package com.rental.platform.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AppProperties {

    private Jwt jwt = new Jwt();
    private Frontend frontend = new Frontend();
    private Razorpay razorpay = new Razorpay();
    private Platform platform = new Platform();

    @Getter @Setter
    public static class Jwt {
        private String secret;
        private long accessTokenExpiryMs;
        private long refreshTokenExpiryMs;
    }

    @Getter @Setter
    public static class Frontend {
        private String customerUrl;
        private String adminUrl;
    }

    @Getter @Setter
    public static class Razorpay {
        private String keyId;
        private String keySecret;
        private String webhookSecret;
    }

    @Getter @Setter
    public static class Platform {
        private double serviceFeePercent;
        private double taxPercent;
        private int payoutDelayDays;
    }
}
