package com.scholarshare.scholarshare_backend.controllers;

import com.scholarshare.scholarshare_backend.dto.requests.ReviewRequest;
import com.scholarshare.scholarshare_backend.dto.responses.ApiResponse;
import com.scholarshare.scholarshare_backend.dto.responses.ResearchResponse;
import com.scholarshare.scholarshare_backend.services.ResearchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/research")
@RequiredArgsConstructor
public class AdminResearchController {

    private final ResearchService researchService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<ResearchResponse>>> pending() {
        return ResponseEntity.ok(ApiResponse.ok("OK", researchService.listPending()));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<ResearchResponse>> approve(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Research approved", researchService.approve(id)));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<ResearchResponse>> reject(@PathVariable Long id,
                                                                @Valid @RequestBody(required = false) ReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Research rejected", researchService.reject(id, request)));
    }
}
