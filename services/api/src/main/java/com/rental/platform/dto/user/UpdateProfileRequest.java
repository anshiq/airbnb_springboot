package com.rental.platform.dto.user;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(min = 2, max = 100)
    private String firstName;

    @Size(min = 2, max = 100)
    private String lastName;

    @Size(max = 20)
    private String phone;

    @Size(max = 1000)
    private String bio;

    private String profilePhotoUrl;
}
