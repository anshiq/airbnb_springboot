package com.rental.platform.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "platform_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatformConfig extends BaseEntity {

    @Column(name = "config_key", nullable = false, unique = true, length = 100)
    private String key;

    @Column(name = "config_value", nullable = false, columnDefinition = "TEXT")
    private String value;

    @Column(name = "description", length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;
}
