package com.rental.platform.dto.user;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class UserPageResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String status;
    private String profilePhotoUrl;
    private boolean emailVerified;
    private Instant createdAt;
}
