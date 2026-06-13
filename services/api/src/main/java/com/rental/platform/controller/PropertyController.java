package com.rental.platform.controller;

import com.rental.platform.common.response.ApiResponse;
import com.rental.platform.common.response.PageResponse;
import com.rental.platform.dto.property.*;
import com.rental.platform.service.AmenityService;
import com.rental.platform.service.PropertyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/properties")
@RequiredArgsConstructor
@Tag(name = "Properties", description = "Property listing management for hosts and admins")
public class PropertyController {

    private final PropertyService propertyService;
    private final AmenityService amenityService;

    @PostMapping
    @Operation(summary = "Create a new property listing (host only)")
    @PreAuthorize("hasAnyRole('HOST', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PropertyResponse>> createProperty(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PropertyRequest request) {
        PropertyResponse response = propertyService.createProperty(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Property created successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get property details by ID")
    public ResponseEntity<ApiResponse<PropertyResponse>> getProperty(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(propertyService.getPropertyById(id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update property listing (host only)")
    @PreAuthorize("hasAnyRole('HOST', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PropertyResponse>> updateProperty(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PropertyUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(propertyService.updateProperty(id, userDetails.getUsername(), request)));
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit listing for review")
    @PreAuthorize("hasAnyRole('HOST', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PropertyResponse>> submitForReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(propertyService.submitForReview(id, userDetails.getUsername())));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Archive/delete property (host only)")
    @PreAuthorize("hasAnyRole('HOST', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProperty(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        propertyService.deleteProperty(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Property archived successfully", null));
    }

    @GetMapping("/host/my-listings")
    @Operation(summary = "Get all listings for the current host")
    @PreAuthorize("hasAnyRole('HOST', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<PropertySummaryResponse>>> getMyListings(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(propertyService.getHostProperties(userDetails.getUsername(), pageable))));
    }

    @PostMapping("/{id}/photos")
    @Operation(summary = "Add photos to a property")
    @PreAuthorize("hasAnyRole('HOST', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PropertyResponse>> addPhotos(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody List<PropertyRequest.PhotoRequest> photos) {
        return ResponseEntity.ok(ApiResponse.success(propertyService.addPhotos(id, userDetails.getUsername(), photos)));
    }

    @DeleteMapping("/{propertyId}/photos/{photoId}")
    @Operation(summary = "Delete a property photo")
    @PreAuthorize("hasAnyRole('HOST', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePhoto(
            @PathVariable Long propertyId,
            @PathVariable Long photoId,
            @AuthenticationPrincipal UserDetails userDetails) {
        propertyService.deletePhoto(propertyId, photoId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Photo deleted", null));
    }

    @PutMapping("/{id}/availability")
    @Operation(summary = "Update property availability calendar")
    @PreAuthorize("hasAnyRole('HOST', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateAvailability(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AvailabilityRequest request) {
        propertyService.updateAvailability(id, userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Availability updated", null));
    }
    @GetMapping("/search")
@Operation(summary = "Search available properties")
public ResponseEntity<ApiResponse<PageResponse<PropertySummaryResponse>>> searchProperties(
        @RequestParam String city,
        @RequestParam LocalDate checkIn,
        @RequestParam LocalDate checkOut,
        @RequestParam(defaultValue = "1") int guests,
        @RequestParam(defaultValue = "0") BigDecimal minPrice,
        @RequestParam(defaultValue = "100000") BigDecimal maxPrice,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
    PageRequest pageable = PageRequest.of(page, size);
    return ResponseEntity.ok(ApiResponse.success(
        PageResponse.from(propertyService.searchProperties(city, checkIn, checkOut, guests, minPrice, maxPrice, pageable))
    ));
}

    @GetMapping("/{id}/availability")
    @Operation(summary = "Get property availability for a date range")
    public ResponseEntity<ApiResponse<List<AvailabilityRequest>>> getAvailability(
            @PathVariable Long id,
            @RequestParam LocalDate start,
            @RequestParam LocalDate end) {
        return ResponseEntity.ok(ApiResponse.success(propertyService.getAvailability(id, start, end)));
    }

    @GetMapping("/amenities")
    @Operation(summary = "Get all available amenities")
    public ResponseEntity<ApiResponse<List<?>>> getAmenities() {
        return ResponseEntity.ok(ApiResponse.success(amenityService.getAllAmenities()));
    }
}
