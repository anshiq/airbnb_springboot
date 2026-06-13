package com.rental.platform.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "messages", indexes = {
    @Index(name = "idx_messages_booking", columnList = "booking_id"),
    @Index(name = "idx_messages_sender", columnList = "sender_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean read = false;
}
