package com.rental.platform.domain.repository;

import com.rental.platform.domain.entity.HostApplication;
import com.rental.platform.domain.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HostApplicationRepository extends JpaRepository<HostApplication, Long> {

    Optional<HostApplication> findByUserId(Long userId);

    boolean existsByUserIdAndStatus(Long userId, ApplicationStatus status);

    Page<HostApplication> findByStatus(ApplicationStatus status, Pageable pageable);
}
