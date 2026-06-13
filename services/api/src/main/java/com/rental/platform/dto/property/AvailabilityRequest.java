package com.rental.platform.dto.property;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class AvailabilityRequest {

    @NotNull
    private List<LocalDate> dates;

    private boolean blocked;
    private BigDecimal customPrice;
    private String note;
}
