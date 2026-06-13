package com.rental.platform.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class HostApplicationRequest {
    @NotBlank private String governmentIdUrl;
    @NotBlank private String bio;
    @NotBlank private String reason;
}
