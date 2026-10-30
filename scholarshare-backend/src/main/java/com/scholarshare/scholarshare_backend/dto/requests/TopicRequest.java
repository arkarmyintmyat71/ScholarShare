package com.scholarshare.scholarshare_backend.dto.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TopicRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must be at most 255 characters")
        String title,

        @NotBlank(message = "Body is required")
        @Size(max = 2000, message = "Body must be at most 2000 characters")
        String body
) {
}
