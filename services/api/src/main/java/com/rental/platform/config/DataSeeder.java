package com.rental.platform.config;

import com.rental.platform.domain.entity.*;
import com.rental.platform.domain.enums.*;
import com.rental.platform.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    @Value("${app.seed:false}")
    private boolean seedEnabled;

    private final UserRepository userRepository;
    private final AmenityRepository amenityRepository;
    private final PropertyRepository propertyRepository;
    private final PropertyPhotoRepository propertyPhotoRepository;
    private final AvailabilityRepository availabilityRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final PlatformConfigRepository platformConfigRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("app.seed is false — skipping data seeding.");
            return;
        }
        log.info("app.seed is true — running data seeder...");

        seedUsers();
        seedAmenities();
        seedPlatformConfig();
        seedProperties();
        seedBookingsAndReviews();

        log.info("Data seeding completed.");
    }

    // ---------------------------------------------------------------
    // USERS
    // ---------------------------------------------------------------
    private void seedUsers() {

        createUserIfNotExists("host.john@rentalplatform.com", "John", "Carter",
                UserRole.HOST, UserStatus.ACTIVE, "Host@123", true);

        createUserIfNotExists("host.priya@rentalplatform.com", "Priya", "Sharma",
                UserRole.HOST, UserStatus.ACTIVE, "Host@123", true);

        createUserIfNotExists("guest.alice@rentalplatform.com", "Alice", "Walker",
                UserRole.GUEST, UserStatus.ACTIVE, "Guest@123", true);

        createUserIfNotExists("guest.raj@rentalplatform.com", "Raj", "Verma",
                UserRole.GUEST, UserStatus.ACTIVE, "Guest@123", true);
    }

    private void createUserIfNotExists(String email, String firstName, String lastName,
                                       UserRole role, UserStatus status,
                                       String rawPassword, boolean emailVerified) {
        if (userRepository.existsByEmail(email)) {
            return;
        }
        User user = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .status(status)
                .emailVerified(emailVerified)
                .build();
        userRepository.save(user);
        log.info("Seeded user: {}", email);
    }

    // ---------------------------------------------------------------
    // AMENITIES
    // ---------------------------------------------------------------
    private void seedAmenities() {
        record AmenitySeed(String name, AmenityCategory category, String icon) {}

        List<AmenitySeed> amenities = List.of(
                new AmenitySeed("WiFi", AmenityCategory.ACCESSIBILITY, "wifi"),
                new AmenitySeed("Air Conditioning", AmenityCategory.ACCESSIBILITY, "ac-unit"),
                new AmenitySeed("Heating", AmenityCategory.ACCESSIBILITY, "thermostat"),
                new AmenitySeed("Kitchen", AmenityCategory.ACCESSIBILITY, "kitchen"),
                new AmenitySeed("Washer", AmenityCategory.ACCESSIBILITY, "local-laundry-service"),
                new AmenitySeed("Free Parking", AmenityCategory.ACCESSIBILITY, "local-parking"),
                new AmenitySeed("TV", AmenityCategory.ENTERTAINMENT, "tv"),
                new AmenitySeed("Pool", AmenityCategory.OUTDOOR, "pool"),
                new AmenitySeed("Gym", AmenityCategory.OUTDOOR, "fitness-center"),
                new AmenitySeed("Smoke Alarm", AmenityCategory.SAFETY, "smoke-detector"),
                new AmenitySeed("First Aid Kit", AmenityCategory.SAFETY, "medical-services"),
                new AmenitySeed("Fire Extinguisher", AmenityCategory.SAFETY, "fire-extinguisher")
        );

        for (AmenitySeed a : amenities) {
            if (amenityRepository.existsByName(a.name())) {
                continue;
            }
            Amenity amenity = Amenity.builder()
                    .name(a.name())
                    .category(a.category())
                    .icon(a.icon())
                    .build();
            amenityRepository.save(amenity);
            log.info("Seeded amenity: {}", a.name());
        }
    }

    // ---------------------------------------------------------------
    // PLATFORM CONFIG
    // ---------------------------------------------------------------
    private void seedPlatformConfig() {
        Map<String, String[]> configs = Map.of(
                "DEFAULT_SERVICE_FEE_PERCENT", new String[]{"12.00", "Default service fee percentage charged to guests"},
                "DEFAULT_TAX_PERCENT", new String[]{"8.00", "Default tax percentage applied to bookings"},
                "MIN_BOOKING_NIGHTS", new String[]{"1", "Minimum nights allowed per booking"},
                "MAX_BOOKING_NIGHTS", new String[]{"365", "Maximum nights allowed per booking"},
                "SUPPORT_EMAIL", new String[]{"support@rentalplatform.com", "Support contact email shown to users"}
        );

        configs.forEach((key, value) -> {
            if (platformConfigRepository.existsByKey(key)) {
                return;
            }
            PlatformConfig config = PlatformConfig.builder()
                    .key(key)
                    .value(value[0])
                    .description(value[1])
                    .build();
            platformConfigRepository.save(config);
            log.info("Seeded platform config: {}", key);
        });
    }

    // ---------------------------------------------------------------
    // PROPERTIES
    // ---------------------------------------------------------------
    private void seedProperties() {
        if (propertyRepository.count() > 0) {
            log.info("Properties already exist — skipping property seeding.");
            return;
        }

        User john = userRepository.findByEmail("host.john@rentalplatform.com")
                .orElseThrow(() -> new IllegalStateException("Seed user host.john not found"));
        User priya = userRepository.findByEmail("host.priya@rentalplatform.com")
                .orElseThrow(() -> new IllegalStateException("Seed user host.priya not found"));

        Property goaVilla = seedProperty(
                john,
                "Sunny Beachfront Villa in Goa",
                "A spacious 3-bedroom villa just steps away from Baga Beach, perfect for families and groups.",
                PropertyType.VILLA,
                PropertyStatus.ACTIVE,
                8, 3, 3, 4,
                new BigDecimal("8500.00"),
                new BigDecimal("1500.00"),
                BookingType.INSTANT,
                CancellationPolicy.MODERATE,
                "Goa Beach House", "near Baga Beach", "Goa", "Goa", "India", "403516",
                15.5524, 73.7517,
                List.of("WiFi", "Air Conditioning", "Pool", "Free Parking", "Kitchen", "TV")
        );

        Property mumbaiApt = seedProperty(
                john,
                "Modern Studio Apartment in Bandra",
                "Cozy and stylish studio apartment located in the heart of Bandra West, close to cafes and the sea link.",
                PropertyType.APARTMENT,
                PropertyStatus.ACTIVE,
                2, 1, 1, 1,
                new BigDecimal("4200.00"),
                new BigDecimal("500.00"),
                BookingType.REQUEST,
                CancellationPolicy.FLEXIBLE,
                "Bandra West Residency", "Linking Road", "Mumbai", "Maharashtra", "India", "400050",
                19.0596, 72.8295,
                List.of("WiFi", "Air Conditioning", "Kitchen", "TV", "Washer")
        );

        Property manaliCottage = seedProperty(
                priya,
                "Cozy Mountain Cottage in Manali",
                "Charming wooden cottage with stunning views of the Himalayas, ideal for a peaceful getaway.",
                PropertyType.COTTAGE,
                PropertyStatus.ACTIVE,
                4, 2, 1, 2,
                new BigDecimal("3200.00"),
                new BigDecimal("400.00"),
                BookingType.INSTANT,
                CancellationPolicy.STRICT,
                "Old Manali Road", "Near River Beas", "Manali", "Himachal Pradesh", "India", "175131",
                32.2432, 77.1892,
                List.of("WiFi", "Heating", "Kitchen", "Smoke Alarm", "First Aid Kit")
        );

        seedAvailability(goaVilla, 30);
        seedAvailability(mumbaiApt, 30);
        seedAvailability(manaliCottage, 30);
    }

    private Property seedProperty(User host, String title, String description,
                                  PropertyType propertyType, PropertyStatus status,
                                  int maxGuests, int bedrooms, int bathrooms, int beds,
                                  BigDecimal basePrice, BigDecimal cleaningFee,
                                  BookingType bookingType, CancellationPolicy cancellationPolicy,
                                  String addressLine1, String addressLine2,
                                  String city, String state, String country, String zip,
                                  double lat, double lng,
                                  List<String> amenityNames) {

        Location location = Location.builder()
                .addressLine1(addressLine1)
                .addressLine2(addressLine2)
                .city(city)
                .state(state)
                .country(country)
                .zipCode(zip)
                .latitude(lat)
                .longitude(lng)
                .build();

        Property property = Property.builder()
                .host(host)
                .title(title)
                .description(description)
                .propertyType(propertyType)
                .status(status)
                .maxGuests(maxGuests)
                .bedrooms(bedrooms)
                .bathrooms(bathrooms)
                .beds(beds)
                .basePrice(basePrice)
                .cleaningFee(cleaningFee)
                .bookingType(bookingType)
                .cancellationPolicy(cancellationPolicy)
                .location(location)
                .build();

        for (String amenityName : amenityNames) {
            amenityRepository.findByName(amenityName)
                    .ifPresent(a -> property.getAmenities().add(a));
        }

        Property saved = propertyRepository.save(property);

        PropertyPhoto photo = PropertyPhoto.builder()
                .property(saved)
                .url("https://placehold.co/1024x768?text=" + title.replace(" ", "+"))
                .caption(title)
                .primary(true)
                .displayOrder(0)
                .build();
        propertyPhotoRepository.save(photo);

        log.info("Seeded property: {}", title);
        return saved;
    }

    private void seedAvailability(Property property, int days) {
        LocalDate start = LocalDate.now();
        for (int i = 0; i < days; i++) {
            LocalDate date = start.plusDays(i);
            Availability availability = Availability.builder()
                    .property(property)
                    .date(date)
                    .blocked(false)
                    .build();
            availabilityRepository.save(availability);
        }
        log.info("Seeded {} availability days for property: {}", days, property.getTitle());
    }

    // ---------------------------------------------------------------
    // BOOKINGS & REVIEWS
    // ---------------------------------------------------------------
    private void seedBookingsAndReviews() {
        if (bookingRepository.count() > 0) {
            log.info("Bookings already exist — skipping booking seeding.");
            return;
        }

        User alice = userRepository.findByEmail("guest.alice@rentalplatform.com")
                .orElseThrow(() -> new IllegalStateException("Seed user guest.alice not found"));
        User raj = userRepository.findByEmail("guest.raj@rentalplatform.com")
                .orElseThrow(() -> new IllegalStateException("Seed user guest.raj not found"));

        List<Property> properties = propertyRepository.findAll();
        if (properties.isEmpty()) {
            return;
        }
        Property goaVilla = properties.get(0);
        Property mumbaiApt = properties.size() > 1 ? properties.get(1) : properties.get(0);

        // Completed past booking with review (Alice -> Goa villa)
        LocalDate checkIn1 = LocalDate.now().minusDays(20);
        LocalDate checkOut1 = checkIn1.plusDays(3);
        BigDecimal subtotal1 = goaVilla.getBasePrice().multiply(BigDecimal.valueOf(3));
        BigDecimal serviceFee1 = subtotal1.multiply(goaVilla.getServiceFeePercent())
                .divide(BigDecimal.valueOf(100));
        BigDecimal taxes1 = subtotal1.multiply(goaVilla.getTaxPercent())
                .divide(BigDecimal.valueOf(100));
        BigDecimal total1 = subtotal1.add(goaVilla.getCleaningFee()).add(serviceFee1).add(taxes1);

        Booking pastBooking = Booking.builder()
                .property(goaVilla)
                .guest(alice)
                .checkInDate(checkIn1)
                .checkOutDate(checkOut1)
                .guestsCount(2)
                .status(BookingStatus.COMPLETED)
                .bookingType(goaVilla.getBookingType())
                .nights(3)
                .basePricePerNight(goaVilla.getBasePrice())
                .subtotal(subtotal1)
                .cleaningFee(goaVilla.getCleaningFee())
                .serviceFee(serviceFee1)
                .taxes(taxes1)
                .totalPrice(total1)
                .build();
        pastBooking = bookingRepository.save(pastBooking);

        Review review = Review.builder()
                .booking(pastBooking)
                .property(goaVilla)
                .reviewer(alice)
                .overallRating(new BigDecimal("4.5"))
                .cleanlinessRating(new BigDecimal("5.0"))
                .accuracyRating(new BigDecimal("4.5"))
                .checkinRating(new BigDecimal("4.0"))
                .communicationRating(new BigDecimal("5.0"))
                .locationRating(new BigDecimal("4.5"))
                .valueRating(new BigDecimal("4.0"))
                .comment("Beautiful villa, amazing location right next to the beach. Would definitely come back!")
                .visible(true)
                .build();
        reviewRepository.save(review);

        goaVilla.setAverageRating(new BigDecimal("4.5"));
        goaVilla.setReviewCount(1);
        propertyRepository.save(goaVilla);

        // Upcoming confirmed booking (Raj -> Mumbai apartment)
        LocalDate checkIn2 = LocalDate.now().plusDays(10);
        LocalDate checkOut2 = checkIn2.plusDays(2);
        BigDecimal subtotal2 = mumbaiApt.getBasePrice().multiply(BigDecimal.valueOf(2));
        BigDecimal serviceFee2 = subtotal2.multiply(mumbaiApt.getServiceFeePercent())
                .divide(BigDecimal.valueOf(100));
        BigDecimal taxes2 = subtotal2.multiply(mumbaiApt.getTaxPercent())
                .divide(BigDecimal.valueOf(100));
        BigDecimal total2 = subtotal2.add(mumbaiApt.getCleaningFee()).add(serviceFee2).add(taxes2);

        Booking upcomingBooking = Booking.builder()
                .property(mumbaiApt)
                .guest(raj)
                .checkInDate(checkIn2)
                .checkOutDate(checkOut2)
                .guestsCount(1)
                .status(BookingStatus.CONFIRMED)
                .bookingType(mumbaiApt.getBookingType())
                .nights(2)
                .basePricePerNight(mumbaiApt.getBasePrice())
                .subtotal(subtotal2)
                .cleaningFee(mumbaiApt.getCleaningFee())
                .serviceFee(serviceFee2)
                .taxes(taxes2)
                .totalPrice(total2)
                .build();
        bookingRepository.save(upcomingBooking);

        log.info("Seeded sample bookings and review.");
    }
}