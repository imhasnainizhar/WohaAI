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
**So, consider to create and check .env file at root directory and provide it in docker compose commands for development**

**For Just an Example**

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
