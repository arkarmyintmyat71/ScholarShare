package com.scholarshare.scholarshare_backend.dto.responses;

import com.scholarshare.scholarshare_backend.entities.enums.Role;

public record UserResponse (
        Long id,
        String name,
        String email,
        String pictureUrl,
        Role role
) {}
