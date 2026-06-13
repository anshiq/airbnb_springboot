package com.rental.platform.dto.message;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MessageRequest {
    @NotNull
    private Long bookingId;

    @NotBlank
    @Size(min = 1, max = 2000)
    private String content;
}
