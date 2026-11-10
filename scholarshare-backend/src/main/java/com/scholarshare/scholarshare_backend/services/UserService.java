package com.scholarshare.scholarshare_backend.services;

import com.scholarshare.scholarshare_backend.dto.requests.ChangePasswordRequest;
import com.scholarshare.scholarshare_backend.dto.requests.UpdateProfileRequest;
import com.scholarshare.scholarshare_backend.dto.responses.AdminStatsResponse;
import com.scholarshare.scholarshare_backend.dto.responses.ImageDownload;
import com.scholarshare.scholarshare_backend.dto.responses.PageResponse;
import com.scholarshare.scholarshare_backend.dto.responses.UserResponse;
import com.scholarshare.scholarshare_backend.entities.enums.AccountStatus;

import org.springframework.web.multipart.MultipartFile;


public interface UserService {
    /** The signed-in user's profile, looked up by the email stored in their token. */
    UserResponse getCurrentUser(String email);

    UserResponse updateProfile(UpdateProfileRequest request);

    void changePassword(ChangePasswordRequest request);

    UserResponse uploadAvatar(MultipartFile file);

    UserResponse removeAvatar();

    /** Public: the photo shown next to a user's name. */
    ImageDownload avatar(Long userId);

    // ---- admin ----
    PageResponse<UserResponse> search(AccountStatus status, String q, int page, int size);

    UserResponse enable(Long id);

    UserResponse disable(Long id);

    AdminStatsResponse stats();
}
