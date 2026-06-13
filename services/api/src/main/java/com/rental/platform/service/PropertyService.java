package com.rental.platform.service;

import com.rental.platform.domain.entity.Property;
import com.rental.platform.domain.repository.AvailabilityRepository;
import com.rental.platform.domain.repository.PropertyPhotoRepository;
import com.rental.platform.domain.repository.PropertyRepository;
import com.rental.platform.dto.property.PropertySummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.PropertyMapper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    // Add at line ~25
    private final PropertyMapper propertyMapper;
    private final PropertyPhotoRepository photoRepository;
    private final AvailabilityRepository availabilityRepository;

    /**
     * Converts a Property entity to a lightweight summary response used in listing
     * pages and admin moderation views.
     */
    public PropertySummaryResponse toPropertySummaryResponse(Property p) {
        String city =
            p.getLocation() != null ? p.getLocation().getCity() : null;
        String country =
            p.getLocation() != null ? p.getLocation().getCountry() : null;
        String firstPhotoUrl = (p.getPhotos() != null &&
            !p.getPhotos().isEmpty())
            ? p.getPhotos().get(0).getUrl()
            : null;

        return PropertySummaryResponse.builder()
            .id(p.getId())
            .title(p.getTitle())
            .propertyType(p.getPropertyType().name())
            .status(p.getStatus().name())
            .basePrice(p.getBasePrice())
            .averageRating(p.getAverageRating())
            .reviewCount(p.getReviewCount())
            .maxGuests(p.getMaxGuests())
            .bedrooms(p.getBedrooms())
            .bathrooms(p.getBathrooms())
            .beds(p.getBeds())
            .city(city)
            .country(country)
            .firstPhotoUrl(firstPhotoUrl)
            .hostId(p.getHost().getId())
            .hostName(p.getHost().getFullName())
            .createdAt(p.getCreatedAt())
            .build();
    }
}
