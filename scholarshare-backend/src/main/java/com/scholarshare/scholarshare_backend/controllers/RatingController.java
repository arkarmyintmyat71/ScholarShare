package com.scholarshare.scholarshare_backend.controllers;

import com.scholarshare.scholarshare_backend.dto.requests.RatingRequest;
import com.scholarshare.scholarshare_backend.dto.responses.ApiResponse;
import com.scholarshare.scholarshare_backend.dto.responses.MyRatingResponse;
import com.scholarshare.scholarshare_backend.services.ResearchEngagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Star ratings for students: GET /ratings, PUT /ratings/{researchId} {rating 1-5}, DELETE /ratings/{researchId}. */
@RestController
@RequestMapping("/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final ResearchEngagementService engagement;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MyRatingResponse>>> mine() {
        return ResponseEntity.ok(ApiResponse.ok("OK", engagement.myRatings()));
    }

    @PutMapping("/{researchId}")
    public ResponseEntity<ApiResponse<Void>> rate(@PathVariable Long researchId,
                                                  @Valid @RequestBody RatingRequest request) {
        engagement.rate(researchId, request.rating());
        return ResponseEntity.ok(ApiResponse.ok("Saved"));
    }

    @DeleteMapping("/{researchId}")
    public ResponseEntity<ApiResponse<Void>> remove(@PathVariable Long researchId) {
        engagement.removeRating(researchId);
        return ResponseEntity.ok(ApiResponse.ok("Rating removed"));
    }
}
