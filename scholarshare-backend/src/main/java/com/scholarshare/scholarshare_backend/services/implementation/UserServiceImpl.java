package com.scholarshare.scholarshare_backend.services.implementation;

import com.scholarshare.scholarshare_backend.dto.requests.ReviewRequest;
import com.scholarshare.scholarshare_backend.dto.requests.UpdateProfileRequest;
import com.scholarshare.scholarshare_backend.dto.responses.AdminStatsResponse;
import com.scholarshare.scholarshare_backend.dto.responses.PageResponse;
import com.scholarshare.scholarshare_backend.dto.responses.UserResponse;
import com.scholarshare.scholarshare_backend.entities.User;
import com.scholarshare.scholarshare_backend.entities.enums.AccountStatus;
import com.scholarshare.scholarshare_backend.entities.enums.NotificationType;
import com.scholarshare.scholarshare_backend.entities.enums.RelatedEntityType;
import com.scholarshare.scholarshare_backend.entities.enums.ResearchStatus;
import com.scholarshare.scholarshare_backend.entities.enums.Role;
import com.scholarshare.scholarshare_backend.exceptions.ApiException;
import com.scholarshare.scholarshare_backend.exceptions.NotFoundException;
import com.scholarshare.scholarshare_backend.mappers.UserMapper;
import com.scholarshare.scholarshare_backend.repositories.CategoryRepo;
import com.scholarshare.scholarshare_backend.repositories.ResearchFileRepo;
import com.scholarshare.scholarshare_backend.repositories.TopicRepo;
import com.scholarshare.scholarshare_backend.repositories.UserRepo;
import com.scholarshare.scholarshare_backend.securities.CurrentUser;
import com.scholarshare.scholarshare_backend.services.NotificationPublisher;
import com.scholarshare.scholarshare_backend.services.UserService;
import com.scholarshare.scholarshare_backend.utils.Paging;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepo userRepo;
    private final UserMapper userMapper;
    private final CurrentUser currentUser;
    private final NotificationPublisher notifications;
    private final ResearchFileRepo researchRepo;
    private final TopicRepo topicRepo;
    private final CategoryRepo categoryRepo;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        return userRepo.findByEmail(email)
                .map(userMapper::toUserResponse)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    @Override
    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        User user = currentUser.require();
        user.setName(request.name().trim());
        String picture = request.pictureUrl() == null ? "" : request.pictureUrl().trim();
        user.setPictureUrl(picture.isEmpty() ? null : picture);
        return userMapper.toUserResponse(userRepo.save(user));
    }

    // ---------------------------------------------------------------- admin

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> listPending() {
        return userRepo.findByAccountStatusOrderByCreatedAtAsc(AccountStatus.PENDING).stream()
                .map(userMapper::toUserResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> search(AccountStatus status, String q, int page, int size) {
        return PageResponse.from(
                userRepo.search(status, Paging.likePattern(q), Paging.of(page, size)).map(userMapper::toUserResponse));
    }

    @Override
    @Transactional
    public UserResponse approve(Long id) {
        User user = find(id);
        if (user.getAccountStatus() == AccountStatus.APPROVED) {
            throw new ApiException(HttpStatus.CONFLICT, "This account is already approved");
        }
        boolean wasPending = user.getAccountStatus() == AccountStatus.PENDING;
        user.setAccountStatus(AccountStatus.APPROVED);
        if (wasPending) {   // re-enabling a disabled account does not need a "registration result"
            notifications.toUser(user, NotificationType.REGISTRATION_RESULT,
                    "Your registration was approved. You can sign in now.", RelatedEntityType.USER, user.getId());
        }
        return userMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse reject(Long id, ReviewRequest request) {
        User user = find(id);
        if (user.getAccountStatus() != AccountStatus.PENDING) {
            throw new ApiException(HttpStatus.CONFLICT, "Only pending registrations can be rejected");
        }
        user.setAccountStatus(AccountStatus.REJECTED);
        notifications.toUser(user, NotificationType.REGISTRATION_RESULT,
                "Your registration was not approved." + reasonSuffix(request), RelatedEntityType.USER, user.getId());
        return userMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse disable(Long id) {
        User user = find(id);
        if (user.getRole() == Role.ADMIN) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Administrator accounts cannot be disabled");
        }
        if (user.getAccountStatus() != AccountStatus.APPROVED) {
            throw new ApiException(HttpStatus.CONFLICT, "Only approved accounts can be disabled");
        }
        user.setAccountStatus(AccountStatus.DISABLED);
        return userMapper.toUserResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminStatsResponse stats() {
        return new AdminStatsResponse(
                userRepo.countByAccountStatus(AccountStatus.PENDING),
                researchRepo.countByStatus(ResearchStatus.PENDING),
                userRepo.countByRoleAndAccountStatus(Role.STUDENT, AccountStatus.APPROVED),
                researchRepo.countByStatus(ResearchStatus.APPROVED),
                topicRepo.count(),
                categoryRepo.count());
    }

    private User find(Long id) {
        return userRepo.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
    }

    private static String reasonSuffix(ReviewRequest request) {
        return request == null || request.reason() == null || request.reason().isBlank()
                ? "" : " Reason: " + request.reason().trim();
    }
}
