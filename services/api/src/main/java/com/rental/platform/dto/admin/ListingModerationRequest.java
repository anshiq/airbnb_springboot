package com.rental.platform.dto.admin;

import com.rental.platform.domain.enums.PropertyStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ListingModerationRequest {
    @NotNull
    private PropertyStatus action; // ACTIVE, REJECTED, SUSPENDED
    private String reason;
}
