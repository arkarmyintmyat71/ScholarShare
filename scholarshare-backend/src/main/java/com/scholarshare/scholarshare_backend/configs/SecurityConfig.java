package com.scholarshare.scholarshare_backend.configs;

import com.scholarshare.scholarshare_backend.securities.JwtAuthenticationFilter;
import com.scholarshare.scholarshare_backend.securities.RestAccessDeniedHandler;
import com.scholarshare.scholarshare_backend.securities.RestAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Who may call what. Paths here are relative to the /api context path.
 *   public:  POST /auth/login, POST /auth/register, health check
 *   public:  GET /research, /research/{id}, /research/{id}/download, /categories
 *   admin:   /admin/**  (role ADMIN)
 *   student: upload, my uploads, create topic/comment, bookmarks  (role STUDENT)
 *   others:  any signed-in user (valid JWT): read topics, notifications, own profile
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)   // safe: stateless API, token in a header, no cookies
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .exceptionHandling(handling -> handling
                        .authenticationEntryPoint(authenticationEntryPoint)   // 401 JSON
                        .accessDeniedHandler(accessDeniedHandler))            // 403 JSON
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()   // CORS pre-flight
                        .requestMatchers(HttpMethod.POST, "/auth/login", "/auth/register").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        // Research: browsing and downloading are public (the service hides non-approved files).
                        // "/research/mine" must come BEFORE "/research/{id}" so it is not read as an id.
                        .requestMatchers(HttpMethod.GET, "/research/mine").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.GET, "/research", "/research/{id}", "/research/{id}/download", "/categories").permitAll()
                        .requestMatchers(HttpMethod.POST, "/research").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.POST, "/topics", "/topics/{id}/comments").hasRole("STUDENT")
                        .requestMatchers("/bookmarks/**").hasRole("STUDENT")
                        .anyRequest().authenticated()      // topics (read), notifications, /users/me, /auth/me
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
