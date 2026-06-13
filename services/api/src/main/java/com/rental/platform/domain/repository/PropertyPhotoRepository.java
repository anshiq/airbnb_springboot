package com.rental.platform.domain.repository;

import com.rental.platform.domain.entity.PropertyPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyPhotoRepository extends JpaRepository<PropertyPhoto, Long> {

    List<PropertyPhoto> findByPropertyIdOrderByDisplayOrderAsc(Long propertyId);

    Optional<PropertyPhoto> findByPropertyIdAndPrimaryTrue(Long propertyId);
    // Add these methods
    void deleteByIdAndPropertyId(Long photoId, Long propertyId);

    Optional<PropertyPhoto> findByIdAndPropertyId(Long id, Long propertyId);

    long countByPropertyId(Long propertyId);

    void deleteByPropertyId(Long propertyId);
}
