package com.rental.platform.service;

import com.rental.platform.domain.entity.User;
import com.rental.platform.domain.enums.UserRole;
import com.rental.platform.domain.repository.UserRepository;
import com.rental.platform.dto.admin.UserAdminResponse;
import com.rental.platform.dto.admin.UserRoleUpdateRequest;
import com.rental.platform.exception.BusinessException;
import com.rental.platform.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminUserRoleService {

    private final UserRepository userRepository;

    @Transactional
    public UserAdminResponse updateUserRole(Long userId, UserRoleUpdateRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (admin.getId().equals(user.getId()) && request.getRole() != UserRole.SUPER_ADMIN) {
            throw new BusinessException("You cannot change your own role");
        }

        user.setRole(request.getRole());
        userRepository.save(user);

        return UserAdminResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .emailVerified(user.isEmailVerified())
                .accountLocked(user.isAccountLocked())
                .createdAt(user.getCreatedAt())
                .build();
    }
}