package com.rental.platform.dto.admin;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class UserAdminResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role;
    private String status;
    private boolean emailVerified;
    private boolean accountLocked;
    private Instant createdAt;
}