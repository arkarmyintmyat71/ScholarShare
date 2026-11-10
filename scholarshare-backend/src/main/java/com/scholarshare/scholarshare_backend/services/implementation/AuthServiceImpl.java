package com.scholarshare.scholarshare_backend.services.implementation;

import com.scholarshare.scholarshare_backend.dto.requests.LoginRequest;
import com.scholarshare.scholarshare_backend.dto.requests.RegisterRequest;
import com.scholarshare.scholarshare_backend.dto.responses.LoginResponse;
import com.scholarshare.scholarshare_backend.dto.responses.UserResponse;
import com.scholarshare.scholarshare_backend.entities.User;
import com.scholarshare.scholarshare_backend.entities.enums.AccountStatus;
import com.scholarshare.scholarshare_backend.entities.enums.Provider;
import com.scholarshare.scholarshare_backend.entities.enums.Role;
import com.scholarshare.scholarshare_backend.exceptions.AccountNotActiveException;
import com.scholarshare.scholarshare_backend.exceptions.ApiException;
import com.scholarshare.scholarshare_backend.exceptions.InvalidCredentialsException;
import com.scholarshare.scholarshare_backend.mappers.UserMapper;
import com.scholarshare.scholarshare_backend.repositories.UserRepo;
import com.scholarshare.scholarshare_backend.securities.GoogleTokenVerifier;
import com.scholarshare.scholarshare_backend.securities.JwtTokenProvider;
import com.scholarshare.scholarshare_backend.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    // One message for "no such email" and "wrong password", so the API
    // doesn't reveal which emails have accounts.
    private static final String BAD_CREDENTIALS = "Invalid email or password";

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserMapper userMapper;
    private final GoogleTokenVerifier googleVerifier;

    @Override
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepo.findByEmail(normalize(request.getEmail()))
                .orElseThrow(() -> new InvalidCredentialsException(BAD_CREDENTIALS));

        if (user.getProvider() == Provider.GOOGLE) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "This account uses Google Sign-In. Please continue with Google instead.");
        }

        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()
                || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException(BAD_CREDENTIALS);
        }

        // Checked after the password so a stranger can't probe which accounts are disabled.
        if (user.getAccountStatus() != AccountStatus.APPROVED) {
            throw new AccountNotActiveException(user.getAccountStatus());
        }

        return new LoginResponse(jwtTokenProvider.generateToken(user), userMapper.toUserResponse(user));
    }

    @Override
    @Transactional
    public LoginResponse loginWithGoogle(String idToken) {
        GoogleTokenVerifier.GoogleProfile google = googleVerifier.verify(idToken);
        String email = normalize(google.email());

        User user = userRepo.findByEmail(email).orElse(null);
        if (user == null) {
            String name = google.name() == null || google.name().isBlank() ? email : google.name().trim();
            user = userRepo.save(User.builder()
                    .name(name.length() > 100 ? name.substring(0, 100) : name)
                    .email(email)
                    .role(Role.STUDENT)
                    .provider(Provider.GOOGLE)
                    .googleId(google.sub())
                    .accountStatus(AccountStatus.APPROVED)    // same rule as sign-up: usable at once
                    .build());
        } else if (user.getGoogleId() == null) {
            user.setGoogleId(google.sub());                   // an existing account now also works with Google
        }

        if (user.getAccountStatus() != AccountStatus.APPROVED) {
            throw new AccountNotActiveException(user.getAccountStatus());
        }
        return new LoginResponse(jwtTokenProvider.generateToken(user), userMapper.toUserResponse(user));
    }

    @Override
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        String email = normalize(request.getEmail());

        if (userRepo.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        User user = userRepo.save(User.builder()
                .name(request.getName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)                       // admins are never created through sign-up
                .provider(Provider.LOCAL)
                .accountStatus(AccountStatus.APPROVED)    // no admin approval: the student can use the account at once
                .build());

        return new LoginResponse(jwtTokenProvider.generateToken(user), userMapper.toUserResponse(user));
    }

    private String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
