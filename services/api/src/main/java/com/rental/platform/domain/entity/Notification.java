package com.rental.platform.domain.entity;

import com.rental.platform.domain.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notifications_user", columnList = "user_id"),
    @Index(name = "idx_notifications_read", columnList = "is_read")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private NotificationType type;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean read = false;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "reference_type", length = 50)
    private String referenceType;
}
