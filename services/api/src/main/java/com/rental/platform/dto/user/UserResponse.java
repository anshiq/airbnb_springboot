package com.rental.platform.dto.user;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role;
    private String status;
    private String profilePhotoUrl;
    private String bio;
    private boolean emailVerified;
    private Instant createdAt;
    private Instant updatedAt;
}
