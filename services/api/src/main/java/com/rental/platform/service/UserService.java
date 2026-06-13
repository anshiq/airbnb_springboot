package com.rental.platform.service;

import com.rental.platform.domain.entity.User;
import com.rental.platform.domain.enums.UserRole;
import com.rental.platform.domain.enums.UserStatus;
import com.rental.platform.domain.repository.UserRepository;
import com.rental.platform.dto.user.UpdateProfileRequest;
import com.rental.platform.dto.user.UserPageResponse;
import com.rental.platform.dto.user.UserResponse;
import com.rental.platform.exception.BusinessException;
import com.rental.platform.exception.ResourceNotFoundException;
import com.rental.platform.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getProfilePhotoUrl() != null) user.setProfilePhotoUrl(request.getProfilePhotoUrl());

        return toUserResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return toUserResponse(findUserById(id));
    }

    @Transactional(readOnly = true)
    public Page<UserPageResponse> getAllUsers(String query, Pageable pageable) {
        Page<User> users = (query != null && !query.isBlank())
            ? userRepository.searchUsers(query, pageable)
            : userRepository.findByDeletedFalse(pageable);
        return users.map(this::toUserPageResponse);
    }

    @Transactional
    public UserResponse updateUserStatus(Long userId, UserStatus status, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        if (admin.getRole() != UserRole.SUPER_ADMIN && admin.getRole() != UserRole.SUPPORT_AGENT) {
            throw new UnauthorizedException("Insufficient permissions to change user status");
        }

        User user = findUserById(userId);
        user.setStatus(status);
        return toUserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUserRole(Long userId, UserRole role, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        if (admin.getRole() != UserRole.SUPER_ADMIN) {
            throw new UnauthorizedException("Only Super Admins can change user roles");
        }

        User user = findUserById(userId);
        user.setRole(role);
        return toUserResponse(userRepository.save(user));
    }

    @Transactional
    public void softDeleteUser(Long userId, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        if (admin.getRole() != UserRole.SUPER_ADMIN) {
            throw new UnauthorizedException("Only Super Admins can delete accounts");
        }

        User user = findUserById(userId);
        if (user.isDeleted()) {
            throw new BusinessException("User is already deleted");
        }
        user.setDeleted(true);
        user.setDeletedAt(Instant.now());
        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
        log.info("User {} soft-deleted by admin {}", userId, adminEmail);
    }

    public User findUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public UserResponse toUserResponse(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .email(user.getEmail())
            .phone(user.getPhone())
            .role(user.getRole().name())
            .status(user.getStatus().name())
            .profilePhotoUrl(user.getProfilePhotoUrl())
            .bio(user.getBio())
            .emailVerified(user.isEmailVerified())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }

    private UserPageResponse toUserPageResponse(User user) {
        return UserPageResponse.builder()
            .id(user.getId())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .email(user.getEmail())
            .role(user.getRole().name())
            .status(user.getStatus().name())
            .profilePhotoUrl(user.getProfilePhotoUrl())
            .emailVerified(user.isEmailVerified())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
