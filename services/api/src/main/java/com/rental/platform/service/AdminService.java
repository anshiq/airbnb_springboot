package com.rental.platform.service;

import com.rental.platform.domain.entity.*;
import com.rental.platform.domain.enums.*;
import com.rental.platform.domain.repository.*;
import com.rental.platform.dto.admin.*;
import com.rental.platform.dto.property.PropertySummaryResponse;
import com.rental.platform.exception.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Month;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final HostApplicationRepository hostApplicationRepository;
    private final PlatformConfigRepository platformConfigRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final PropertyService propertyService;

    // --- Listing Moderation ---

    @Transactional(readOnly = true)
    public Page<PropertySummaryResponse> getPendingListings(Pageable pageable) {
        return propertyRepository.findByStatus(PropertyStatus.PENDING_REVIEW, pageable)
            .map(propertyService::toPropertySummaryResponse);
    }

    @Transactional
    public PropertySummaryResponse moderateListing(Long propertyId, ListingModerationRequest request, String adminEmail) {
        Property property = propertyRepository.findById(propertyId)
            .orElseThrow(() -> new ResourceNotFoundException("Property", propertyId));

        User admin = userRepository.findByEmail(adminEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        PropertyStatus newStatus = request.getAction();

        if (newStatus != PropertyStatus.ACTIVE && newStatus != PropertyStatus.REJECTED && newStatus != PropertyStatus.SUSPENDED) {
            throw new BusinessException("Invalid moderation action. Use ACTIVE, REJECTED, or SUSPENDED.");
        }

        property.setStatus(newStatus);
        property.setReviewedBy(admin.getId());
        property.setReviewedAt(Instant.now());

        if (newStatus == PropertyStatus.REJECTED || newStatus == PropertyStatus.SUSPENDED) {
            property.setRejectionReason(request.getReason());
        }

        propertyRepository.save(property);

        if (newStatus == PropertyStatus.ACTIVE) {
            notificationService.notifyListingApproved(property.getHost(), property.getTitle());
            emailService.sendListingStatusUpdate(property.getHost().getEmail(), property.getTitle(), "APPROVED", null);
        } else {
            notificationService.notifyListingRejected(property.getHost(), property.getTitle(), request.getReason());
            emailService.sendListingStatusUpdate(property.getHost().getEmail(), property.getTitle(), newStatus.name(), request.getReason());
        }

        return propertyService.toPropertySummaryResponse(property);
    }

    // --- Host Applications ---

    @Transactional
    public HostApplicationResponse submitHostApplication(String userEmail, HostApplicationRequest request) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == UserRole.HOST) {
            throw new BusinessException("You are already a host");
        }

        if (hostApplicationRepository.existsByUserIdAndStatus(user.getId(), ApplicationStatus.PENDING)) {
            throw new BusinessException("You already have a pending host application");
        }

        HostApplication application = HostApplication.builder()
            .user(user)
            .governmentIdUrl(request.getGovernmentIdUrl())
            .bio(request.getBio())
            .reason(request.getReason())
            .status(ApplicationStatus.PENDING)
            .build();

        return toHostApplicationResponse(hostApplicationRepository.save(application));
    }

    @Transactional(readOnly = true)
    public Page<HostApplicationResponse> getPendingHostApplications(Pageable pageable) {
        return hostApplicationRepository.findByStatus(ApplicationStatus.PENDING, pageable)
            .map(this::toHostApplicationResponse);
    }

    @Transactional
    public HostApplicationResponse reviewHostApplication(Long applicationId, HostApplicationReviewRequest request, String adminEmail) {
        HostApplication application = hostApplicationRepository.findById(applicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Host application", applicationId));

        User admin = userRepository.findByEmail(adminEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new BusinessException("This application has already been reviewed");
        }

        application.setStatus(request.isApproved() ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED);
        application.setReviewedBy(admin);
        application.setReviewNote(request.getNote());
        application.setReviewedAt(Instant.now());

        if (request.isApproved()) {
            User user = application.getUser();
            user.setRole(UserRole.HOST);
            userRepository.save(user);
        }

        hostApplicationRepository.save(application);
        notificationService.notifyHostApplicationResult(application.getUser(), request.isApproved());
        emailService.sendHostApplicationResult(application.getUser().getEmail(), request.isApproved(), request.getNote());

        return toHostApplicationResponse(application);
    }

    // --- Platform Config ---

    @Transactional(readOnly = true)
    public List<PlatformConfigResponse> getAllConfigs() {
        return platformConfigRepository.findAll().stream()
            .map(this::toConfigResponse).toList();
    }

    @Transactional
    public PlatformConfigResponse upsertConfig(PlatformConfigRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        PlatformConfig config = platformConfigRepository.findByKey(request.getKey())
            .orElse(PlatformConfig.builder().key(request.getKey()).build());

        config.setValue(request.getValue());
        config.setDescription(request.getDescription());
        config.setUpdatedBy(admin);

        return toConfigResponse(platformConfigRepository.save(config));
    }

    // --- Dashboard Stats ---

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        long totalUsers = userRepository.countByRoleAndDeletedFalse(UserRole.GUEST) +
            userRepository.countByRoleAndDeletedFalse(UserRole.HOST);
        long totalHosts = userRepository.countByRoleAndDeletedFalse(UserRole.HOST);
        long totalGuests = userRepository.countByRoleAndDeletedFalse(UserRole.GUEST);
        long activeListings = propertyRepository.countByStatus(PropertyStatus.ACTIVE);
        long pendingListings = propertyRepository.countByStatus(PropertyStatus.PENDING_REVIEW);

        LocalDate now = LocalDate.now();
        long bookingsThisMonth = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        BigDecimal revenueThisMonth = bookingRepository.sumRevenueByMonth(now.getYear(), now.getMonthValue());
        if (revenueThisMonth == null) revenueThisMonth = BigDecimal.ZERO;

        List<DashboardStatsResponse.MonthlyRevenue> monthlyRevenues = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate month = now.minusMonths(i);
            BigDecimal revenue = bookingRepository.sumRevenueByMonth(month.getYear(), month.getMonthValue());
            monthlyRevenues.add(DashboardStatsResponse.MonthlyRevenue.builder()
                .year(month.getYear())
                .month(month.getMonthValue())
                .monthName(Month.of(month.getMonthValue()).name())
                .revenue(revenue != null ? revenue : BigDecimal.ZERO)
                .build());
        }

        return DashboardStatsResponse.builder()
            .totalUsers(totalUsers)
            .totalHosts(totalHosts)
            .totalGuests(totalGuests)
            .activeListings(activeListings)
            .pendingListings(pendingListings)
            .bookingsThisMonth(bookingsThisMonth)
            .revenueThisMonth(revenueThisMonth)
            .monthlyRevenue(monthlyRevenues)
            .build();
    }

    private HostApplicationResponse toHostApplicationResponse(HostApplication ha) {
        return HostApplicationResponse.builder()
            .id(ha.getId())
            .userId(ha.getUser().getId())
            .userEmail(ha.getUser().getEmail())
            .userFullName(ha.getUser().getFullName())
            .status(ha.getStatus().name())
            .governmentIdUrl(ha.getGovernmentIdUrl())
            .bio(ha.getBio())
            .reason(ha.getReason())
            .reviewNote(ha.getReviewNote())
            .reviewedByEmail(ha.getReviewedBy() != null ? ha.getReviewedBy().getEmail() : null)
            .reviewedAt(ha.getReviewedAt())
            .createdAt(ha.getCreatedAt())
            .build();
    }

    private PlatformConfigResponse toConfigResponse(PlatformConfig c) {
        return PlatformConfigResponse.builder()
            .id(c.getId())
            .key(c.getKey())
            .value(c.getValue())
            .description(c.getDescription())
            .updatedAt(c.getUpdatedAt())
            .build();
    }
}
