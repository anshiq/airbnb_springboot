# Rental Platform — Airbnb-Style Property Rental

A full-stack property rental platform built with **Java 21 · Spring Boot 3.4 · React 19 · PostgreSQL · JWT · Razorpay**.

## Repository Structure

```
rental-platform/
├── apps/
│   ├── customer/          # React 19 customer web app  (port 5173)
│   └── admin/             # React 19 admin portal       (port 5174)
├── services/
│   └── api/               # Spring Boot 3.4 REST API    (port 8080)
├── docker-compose.yml     # PostgreSQL + Spring Boot API
├── pnpm-workspace.yaml
└── README.md
```

---

## Quick Start

### Prerequisites
- Java 21+  |  Maven 3.9+
- Node.js 20+  |  pnpm 9+
- Docker & Docker Compose

### 1. Start Backend + Database (Docker)

```bash
docker-compose up -d
```

| URL | Description |
|-----|-------------|
| `http://localhost:8080/api/v1` | REST API base |
| `http://localhost:8080/api/v1/docs/ui` | Swagger UI |
| `http://localhost:8080/api/v1/actuator/health` | Health check |

### 2. Start React Apps (Local)

```bash
# Install all workspace dependencies
pnpm install

# Customer web app
pnpm dev:customer      # → http://localhost:5173

# Admin portal
pnpm dev:admin         # → http://localhost:5174
```

---

## Environment Variables

Copy `.env.example` (or set these in `docker-compose.yml` overrides):

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | `jdbc:postgresql://localhost:5432/rental_platform` | PostgreSQL JDBC URL |
| `DB_USERNAME` | `rental_user` | Database username |
| `DB_PASSWORD` | `rental_pass` | Database password |
| `JWT_SECRET` | *(must override in prod)* | 256-bit Base64-encoded HMAC secret |
| `JWT_ACCESS_EXPIRY` | `900000` | Access token TTL in ms (15 min) |
| `JWT_REFRESH_EXPIRY` | `604800000` | Refresh token TTL in ms (7 days) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:5174` | Comma-separated allowed origins |
| `MAIL_HOST` | `smtp.gmail.com` | SMTP host |
| `MAIL_PORT` | `587` | SMTP port |
| `MAIL_USERNAME` | — | SMTP username |
| `MAIL_PASSWORD` | — | SMTP password/app-password |
| `RAZORPAY_KEY_ID` | — | Razorpay test Key ID |
| `RAZORPAY_KEY_SECRET` | — | Razorpay test Key Secret |
| `RAZORPAY_WEBHOOK_SECRET` | — | Razorpay webhook signing secret |
| `SERVICE_FEE_PERCENT` | `12.0` | Platform service fee % |
| `TAX_PERCENT` | `8.0` | Default tax rate % |

---

## Running Tests

```bash
cd services/api
mvn test
# Coverage report → target/site/jacoco/index.html
```

---

## API Reference

Swagger UI: **`http://localhost:8080/api/v1/docs/ui`**

| Tag | Endpoints |
|-----|-----------|
| Authentication | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password` |
| Users | `GET/PATCH /users/me`, `GET /users/{id}`, `PATCH /users/{id}/status`, `PATCH /users/{id}/role`, `DELETE /users/{id}` |
| Properties | `POST /properties`, `GET /properties/{id}`, `PUT /properties/{id}`, `POST /properties/{id}/submit`, `PUT /properties/{id}/availability` |
| Search | `GET /properties/search?city=&checkIn=&checkOut=&guests=&minPrice=&maxPrice=&propertyType=&amenityIds=` |
| Bookings | `POST /bookings`, `GET /bookings/{id}`, `POST /bookings/{id}/confirm`, `POST /bookings/{id}/cancel`, `GET /bookings/my-trips` |
| Payments | `POST /payments/create-order`, `POST /payments/verify`, `GET /payments/booking/{id}`, `POST /payments/refund` |
| Reviews | `POST /reviews`, `GET /reviews/property/{id}`, `POST /reviews/{id}/host-response` |
| Messages | `POST /messages`, `GET /messages/booking/{id}`, `POST /messages/booking/{id}/read` |
| Notifications | `GET /notifications`, `GET /notifications/unread-count`, `POST /notifications/mark-all-read` |
| Admin | `GET /admin/dashboard/stats`, `GET /admin/listings/pending`, `PATCH /admin/listings/{id}/moderate`, `GET /admin/host-applications/pending`, `PATCH /admin/host-applications/{id}/review`, `GET/PUT /admin/config` |

---

## User Roles & Access

| Role | Portal | Capabilities |
|------|--------|-------------|
| `SUPER_ADMIN` | Admin | Full access + platform config |
| `PROPERTY_MANAGER` | Admin | Listing moderation + host applications |
| `HOST` | Customer + Admin | Create/manage listings, manage bookings |
| `GUEST` | Customer | Search, book, review, message |
| `SUPPORT_AGENT` | Admin | User management, booking cancellations, refunds |

---

## Key Design Decisions

- **Stateless JWT** — access tokens (15 min) + refresh tokens (7 days) stored in DB for revocation
- **BCrypt cost 12** — strong password hashing
- **Rate limiting** — 5 login attempts per IP per 15 min via Bucket4j in-memory
- **Liquibase** — versioned schema migrations, full rollback support
- **Async email** — `@Async` on all `EmailService` methods; failures logged without breaking requests
- **Soft delete** — users are never hard-deleted; `is_deleted` flag + `deleted_at` timestamp
- **Booking conflict detection** — JPQL subquery checks overlapping CONFIRMED/CHECKED_IN bookings
- **CORS locked** — only origins listed in `CORS_ALLOWED_ORIGINS` are allowed
- **OpenAPI 3** — all endpoints documented with Bearer JWT security scheme at `/api/v1/docs`
