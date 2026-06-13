package com.rental.platform.domain.repository;

import com.rental.platform.domain.entity.User;
import com.rental.platform.domain.enums.UserRole;
import com.rental.platform.domain.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Page<User> findByDeletedFalse(Pageable pageable);

    Page<User> findByRoleAndDeletedFalse(UserRole role, Pageable pageable);

    Page<User> findByStatusAndDeletedFalse(UserStatus status, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.deleted = false AND " +
           "(LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<User> searchUsers(@Param("query") String query, Pageable pageable);

    long countByRoleAndDeletedFalse(UserRole role);

    long countByStatusAndDeletedFalse(UserStatus status);
}
