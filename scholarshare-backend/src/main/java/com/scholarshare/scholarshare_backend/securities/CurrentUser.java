package com.scholarshare.scholarshare_backend.securities;

import com.scholarshare.scholarshare_backend.entities.User;
import com.scholarshare.scholarshare_backend.exceptions.ApiException;
import com.scholarshare.scholarshare_backend.repositories.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * "Who is calling?" for services. Controllers stay free of security code, and services
 * get the signed-in User entity with one line: currentUser.require().
 */
@Component
@RequiredArgsConstructor
public class CurrentUser {

    private final UserRepo userRepo;

    /** Empty for visitors that are not signed in (public endpoints). */
    public Optional<User> find() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return Optional.empty();
        }
        return userRepo.findByEmail(authentication.getName());
    }

    public User require() {
        return find().orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Please sign in"));
    }
}
