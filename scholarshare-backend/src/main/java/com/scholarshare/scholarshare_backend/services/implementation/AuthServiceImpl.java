package com.scholarshare.scholarshare_backend.services.implementation;

import com.scholarshare.scholarshare_backend.dto.requests.LoginRequest;
import com.scholarshare.scholarshare_backend.dto.responses.ApiResponse;
import com.scholarshare.scholarshare_backend.dto.responses.LoginResponse;
import com.scholarshare.scholarshare_backend.dto.responses.UserResponse;
import com.scholarshare.scholarshare_backend.entities.User;
import com.scholarshare.scholarshare_backend.entities.enums.AccountStatus;
import com.scholarshare.scholarshare_backend.entities.enums.Provider;
import com.scholarshare.scholarshare_backend.exceptions.AccountNotActiveException;
import com.scholarshare.scholarshare_backend.exceptions.ApiException;
import com.scholarshare.scholarshare_backend.exceptions.InvalidCredentialsException;
import com.scholarshare.scholarshare_backend.mappers.UserMapper;
import com.scholarshare.scholarshare_backend.repositories.UserRepo;
import com.scholarshare.scholarshare_backend.securities.JwtTokenProvider;
import com.scholarshare.scholarshare_backend.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserMapper userMapper;

    @Override
    public ApiResponse<LoginResponse> login(LoginRequest request) {

        String email = normalize(request.getEmail());
        String password = request.getPassword();

        User user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new InvalidCredentialsException("Email not found")
                );

        if (user.getProvider() == Provider.GOOGLE) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "This account uses Google Sign-In. Please continue with Google instead."
            );
        }

        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new AccountNotActiveException(
                    user.getAccountStatus()
            );
        }

        if (user.getPasswordHash() == null ||
                user.getPasswordHash().isBlank()) {

            throw new InvalidCredentialsException(
                    "Password is not configured for this account"
            );
        }

        if (!passwordEncoder.matches(
                password,
                user.getPasswordHash()
        )) {
            throw new InvalidCredentialsException(
                    "Incorrect password"
            );
        }

        String token = jwtTokenProvider.generateToken(user);

        UserResponse userResponse =
                userMapper.toUserResponse(user);

        LoginResponse loginResponse =
                new LoginResponse(token, userResponse);

        return new ApiResponse<>(
                true,
                "Login successful",
                loginResponse
        );
    }

    private String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
