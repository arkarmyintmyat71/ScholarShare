package com.scholarshare.scholarshare_backend.controllers;

import com.scholarshare.scholarshare_backend.dto.requests.GoogleLoginRequest;
import com.scholarshare.scholarshare_backend.dto.requests.LoginRequest;
import com.scholarshare.scholarshare_backend.dto.requests.RegisterRequest;
import com.scholarshare.scholarshare_backend.dto.responses.ApiResponse;
import com.scholarshare.scholarshare_backend.dto.responses.LoginResponse;
import com.scholarshare.scholarshare_backend.dto.responses.UserResponse;
import com.scholarshare.scholarshare_backend.services.AuthService;
import com.scholarshare.scholarshare_backend.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Real URLs (context path /api): /api/auth/login, register, google, me. */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Login successful", authService.login(request)));
    }

    /** Google sign-in: the browser sends the Google ID token, the server verifies it and answers like /login. */
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<LoginResponse>> google(@Valid @RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Login successful", authService.loginWithGoogle(request.idToken())));
    }

    /** Creates a student account. No approval step: the answer already holds the token, like a login. */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<LoginResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                "Account created",
                authService.register(request)));
    }

    /** Requires a valid Bearer token; the frontend calls this on page load to restore the session. */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok("OK", userService.getCurrentUser(authentication.getName())));
    }
}
