package com.rental.platform.config;

import com.rental.platform.domain.entity.User;
import com.rental.platform.domain.enums.UserRole;
import com.rental.platform.domain.enums.UserStatus;
import com.rental.platform.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SuperAdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.super-admin.email}")
    private String superAdminEmail;

    @Value("${app.super-admin.password}")
    private String superAdminPassword;

    @Value("${app.super-admin.first-name:Super}")
    private String superAdminFirstName;

    @Value("${app.super-admin.last-name:Admin}")
    private String superAdminLastName;

    @Override
    public void run(String... args) {
        User superAdmin = userRepository.findByEmail(superAdminEmail)
                .orElseGet(this::createSuperAdmin);

        log.info("=================================================");
        log.info("SUPER ADMIN CREDENTIALS");
        log.info("Email:    {}", superAdmin.getEmail());
        log.info("Password: {}", superAdminPassword);
        log.info("=================================================");
    }

    private User createSuperAdmin() {
        User admin = User.builder()
                .firstName(superAdminFirstName)
                .lastName(superAdminLastName)
                .email(superAdminEmail)
                .password(passwordEncoder.encode(superAdminPassword))
                .role(UserRole.SUPER_ADMIN)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .build();

        return userRepository.save(admin);
    }
}