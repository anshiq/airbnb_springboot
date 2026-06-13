package com.rental.platform.controller;

import com.rental.platform.common.response.ApiResponse;
import com.rental.platform.common.response.PageResponse;
import com.rental.platform.dto.message.MessageRequest;
import com.rental.platform.dto.message.MessageResponse;
import com.rental.platform.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
@Tag(name = "Messages", description = "Per-booking conversation threads between guests and hosts")
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    @Operation(summary = "Send a message in a booking conversation")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody MessageRequest request) {
        MessageResponse response = messageService.sendMessage(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get all messages in a booking conversation")
    public ResponseEntity<ApiResponse<PageResponse<MessageResponse>>> getConversation(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(
                messageService.getConversation(bookingId, userDetails.getUsername(), pageable))));
    }

    @PostMapping("/booking/{bookingId}/read")
    @Operation(summary = "Mark all messages in a conversation as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal UserDetails userDetails) {
        messageService.markAsRead(bookingId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Messages marked as read", null));
    }
}
