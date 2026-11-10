package com.scholarshare.scholarshare_backend.dto.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * PUT /users/me: the profile details. The photo is changed with POST/DELETE /users/me/avatar and the password
 * has its own call. The e-mail cannot be changed (it is only shown). Empty optional fields clear the value.
 */
public record UpdateProfileRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,

        @Size(max = 110, message = "Headline must be at most 110 characters")
        String headline,

        @Size(max = 420, message = "Bio must be at most 420 characters")
        String bio,

        @Size(max = 90, message = "University must be at most 90 characters")
        String university,

        @Size(max = 90, message = "Location must be at most 90 characters")
        String location
) {
}
