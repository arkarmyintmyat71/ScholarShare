package com.scholarshare.scholarshare_backend.services;

import com.scholarshare.scholarshare_backend.dto.requests.ReviewRequest;
import com.scholarshare.scholarshare_backend.dto.requests.UpdateProfileRequest;
import com.scholarshare.scholarshare_backend.dto.responses.AdminStatsResponse;
import com.scholarshare.scholarshare_backend.dto.responses.PageResponse;
import com.scholarshare.scholarshare_backend.dto.responses.UserResponse;
import com.scholarshare.scholarshare_backend.entities.enums.AccountStatus;

import java.util.List;

public interface UserService {
    /** The signed-in user's profile, looked up by the email stored in their token. */
    UserResponse getCurrentUser(String email);

    UserResponse updateProfile(UpdateProfileRequest request);

    // ---- admin ----
    List<UserResponse> listPending();

    PageResponse<UserResponse> search(AccountStatus status, String q, int page, int size);

    UserResponse approve(Long id);

    UserResponse reject(Long id, ReviewRequest request);

    UserResponse disable(Long id);

    AdminStatsResponse stats();
}
