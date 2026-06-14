package com.rental.platform.service;

import com.rental.platform.domain.entity.User;
import com.rental.platform.domain.enums.UserRole;
import com.rental.platform.domain.enums.UserStatus;
import com.rental.platform.domain.repository.UserRepository;
import com.rental.platform.dto.admin.UserAdminResponse;
import com.rental.platform.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<UserAdminResponse> getAllUsers(String role, String status, String search, Pageable pageable) {
        Specification<User> spec = Specification.where((root, query, cb) -> cb.isFalse(root.get("deleted")));

        if (role != null && !role.isBlank()) {
            UserRole roleEnum = UserRole.valueOf(role.toUpperCase());
            spec = spec.and((root, query, cb) -> cb.equal(root.get("role"), roleEnum));
        }

        if (status != null && !status.isBlank()) {
            UserStatus statusEnum = UserStatus.valueOf(status.toUpperCase());
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), statusEnum));
        }

        if (search != null && !search.isBlank()) {
            String like = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("firstName")), like),
                    cb.like(cb.lower(root.get("lastName")), like),
                    cb.like(cb.lower(root.get("email")), like)
            ));
        }

        return userRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public UserAdminResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        return toResponse(user);
    }

    private UserAdminResponse toResponse(User user) {
        return UserAdminResponse.builder()
                .id(user.getId())
                .role(user.getRole().name())
                .status(user.getStatus().name())
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