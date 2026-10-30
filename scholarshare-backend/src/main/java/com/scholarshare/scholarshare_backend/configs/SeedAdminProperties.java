package com.scholarshare.scholarshare_backend.configs;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Binds app.seed-admin.* from application.yaml. */
@ConfigurationProperties(prefix = "app.seed-admin")
public record SeedAdminProperties(boolean enabled, String name, String email, String password) {
}
