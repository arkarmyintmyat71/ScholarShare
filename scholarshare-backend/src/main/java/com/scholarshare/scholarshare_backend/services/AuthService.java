package com.scholarshare.scholarshare_backend.services;

import com.scholarshare.scholarshare_backend.dto.requests.LoginRequest;
import com.scholarshare.scholarshare_backend.dto.requests.RegisterRequest;
import com.scholarshare.scholarshare_backend.dto.responses.LoginResponse;
import com.scholarshare.scholarshare_backend.dto.responses.UserResponse;

/** Business rules for signing in and signing up. Returns plain data; the controller adds the HTTP envelope. */
public interface AuthService {
    /** Only APPROVED accounts get a token. Others get a 403 that says why. */
    LoginResponse login(LoginRequest request);

    /** Creates a LOCAL STUDENT account in status PENDING and notifies every admin. No token is issued. */
    UserResponse register(RegisterRequest request);
}
