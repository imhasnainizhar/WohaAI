# 🐳 Multi-Service Docker Deployment Guide

This guide explains how to **develop, test, and deploy** this MicroService Architecture application consisting of:

* **Next.js Frontend**

* **Node.js Microservices (API Gateway, Auth Services, etc.)**

* **Redis**

* **Postgres DB**

* All orchestrated via **Docker** and **Docker Compose**.

* **Further we will extend this to deployment using IaC Terraform deployment using AWS and integrating pipelines using GitLab Workflows**

---

## 📁 Project Structure

```
project-root/
├── dev/
│   ├── compose.api.yml
│   ├── compose.auth.yml
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

In **development**, you want:

* Hot reloading for frontend and backend.
* Shared network for inter-service communication.
* Mounted volumes for live file editing.

### 🧩 Commands

1. **Start all services in dev mode:**

   ```bash
   cd dev
   docker compose -f compose.api.yml -f compose.auth.yml -f compose.frontend.yml --env-file ../.env up --build
   ```

   This command:

   * Builds all images using the development target (`DOCKER_TARGET=development`)
   * Mounts local source code (`./src/...:/src`) for hot reloading
   * Starts all services together in one shared network `microservices_net_01`

2. **Run a single service for debugging:**

   ```bash
   cd dev
   docker compose -f compose.auth.yml --env-file ../.env up signin_service --build
   ```

   Example: Frontend (Next.js)

   ```bash
   cd dev
   docker compose -f compose.frontend.yml --env-file ../.env up frontend_app --build
   ```

3. **Stop and remove containers:**

   ```bash
   docker compose -f compose.frontend.yml down
   ```

   You can also use **Ctrl + C** to stop containers.

### 🗂 Example `docker-compose.dev.yml` Overview

* Uses `target: development` for hot reload builds.
* Mounts local directories (`volumes:`) for live code updates.
* Exposes all dev ports (e.g., 3000, 4000, 6379).

---

## 🚀 Production Deployment

In **production**, you want:

* Prebuilt, optimized images.
* No file mounts or unnecessary ports.
* Smaller image size and locked dependencies.

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
cd src/microservices/signin_service/service
docker build -t signin_service_prod --target production .
docker run -d --name signin_service_prod -p 4002:4002 --env-file ../../../.env signin_service_prod
```

This allows flexible deployment strategies (e.g., Kubernetes, ECS, or separate VMs per service).

---

## 🌐 Frontend (Next.js) Deployment

To build and deploy only the **frontend app**:

### Dev Mode:

```bash
docker compose -f docker-compose.dev.yml up --build frontend_app
```

### Production Mode:

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

## 🔁 Best Practices

✅ **Development**

* Use shared `.env` for service communication.
* Mount local files for rapid iteration.
* Keep logs active for debugging.

✅ **Production**

* Use a separate compose file.
* Don’t mount source code.
* Use minimal images (multi-stage builds).
* Push images to a container registry (e.g., GitHub Packages, Docker Hub).

---

## ⚙️ Environment Variables

Define these in your `.env`:

```
NODE_ENV=development

# Frontend
APP_PUBLIC_GATEWAY_BASE_URL_01=http://localhost:4000

# Backend
API_GATEWAY=4000
SIGNIN_SERVICE_PORT=4002

# Redis
REDIS_SERVER_PORT_01=6379
REDIS_PASSWORD_CODE_C=mysecretredis
DATABASE_PROVIDER=postgres
PRISMA_DATABASE_URL=postgresql://user:pass@db:5432/app
```

---

## 🦯 TL;DR Summary

| Task                 | Command                                               | Description             |
| -------------------- | ----------------------------------------------------- | ----------------------- |
| Start Dev Stack      | `docker compose -f docker-compose.dev.yml up --build` | Run all with hot reload |
| Start Prod Stack     | `docker compose -f docker-compose.prod.yml up -d`     | Run optimized services  |
| Build Single Service | `docker build -t myservice --target production .`     | Isolated deployment     |
| Stop Stack           | `docker compose down`                                 | Clean shutdown          |

---

💡 **Pro Tip:** Keep your Compose files versioned and automate image builds & pushes via **GitHub Actions** or **GitLab CI/CD**.

---
