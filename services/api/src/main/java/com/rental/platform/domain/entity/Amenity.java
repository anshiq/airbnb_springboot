package com.rental.platform.domain.entity;

import com.rental.platform.domain.enums.AmenityCategory;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "amenities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Amenity extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private AmenityCategory category;

    @Column(name = "icon", length = 100)
    private String icon;

    @ManyToMany(mappedBy = "amenities")
    @Builder.Default
    private Set<Property> properties = new HashSet<>();
}
