package com.rental.platform.controller;

import com.rental.platform.common.response.ApiResponse;
import com.rental.platform.common.response.PageResponse;
import com.rental.platform.domain.repository.UserRepository;
import com.rental.platform.exception.ResourceNotFoundException;
import com.rental.platform.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "In-app notification bell for key platform events")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get paginated notifications for the current user")
    public ResponseEntity<ApiResponse<PageResponse<NotificationService.NotificationDto>>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = resolveUserId(userDetails);
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(notificationService.getUserNotifications(userId, pageable))));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get count of unread notifications")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.getUnreadCount(resolveUserId(userDetails))));
    }

    @PostMapping("/mark-all-read")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UserDetails userDetails) {
        notificationService.markAllAsRead(resolveUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    private Long resolveUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getId();
    }
}
