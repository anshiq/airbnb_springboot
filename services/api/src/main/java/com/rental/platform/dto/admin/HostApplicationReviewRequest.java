package com.rental.platform.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HostApplicationReviewRequest {
    @NotNull
    private boolean approved;
    @NotBlank
    private String note;
}
