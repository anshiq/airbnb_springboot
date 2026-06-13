package com.rental.platform.service;

import com.rental.platform.config.AppProperties;
import com.rental.platform.domain.entity.User;
import com.rental.platform.domain.enums.UserRole;
import com.rental.platform.domain.enums.UserStatus;
import com.rental.platform.domain.repository.*;
import com.rental.platform.dto.auth.RegisterRequest;
import com.rental.platform.exception.DuplicateResourceException;
import com.rental.platform.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock EmailVerificationTokenRepository emailVerificationTokenRepository;
    @Mock PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock JwtTokenProvider jwtTokenProvider;
    @Mock PasswordEncoder passwordEncoder;
    @Mock AuthenticationManager authenticationManager;
    @Mock UserDetailsService userDetailsService;
    @Mock EmailService emailService;
    @Mock AppProperties appProperties;

    @InjectMocks
    AuthService authService;

    @BeforeEach
    void setUp() {
        AppProperties.Jwt jwtProps = new AppProperties.Jwt();
        jwtProps.setRefreshTokenExpiryMs(604800000L);
        jwtProps.setAccessTokenExpiryMs(900000L);
        when(appProperties.getJwt()).thenReturn(jwtProps);
    }

    @Test
    void register_withNewEmail_createsUserAndReturnsTokens() {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("john@example.com");
        request.setPassword("Password123");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");

        User savedUser = User.builder()
                .firstName("John").lastName("Doe")
                .email("john@example.com").password("encoded-password")
                .role(UserRole.GUEST).status(UserStatus.PENDING_VERIFICATION)
                .build();
        setEntityId(savedUser, 1L);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        org.springframework.security.core.userdetails.UserDetails mockDetails =
                org.springframework.security.core.userdetails.User.builder()
                        .username("john@example.com").password("encoded-password")
                        .roles("GUEST").build();
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(mockDetails);
        when(jwtTokenProvider.generateAccessToken(any())).thenReturn("mock-access-token");
        when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);
        when(emailVerificationTokenRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        var response = authService.register(request);

        assertThat(response.getAccessToken()).isEqualTo("mock-access-token");
        assertThat(response.getUser().getEmail()).isEqualTo("john@example.com");
        assertThat(response.getUser().getRole()).isEqualTo("GUEST");
        verify(emailService).sendEmailVerification(eq("john@example.com"), anyString());
    }

    @Test
    void register_withExistingEmail_throwsDuplicateResourceException() {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Jane");
        request.setLastName("Doe");
        request.setEmail("existing@example.com");
        request.setPassword("Password123");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("email already exists");
    }

    @Test
    void verifyEmail_withValidToken_activatesUser() {
        User user = User.builder()
                .email("user@example.com").firstName("A").lastName("B")
                .password("p").role(UserRole.GUEST).status(UserStatus.PENDING_VERIFICATION)
                .emailVerified(false).build();
        setEntityId(user, 1L);

        com.rental.platform.domain.entity.EmailVerificationToken token =
                com.rental.platform.domain.entity.EmailVerificationToken.builder()
                        .user(user).token("valid-token")
                        .expiresAt(java.time.Instant.now().plusSeconds(3600))
                        .used(false).build();

        when(emailVerificationTokenRepository.findByTokenAndUsedFalse("valid-token"))
                .thenReturn(Optional.of(token));
        when(userRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);
        when(emailVerificationTokenRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        authService.verifyEmail("valid-token");

        assertThat(user.isEmailVerified()).isTrue();
        assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE);
    }

    private void setEntityId(Object entity, Long id) {
        try {
            var field = com.rental.platform.domain.entity.BaseEntity.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (Exception ignored) {
        }
    }
}
