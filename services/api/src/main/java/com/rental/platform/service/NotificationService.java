package com.rental.platform.service;

import com.rental.platform.domain.entity.Booking;
import com.rental.platform.domain.entity.Notification;
import com.rental.platform.domain.entity.User;
import com.rental.platform.domain.enums.NotificationType;
import com.rental.platform.domain.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Async
    @Transactional
    public void notifyBookingCreated(Booking booking) {
        // Notify host about new booking request
        createNotification(
            booking.getProperty().getHost(),
            "New Booking Request",
            booking.getGuest().getFullName() +
                " has requested to book " +
                booking.getProperty().getTitle(),
            NotificationType.BOOKING_REQUEST,
            booking.getId(),
            "BOOKING"
        );

        // Notify guest about booking submission
        createNotification(
            booking.getGuest(),
            "Booking Submitted",
            "Your booking for " +
                booking.getProperty().getTitle() +
                " has been submitted.",
            NotificationType.BOOKING_REQUEST,
            booking.getId(),
            "BOOKING"
        );
    }

    @Async
    @Transactional
    public void notifyBookingConfirmed(Booking booking) {
        createNotification(
            booking.getGuest(),
            "Booking Confirmed!",
            "Your booking for " +
                booking.getProperty().getTitle() +
                " has been confirmed.",
            NotificationType.BOOKING_CONFIRMED,
            booking.getId(),
            "BOOKING"
        );
    }

    @Async
    @Transactional
    public void notifyBookingCancelled(Booking booking) {
        createNotification(
            booking.getGuest(),
            "Booking Cancelled",
            "Your booking for " +
                booking.getProperty().getTitle() +
                " has been cancelled.",
            NotificationType.BOOKING_CANCELLED,
            booking.getId(),
            "BOOKING"
        );

        createNotification(
            booking.getProperty().getHost(),
            "Booking Cancelled",
            "A booking for " +
                booking.getProperty().getTitle() +
                " has been cancelled.",
            NotificationType.BOOKING_CANCELLED,
            booking.getId(),
            "BOOKING"
        );
    }

    @Async
    @Transactional
    public void notifyListingApproved(User host, String listingTitle) {
        createNotification(
            host,
            "Listing Approved",
            "Your listing \"" +
                listingTitle +
                "\" has been approved and is now live!",
            NotificationType.LISTING_APPROVED,
            null,
            null
        );
    }

    @Async
    @Transactional
    public void notifyListingRejected(
        User host,
        String listingTitle,
        String reason
    ) {
        createNotification(
            host,
            "Listing Not Approved",
            "Your listing \"" +
                listingTitle +
                "\" was not approved. Reason: " +
                reason,
            NotificationType.LISTING_REJECTED,
            null,
            null
        );
    }

    @Async
    @Transactional
    public void notifyHostApplicationResult(User user, boolean approved) {
        NotificationType type = approved
            ? NotificationType.HOST_APPLICATION_APPROVED
            : NotificationType.HOST_APPLICATION_REJECTED;
        String title = approved
            ? "Host Application Approved!"
            : "Host Application Update";
        String msg = approved
            ? "Congratulations! You are now a host. Start creating listings."
            : "Your host application was reviewed. Please check your email for details.";
        createNotification(user, title, msg, type, null, null);
    }

    @Transactional(readOnly = true)
    public Page<NotificationDto> getUserNotifications(
        Long userId,
        Pageable pageable
    ) {
        return notificationRepository
            .findByUserId(userId, pageable)
            .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadForUser(userId);
    }

    private void createNotification(
        User user,
        String title,
        String message,
        NotificationType type,
        Long refId,
        String refType
    ) {
        Notification notification = Notification.builder()
            .user(user)
            .title(title)
            .message(message)
            .type(type)
            .referenceId(refId)
            .referenceType(refType)
            .build();
        notificationRepository.save(notification);
    }

    private NotificationDto toDto(Notification n) {
        return NotificationDto.builder()
            .id(n.getId())
            .title(n.getTitle())
            .message(n.getMessage())
            .type(n.getType().name())
            .read(n.isRead())
            .referenceId(n.getReferenceId())
            .referenceType(n.getReferenceType())
            .createdAt(n.getCreatedAt())
            .build();
    }

    @lombok.Builder
    @lombok.Data
    public static class NotificationDto {

        private Long id;
        private String title;
        private String message;
        private String type;
        private boolean read;
        private Long referenceId;
        private String referenceType;
        private java.time.Instant createdAt;
    }
}
