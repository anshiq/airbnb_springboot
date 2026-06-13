package com.rental.platform.domain.entity;

import com.rental.platform.domain.enums.UserRole;
import com.rental.platform.domain.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_email", columnList = "email"),
    @Index(name = "idx_users_role", columnList = "role")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "phone", length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    @Builder.Default
    private UserRole role = UserRole.GUEST;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private UserStatus status = UserStatus.PENDING_VERIFICATION;

    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private boolean emailVerified = false;

    @Column(name = "account_locked", nullable = false)
    @Builder.Default
    private boolean accountLocked = false;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private boolean deleted = false;

    @OneToMany(mappedBy = "host", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<Property> properties = new ArrayList<>();

    @OneToMany(mappedBy = "guest", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Booking> bookings = new ArrayList<>();

    public boolean isEnabled() {
        return status == UserStatus.ACTIVE && !deleted;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
