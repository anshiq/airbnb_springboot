package com.rental.platform.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "property_photos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyPhoto extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "url", nullable = false)
    private String url;

    @Column(name = "caption", length = 200)
    private String caption;

    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    private boolean primary = false;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private int displayOrder = 0;
}
