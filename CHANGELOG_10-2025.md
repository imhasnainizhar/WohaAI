# 🧾 October 2025 Changelog — Infrastructure, Security & System Enhancements

## 🚀 Overview

October marks a major phase of stabilization and production hardening. Nearly every service — **Auth**, **User**, **Gateway**, and shared **utils** — received security, maintainability, and scalability improvements. This round of changes focuses on creating a **robust local development workflow**, **secure authentication**, and a **standardized response structure** across services.

---

## Attention*:*

## UI is being developed with heavy business logic

## 🧱 System Architecture & Project Restructure

### 📁 Folder & Environment Separation

* Introduced a **clear distinction between `src/` and `dev/`** directories.

  * `src/` → production-ready source code.
  * `dev/` → local development tooling, Docker config, test scripts, and environment overrides.
* Improved internal imports with TypeScript **path aliases** (`@utils`, `@routes`, `@mailer`, etc.) for cleaner and consistent references.
* Reorganized project structure to make **each service independently deployable** and maintainable.

### 🐳 Docker & Development Environment

* Added **Docker Compose** for local development orchestration.

  * Containers include: `auth-service`, `user-service`, `redis`, `postgres`, and a lightweight `api-gateway`.
* Designed a **mock/test API Gateway** to simulate AWS API Gateway locally.

  * Enables devs to test microservices without depending on AWS.
* Introduced **dev-specific `.env` management** using environment overrides (`.env.dev`, `.env.prod`).
* Integrated live reload in the dev environment for faster iteration.

---

## 🔐 Authentication & Security Upgrades

### 🧠 Password Security: Argon2 Integration

* Replaced `bcryptjs` with **Argon2id** — offering memory-hard password hashing resistant to GPU attacks.
* Implemented centralized password utilities under `@utils/password_utils`.
* Added validation and error tracking for each hashing or comparison operation.

### 🍪 JWT Session Validation

* Refactored token verification logic with **typed decoding** via `DecodedToken` interface.
* Enforced `sub` existence in JWT payload before querying the database.
* Introduced **explicit error states**:
* All responses now handled through the `sendResponse` util for uniform structure, present in each microservice
as the project standard.

### 🔒 ReCAPTCHA Verification

* Added `/captcha` route to validate Google reCAPTCHA tokens securely.
* Supports environment-based `RECAPTCHA_SECRET_KEY`.
* Detailed emoji-coded console logs for success, missing keys, and verification failures.

---

## 📧 Email Verification System

### 🔑 Verification Flow Implementation

* Introduced **Redis-based verification system** with TTL expiry (5 minutes per code).
* Created **`@mailer/code_mailer`** to handle sending verification emails asynchronously.
* Added a reusable **`generateVerificationCode()`** hook for creating cryptographically strong verification codes.
* Implemented `/verify` route that:

  * Parses requests using **Zod schema validation**.
  * Retrieves and validates codes from Redis.
  * Returns standardized API responses using `sendResponse`.
  * Deletes verified codes upon success.

---

## 🧩 API Response Standardization

### 🧰 `@utils/api_response.ts`

Centralized the API response handling for all services.

**Features Added:**

* Default structured JSON response with:

  * `success`, `statusCode`, `message`, `timestamp`, `data`, and optional `errors`.
* Unified response interface ensuring consistency across all endpoints.
* Added support for `errorType` and `path` for enhanced debugging.
* Fully integrated in Auth, Captcha, and Verification routes.

**Example:**

```ts
return sendResponse({
  res,
  success: false,
  message: "Invalid token payload",
  statusCode: 401,
  errorType: "invalid_jwt_payload",
  path: req.originalUrl,
});
```

---

## 🧠 Auth & User Service Refactors

### Auth Service

* Modularized JWT validation, signup, and signin logic.
* Rewrote signup route to handle **username/email conflicts** in one DB query (reducing I/O).
* Integrated `argon2` for secure password hashing and verification.
* Introduced emoji-based logs for clarity in development environments.
* Added clear **error vs success pathing** via `sendResponse`.

### User Service

* Introduced typed route handling and Prisma schema alignment.
* Added **JWT-based user retrieval** route (`/session`).
* Enforced type safety with custom `DecodedToken` and Prisma model inference.
* Integrated standardized API responses for all user lookups.

---

## 🧰 Developer Experience Improvements

### 🧩 Local API Gateway (Test Gateway)

* Built a lightweight **Express-based mock API Gateway** that simulates AWS routing locally.
* Enables multi-service testing (Auth + User + Captcha) without cloud dependency.
* Used during Docker Compose-based local runs.

### 🪶 Logging & Monitoring

* Introduced **emoji-based logging conventions**:

  * 🟢 Success
  * 🔴 Error
  * ⚠️ Warning
  * 💥 Exception
  * 🧩 Validation
* Standardized log levels for readability.

### 🧠 Zod Validation Layer

* Implemented **Zod schemas** for input validation across multiple services.
* Eliminated untyped request body parsing.
* Enhanced safety against malformed client requests.

---

## 📊 Summary of Key Additions

| Category        | Change                                           | Status |
| --------------- | ------------------------------------------------ | ------ |
| 🧱 Structure    | `src/` and `dev/` directory separation           | ✅      |
| 🐳 Environment  | `docker-compose.dev.yml` for local orchestration | ✅      |
| 🔐 Security     | Argon2 password hashing                          | ✅      |
| 🍪 Auth         | JWT validation + typed decoding                  | ✅      |
| 📧 Verification | Redis-backed email verification flow             | ✅      |
| ⚙️ Utility      | `sendResponse` unified response util             | ✅      |
| 🧠 Validation   | Zod schema validation integration                | ✅      |
| 🚦 Gateway      | Local mock API Gateway                            | ✅      |
| 🧩 Logging      | Emoji-based structured logs                      | ✅      |

---

## 🧭 Outlook for November

* Introduce **rate-limiting middleware** for login & verification routes.
* Implement **service discovery** for inter-service communication.
* Begin transition from local mock Gateway to **AWS API Gateway integration**.
* Add **centralized logging and metrics exporter** using OpenTelemetry.
* AWS Deployment

---

📌 *This changelog reflects all major commits, refactors, and structural upgrades made in October 2025 as part of the full-stack authentication and user infrastructure stabilization.*
