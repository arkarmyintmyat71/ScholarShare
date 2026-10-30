package com.scholarshare.scholarshare_backend.dto.responses;

import com.scholarshare.scholarshare_backend.entities.enums.AccountStatus;
import com.scholarshare.scholarshare_backend.entities.enums.Role;

import java.time.Instant;

public record UserResponse(
        Long id,
        String name,
        String email,
        String pictureUrl,
        Role role,
        AccountStatus accountStatus,
        Instant createdAt
) {
}
