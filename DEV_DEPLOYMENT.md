# 🐳 Multi-Service Docker Development Guide

This guide explains how to **develop and test** a complete **MicroService Architecture** using Docker and Docker Compose.

Your stack includes:

* **Next.js Frontend**
* **Node.js Microservices (Auth, User, Generative APIs etc.)**
* **Redis**
* **Postgres DBs**

All services are orchestrated via **Docker Compose** just for dev.

> ⚙️ **Production deployment** will be handled later through **Terraform (IaC)** and **GitLab CI/CD pipelines**.

---

## 📁 Project Structure

```
project-root/
├── dev/
│   ├── compose.api.yml
│   ├── compose.auth.yml
│   ├── compose.frontend.yml
│   └── ...
│
├── src/
│   ├── frontend/
│   │   └── Dockerfile
│   └── microservices/
│       ├── api_gateway/service/Dockerfile
│       ├── signin_service/service/Dockerfile
│       └── ...
│
└── .env
```

---

## 🧑‍💻 Development Setup

### Goals:

* Hot reloading for both frontend and backend.
* Shared network for seamless service communication.
* Mounted volumes for live file editing.

### 🧩 Commands

#### 1. **Start all services (development mode)**

```bash
cd dev
docker compose -f compose.api.yml -f compose.auth.yml -f compose.frontend.yml --env-file ../.env up --build
```

This command:

* Builds images with the `development` target (`DOCKER_TARGET=development`).
* Mounts local source code for live reload.
* Runs all services in a shared network `microservices_net_01`.

#### 2. **Run a single service (debugging)**

```bash
cd dev
docker compose -f compose.auth.yml --env-file ../.env up signin_service --build
```

Example (Frontend):

```bash
cd dev
docker compose -f compose.frontend.yml --env-file ../.env up frontend_app --build
```

#### 3. **Stop and remove containers**

```bash
docker compose -f compose.frontend.yml down
```

You can also stop containers with **Ctrl + C**.

---

## 🗂 Example Compose Configuration Highlights

* Uses `target: development` for hot reload builds.
* Mounts local directories with `volumes:`.
* Exposes dev ports like **3000**, **8000**, **6379**, etc.

---

## 🌐 Environment Variables (`.env`)

Your `.env` configuration defines all Dockerized environment settings for both **development** and future **production** via Terraform.

```bash
###############################################
# 🌍 Global Configuration
###############################################
NODE_ENV=development
DOCKER_TARGET=development

###############################################
# ⚛️ Frontend (Next.js)
###############################################
FRONTEND_APP_PORT=3000
APP_PUBLIC_GATEWAY_BASE_URL_01=http://localhost:8000
APP_PUBLIC_RECAPTCHA_SITE_KEY=6Lc_-WErAAAAAMFDE86OJbV9Kwd6lEfjVg-EmJJh

###############################################
# 🚪 API Gateway
###############################################
API_GATEWAY_PORT=8000

###############################################
# 🧩 Microservices
###############################################
SIGNIN_SERVICE_PORT=8001
SIGNOUT_SERVICE_PORT=8002
SIGNUP_SERVICE_PORT=8003
USER_CODE_VERIFICATION_PORT=8004
CAPTCHA_VERIFICATION_PORT=8005
CODE_MAILER_PORT=8006
SIGNUP_VALIDATOR_PORT=8007
USER_SERVICE_PORT=8008

###############################################
# 🗄️ Database (PostgreSQL)
###############################################
POSTGRES_USER=postgres
POSTGRES_USER_DB=user_db
POSTGRES_PASSWORD=MyUser1234
POSTGRES_PROVIDER=postgresql
POSTGRES_PORT=5432
POSTGRES_HOST=postgres
PRISMA_USER_DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_USER_DB}?schema=public

###############################################
# 🔐 JWT / Security
###############################################
JWT_ACCESS_SECRET_KEY=686e9bc192fb5a4b74c41d87554e3b6d4d5d2a3acd18e86c7631023f724d155f
JWT_REFRESH_SECRET_KEY=5d6e31f9a1de41274cfbdc8d10d49c9f84533a89245046ee85fc97b8259c2f26

###############################################
# 🧠 Redis
###############################################
REDIS_PASSWORD_CODE_C=redis_code_c123
REDIS_SERVER_PORT_01=6379
REDIS_CODE_C=redis://default:${REDIS_PASSWORD_CODE_C}@redis_code_c:${REDIS_SERVER_PORT_01}

###############################################
# 🤖 Google reCAPTCHA (Backend)
###############################################
RECAPTCHA_SECRET_KEY=6Lc_-WErAAAAAFla_kaucvVEIEM4gBQ_U3yrOWDe

###############################################
# 📧 Email (SMTP)
###############################################
EMAIL_USER=thehasnainizhar.work@gmail.com
EMAIL_PASS="xeat lola gwdb dhbl"
EMAIL_FROM="WoahAI <no-reply@yourapp.com>"

###############################################
# 🌐 Client / API URIs
###############################################
CLIENT_ORIGIN=http://localhost:3000
PRISMA_SKIP_POSTINSTALL_GENERATE=true

NEXT_PUBLIC_BASE_URI=http://localhost:8000
NEXT_PUBLIC_SIGNIN_API_URI=${NEXT_PUBLIC_BASE_URI}/signin
NEXT_PUBLIC_SIGNUP_API_URI=${NEXT_PUBLIC_BASE_URI}/signup
NEXT_PUBLIC_USER_API_URI=${NEXT_PUBLIC_BASE_URI}/user
NEXT_PUBLIC_SIGNOUT_API_URI=${NEXT_PUBLIC_BASE_URI}/signout
NEXT_PUBLIC_SIGNUP_VALIDATOR_URI=${NEXT_PUBLIC_BASE_URI}/signup-validator
NEXT_PUBLIC_CAPTCHA_VERIFICATION_URI=${NEXT_PUBLIC_BASE_URI}/captcha-verification
NEXT_PUBLIC_CODE_VERIFICATION_API_URI=${NEXT_PUBLIC_BASE_URI}/code-verification
NEXT_PUBLIC_VERIFICATION_CODE_MAILER_URI=${NEXT_PUBLIC_BASE_URI}/verification-code-mailer
```

---

## 🧭 TL;DR Summary

| Task               | Command                                                                                    | Description                      |
| ------------------ | ------------------------------------------------------------------------------------------ | -------------------------------- |
| Start Dev Stack    | `docker compose -f compose.api.yml -f compose.auth.yml -f compose.frontend.yml up --build` | Run all services with hot reload |
| Run Single Service | `docker compose -f compose.auth.yml up signin_service --build`                             | Debug isolated service           |
| Stop Stack         | `docker compose down`                                                                      | Clean shutdown                   |

---

💡 **Pro Tip:** Keep your Compose files modular under `dev/`, version them in Git, and later automate builds and deploys via **GitLab CI/CD + Terraform**.

---
