package com.rental.platform.service;

import com.rental.platform.domain.entity.Booking;
import com.rental.platform.domain.entity.Message;
import com.rental.platform.domain.entity.User;
import com.rental.platform.domain.repository.BookingRepository;
import com.rental.platform.domain.repository.MessageRepository;
import com.rental.platform.domain.repository.UserRepository;
import com.rental.platform.dto.message.MessageRequest;
import com.rental.platform.dto.message.MessageResponse;
import com.rental.platform.exception.ResourceNotFoundException;
import com.rental.platform.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Transactional
    public MessageResponse sendMessage(String senderEmail, MessageRequest request) {
        User sender = userRepository.findByEmail(senderEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Booking booking = bookingRepository.findById(request.getBookingId())
            .orElseThrow(() -> new ResourceNotFoundException("Booking", request.getBookingId()));

        boolean isParticipant = booking.getGuest().getEmail().equals(senderEmail)
            || booking.getProperty().getHost().getEmail().equals(senderEmail);

        if (!isParticipant) {
            throw new UnauthorizedException("You are not a participant in this booking conversation");
        }

        Message message = Message.builder()
            .booking(booking)
            .sender(sender)
            .content(request.getContent())
            .build();

        return toMessageResponse(messageRepository.save(message));
    }

    @Transactional(readOnly = true)
    public Page<MessageResponse> getConversation(Long bookingId, String userEmail, Pageable pageable) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingId));

        boolean isParticipant = booking.getGuest().getEmail().equals(userEmail)
            || booking.getProperty().getHost().getEmail().equals(userEmail);

        if (!isParticipant) {
            throw new UnauthorizedException("You are not a participant in this booking conversation");
        }

        return messageRepository.findByBookingIdOrderByCreatedAtAsc(bookingId, pageable).map(this::toMessageResponse);
    }

    @Transactional
    public void markAsRead(Long bookingId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        messageRepository.markMessagesAsRead(bookingId, user.getId());
    }

    private MessageResponse toMessageResponse(Message m) {
        return MessageResponse.builder()
            .id(m.getId())
            .bookingId(m.getBooking().getId())
            .sender(MessageResponse.SenderSummary.builder()
                .id(m.getSender().getId())
                .firstName(m.getSender().getFirstName())
                .lastName(m.getSender().getLastName())
                .profilePhotoUrl(m.getSender().getProfilePhotoUrl())
                .build())
            .content(m.getContent())
            .read(m.isRead())
            .createdAt(m.getCreatedAt())
            .build();
    }
}
