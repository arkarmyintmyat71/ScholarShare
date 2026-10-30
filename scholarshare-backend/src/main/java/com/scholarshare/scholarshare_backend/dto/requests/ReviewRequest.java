package com.scholarshare.scholarshare_backend.dto.requests;

import jakarta.validation.constraints.Size;

/** Optional body of a reject call. The reason is included in the notification sent to the student. */
public record ReviewRequest(
        @Size(max = 150, message = "Reason must be at most 150 characters")
        String reason
) {
}
