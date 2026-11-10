package com.scholarshare.scholarshare_backend.securities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.scholarshare.scholarshare_backend.exceptions.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Checks a Google ID token by asking Google (https://oauth2.googleapis.com/tokeninfo). Google verifies the
 * signature and expiry; we check that it was issued for OUR client id and that the e-mail is verified.
 */
@Component
public class GoogleTokenVerifier {

    /** The parts of the token we use. */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record GoogleProfile(String sub, String email, String email_verified, String name, String aud) {
    }

    private final String clientId;
    private final RestClient http = RestClient.create("https://oauth2.googleapis.com");

    public GoogleTokenVerifier(@Value("${app.google.client-id:}") String clientId) {
        this.clientId = clientId == null ? "" : clientId.trim();
    }

    public GoogleProfile verify(String idToken) {
        if (clientId.isEmpty()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Google sign-in is not set up on the server (missing GOOGLE_CLIENT_ID).");
        }
        GoogleProfile profile;
        try {
            profile = http.get()
                    .uri(uri -> uri.path("/tokeninfo").queryParam("id_token", idToken).build())
                    .retrieve()
                    .body(GoogleProfile.class);
        } catch (RestClientException e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Google sign-in failed. Please try again.");
        }
        if (profile == null || profile.sub() == null || profile.email() == null
                || !clientId.equals(profile.aud()) || !"true".equals(profile.email_verified())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Google sign-in failed. Please try again.");
        }
        return profile;
    }
}
