package com.rental.platform.service;

import com.rental.platform.domain.entity.Property;
import com.rental.platform.domain.repository.AvailabilityRepository;
import com.rental.platform.domain.repository.PropertyPhotoRepository;
import com.rental.platform.domain.repository.PropertyRepository;
import com.rental.platform.dto.property.PropertySummaryResponse;
import com.rental.platform.exception.ResourceNotFoundException;
import com.rental.platform.mapper.PropertyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.rental.platform.domain.entity.*;
import com.rental.platform.domain.enums.PropertyStatus;
import com.rental.platform.domain.repository.AvailabilityRepository;
import com.rental.platform.domain.repository.UserRepository;
import com.rental.platform.dto.property.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PropertyService {
private final UserRepository userRepository;
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
    public PropertyResponse createProperty(String email, PropertyRequest request) {
    User host = userRepository.findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    Property property = propertyMapper.toEntity(request);
    property.setHost(host);
    Property saved = propertyRepository.save(property);
    return propertyMapper.toResponse(saved);
}

public PropertyResponse getPropertyById(Long id) {
    Property property = propertyRepository.findByIdAndStatusNot(id, PropertyStatus.DELETED)
        .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
    return propertyMapper.toResponse(property);
}

public PropertyResponse updateProperty(Long id, String email, PropertyUpdateRequest request) {
    Property property = propertyRepository.findByIdAndStatusNot(id, PropertyStatus.DELETED)
        .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
    if (!property.getHost().getEmail().equals(email)) {
        throw new AccessDeniedException("You do not own this property");
    }
    propertyMapper.updateEntity(property, request);
    return propertyMapper.toResponse(propertyRepository.save(property));
}

public PropertyResponse submitForReview(Long id, String email) {
    Property property = propertyRepository.findByIdAndStatusNot(id, PropertyStatus.DELETED)
        .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
    if (!property.getHost().getEmail().equals(email)) {
        throw new AccessDeniedException("You do not own this property");
    }
    property.setStatus(PropertyStatus.PENDING_REVIEW);
    return propertyMapper.toResponse(propertyRepository.save(property));
}

public void deleteProperty(Long id, String email) {
    Property property = propertyRepository.findByIdAndStatusNot(id, PropertyStatus.DELETED)
        .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
    if (!property.getHost().getEmail().equals(email)) {
        throw new AccessDeniedException("You do not own this property");
    }
    property.setStatus(PropertyStatus.DELETED);
    propertyRepository.save(property);
}

public Page<PropertySummaryResponse> getHostProperties(String email, Pageable pageable) {
    return propertyRepository.findByHostEmail(email, pageable)
        .map(this::toPropertySummaryResponse);
}

public PropertyResponse addPhotos(Long propertyId, String email, List<PropertyRequest.PhotoRequest> photos) {
    Property property = propertyRepository.findByIdAndStatusNot(propertyId, PropertyStatus.DELETED)
        .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
    if (!property.getHost().getEmail().equals(email)) {
        throw new AccessDeniedException("You do not own this property");
    }
    long currentCount = photoRepository.countByPropertyId(propertyId);
    for (int i = 0; i < photos.size(); i++) {
        PropertyRequest.PhotoRequest pr = photos.get(i);
        PropertyPhoto photo = PropertyPhoto.builder()
            .property(property)
            .url(pr.getUrl())
            .caption(pr.getCaption())
            .primary(currentCount == 0 && i == 0)
            .displayOrder((int) currentCount + i)
            .build();
        photoRepository.save(photo);
    }
    return propertyMapper.toResponse(propertyRepository.findById(propertyId).orElseThrow());
}

@Transactional
public void deletePhoto(Long propertyId, Long photoId, String email) {
    Property property = propertyRepository.findByIdAndStatusNot(propertyId, PropertyStatus.DELETED)
        .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
    if (!property.getHost().getEmail().equals(email)) {
        throw new AccessDeniedException("You do not own this property");
    }
    photoRepository.findByIdAndPropertyId(photoId, propertyId)
        .orElseThrow(() -> new ResourceNotFoundException("Photo not found"));
    photoRepository.deleteByIdAndPropertyId(photoId, propertyId);
}

public void updateAvailability(Long id, String email, AvailabilityRequest request) {
    Property property = propertyRepository.findByIdAndStatusNot(id, PropertyStatus.DELETED)
        .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
    if (!property.getHost().getEmail().equals(email)) {
        throw new AccessDeniedException("You do not own this property");
    }

    request.getDates().forEach(date -> {
        Availability availability = Availability.builder()
            .property(property)
            .date(date.getDate())
            .build();
        availabilityRepository.save(availability);
    });
}

public List<AvailabilityRequest> getAvailability(Long id, LocalDate start, LocalDate end) {
    return availabilityRepository.findByPropertyIdAndDateBetween(id, start, end)
        .stream()
        .map(propertyMapper::toAvailabilityResponse)
        .collect(Collectors.toList());
}

public Page<PropertySummaryResponse> searchProperties(String city, LocalDate checkIn, LocalDate checkOut,
        int guests, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
    return propertyRepository.searchAvailable(city, guests, minPrice, maxPrice, checkIn, checkOut, pageable)
        .map(this::toPropertySummaryResponse);
}
}
