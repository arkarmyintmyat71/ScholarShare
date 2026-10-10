package com.scholarshare.scholarshare_backend.entities;
import com.scholarshare.scholarshare_backend.entities.enums.AccountStatus;
import com.scholarshare.scholarshare_backend.entities.enums.Provider;
import com.scholarshare.scholarshare_backend.entities.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(
        name = "users",
        indexes = {
                // Speeds up the two hottest lookups: login-by-email and google-id lookup.
                @Index(name = "idx_users_email", columnList = "email", unique = true),
                @Index(name = "idx_users_google_id", columnList = "google_id", unique = true)
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    /** BCrypt hash. Null when provider = GOOGLE. **/
    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "picture_url")
    private String pictureUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Provider provider;

    /** Google account id. Unique when set. Null when provider = LOCAL. */
    @Column(name = "google_id")
    private String googleId;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false)
    private AccountStatus accountStatus;

    @Column(name = "university", nullable = false,  length = 150)
    private String university;

    @Column(name = "bio",  length = 500)
    private String bio;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
