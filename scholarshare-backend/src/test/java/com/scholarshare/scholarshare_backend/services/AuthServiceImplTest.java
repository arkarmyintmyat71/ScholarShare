package com.scholarshare.scholarshare_backend.services;

import com.scholarshare.scholarshare_backend.dto.requests.LoginRequest;
import com.scholarshare.scholarshare_backend.dto.requests.RegisterRequest;
import com.scholarshare.scholarshare_backend.dto.responses.LoginResponse;
import com.scholarshare.scholarshare_backend.dto.responses.UserResponse;
import com.scholarshare.scholarshare_backend.entities.User;
import com.scholarshare.scholarshare_backend.entities.enums.AccountStatus;
import com.scholarshare.scholarshare_backend.entities.enums.NotificationType;
import com.scholarshare.scholarshare_backend.entities.enums.Provider;
import com.scholarshare.scholarshare_backend.entities.enums.RelatedEntityType;
import com.scholarshare.scholarshare_backend.entities.enums.Role;
import com.scholarshare.scholarshare_backend.exceptions.AccountNotActiveException;
import com.scholarshare.scholarshare_backend.exceptions.ApiException;
import com.scholarshare.scholarshare_backend.exceptions.InvalidCredentialsException;
import com.scholarshare.scholarshare_backend.mappers.UserMapper;
import com.scholarshare.scholarshare_backend.repositories.UserRepo;
import com.scholarshare.scholarshare_backend.securities.JwtTokenProvider;
import com.scholarshare.scholarshare_backend.services.implementation.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock UserRepo userRepo;
    @Mock JwtTokenProvider jwtTokenProvider;
    @Mock UserMapper userMapper;
    @Mock NotificationPublisher notifications;

    // Real encoder (cheap strength) so we test actual hash matching.
    final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(4);

    AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(userRepo, passwordEncoder, jwtTokenProvider, userMapper, notifications);
    }

    private User localUser(AccountStatus status) {
        return User.builder().id(1L).name("May").email("may@uni.edu")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.STUDENT).provider(Provider.LOCAL).accountStatus(status).build();
    }

    private UserResponse response(Long id, String name, String email, AccountStatus status) {
        return new UserResponse(id, name, email, null, Role.STUDENT, status, null);
    }

    @Test
    void login_succeedsAndNormalizesEmail() {
        User user = localUser(AccountStatus.APPROVED);
        when(userRepo.findByEmail("may@uni.edu")).thenReturn(Optional.of(user));
        when(jwtTokenProvider.generateToken(user)).thenReturn("jwt");
        when(userMapper.toUserResponse(user)).thenReturn(response(1L, "May", "may@uni.edu", AccountStatus.APPROVED));

        LoginResponse result = authService.login(new LoginRequest("  MAY@Uni.edu ", "password123"));

        assertThat(result.accessToken()).isEqualTo("jwt");
        assertThat(result.user().role()).isEqualTo(Role.STUDENT);
    }

    @Test
    void login_wrongPasswordAndUnknownEmailGiveTheSameMessage() {
        when(userRepo.findByEmail("may@uni.edu")).thenReturn(Optional.of(localUser(AccountStatus.APPROVED)));
        when(userRepo.findByEmail("nobody@uni.edu")).thenReturn(Optional.empty());

        Throwable wrongPassword = catchThrowable(() -> authService.login(new LoginRequest("may@uni.edu", "bad-password")));
        Throwable unknownEmail = catchThrowable(() -> authService.login(new LoginRequest("nobody@uni.edu", "whatever")));

        assertThat(wrongPassword).isInstanceOf(InvalidCredentialsException.class);
        assertThat(unknownEmail).isInstanceOf(InvalidCredentialsException.class);
        assertThat(wrongPassword.getMessage()).isEqualTo(unknownEmail.getMessage());
    }

    @Test
    void login_pendingRejectedAndDisabledAccountsGet403WithTheirStatus() {
        for (AccountStatus status : new AccountStatus[]{AccountStatus.PENDING, AccountStatus.REJECTED, AccountStatus.DISABLED}) {
            when(userRepo.findByEmail("may@uni.edu")).thenReturn(Optional.of(localUser(status)));

            Throwable thrown = catchThrowable(() -> authService.login(new LoginRequest("may@uni.edu", "password123")));

            assertThat(thrown).isInstanceOf(AccountNotActiveException.class);
            ApiException api = (ApiException) thrown;
            assertThat(api.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
            assertThat(api.getData()).hasToString("{accountStatus=" + status.name() + "}");
        }
    }

    @Test
    void login_pendingAccountWithWrongPasswordStillLooksLikeBadCredentials() {
        when(userRepo.findByEmail("may@uni.edu")).thenReturn(Optional.of(localUser(AccountStatus.PENDING)));

        assertThatThrownBy(() -> authService.login(new LoginRequest("may@uni.edu", "wrong-password")))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void register_createsPendingStudentWithHashedPasswordAndNotifiesAdmins() {
        when(userRepo.existsByEmail("new@uni.edu")).thenReturn(false);
        when(userRepo.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(7L);
            return u;
        });
        when(userMapper.toUserResponse(any(User.class)))
                .thenReturn(response(7L, "New", "new@uni.edu", AccountStatus.PENDING));

        authService.register(new RegisterRequest(" New ", "New@Uni.edu", "password123"));

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(userRepo).save(saved.capture());
        User user = saved.getValue();
        assertThat(user.getEmail()).isEqualTo("new@uni.edu");
        assertThat(user.getName()).isEqualTo("New");
        assertThat(user.getRole()).isEqualTo(Role.STUDENT);
        assertThat(user.getAccountStatus()).isEqualTo(AccountStatus.PENDING);
        assertThat(user.getPasswordHash()).isNotEqualTo("password123");
        assertThat(passwordEncoder.matches("password123", user.getPasswordHash())).isTrue();

        verify(notifications).toAdmins(eq(NotificationType.REGISTRATION_SUBMITTED), anyString(),
                eq(RelatedEntityType.USER), eq(7L));
    }

    @Test
    void register_duplicateEmailIsRejectedWith409() {
        when(userRepo.existsByEmail("may@uni.edu")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(new RegisterRequest("May", "may@uni.edu", "password123")))
                .isInstanceOf(ApiException.class)
                .extracting(e -> ((ApiException) e).getStatus()).isEqualTo(HttpStatus.CONFLICT);
        verify(userRepo, never()).save(any());
        verify(notifications, never()).toAdmins(any(), anyString(), any(), anyLong());
    }
}
