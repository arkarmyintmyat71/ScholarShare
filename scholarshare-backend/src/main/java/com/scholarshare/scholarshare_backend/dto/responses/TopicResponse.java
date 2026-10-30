package com.scholarshare.scholarshare_backend.dto.responses;

import java.time.Instant;

public record TopicResponse(
        Long id,
        String title,
        String body,
        Long createdById,
        String createdByName,
        Instant createdAt,
        Long commentCount
) {
}
