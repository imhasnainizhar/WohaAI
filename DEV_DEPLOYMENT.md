# 🐳 WohaAI Docker Development Guide

This guide explains how to **develop, test, and deploy** this MicroService Architecture application consisting of:

- **Next.js Frontend**
- **Node.js Microservices (API Gateway, Auth Services, etc.)**
- **Redis**
- **Postgres DB**
- All orchestrated via **Docker** and **Docker Compose**.

Your stack includes:

- **Next.js Frontend**
- **Node.js Microservices (Auth, User, Generative APIs etc.)**
- **Redis**
- **Postgres DBs**

All services are orchestrated via **Docker Compose** just for dev.

> ⚙️ **Production deployment** will be handled later through **Terraform (IaC)** and **GitLab CI/CD pipelines**.

---

## 📁 Project Structure

```bash
project-root/
├── dev/
│   ├── compose
│   │    ├── compose.api.yml
│   │    ├── compose.auth.yml
│   │    ├── compose.frontend.yml
│   │    └── ...
│   └── scripts
│        ├── dev.ps1
│        ├── dev.sh
│        └── ...
│
├── src/
│   ├── frontend/
│   │   └── Dockerfile
│   └── microservices/
│       ├── api_gateway/Dockerfile
│       ├── auth_service/Dockerfile
│       └── ...
│
└── .env
```

---

## 🧑‍💻 Development Setup

In **development**, you want:

- Hot reloading for frontend and backend.
- Shared network for inter-service communication.
- Mounted volumes for live file editing.

### 🧩 Commands

1. **Start all services in dev mode:**

   ```bash
   ## Go to scripts directory for dev:
   cd dev/scripts

   ## For dev on Windows, run:
   ./dev.ps1

   ## For dev on Linux/macOS, run:
   ./dev.sh
   ```

   This command:

   Builds all images using the development target (DOCKER_TARGET=development)

   Mounts local source code (./src/...:/src) for hot reloading

   Starts all services together in one shared network microservices_net_01

2. **Run a single service for debugging:**

   ```bash
   cd dev/compose
   docker compose -f compose.auth.yml --env-file ../env/.env up --build
   ```

   Example: Frontend (Next.js)

   ```bash
   cd dev/Compose
   docker compose -f compose.frontend.yml --env-file ../env/.env up frontend_app --build
   ```

3. **Stop and remove containers:**

   ```bash
   docker compose -f compose.frontend.yml down
   ```

   You can also use Control Key + C

### 🗂 Example `dev/compose/compose.*.yml` Overview

- Uses `target: development` for hot reload builds.
- Mounts local directories (`volumes:`) for live code updates.
- Exposes all dev ports (e.g., 3000, 4000, 6379).

---

## 🗂 Example Compose Configuration Highlights

To dev and test only the **frontend app**:

### Dev Mode

```bash
cd dev/compose
docker compose -f  up compose.frontend.yml --build frontend_app
```

---

## 🌐 Environment Variables (`.env`)

✅ **Development**

- Use shared `.env` for service communication.
- Mount local files for rapid iteration.
- Keep logs active for debugging.

✅ **Production**

- Use separate infra scripts.
- Don’t mount source code.
- Use minimal images (multi-stage builds).
- Push images to container registry (e.g., GitHub Packages, Docker Hub).

```bash
###############################################
# 🌍 Global Configuration
###############################################
NODE_ENV=development
DOCKER_TARGET=development
....
```

## 🧭 TL;DR Summary

| Task               | Command                                                                                    | Description                      |
| ------------------ | ------------------------------------------------------------------------------------------ | -------------------------------- |
| Start Dev Stack    | `./dev.sh` OR `./dev.ps1`                                                                  | Run all services with hot reload |
| Run Single Service | `docker compose -f compose.auth.yml up signin_service --build`                             | Debug isolated service           |
| Stop Stack         | `docker compose down`                                                                      | Clean shutdown                   |

---

💡 **Pro Tip:** Keep your Compose files modular under `dev/`, version them in Git, and later automate builds and deploys via **GitLab CI/CD + Terraform**.

---
