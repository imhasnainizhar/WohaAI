# 🤖 WoahAI Chatbot

<p align="center">
  <img src="https://your-logo-url.png" width="120" />
</p>

<p align="center">
  Open-source AI chatbot project for <strong>educational purposes</strong> and portfolio showcase.<br/>
  Learn, contribute, and explore ethical AI development 🌱
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Contributions-Welcome-brightgreen.svg" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" />
  <img src="https://img.shields.io/badge/Powered%20By-OpenAI-black.svg" />
</p>

---

## ⚡ Development Speed & Vision

WoahAI is under **active and rapid development**, focused on building a **production-grade AI assistant ecosystem**. The current roadmap includes:

* A complete **ChatGPT-style business logic layer**, built with modular generative API integrations (OpenAI, Anthropic, custom LLMs).
* A **Next.js UI** with real-time chat, adaptive prompts, and multi-modal extensions — under heavy, fast-paced development.
* **Microservice architecture** using Node.js + Express, Prisma, Redis, and PostgreSQL.
* Future **Terraform-managed cloud infrastructure**, replacing Docker Compose for production-level orchestration.

This is not a demo — it’s a living system under design to represent modern, scalable AI backends.

---

## 🌟 Purpose

WoahAI Chatbot is a **portfolio and educational project** designed to:

* Demonstrate how to integrate **OpenAI and generative APIs** into a microservice ecosystem.
* Showcase **clean architecture** and modular containerization across frontend and backend.
* Provide a **learning playground** for developers exploring AI systems, DevOps, and infrastructure.
* Promote **ethical, transparent, and open-source** AI experimentation.

---

## 🚀 Features

* 💬 **AI Chatbot Logic** using GPT-style APIs (OpenAI and future custom endpoints)
* 🐳 **Microservices-first backend**: Sign-in, Sign-up, Gateway, User, Verification, and Mailer services
* 🛠️ **Local Dev Environment** via Docker Compose (in `dev/`)
* 🏗️ **Infrastructure-as-Code (IaC)** with Terraform (in `infra/`)
* 📂 **PostgreSQL + Redis** integration for persistence and caching
* 🌐 **Next.js UI** under development — optimized for SSR, token-based auth, and AI conversation streams

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://gitlab.com/yourusername/WoahAI_Chatbot.git
cd WoahAI_Chatbot
```

### 2. Install Dependencies

Each service in `src/` has its own package.json:

```bash
npm install  # or yarn install
```

### 3. Configure Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

> ⚠️ Never commit secrets or API keys.

### 4. Run the Dev Environment

```bash
cd dev/
docker compose -f compose.api.yml up --build
```

* Access frontend on `http://localhost:3000`
* API Gateway on `http://localhost:8000`

### 5. (Optional) Terraform Cloud Deployment

```bash
cd infra/
terraform init
terraform plan
terraform apply
```

Future production releases will use Terraform for container orchestration, scaling, and secrets management.

---

## 🗂️ Project Structure

```
project-root/
├── dev/                    # Docker Compose environment
├── infra/                  # Terraform IaC configs (under dev)
├── src/                    # Microservice source code
├── frontend/               # Next.js UI (in progress)
├── docs/                   # Documentation and wiki
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── CHANGELOG.md
└── README.md
```

---

## 📚 Documentation & Community

* [Wiki](./docs/Home.md) — full guides & reference docs
* [Code of Conduct](./CODE_OF_CONDUCT.md) — behavior guidelines
* [Contributing](./CONTRIBUTING.md) — development workflow
* [Changelog](./CHANGELOG.md) — progress tracking

---

<p align="center">
  Built with 💚 by <strong>Hani</strong> and contributors.<br/>
  <em>Accelerating ethical AI systems — one microservice at a time.</em>
</p>
