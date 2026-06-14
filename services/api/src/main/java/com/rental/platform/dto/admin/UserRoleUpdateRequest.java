package com.rental.platform.dto.admin;

import com.rental.platform.domain.enums.UserRole;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRoleUpdateRequest {

    @NotNull(message = "Role is required")
    private UserRole role;
}