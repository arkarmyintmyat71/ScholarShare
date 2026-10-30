package com.scholarshare.scholarshare_backend.controllers;

import com.scholarshare.scholarshare_backend.dto.requests.ReviewRequest;
import com.scholarshare.scholarshare_backend.dto.responses.AdminStatsResponse;
import com.scholarshare.scholarshare_backend.dto.responses.ApiResponse;
import com.scholarshare.scholarshare_backend.dto.responses.PageResponse;
import com.scholarshare.scholarshare_backend.dto.responses.UserResponse;
import com.scholarshare.scholarshare_backend.entities.enums.AccountStatus;
import com.scholarshare.scholarshare_backend.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Everything here needs the ADMIN role (SecurityConfig: /admin/**). */
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> stats() {
        return ResponseEntity.ok(ApiResponse.ok("OK", userService.stats()));
    }

    @GetMapping("/users/pending")
    public ResponseEntity<ApiResponse<List<UserResponse>>> pending() {
        return ResponseEntity.ok(ApiResponse.ok("OK", userService.listPending()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> users(
            @RequestParam(required = false) AccountStatus status,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok("OK", userService.search(status, q, page, size)));
    }

    @PutMapping("/users/{id}/approve")
    public ResponseEntity<ApiResponse<UserResponse>> approve(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Account approved", userService.approve(id)));
    }

    @PutMapping("/users/{id}/reject")
    public ResponseEntity<ApiResponse<UserResponse>> reject(@PathVariable Long id,
                                                            @Valid @RequestBody(required = false) ReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Account rejected", userService.reject(id, request)));
    }

    @PutMapping("/users/{id}/disable")
    public ResponseEntity<ApiResponse<UserResponse>> disable(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Account disabled", userService.disable(id)));
    }
}
