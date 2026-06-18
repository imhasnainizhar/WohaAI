# 🔐 Auth Service

A minimal authentication microservice built with **Express.js**, **TypeScript**, and **Prisma ORM**. It handles user signup, signin, and refresh token rotation for secure authentication across distributed services.

---


## 🚀 Features

* User signup with password hashing (Argon2)
* JWT-based authentication (Access + Refresh tokens)
* Refresh token rotation & invalidation
* Input validation using Zod
* Prisma ORM integration with PostgreSQL
* Modular folder structure (Controller / Service / Route)

---

## 📁 Folder Structure

```plaintext
📦 auth-service
├── src
│   ├── controllers/   # Request handlers
│   ├── routes/        # Express routes
│   ├── services/      # Business logic
│   ├── utils/         # Helpers (e.g. prisma client, response wrapper)
│   ├── server.ts      # Server Listens 
│   └── app.ts         # Express entry point
│
├── prisma/            # Prisma schema & migrations
├── package.json
└── tsconfig.json
```

---

## ⚙️ Non-Docker Setup

```bash
# Install dependencies
npm install

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

## ⚙️ With-Docker Setup

```bash
# Go to dev directory
cd dev

# Run single service
docker compose up --build auth_service
```

## 🧩 Example Endpoints

**POST /signup** – Create a new user
**POST /signin** – Authenticate user & return tokens
**POST /refresh** – Rotate refresh token

---

## 🧠 Tech Stack

* **Backend:** Express.js + TypeScript
* **ORM:** Prisma
* **Database:** PostgreSQL
* **Validation:** Zod
* **Auth:** JWT (Access + Refresh)

---

## 🧱 License

MIT License
