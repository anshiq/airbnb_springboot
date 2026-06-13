package com.rental.platform.controller;

import com.rental.platform.common.response.ApiResponse;
import com.rental.platform.common.response.PageResponse;
import com.rental.platform.dto.admin.*;
import com.rental.platform.dto.property.PropertySummaryResponse;
import com.rental.platform.service.AdminService;
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

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin portal — listing moderation, host applications, platform config, analytics")
public class AdminController {

    private final AdminService adminService;

    // -------------------------------------------------------------------------
    // Dashboard
    // -------------------------------------------------------------------------

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get platform KPI dashboard stats")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER', 'SUPPORT_AGENT')")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats()));
    }

    // -------------------------------------------------------------------------
    // Listing Moderation
    // -------------------------------------------------------------------------

    @GetMapping("/listings/pending")
    @Operation(summary = "Get listings pending review")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER')")
    public ResponseEntity<ApiResponse<PageResponse<PropertySummaryResponse>>> getPendingListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(adminService.getPendingListings(pageable))));
    }

    @PatchMapping("/listings/{id}/moderate")
    @Operation(summary = "Approve, reject, or suspend a listing")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER')")
    public ResponseEntity<ApiResponse<PropertySummaryResponse>> moderateListing(
            @PathVariable Long id,
            @Valid @RequestBody ListingModerationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                adminService.moderateListing(id, request, userDetails.getUsername())));
    }

    // -------------------------------------------------------------------------
    // Host Applications
    // -------------------------------------------------------------------------

    @PostMapping("/host-applications")
    @Operation(summary = "Submit a host application")
    public ResponseEntity<ApiResponse<HostApplicationResponse>> submitApplication(
            @Valid @RequestBody HostApplicationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                adminService.submitHostApplication(userDetails.getUsername(), request)));
    }

    @GetMapping("/host-applications/pending")
    @Operation(summary = "Get all pending host applications (admin only)")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER')")
    public ResponseEntity<ApiResponse<PageResponse<HostApplicationResponse>>> getPendingApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(adminService.getPendingHostApplications(pageable))));
    }

    @PatchMapping("/host-applications/{id}/review")
    @Operation(summary = "Approve or reject a host application")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER')")
    public ResponseEntity<ApiResponse<HostApplicationResponse>> reviewApplication(
            @PathVariable Long id,
            @Valid @RequestBody HostApplicationReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                adminService.reviewHostApplication(id, request, userDetails.getUsername())));
    }

    // -------------------------------------------------------------------------
    // Platform Config (Super Admin only)
    // -------------------------------------------------------------------------

    @GetMapping("/config")
    @Operation(summary = "Get all platform configuration values")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<PlatformConfigResponse>>> getConfigs() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllConfigs()));
    }

    @PutMapping("/config")
    @Operation(summary = "Create or update a platform config entry (Super Admin only)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PlatformConfigResponse>> upsertConfig(
            @Valid @RequestBody PlatformConfigRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                adminService.upsertConfig(request, userDetails.getUsername())));
    }
}
