package com.rental.platform.dto.property;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilityRequest {

    // Used when returning a single availability slot (toAvailabilityResponse)
    private LocalDate date;
    private boolean available;
    private BigDecimal customPrice;

    // Used when the host submits a bulk calendar update
    @Valid
    private List<AvailabilityEntry> dates;

    // ------------------------------------------------------------------ //
    //  Nested: AvailabilityEntry (one slot in the bulk update list)
    // ------------------------------------------------------------------ //
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AvailabilityEntry {

        @NotNull(message = "Date is required")
        private LocalDate date;

        private boolean available;

        private BigDecimal customPrice;
    }
}