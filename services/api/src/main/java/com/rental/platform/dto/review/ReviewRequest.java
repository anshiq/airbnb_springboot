package com.rental.platform.dto.review;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ReviewRequest {

    @NotNull
    private Long bookingId;

    @NotNull
    @DecimalMin("1.0") @DecimalMax("5.0")
    private BigDecimal overallRating;

    @DecimalMin("1.0") @DecimalMax("5.0")
    private BigDecimal cleanlinessRating;

    @DecimalMin("1.0") @DecimalMax("5.0")
    private BigDecimal accuracyRating;

    @DecimalMin("1.0") @DecimalMax("5.0")
    private BigDecimal checkinRating;

    @DecimalMin("1.0") @DecimalMax("5.0")
    private BigDecimal communicationRating;

    @DecimalMin("1.0") @DecimalMax("5.0")
    private BigDecimal locationRating;

    @DecimalMin("1.0") @DecimalMax("5.0")
    private BigDecimal valueRating;

    @NotBlank
    @Size(min = 20, max = 2000)
    private String comment;
}
