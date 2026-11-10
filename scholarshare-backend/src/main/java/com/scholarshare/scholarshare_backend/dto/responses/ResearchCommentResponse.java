package com.scholarshare.scholarshare_backend.dto.responses;

import java.time.Instant;

/** A comment under a research card, with its own Like count and whether the caller liked it. */
public record ResearchCommentResponse(
        Long id,
        Long researchId,
        String body,
        Long createdById,
        String createdByName,
        String createdByPictureUrl,
        Instant createdAt,
        Long likeCount,
        Boolean likedByMe
) {
    /** Used by the JPQL "select new" query, which can only count (not return a boolean). */
    public ResearchCommentResponse(Long id, Long researchId, String body, Long createdById, String createdByName,
                                   String createdByPictureUrl, Instant createdAt, Long likeCount, Long likedByMeCount) {
        this(id, researchId, body, createdById, createdByName, createdByPictureUrl, createdAt,
                likeCount, likedByMeCount != null && likedByMeCount > 0);
    }
}
