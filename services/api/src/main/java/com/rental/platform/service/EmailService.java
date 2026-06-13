package com.rental.platform.service;

import com.rental.platform.config.AppProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final AppProperties appProperties;

    @Async
    public void sendEmailVerification(String to, String token) {
        String link = appProperties.getFrontend().getCustomerUrl() + "/verify-email?token=" + token;
        sendEmail(to, "Verify Your Email", buildVerificationEmail(link));
    }

    @Async
    public void sendPasswordReset(String to, String token) {
        String link = appProperties.getFrontend().getCustomerUrl() + "/reset-password?token=" + token;
        sendEmail(to, "Reset Your Password", buildPasswordResetEmail(link));
    }

    @Async
    public void sendBookingConfirmation(String to, String bookingReference) {
        sendEmail(to, "Booking Confirmed - " + bookingReference,
            "Your booking " + bookingReference + " has been confirmed. Thank you for choosing Rental Platform!");
    }

    @Async
    public void sendBookingCancellation(String to, String bookingReference) {
        sendEmail(to, "Booking Cancelled - " + bookingReference,
            "Your booking " + bookingReference + " has been cancelled.");
    }

    @Async
    public void sendHostApplicationResult(String to, boolean approved, String reason) {
        String subject = approved ? "Host Application Approved!" : "Host Application Update";
        String body = approved
            ? "Congratulations! Your host application has been approved. You can now create property listings."
            : "Your host application was not approved at this time.\n\nReason: " + reason;
        sendEmail(to, subject, body);
    }

    @Async
    public void sendListingStatusUpdate(String to, String listingTitle, String status, String reason) {
        String subject = "Listing Status Update: " + listingTitle;
        String body = "Your listing \"" + listingTitle + "\" status has been updated to: " + status;
        if (reason != null && !reason.isBlank()) {
            body += "\n\nReason: " + reason;
        }
        sendEmail(to, subject, body);
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom("noreply@rentalplatform.com");
            mailSender.send(message);
            log.info("Email sent to {} with subject: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private String buildVerificationEmail(String link) {
        return "Welcome to Rental Platform!\n\nPlease verify your email by clicking the link below:\n" + link +
               "\n\nThis link expires in 24 hours.\n\nIf you did not create an account, please ignore this email.";
    }

    private String buildPasswordResetEmail(String link) {
        return "You requested a password reset.\n\nClick the link below to reset your password:\n" + link +
               "\n\nThis link expires in 1 hour.\n\nIf you did not request a password reset, please ignore this email.";
    }
}
