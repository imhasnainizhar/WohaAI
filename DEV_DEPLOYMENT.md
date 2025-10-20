# 🐳 Multi-Service Docker Development Guide

This guide explains how to **develop, test, and deploy** this MicroService Architecture application consisting of:

- **Next.js Frontend**
- **Node.js Microservices (API Gateway, Auth Services, etc.)**
- **Redis**
- **Postgres DB**
- All orchestrated via **Docker** and **Docker Compose**.

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
   cd Docker/services
   docker compose -f compose.shared.yml -f compose.db.yml -f compose.utility.yml -f compose.gateway.yml -f compose.auth.yml -f compose.frontend.yml --env-file ../env/.env up --build
   ```

   This command:

   Builds all images using the development target (DOCKER_TARGET=development)

   Mounts local source code (./src/...:/src) for hot reloading

   Starts all services together in one shared network microservices_net_01

2. **Run a single service for debugging:**

   ```bash
   cd Docker/services
   docker compose -f compose.auth.yml --env-file ../env/.env up --build
   ```

   Example: Frontend (Next.js)

   ```bash
   cd Docker/services
   docker compose -f compose.frontend.yml --env-file ../env/.env up frontend_app --build
   ```

3. **Stop and remove containers:**

   ```bash
   docker compose -f compose.frontend.yml down
   ```

   You can also use Control Key + C

### 🗂 Example `docker-compose.dev.yml` Overview

- Uses `target: development` for hot reload builds.
- Mounts local directories (`volumes:`) for live code updates.
- Exposes all dev ports (e.g., 3000, 4000, 6379).

---

## 🚀 Production Deployment

In **production**, you want:

- Prebuilt, optimized images.
- No file mounts or unnecessary ports.
- Smaller image size and locked dependencies.

### 🧩 Commands

1. **Build all images:**

   ```bash
   docker compose -f docker-compose.prod.yml build
   ```

2. **Run the entire stack:**

   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

3. **Check running containers:**

   ```bash
   docker ps
   ```

4. **View logs for a specific service:**

   ```bash
   docker compose -f docker-compose.prod.yml logs -f api_gateway
   ```

---

## 🧱 Individual Service Deployment (Production)

Each microservice can be built and deployed **independently**.

Example for `signin_service`:

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

To build and deploy only the **frontend app**:

### Dev Mode

```bash
docker compose -f docker-compose.dev.yml up --build frontend_app
```

### Production Mode

```bash
docker compose -f docker-compose.prod.yml up -d frontend_app
```

You can also build and run it separately:

```bash
cd src/frontend
docker build -t frontend_app_prod --target production .
docker run -p 80:3000 frontend_app_prod
```

---

## 🌐 Environment Variables (`.env`)

✅ **Development**

- Use shared `.env` for service communication.
- Mount local files for rapid iteration.
- Keep logs active for debugging.

✅ **Production**

- Use separate compose file.
- Don’t mount source code.
- Use minimal images (multi-stage builds).
- Push images to container registry (e.g., GitHub Packages, Docker Hub).

```bash
###############################################
# 🌍 Global Configuration
###############################################
NODE_ENV=development
DOCKER_TARGET=development

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
