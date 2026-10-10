package com.scholarshare.scholarshare_backend.dto.responses;

public record LoginResponse(
        String accessToken,
        UserResponse user
) {
}
