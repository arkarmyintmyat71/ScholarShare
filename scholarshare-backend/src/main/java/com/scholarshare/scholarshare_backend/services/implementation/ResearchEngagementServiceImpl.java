package com.scholarshare.scholarshare_backend.services.implementation;

import com.scholarshare.scholarshare_backend.dto.requests.CommentRequest;
import com.scholarshare.scholarshare_backend.dto.responses.MyRatingResponse;
import com.scholarshare.scholarshare_backend.dto.responses.ResearchCommentResponse;
import com.scholarshare.scholarshare_backend.dto.responses.ResearchResponse;
import com.scholarshare.scholarshare_backend.entities.ResearchComment;
import com.scholarshare.scholarshare_backend.entities.ResearchCommentLike;
import com.scholarshare.scholarshare_backend.entities.ResearchRating;
import com.scholarshare.scholarshare_backend.entities.User;
import com.scholarshare.scholarshare_backend.entities.enums.NotificationType;
import com.scholarshare.scholarshare_backend.entities.enums.RelatedEntityType;
import com.scholarshare.scholarshare_backend.entities.enums.ResearchStatus;
import com.scholarshare.scholarshare_backend.exceptions.ApiException;
import com.scholarshare.scholarshare_backend.exceptions.NotFoundException;
import org.springframework.http.HttpStatus;
import com.scholarshare.scholarshare_backend.repositories.ResearchCommentLikeRepo;
import com.scholarshare.scholarshare_backend.repositories.ResearchCommentRepo;
import com.scholarshare.scholarshare_backend.repositories.ResearchFileRepo;
import com.scholarshare.scholarshare_backend.repositories.ResearchRatingRepo;
import com.scholarshare.scholarshare_backend.repositories.UserRepo;
import com.scholarshare.scholarshare_backend.securities.CurrentUser;
import com.scholarshare.scholarshare_backend.services.NotificationPublisher;
import com.scholarshare.scholarshare_backend.services.ResearchEngagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResearchEngagementServiceImpl implements ResearchEngagementService {

    private final ResearchRatingRepo ratingRepo;
    private final ResearchCommentRepo commentRepo;
    private final ResearchCommentLikeRepo commentLikeRepo;
    private final ResearchFileRepo researchRepo;
    private final UserRepo userRepo;
    private final CurrentUser currentUser;
    private final NotificationPublisher notifications;

    // ------------------------------------------------------------------ ratings

    @Override
    @Transactional(readOnly = true)
    public List<MyRatingResponse> myRatings() {
        return ratingRepo.findByUser(currentUser.require().getId()).stream()
                .map(r -> new MyRatingResponse(r.getResearchFile().getId(), r.getStars()))
                .toList();
    }

    @Override
    @Transactional
    public void rate(Long researchId, int stars) {
        if (stars < 1 || stars > 5) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
        }
        User user = currentUser.require();
        requireApproved(researchId);
        ratingRepo.findByUserIdAndResearchFileId(user.getId(), researchId).ifPresentOrElse(
                existing -> existing.setStars(stars),            // changing your mind replaces the rating
                () -> ratingRepo.save(ResearchRating.builder()
                        .user(user)
                        .researchFile(researchRepo.getReferenceById(researchId))
                        .stars(stars)
                        .build()));
    }

    @Override
    @Transactional
    public void removeRating(Long researchId) {
        ratingRepo.deleteByUserAndResearch(currentUser.require().getId(), researchId);
    }

    // ------------------------------------------------------------------ comments

    @Override
    @Transactional(readOnly = true)
    public List<ResearchCommentResponse> comments(Long researchId) {
        requireApproved(researchId);
        return commentRepo.findByResearch(researchId, currentUser.require().getId());
    }

    @Override
    @Transactional
    public ResearchCommentResponse addComment(Long researchId, CommentRequest request) {
        User author = currentUser.require();
        ResearchResponse research = requireApproved(researchId);

        ResearchComment comment = commentRepo.save(ResearchComment.builder()
                .researchFile(researchRepo.getReferenceById(researchId))
                .body(request.body().trim())
                .createdBy(author)
                .build());

        // Tell the uploader, but not when they comment on their own research.
        if (!research.uploadedById().equals(author.getId())) {
            notifications.toUser(userRepo.getReferenceById(research.uploadedById()), NotificationType.NEW_COMMENT,
                    author.getName() + " commented on your research \"" + research.title() + "\".",
                    RelatedEntityType.RESEARCH_FILE, researchId);
        }

        return new ResearchCommentResponse(comment.getId(), researchId, comment.getBody(),
                author.getId(), author.getName(), author.getPictureUrl(), comment.getCreatedAt(), 0L, false);
    }

    @Override
    @Transactional
    public ResearchCommentResponse likeComment(Long commentId) {
        User user = currentUser.require();
        ResearchComment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Comment not found"));
        requireApproved(comment.getResearchFile().getId());
        if (!commentLikeRepo.existsByUserIdAndCommentId(user.getId(), commentId)) {   // liking twice is harmless
            commentLikeRepo.save(ResearchCommentLike.builder().user(user).comment(comment).build());
            commentLikeRepo.flush();
        }
        return commentRepo.findResponseById(commentId, user.getId()).orElseThrow();
    }

    @Override
    @Transactional
    public ResearchCommentResponse unlikeComment(Long commentId) {
        User user = currentUser.require();
        if (!commentRepo.existsById(commentId)) {
            throw new NotFoundException("Comment not found");
        }
        commentLikeRepo.deleteByUserAndComment(user.getId(), commentId);
        return commentRepo.findResponseById(commentId, user.getId()).orElseThrow();
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId) {
        if (!commentRepo.existsById(commentId)) {
            throw new NotFoundException("Comment not found");
        }
        commentLikeRepo.deleteByComment(commentId);
        commentRepo.deleteById(commentId);
    }

    /** Only published research can be reacted to or discussed. */
    private ResearchResponse requireApproved(Long researchId) {
        return researchRepo.findResponseById(researchId)
                .filter(r -> r.status() == ResearchStatus.APPROVED)
                .orElseThrow(() -> new NotFoundException("Research not found"));
    }
}
