package com.rental.platform.service;

import com.rental.platform.domain.entity.Amenity;
import com.rental.platform.domain.repository.AmenityRepository;
import com.rental.platform.dto.property.PropertyResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AmenityService {

    private final AmenityRepository amenityRepository;

    @Transactional(readOnly = true)
    public List<PropertyResponse.AmenityResponse> getAllAmenities() {
        return amenityRepository.findAll().stream()
            .map(a -> PropertyResponse.AmenityResponse.builder()
                .id(a.getId())
                .name(a.getName())
                .category(a.getCategory().name())
                .icon(a.getIcon())
                .build())
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Amenity> findByIds(List<Long> ids) {
        return amenityRepository.findByIdIn(ids);
    }
}
