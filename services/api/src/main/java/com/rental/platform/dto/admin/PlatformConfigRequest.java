package com.rental.platform.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PlatformConfigRequest {
    @NotBlank private String key;
    @NotBlank private String value;
    private String description;
}
