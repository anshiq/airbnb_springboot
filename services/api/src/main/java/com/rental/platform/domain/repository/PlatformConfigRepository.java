package com.rental.platform.domain.repository;

import com.rental.platform.domain.entity.PlatformConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlatformConfigRepository extends JpaRepository<PlatformConfig, Long> {

    Optional<PlatformConfig> findByKey(String key);

    boolean existsByKey(String key);
}
