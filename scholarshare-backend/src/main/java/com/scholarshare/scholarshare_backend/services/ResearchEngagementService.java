package com.scholarshare.scholarshare_backend.services;

import com.scholarshare.scholarshare_backend.dto.requests.CommentRequest;
import com.scholarshare.scholarshare_backend.dto.responses.MyRatingResponse;
import com.scholarshare.scholarshare_backend.dto.responses.ResearchCommentResponse;

import java.util.List;

/** Ratings and comments on approved research (the buttons on a research card). */
public interface ResearchEngagementService {
    /** The signed-in student's ratings: one entry per research they rated. */
    List<MyRatingResponse> myRatings();

    /** Adds the rating (1-5 stars) or changes the existing one (a student has one rating per research). */
    void rate(Long researchId, int stars);

    void removeRating(Long researchId);

    List<ResearchCommentResponse> comments(Long researchId);

    ResearchCommentResponse addComment(Long researchId, CommentRequest request);

    ResearchCommentResponse likeComment(Long commentId);

    ResearchCommentResponse unlikeComment(Long commentId);

    /** Admin moderation. */
    void deleteComment(Long commentId);
}
