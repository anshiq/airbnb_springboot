package com.rental.platform.domain.entity;

import com.rental.platform.domain.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "host_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostApplication extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column(name = "government_id_url", nullable = false)
    private String governmentIdUrl;

    @Column(name = "bio", nullable = false, columnDefinition = "TEXT")
    private String bio;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "review_note", columnDefinition = "TEXT")
    private String reviewNote;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;
}
