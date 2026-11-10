package com.scholarshare.scholarshare_backend.dto.responses;

/** One entry of GET /ratings: which research the student rated and with how many stars (1-5). */
public record MyRatingResponse(Long researchId, int rating) {
}
