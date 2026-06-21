# 🤖 WohaAI

![WohaAI Logo](https://gitlab.com/TheHasnainIzhar/Woah_GenAI_ChatBot/-/raw/65c3f25e2aeee5471f7e089621b5e0ea8a258840/gitlab_favicon.png "WohaAI Chatbot Logo")

**⚡ WohaAI is evolving at high speed!**
Building ChatGPT-like business logic, custom generative APIs, and a dynamic UI layer — progressing rapidly toward production-grade architecture.

![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgray.svg) ![License MIT](https://img.shields.io/badge/License-MIT-blue.svg) ![Powered By OpenAI](https://img.shields.io/badge/Powered%20By-OpenAI-black.svg)

---

## 🌟 Purpose

WohaAI is a **portfolio and educational project** designed to:

* Develop and showcase **ChatGPT-like generative logic**, prompt pipelines, and message orchestration.
* Implement custom **Generative APIs** for conversational AI, modular and scalable for future extensions.
* Demonstrate a full **microservices architecture** running on Docker Compose, with production deployment capabilities.
* Provide **educational and AI engineering resources** for learners and contributors.

This project is in **active development**, blending **LLM-driven backends**, **real-time API systems**, and **Next.js UI** to form a modern, open AI chatbot stack.

---

## 🚀 Current Development Highlights

* 🧠 **ChatGPT-like core logic** – custom pipeline managing conversation state, role hierarchy, and memory retention.
* 🧩 **Generative APIs** – modular endpoints for contextual reasoning, and functional tool use.
* 🖥️ **Frontend (Next.js)** – dynamic chat interface, theme engine, and realtime stream rendering.
* 🐳 **Dockerized Environment** – each service isolated and configurable through `.env`.
* 🔐 **JWT + Redis Integration** – secure session management and code verification flows.
* 📧 **Email Verification** – Kafka-based email verification system with mailer service.
* 🏗️ **Microservices Architecture** – Auth, User, Mailer, and AI Agent services.

---

## ⚙️ Getting Started

### Prerequisites

* **Docker** & **Docker Compose** installed
* **Node.js** 18+ and **pnpm** package manager
* Git for cloning the repository

### 1. Clone the Repository

```bash
git clone https://gitlab.com/TheHasnainIzhar/WohaAI.git
cd WohaAI
```

### 2. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

**Important Environment Variables:**

| Variable | Description | Required |
|----------|-------------|----------|
| `JWT_AUTH_SECRET_KEY` | Secret key for JWT authentication | Yes |
| `MAILER_USER_EMAIL` | Email for sending verification emails | Yes |
| `MAILER_USER_PASSWORD` | App password for email service | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key for AI agent | Yes |
| `APP_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA site key for frontend | Yes |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA secret key for backend | Yes |
| `USERS_MONGO_URI` | MongoDB connection string for users | Yes |
| `AUTH_SESSION_REDIS_URI` | Redis connection for auth sessions | Yes |

> ⚠️ **Never commit `.env` or secret keys to version control.**

### 3. Install Dependencies

```bash
pnpm install
```

---

## 🧑‍💻 Development Setup

### Local Development (Without Docker)

For local development, you can run services individually:

```bash
# Install dependencies
pnpm install

# Run all services in development mode
pnpm dev

# Build all packages
pnpm build

# Type check all packages
pnpm typecheck
```

### Docker Development (Recommended)

Docker is the recommended development environment as it provides:

* **Hot reloading** for both frontend and backend
* **Shared network** for seamless service communication
* **Mounted volumes** for live file editing
* **Isolated services** with proper networking

#### Start All Services (Development Mode)

```bash
# Start all services with hot reload
pnpm docker:all
```

This command:
* Builds images with the `development` target (`DOCKER_TARGET=development`)
* Mounts local source code for live reload
* Runs all services in a shared Docker network

#### Start Specific Service Groups

```bash
# Start only apps (Next.js frontend)
pnpm docker:apps

# Start only repository packages
pnpm docker:repo

# Start messaging services (Kafka, Redis)
pnpm docker:messaging

# Start backend services (Auth, User, Mailer)
pnpm docker:services

# Start AI agent
pnpm docker:agentic
```

#### Stop Services

```bash
# Stop all running containers
docker compose --env-file .env down

# Stop and remove volumes
docker compose --env-file .env down -v
```

---

## 🐳 Docker Build Commands

For production builds, use the `DOCKER_TARGET=build` environment variable to build optimized images.

### Build All Services

```bash
# Build all services with production target
pnpm docker:build:all
```

### Build Specific Service Groups

```bash
# Build apps only
pnpm docker:build:apps

# Build repository packages only
pnpm docker:build:repo

# Build messaging services only
pnpm docker:build:messaging

# Build backend services only
pnpm docker:build:services

# Build AI agent only
pnpm docker:build:agentic
```

### Build Process Documentation

The build process uses multi-stage Dockerfiles with two targets:

1. **Development Target** (`DOCKER_TARGET=development`):
   - Installs all dependencies including dev dependencies
   - Enables hot reloading with nodemon/next dev
   - Mounts source code volumes for live editing
   - Optimized for development experience

2. **Build Target** (`DOCKER_TARGET=build`):
   - Installs only production dependencies
   - Builds optimized production bundles
   - Minifies and compresses assets
   - Creates smaller, production-ready images
   - No source code volumes mounted

**Example Build Command:**

```bash
# Set environment variable and build
DOCKER_TARGET=build docker compose --env-file .env --profile services build

# Or use the npm script
pnpm docker:build:services
```

---

## 📂 Project Structure

```text
WohaAI/
├── apps/                    # Application services
│   ├── web/                # Next.js frontend application
│   └── services/          # Backend microservices
│       ├── auth/           # Authentication service
│       ├── user/           # User management service
│       └── auth-mailer/    # Email verification service
├── packages/               # Shared packages
│   ├── config/             # Configuration files
│   ├── constants/          # Shared constants
│   ├── db/                 # Database utilities
│   ├── env/                # Environment variable handling
│   ├── http/               # HTTP client utilities
│   ├── kafka/              # Kafka client utilities
│   ├── redis/              # Redis client utilities
│   └── telemetry/          # Logging and monitoring
├── docker-compose.yml      # Docker Compose configuration
├── package.json            # Root package.json with scripts
├── turbo.json              # Turborepo configuration
└── .env.example            # Environment variables template
```

---

## 🧱 Tech Stack Overview

| Layer          | Technology                       | Purpose                                 |
| -------------- | -------------------------------- | --------------------------------------- |
| Frontend       | **Next.js 14 (App Router)**      | UI, streaming chat, theming             |
| Auth Service   | **Express.js + TypeScript**      | Authentication, JWT, session management |
| User Service   | **Express.js + TypeScript**      | User profile management                 |
| Mailer Service | **Nodemailer + Kafka**           | Email verification notifications         |
| AI Agent       | **Anthropic API + Custom Logic**  | Generative intelligence core            |
| Database       | **MongoDB**                      | User and conversation data              |
| Cache/Queue    | **Redis + Kafka**                | Session, verification, message queue     |
| Vector Store   | **Qdrant**                       | Memory and context storage              |
| Infrastructure | **Docker + Docker Compose**      | Container orchestration                 |

---

## 🔧 Service Ports

| Service               | Port  | Description                          |
| --------------------- | ----- | ------------------------------------ |
| Next.js App           | 3000  | Frontend web application             |
| Auth Service          | 8001  | Authentication API                   |
| User Service          | 8002  | User management API                  |
| Auth Mailer Service   | 8003  | Email verification service          |
| AI Agent              | 9010  | AI agent API                         |
| Users MongoDB         | 27015 | User database                        |
| Threads MongoDB       | 27016 | Conversation database                |
| Auth Redis            | 6379  | Auth session cache                   |
| Threads Redis         | 8010  | Thread history cache                 |
| Kafka Broker          | 9092  | Message broker for email events      |

---

## 🌍 Vision & Roadmap

WohaAI aims to evolve into a **modular, production-ready conversational AI ecosystem**, combining scalable backend logic, ethical AI engineering practices, and cutting-edge UI.

### Upcoming Milestones

* 🔁 Persistent memory & conversation history
* 🧩 Function calling & external API tools
* 📊 Observability dashboard (Prometheus + Grafana)
* ☁️ Cloud deployment automation
* 🧠 Model fine-tuning playground
* 🔐 Advanced security features (2FA, rate limiting)

---

## 📚 Documentation

* [Development Deployment Guide](./DEV_DEPLOYMENT.md) — Detailed Docker development setup
* [Code of Conduct](./CODE_OF_CONDUCT.pdf) — Community guidelines
* [Contributing Guide](./CONTRIBUTING.md) — How to contribute
* [Changelog](./CHANGELOG_10-2025.md) — Recent changes
* [Naming Conventions](./NAMING_CONVENTIONS.md) — Code style guidelines

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤ by Hani.**
*Fast development. Transparent logic. Real AI engineering.*
