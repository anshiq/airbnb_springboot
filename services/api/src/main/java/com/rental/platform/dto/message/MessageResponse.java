package com.rental.platform.dto.message;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class MessageResponse {
    private Long id;
    private Long bookingId;
    private SenderSummary sender;
    private String content;
    private boolean read;
    private Instant createdAt;

    @Data
    @Builder
    public static class SenderSummary {
        private Long id;
        private String firstName;
        private String lastName;
        private String profilePhotoUrl;
    }
}
