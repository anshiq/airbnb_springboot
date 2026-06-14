package com.rental.platform.service;

import com.rental.platform.config.AppProperties;
import com.rental.platform.domain.entity.*;
import com.rental.platform.domain.enums.UserRole;
import com.rental.platform.domain.enums.UserStatus;
import com.rental.platform.domain.repository.*;
import com.rental.platform.dto.auth.*;
import com.rental.platform.exception.*;
import com.rental.platform.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final EmailService emailService;
    private final AppProperties appProperties;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        User user = User.builder()
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .email(request.getEmail().toLowerCase())
            .password(passwordEncoder.encode(request.getPassword()))
            .phone(request.getPhone())
            .role(UserRole.GUEST)
            .status(UserStatus.PENDING_VERIFICATION)
            .emailVerified(false)
            .build();

        user = userRepository.save(user);
        sendEmailVerificationToken(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        // Guest accounts need email verification first, but we still generate tokens
        // so they can complete verification flow
        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        String accessToken = jwtTokenProvider.generateAccessToken(auth);
        String refreshToken = createRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse login(LoginRequest request)  {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.isDeleted()) {
            throw new UnauthorizedException("Account has been deleted");
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new UnauthorizedException("Account has been suspended. Please contact support.");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        String refreshToken = createRefreshToken(user);

        log.info("User {} logged in successfully", user.getEmail());
        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken storedToken = refreshTokenRepository.findByTokenAndRevokedFalse(request.getRefreshToken())
            .orElseThrow(() -> new UnauthorizedException("Invalid or expired refresh token"));

        if (storedToken.isExpired()) {
            storedToken.setRevoked(true);
            refreshTokenRepository.save(storedToken);
            throw new UnauthorizedException("Refresh token has expired. Please login again.");
        }

        User user = storedToken.getUser();
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        String newAccessToken = jwtTokenProvider.generateAccessToken(auth);

        return buildAuthResponse(user, newAccessToken, storedToken.getToken());
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByTokenAndRevokedFalse(refreshToken)
            .ifPresent(token -> {
                token.setRevoked(true);
                refreshTokenRepository.save(token);
            });
    }

    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken evToken = emailVerificationTokenRepository.findByTokenAndUsedFalse(token)
            .orElseThrow(() -> new BusinessException("Invalid or already used verification token"));

        if (evToken.isExpired()) {
            throw new BusinessException("Email verification token has expired. Please request a new one.");
        }

        User user = evToken.getUser();
        user.setEmailVerified(true);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        evToken.setUsed(true);
        emailVerificationTokenRepository.save(evToken);
        log.info("Email verified for user: {}", user.getEmail());
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email.toLowerCase())
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (user.isEmailVerified()) {
            throw new BusinessException("Email is already verified");
        }

        emailVerificationTokenRepository.deleteByUserId(user.getId());
        sendEmailVerificationToken(user);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail().toLowerCase()).ifPresent(user -> {
            passwordResetTokenRepository.deleteByUserId(user.getId());
            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .token(token)
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();
            passwordResetTokenRepository.save(resetToken);
            emailService.sendPasswordReset(user.getEmail(), token);
        });
        // Always return success to prevent email enumeration
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenAndUsedFalse(request.getToken())
            .orElseThrow(() -> new BusinessException("Invalid or already used reset token"));

        if (resetToken.isExpired()) {
            throw new BusinessException("Password reset token has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
        refreshTokenRepository.revokeAllUserTokens(user.getId());
        log.info("Password reset for user: {}", user.getEmail());
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        refreshTokenRepository.revokeAllUserTokens(user.getId());
    }

    private void sendEmailVerificationToken(User user) {
        String token = UUID.randomUUID().toString();
        EmailVerificationToken evToken = EmailVerificationToken.builder()
            .user(user)
            .token(token)
            .expiresAt(Instant.now().plusSeconds(86400)) // 24 hours
            .build();
        emailVerificationTokenRepository.save(evToken);
        emailService.sendEmailVerification(user.getEmail(), token);
    }

    private String createRefreshToken(User user) {
        String token = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
            .user(user)
            .token(token)
            .expiresAt(Instant.now().plusMillis(appProperties.getJwt().getRefreshTokenExpiryMs()))
            .build();
        refreshTokenRepository.save(refreshToken);
        return token;
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(appProperties.getJwt().getAccessTokenExpiryMs() / 1000)
            .user(AuthResponse.UserSummary.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .emailVerified(user.isEmailVerified())
                .build())
            .build();
    }
}
