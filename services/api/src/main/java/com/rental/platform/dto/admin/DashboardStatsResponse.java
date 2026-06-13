package com.rental.platform.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardStatsResponse {
    private long totalUsers;
    private long totalHosts;
    private long totalGuests;
    private long activeListings;
    private long pendingListings;
    private long bookingsThisMonth;
    private BigDecimal revenueThisMonth;
    private List<MonthlyRevenue> monthlyRevenue;

    @Data
    @Builder
    public static class MonthlyRevenue {
        private int year;
        private int month;
        private String monthName;
        private BigDecimal revenue;
        private long bookings;
    }
}
