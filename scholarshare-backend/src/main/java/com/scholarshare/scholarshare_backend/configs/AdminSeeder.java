package com.scholarshare.scholarshare_backend.configs;

import com.scholarshare.scholarshare_backend.entities.User;
import com.scholarshare.scholarshare_backend.entities.enums.AccountStatus;
import com.scholarshare.scholarshare_backend.entities.enums.Provider;
import com.scholarshare.scholarshare_backend.entities.enums.Role;
import com.scholarshare.scholarshare_backend.repositories.UserRepo;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Sign-up only creates STUDENT accounts, so without this nobody could ever become an ADMIN.
 * When app.seed-admin.enabled=true, creates that account on startup if it doesn't exist yet.
 */
@Component
@RequiredArgsConstructor
public class AdminSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final SeedAdminProperties properties;
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (!properties.enabled()) {
            return;
        }
        if (isBlank(properties.email()) || isBlank(properties.password())) {
            log.warn("app.seed-admin.enabled is true but email/password are not set; no admin created.");
            return;
        }

        String email = properties.email().trim().toLowerCase(Locale.ROOT);
        if (userRepo.existsByEmail(email)) {
            return;
        }

        userRepo.save(User.builder()
                .name(isBlank(properties.name()) ? "Administrator" : properties.name().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(properties.password()))
                .role(Role.ADMIN)
                .provider(Provider.LOCAL)
                .accountStatus(AccountStatus.APPROVED)
                .build());
        log.info("Created admin account {}", email);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
