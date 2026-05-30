# 🤖 WohaAI Chatbot

![WohaAI Logo](https://gitlab.com/TheHasnainIzhar/Woah_GenAI_ChatBot/-/raw/65c3f25e2aeee5471f7e089621b5e0ea8a258840/gitlab_favicon.png "WohaAI Chatbot Logo")

**⚡ WohaAI is evolving at high speed!**
Building ChatGPT-like business logic, custom generative APIs, and a dynamic UI layer — progressing rapidly toward production-grade architecture.

![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgray.svg) ![License MIT](https://img.shields.io/badge/License-MIT-blue.svg) ![Powered By OpenAI](https://img.shields.io/badge/Powered%20By-OpenAI-black.svg)

---

## 🌟 Purpose

WohaAI Chatbot is a **portfolio and educational project** designed to:

* Develop and showcase **ChatGPT-like generative logic**, prompt pipelines, and message orchestration.
* Implement custom **Generative APIs** for conversational AI, modular and scalable for future extensions.
* Demonstrate a full **microservices architecture** running on Docker Compose, later deployment via Terraform.
* Provide **educational and AI engineering resources** for learners and contributors.

This project is in **active development**, blending **LLM-driven backends**, **real-time API systems**, and **Next.js UI** to form a modern, open AI chatbot stack.

---

## 🚀 Current Development Highlights

## Most Business Logic is Being Developed In October - November 2025

* 🧠 **ChatGPT-like core logic** – custom pipeline managing conversation state, role hierarchy, and memory retention.
* 🧩 **Generative APIs** – modular endpoints for contextual reasoning, and functional tool use.
* 🖥️ **Frontend (Next.js)** – dynamic chat interface, theme engine, and realtime stream rendering (under rapid development).
* 🐳 **Dockerized Dev Environment** – each service isolated and configurable through `.env`.
* 🔐 **JWT + Redis Integration** – secure session management and code verification flows.
* 🏗️ **Terraform (IaC)** – production deployment automation (in progress).

---

## ⚙️ Getting Started

Follow these steps to set up WohaAI locally for development or testing.

### 1. Clone the Repository

```bash
git clone https://gitlab.com/yourusername/WohaAI_Chatbot.git
cd WohaAI_Chatbot
```

### 2. Install Dependencies

Each microservice or frontend app has its own dependencies:

```bash
npm install   # or yarn install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and include your **OpenAI API key** and configure required services **not set by default**.

> ⚠️ Never commit `.env` or secret keys.

### 4. Start Local Development

## 🧑‍💻 Development Setup

### Goals

* Hot reloading for both frontend and backend.
* Shared network for seamless service communication.
* Mounted volumes for live file editing.

### Commands

#### 1. Start all services (development mode)

```bash
cd dev/scripts

# For Windows
./dev.ps1

# For Linux or macOS
./dev.sh
```

This command:

* Builds images with the `development` target (`DOCKER_TARGET=development`).
* Mounts local source code for live reload.
* Runs all services in a shared network `microservices_net_01`.

#### 2. Run a single service (debugging)

```bash
cd dev/compose

docker compose -f compose.auth.yml --env-file ../.env up --build
```

Example (Frontend):

```bash
docker compose -f compose.frontend.yml --env-file ../.env up --build
```

#### 3. Stop and remove containers

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

Access the services using ports defined in `.env`. Each microservice is modular and discoverable via the API Gateway.

---

## 📂 Project Structure

```text
project-root/
├── dev/                    # Docker Compose dev environment
├── infra/                  # Terraform IaC configs (WIP)
├── src/                    # Microservice + frontend source code
│   ├── frontend/           # Next.js UI (under development)
│   ├── ms/                 # AI, auth, verification, and mailer monorepo modules (Microservices)
├── docs/                   # Technical docs and architecture notes
├── DEV_DEPLOYMENT.md       # Development guide using Docker
└── README.md
```

---

## 🧱 Tech Stack Overview

| Layer          | Technology                       | Purpose                                 |
| -------------- | -------------------------------- | --------------------------------------- |
| Frontend       | **Next.js 14 (App Router)**      | UI, streaming chat, theming             |
| API Gateway    | **Express.js**                   | Routes and proxies service requests     |
| Micro Services | **Node.js / TypeScript**         | Chat logic, auth, verification          |
| AI Layer       | **Custom Tooling + OpenAI APIs** | Generative intelligence core            |
| Database       | **PostgreSQL + Prisma ORM**      | User and token data                     |
| Cache / Queue  | **Redis**                        | Session, verification, and task caching |
| Infrastructure | **Docker + Terraform**           | Dev & future cloud orchestration        |

---

## 🌍 Vision & Roadmap

WohaAI aims to evolve into a **modular, production-ready conversational AI ecosystem**, combining scalable backend logic, ethical AI engineering practices, and cutting-edge UI.

### Upcoming Milestones

* 🔁 Persistent memory & conversation history
* 🧩 Function calling & external API tools
* 📊 Observability dashboard (Prometheus + Grafana)
* ☁️ Full Terraform AWS deployment
* 🧠 Model fine-tuning playground

---

## 📚 Documentation & Community

* [Wiki](./docs/Home.md) — architecture and tutorials
* [Code of Conduct](./CODE_OF_CONDUCT.md)
* [Contributing Guide](./CONTRIBUTING.md)
* [Changelog](./CHANGELOG.md)

Join the mission to **build open, transparent, and ethical AI systems** while learning modern full-stack and DevOps principles.

---

**Built with ❤ by Hani.**
*Fast development. Transparent logic. Real AI engineering.*
