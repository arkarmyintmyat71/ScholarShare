package com.scholarshare.scholarshare_backend.configs;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/** Binds app.cors.* from application.yaml. */
@ConfigurationProperties(prefix = "app.cors")
public record CorsProperties(List<String> allowedOrigins) {
    public CorsProperties {
        allowedOrigins = allowedOrigins == null ? List.of() : List.copyOf(allowedOrigins);
    }
}
