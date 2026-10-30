package com.scholarshare.scholarshare_backend.dto.responses;

import java.time.Instant;

public record CommentResponse(
        Long id,
        Long topicId,
        String body,
        Long createdById,
        String createdByName,
        Instant createdAt
) {
}
