package com.rental.platform.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rental.platform.common.response.ApiResponse;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> loginAttemptCache = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        if (request.getServletPath().equals("/auth/login") && "POST".equals(request.getMethod())) {
            String clientIp = getClientIp(request);
            Bucket bucket = loginAttemptCache.computeIfAbsent(clientIp, this::newBucket);

            if (!bucket.tryConsume(1)) {
                log.warn("Rate limit exceeded for IP: {}", clientIp);
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                ApiResponse<Void> apiResponse = ApiResponse.error("Too many login attempts. Please try again after 15 minutes.");
                response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private Bucket newBucket(String key) {
        Bandwidth limit = Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(15)));
        return Bucket.builder().addLimit(limit).build();
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        return (xff != null && !xff.isEmpty()) ? xff.split(",")[0].trim() : request.getRemoteAddr();
    }
}
