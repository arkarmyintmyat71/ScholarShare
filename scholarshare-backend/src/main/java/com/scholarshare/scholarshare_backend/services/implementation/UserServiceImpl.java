package com.scholarshare.scholarshare_backend.services.implementation;

import com.scholarshare.scholarshare_backend.dto.requests.ChangePasswordRequest;
import com.scholarshare.scholarshare_backend.dto.requests.UpdateProfileRequest;
import com.scholarshare.scholarshare_backend.dto.responses.AdminStatsResponse;
import com.scholarshare.scholarshare_backend.dto.responses.ImageDownload;
import com.scholarshare.scholarshare_backend.dto.responses.PageResponse;
import com.scholarshare.scholarshare_backend.dto.responses.UserResponse;
import com.scholarshare.scholarshare_backend.entities.User;
import com.scholarshare.scholarshare_backend.entities.UserAvatar;
import com.scholarshare.scholarshare_backend.entities.enums.AccountStatus;
import com.scholarshare.scholarshare_backend.entities.enums.ResearchStatus;
import com.scholarshare.scholarshare_backend.entities.enums.Role;
import com.scholarshare.scholarshare_backend.exceptions.ApiException;
import com.scholarshare.scholarshare_backend.exceptions.NotFoundException;
import com.scholarshare.scholarshare_backend.mappers.UserMapper;
import com.scholarshare.scholarshare_backend.repositories.CategoryRepo;
import com.scholarshare.scholarshare_backend.repositories.ResearchFileRepo;
import com.scholarshare.scholarshare_backend.repositories.TopicRepo;
import com.scholarshare.scholarshare_backend.repositories.UserAvatarRepo;
import com.scholarshare.scholarshare_backend.repositories.UserRepo;
import com.scholarshare.scholarshare_backend.securities.CurrentUser;
import com.scholarshare.scholarshare_backend.services.NotificationPublisher;
import com.scholarshare.scholarshare_backend.services.UserService;
import com.scholarshare.scholarshare_backend.utils.ImageValidator;
import com.scholarshare.scholarshare_backend.utils.Paging;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;


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
    private final UserAvatarRepo avatarRepo;
    private final PasswordEncoder passwordEncoder;

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
        user.setHeadline(clean(request.headline()));
        user.setBio(clean(request.bio()));
        user.setUniversity(clean(request.university()));
        user.setLocation(clean(request.location()));
        return userMapper.toUserResponse(userRepo.save(user));
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = currentUser.require();
        requirePassword(user, request.currentPassword());
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepo.save(user);
    }

    @Override
    @Transactional
    public UserResponse uploadAvatar(MultipartFile file) {
        User user = currentUser.require();
        ImageValidator.ValidatedImage image = ImageValidator.validate(file);
        avatarRepo.save(UserAvatar.builder().userId(user.getId())
                .contentType(image.contentType()).data(image.data()).build());
        // "?v=" changes with every upload so browsers do not keep showing the old photo.
        user.setPictureUrl("/users/" + user.getId() + "/avatar?v=" + System.currentTimeMillis());
        return userMapper.toUserResponse(userRepo.save(user));
    }

    @Override
    @Transactional
    public UserResponse removeAvatar() {
        User user = currentUser.require();
        if (avatarRepo.existsById(user.getId())) {
            avatarRepo.deleteById(user.getId());
        }
        user.setPictureUrl(null);
        return userMapper.toUserResponse(userRepo.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public ImageDownload avatar(Long userId) {
        return avatarRepo.findById(userId)
                .map(a -> new ImageDownload(a.getContentType(), a.getData()))
                .orElseThrow(() -> new NotFoundException("Photo not found"));
    }

    private void requirePassword(User user, String password) {
        if (user.getPasswordHash() == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Your current password is not correct");
        }
    }

    // ---------------------------------------------------------------- admin

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> search(AccountStatus status, String q, int page, int size) {
        return PageResponse.from(
                userRepo.search(status, Paging.likePattern(q), Paging.of(page, size)).map(userMapper::toUserResponse));
    }

    /** Switches a disabled account back on. */
    @Override
    @Transactional
    public UserResponse enable(Long id) {
        User user = find(id);
        if (user.getAccountStatus() == AccountStatus.APPROVED) {
            throw new ApiException(HttpStatus.CONFLICT, "This account is already active");
        }
        user.setAccountStatus(AccountStatus.APPROVED);
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
                researchRepo.countByStatus(ResearchStatus.PENDING),
                userRepo.countByRoleAndAccountStatus(Role.STUDENT, AccountStatus.APPROVED),
                researchRepo.countByStatus(ResearchStatus.APPROVED),
                topicRepo.count(),
                categoryRepo.count());
    }

    private User find(Long id) {
        return userRepo.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
    }


    /** Optional text: trimmed, and empty becomes null (so the field is cleared). */
    private static String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
