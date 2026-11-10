package com.scholarshare.scholarshare_backend.services;

import com.scholarshare.scholarshare_backend.dto.requests.LoginRequest;
import com.scholarshare.scholarshare_backend.dto.requests.RegisterRequest;
import com.scholarshare.scholarshare_backend.dto.responses.LoginResponse;
import com.scholarshare.scholarshare_backend.dto.responses.UserResponse;

/** Business rules for signing in and signing up. Returns plain data; the controller adds the HTTP envelope. */
public interface AuthService {
    /** Only APPROVED accounts get a token. Others get a 403 that says why. */
    LoginResponse login(LoginRequest request);

    /**
     * Sign in with a Google ID token. A known e-mail signs in like a normal login (APPROVED only); an unknown one
     * creates a GOOGLE STUDENT (APPROVED at once) and signs it in.
     */
    LoginResponse loginWithGoogle(String idToken);

    /** Creates a LOCAL STUDENT account that is usable at once (no admin approval) and signs it in. */
    LoginResponse register(RegisterRequest request);
}
