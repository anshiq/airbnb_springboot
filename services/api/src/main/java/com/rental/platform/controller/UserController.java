package com.rental.platform.controller;

import com.rental.platform.common.response.ApiResponse;
import com.rental.platform.common.response.PageResponse;
import com.rental.platform.domain.enums.UserRole;
import com.rental.platform.domain.enums.UserStatus;
import com.rental.platform.dto.user.UpdateProfileRequest;
import com.rental.platform.dto.user.UserPageResponse;
import com.rental.platform.dto.user.UserResponse;
import com.rental.platform.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile management and admin user operations")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(userService.getCurrentUser(userDetails.getUsername())));
    }

    @PatchMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateProfile(userDetails.getUsername(), request)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID (admin only)")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SUPPORT_AGENT', 'PROPERTY_MANAGER')")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @GetMapping
    @Operation(summary = "List all users with optional search (admin only)")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SUPPORT_AGENT', 'PROPERTY_MANAGER')")
    public ResponseEntity<ApiResponse<PageResponse<UserPageResponse>>> getAllUsers(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(userService.getAllUsers(query, pageable))));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update user account status (admin only)")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SUPPORT_AGENT')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable Long id,
            @RequestParam UserStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateUserStatus(id, status, userDetails.getUsername())));
    }

    @PatchMapping("/{id}/role")
    @Operation(summary = "Update user role (Super Admin only)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable Long id,
            @RequestParam UserRole role,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateUserRole(id, role, userDetails.getUsername())));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete user account (Super Admin only)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        userService.softDeleteUser(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }
}
