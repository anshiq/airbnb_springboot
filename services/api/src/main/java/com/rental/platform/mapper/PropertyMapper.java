package com.rental.platform.mapper;

import com.rental.platform.domain.entity.*;
import com.rental.platform.domain.enums.BookingType;
import com.rental.platform.domain.enums.CancellationPolicy;
import com.rental.platform.domain.enums.PropertyType;
import com.rental.platform.dto.property.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PropertyMapper {

    // ------------------------------------------------------------------ //
    //  PropertyRequest  →  Property entity (CREATE)
    // ------------------------------------------------------------------ //
    public Property toEntity(PropertyRequest request) {
        Property property = Property.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .propertyType(PropertyType.valueOf(request.getPropertyType()))
                .maxGuests(request.getMaxGuests())
                .bedrooms(request.getBedrooms())
                .bathrooms(request.getBathrooms())
                .beds(request.getBeds())
                .basePrice(request.getBasePrice())
                .cleaningFee(request.getCleaningFee() != null
                        ? request.getCleaningFee()
                        : java.math.BigDecimal.ZERO)
                .bookingType(request.getBookingType() != null
                        ? BookingType.valueOf(request.getBookingType())
                        : BookingType.INSTANT)
                .cancellationPolicy(request.getCancellationPolicy() != null
                        ? CancellationPolicy.valueOf(request.getCancellationPolicy())
                        : CancellationPolicy.MODERATE)
                .minNights(request.getMinNights() != null ? request.getMinNights() : 1)
                .maxNights(request.getMaxNights() != null ? request.getMaxNights() : 365)
                .build();

        if (request.getLocation() != null) {
            property.setLocation(toLocationEntity(request.getLocation()));
        }

        return property;
    }

    // ------------------------------------------------------------------ //
    //  PropertyUpdateRequest  →  update existing Property entity
    // ------------------------------------------------------------------ //
    public void updateEntity(Property property, PropertyUpdateRequest request) {
        if (request.getTitle() != null)
            property.setTitle(request.getTitle());
        if (request.getDescription() != null)
            property.setDescription(request.getDescription());
        if (request.getPropertyType() != null)
            property.setPropertyType(PropertyType.valueOf(request.getPropertyType()));
        if (request.getMaxGuests() != null)
            property.setMaxGuests(request.getMaxGuests());
        if (request.getBedrooms() != null)
            property.setBedrooms(request.getBedrooms());
        if (request.getBathrooms() != null)
            property.setBathrooms(request.getBathrooms());
        if (request.getBeds() != null)
            property.setBeds(request.getBeds());
        if (request.getBasePrice() != null)
            property.setBasePrice(request.getBasePrice());
        if (request.getCleaningFee() != null)
            property.setCleaningFee(request.getCleaningFee());
        if (request.getBookingType() != null)
            property.setBookingType(BookingType.valueOf(request.getBookingType()));
        if (request.getCancellationPolicy() != null)
            property.setCancellationPolicy(CancellationPolicy.valueOf(request.getCancellationPolicy()));
        if (request.getMinNights() != null)
            property.setMinNights(request.getMinNights());
        if (request.getMaxNights() != null)
            property.setMaxNights(request.getMaxNights());
        if (request.getLocation() != null && property.getLocation() != null) {
            updateLocationEntity(property.getLocation(), request.getLocation());
        } else if (request.getLocation() != null) {
            property.setLocation(toLocationEntity(request.getLocation()));
        }
    }

    // ------------------------------------------------------------------ //
    //  Property entity  →  PropertyResponse (full detail)
    // ------------------------------------------------------------------ //
    public PropertyResponse toResponse(Property property) {
        List<PropertyResponse.PhotoResponse> photos = property.getPhotos() == null
                ? List.of()
                : property.getPhotos().stream()
                  .map(this::toPhotoResponse)
                  .collect(Collectors.toList());

        List<PropertyResponse.AmenityResponse> amenityNames = property.getAmenities() == null
                ? List.of()
                : property.getAmenities().stream()
                  .map(a -> PropertyResponse.AmenityResponse.builder()
                            .id(a.getId())
                            .name(a.getName())
                            .category(a.getCategory() != null ? a.getCategory().name() : null)
                            .icon(a.getIcon())
                            .build())
                  .collect(Collectors.toList());

        PropertyResponse.LocationResponse locationResponse =
                property.getLocation() != null ? toLocationResponse(property.getLocation()) : null;

        return PropertyResponse.builder()
                .id(property.getId())
                .title(property.getTitle())
                .description(property.getDescription())
                .propertyType(property.getPropertyType().name())
                .status(property.getStatus().name())
                .maxGuests(property.getMaxGuests())
                .bedrooms(property.getBedrooms())
                .bathrooms(property.getBathrooms())
                .beds(property.getBeds())
                .basePrice(property.getBasePrice())
                .cleaningFee(property.getCleaningFee())
                .serviceFeePercent(property.getServiceFeePercent())
                .taxPercent(property.getTaxPercent())
                .bookingType(property.getBookingType().name())
                .cancellationPolicy(property.getCancellationPolicy().name())
                .minNights(property.getMinNights())
                .maxNights(property.getMaxNights())
                .averageRating(property.getAverageRating())
                .reviewCount(property.getReviewCount())
                .hostId(property.getHost().getId())
                .hostName(property.getHost().getFullName())
                .location(locationResponse)
                .photos(photos)
                .amenities(amenityNames)
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .build();
    }

    // ------------------------------------------------------------------ //
    //  Availability entity  →  AvailabilityResponse
    // ------------------------------------------------------------------ //
    public AvailabilityRequest toAvailabilityResponse(Availability availability) {
        return AvailabilityRequest.builder()
                .date(availability.getDate())
                .build();
    }

    // ------------------------------------------------------------------ //
    //  Private helpers
    // ------------------------------------------------------------------ //
    private PropertyResponse.PhotoResponse toPhotoResponse(PropertyPhoto photo) {
        return PropertyResponse.PhotoResponse.builder()
                .id(photo.getId())
                .url(photo.getUrl())
                .caption(photo.getCaption())
                .primary(photo.isPrimary())
                .displayOrder(photo.getDisplayOrder())
                .build();
    }

    private Location toLocationEntity(PropertyRequest.LocationRequest req) {
        return Location.builder()
                .addressLine1(req.getAddressLine1())
                .addressLine2(req.getAddressLine2())
                .city(req.getCity())
                .state(req.getState())
                .country(req.getCountry())
                .zipCode(req.getZipCode())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .build();
    }

    private void updateLocationEntity(Location location, PropertyRequest.LocationRequest req) {
        if (req.getAddressLine1() != null) location.setAddressLine1(req.getAddressLine1());
        if (req.getAddressLine2() != null) location.setAddressLine2(req.getAddressLine2());
        if (req.getCity() != null)         location.setCity(req.getCity());
        if (req.getState() != null)        location.setState(req.getState());
        if (req.getCountry() != null)      location.setCountry(req.getCountry());
        if (req.getZipCode() != null)      location.setZipCode(req.getZipCode());
        if (req.getLatitude() != null)     location.setLatitude(req.getLatitude());
        if (req.getLongitude() != null)    location.setLongitude(req.getLongitude());
    }

    private PropertyResponse.LocationResponse toLocationResponse(Location location) {
        return PropertyResponse.LocationResponse.builder()
                .addressLine1(location.getAddressLine1())
                .addressLine2(location.getAddressLine2())
                .city(location.getCity())
                .state(location.getState())
                .country(location.getCountry())
                .zipCode(location.getZipCode())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .build();
    }
}