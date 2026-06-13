package com.rental.platform.controller;

import com.rental.platform.common.response.ApiResponse;
import com.rental.platform.common.response.PageResponse;
import com.rental.platform.dto.review.HostResponseRequest;
import com.rental.platform.dto.review.ReviewRequest;
import com.rental.platform.dto.review.ReviewResponse;
import com.rental.platform.service.ReviewService;
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

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Post-stay reviews with 6 rating sub-categories and host public responses")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @Operation(summary = "Submit a review for a completed booking")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReviewRequest request) {
        ReviewResponse response = reviewService.createReview(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted successfully", response));
    }

    @GetMapping("/property/{propertyId}")
    @Operation(summary = "Get all visible reviews for a property")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getPropertyReviews(
            @PathVariable Long propertyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(reviewService.getPropertyReviews(propertyId, pageable))));
    }

    @GetMapping("/my-reviews")
    @Operation(summary = "Get current user's submitted reviews")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getMyReviews(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(reviewService.getUserReviews(userDetails.getUsername(), pageable))));
    }

    @PostMapping("/{reviewId}/host-response")
    @Operation(summary = "Add a host public response to a review")
    @PreAuthorize("hasAnyRole('HOST', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ReviewResponse>> addHostResponse(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody HostResponseRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                reviewService.addHostResponse(reviewId, userDetails.getUsername(), request)));
    }
}
