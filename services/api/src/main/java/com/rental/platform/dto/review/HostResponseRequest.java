package com.rental.platform.dto.review;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class HostResponseRequest {
    @NotBlank
    @Size(min = 10, max = 1000)
    private String response;
}
