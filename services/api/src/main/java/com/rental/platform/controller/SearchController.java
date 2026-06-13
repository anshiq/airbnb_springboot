package com.rental.platform.controller;

import com.rental.platform.common.response.ApiResponse;
import com.rental.platform.common.response.PageResponse;
import com.rental.platform.domain.enums.PropertyType;
import com.rental.platform.dto.property.PropertySummaryResponse;
import com.rental.platform.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/properties/search")
@RequiredArgsConstructor
@Tag(name = "Search", description = "Property search and discovery")
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    @Operation(summary = "Search available properties with filters")
    public ResponseEntity<ApiResponse<PageResponse<PropertySummaryResponse>>> search(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(required = false) Integer guests,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) PropertyType propertyType,
            @RequestParam(required = false) List<Long> amenityIds,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "basePrice") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
            ? Sort.by(sortBy).descending()
            : Sort.by(sortBy).ascending();
        PageRequest pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(ApiResponse.success(
            PageResponse.from(searchService.search(city, checkIn, checkOut, guests,
                minPrice, maxPrice, propertyType, amenityIds, pageable))));
    }
}
