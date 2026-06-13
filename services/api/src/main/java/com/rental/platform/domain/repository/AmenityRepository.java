package com.rental.platform.domain.repository;

import com.rental.platform.domain.entity.Amenity;
import com.rental.platform.domain.enums.AmenityCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AmenityRepository extends JpaRepository<Amenity, Long> {

    List<Amenity> findByCategory(AmenityCategory category);

    List<Amenity> findByIdIn(List<Long> ids);
}
