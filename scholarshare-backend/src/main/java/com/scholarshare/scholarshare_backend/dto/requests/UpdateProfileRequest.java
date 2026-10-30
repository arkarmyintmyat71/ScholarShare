package com.scholarshare.scholarshare_backend.dto.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** PUT /users/me. pictureUrl is optional; an empty value removes the picture. */
public record UpdateProfileRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,

        @Size(max = 255, message = "Picture URL must be at most 255 characters")
        @Pattern(regexp = "^(https?://.*)?$", message = "Picture URL must start with http:// or https://")
        String pictureUrl
) {
}
