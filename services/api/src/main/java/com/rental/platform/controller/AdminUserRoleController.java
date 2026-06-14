package com.rental.platform.controller;

import com.rental.platform.common.response.ApiResponse;
import com.rental.platform.dto.admin.UserAdminResponse;
import com.rental.platform.dto.admin.UserRoleUpdateRequest;
import com.rental.platform.service.AdminUserRoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin - User Roles", description = "Admin endpoints for promoting/changing user roles")
public class AdminUserRoleController {

    private final AdminUserRoleService adminUserRoleService;

    @PatchMapping("/{id}/role")
    @Operation(summary = "Change a user's role (promote/demote)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<UserAdminResponse>> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UserRoleUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                adminUserRoleService.updateUserRole(id, request, userDetails.getUsername())));
    }
}