package com.rental.platform.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "availability", uniqueConstraints = {
    @UniqueConstraint(name = "uk_availability_property_date", columnNames = {"property_id", "date"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Availability extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "is_blocked", nullable = false)
    @Builder.Default
    private boolean blocked = false;

    @Column(name = "custom_price", precision = 10, scale = 2)
    private BigDecimal customPrice;

    @Column(name = "note", length = 200)
    private String note;
}
