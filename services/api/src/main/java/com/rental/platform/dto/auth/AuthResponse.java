package com.rental.platform.dto.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;
    private UserSummary user;

    @Data
    @Builder
    public static class UserSummary {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String role;
        private String profilePhotoUrl;
        private boolean emailVerified;
    }
}
