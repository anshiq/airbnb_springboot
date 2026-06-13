package com.rental.platform.service;

import com.rental.platform.domain.entity.Property;
import com.rental.platform.domain.enums.PropertyStatus;
import com.rental.platform.domain.enums.PropertyType;
import com.rental.platform.domain.repository.PropertyRepository;
import com.rental.platform.dto.property.PropertySummaryResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final PropertyRepository propertyRepository;
    private final PropertyService propertyService;
    private final EntityManager entityManager;

    @Transactional(readOnly = true)
    public Page<PropertySummaryResponse> search(
            String city,
            LocalDate checkIn,
            LocalDate checkOut,
            Integer guests,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            PropertyType propertyType,
            List<Long> amenityIds,
            Pageable pageable) {

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Property> query = cb.createQuery(Property.class);
        Root<Property> root = query.from(Property.class);

        root.fetch("location", JoinType.LEFT);
        root.fetch("photos", JoinType.LEFT);
        root.fetch("host", JoinType.LEFT);

        List<Predicate> predicates = new ArrayList<>();
        predicates.add(cb.equal(root.get("status"), PropertyStatus.ACTIVE));

        if (city != null && !city.isBlank()) {
            predicates.add(cb.like(cb.lower(root.get("location").get("city")),
                "%" + city.toLowerCase() + "%"));
        }

        if (guests != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("maxGuests"), guests));
        }

        if (minPrice != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("basePrice"), minPrice));
        }

        if (maxPrice != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("basePrice"), maxPrice));
        }

        if (propertyType != null) {
            predicates.add(cb.equal(root.get("propertyType"), propertyType));
        }

        if (amenityIds != null && !amenityIds.isEmpty()) {
            Join<Object, Object> amenities = root.join("amenities", JoinType.INNER);
            predicates.add(amenities.get("id").in(amenityIds));
        }

        if (checkIn != null && checkOut != null) {
            Subquery<Long> bookingSubquery = query.subquery(Long.class);
            Root<?> bookingRoot = bookingSubquery.from(com.rental.platform.domain.entity.Booking.class);
            bookingSubquery.select(bookingRoot.get("property").get("id"));
            bookingSubquery.where(
                cb.and(
                    cb.in(bookingRoot.get("status")).value("CONFIRMED").value("CHECKED_IN"),
                    cb.not(cb.or(
                        cb.lessThanOrEqualTo(bookingRoot.get("checkOutDate"), checkIn),
                        cb.greaterThanOrEqualTo(bookingRoot.get("checkInDate"), checkOut)
                    ))
                )
            );
            predicates.add(cb.not(root.get("id").in(bookingSubquery)));
        }

        query.where(predicates.toArray(new Predicate[0]));
        query.distinct(true);

        TypedQuery<Property> typedQuery = entityManager.createQuery(query);
        int totalRows = typedQuery.getResultList().size();

        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<Property> properties = typedQuery.getResultList();
        List<PropertySummaryResponse> responses = properties.stream()
            .map(propertyService::toPropertySummaryResponse)
            .toList();

        return new PageImpl<>(responses, pageable, totalRows);
    }
}
