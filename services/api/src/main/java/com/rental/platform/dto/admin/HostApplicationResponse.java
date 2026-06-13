package com.rental.platform.dto.admin;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class HostApplicationResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userFullName;
    private String status;
    private String governmentIdUrl;
    private String bio;
    private String reason;
    private String reviewNote;
    private String reviewedByEmail;
    private Instant reviewedAt;
    private Instant createdAt;
}
