package com.scholarshare.scholarshare_backend.dto.requests;

import jakarta.validation.constraints.NotBlank;

/** POST /auth/google. idToken is the "credential" that Google Identity Services gives the browser. */
public record GoogleLoginRequest(@NotBlank(message = "Google credential is required") String idToken) {
}
