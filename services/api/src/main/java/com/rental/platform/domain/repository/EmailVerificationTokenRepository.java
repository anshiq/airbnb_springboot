package com.rental.platform.domain.repository;

import com.rental.platform.domain.entity.EmailVerificationToken;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface EmailVerificationTokenRepository
    extends JpaRepository<EmailVerificationToken, Long>
{
    Optional<EmailVerificationToken> findByTokenAndUsedFalse(String token);

    @Modifying
    @Transactional
    @Query("DELETE FROM EmailVerificationToken t WHERE t.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
