package com.scholarshare.scholarshare_backend.controllers;

import com.scholarshare.scholarshare_backend.dto.requests.CommentRequest;
import com.scholarshare.scholarshare_backend.dto.responses.ApiResponse;
import com.scholarshare.scholarshare_backend.dto.responses.ResearchCommentResponse;
import com.scholarshare.scholarshare_backend.services.ResearchEngagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Comments under a research card. Readable by signed-in users only (guests see nothing), written by students, moderated by admins. */
@RestController
@RequiredArgsConstructor
public class ResearchCommentController {

    private final ResearchEngagementService engagement;

    @GetMapping("/research/{id}/comments")
    public ResponseEntity<ApiResponse<List<ResearchCommentResponse>>> list(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("OK", engagement.comments(id)));
    }

    @PostMapping("/research/{id}/comments")
    public ResponseEntity<ApiResponse<ResearchCommentResponse>> add(@PathVariable Long id,
                                                                    @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Comment added", engagement.addComment(id, request)));
    }

    @PutMapping("/research-comments/{commentId}/like")
    public ResponseEntity<ApiResponse<ResearchCommentResponse>> like(@PathVariable Long commentId) {
        return ResponseEntity.ok(ApiResponse.ok("Liked", engagement.likeComment(commentId)));
    }

    @DeleteMapping("/research-comments/{commentId}/like")
    public ResponseEntity<ApiResponse<ResearchCommentResponse>> unlike(@PathVariable Long commentId) {
        return ResponseEntity.ok(ApiResponse.ok("Like removed", engagement.unlikeComment(commentId)));
    }

    @DeleteMapping("/admin/research-comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long commentId) {
        engagement.deleteComment(commentId);
        return ResponseEntity.ok(ApiResponse.ok("Comment deleted"));
    }
}
