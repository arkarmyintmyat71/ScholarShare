package com.scholarshare.scholarshare_backend.controllers;

import com.scholarshare.scholarshare_backend.dto.requests.ChangePasswordRequest;
import com.scholarshare.scholarshare_backend.dto.requests.UpdateProfileRequest;
import com.scholarshare.scholarshare_backend.dto.responses.ApiResponse;
import com.scholarshare.scholarshare_backend.dto.responses.ImageDownload;
import com.scholarshare.scholarshare_backend.dto.responses.UserResponse;
import com.scholarshare.scholarshare_backend.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;

/** The signed-in user's own account: name, e-mail, password, photo. */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok("OK", userService.getCurrentUser(authentication.getName())));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> update(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", userService.updateProfile(request)));
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Password updated"));
    }

    /** multipart/form-data with one field: file (PNG/JPG/GIF/WebP, max 2 MB). */
    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserResponse>> uploadAvatar(@RequestParam(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.ok("Photo updated", userService.uploadAvatar(file)));
    }

    @DeleteMapping("/me/avatar")
    public ResponseEntity<ApiResponse<UserResponse>> removeAvatar() {
        return ResponseEntity.ok(ApiResponse.ok("Photo removed", userService.removeAvatar()));
    }

    /** Public: anyone may see a user's photo (it appears next to comments and uploads). */
    @GetMapping("/{id}/avatar")
    public ResponseEntity<byte[]> avatar(@PathVariable Long id) {
        ImageDownload image = userService.avatar(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.contentType()))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic())   // the ?v= in the URL busts it
                .body(image.data());
    }
}
