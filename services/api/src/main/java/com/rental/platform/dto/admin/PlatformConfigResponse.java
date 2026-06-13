package com.rental.platform.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class PlatformConfigResponse {
    private Long id;
    private String key;
    private String value;
    private String description;
    private Instant updatedAt;
}
