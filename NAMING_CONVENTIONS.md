
### 📘 File Naming Rules

| Type | Convention | Example | Notes |
|------|-------------|----------|--------|
| React Components | **PascalCase** | `AuthProvider.tsx` | Always export component in PascalCase |
| Context Providers | **PascalCase** | `AuthProvider.tsx` | Used in `/app/providers/` |
| Route Files | **Fixed names** | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` | Next.js app router requirement |
| Hooks | **kebab-case** | `use-auth.ts` | Must start with `use` |
| Utilities / Helpers | **kebab-case** | `auth-utils.ts`, `fetch-data.ts` | Reusable logic, no React code |
| Configs | **kebab-case** | `auth-config.ts`, `env-config.ts` | Store constants or settings |
| Components Directory | **PascalCase files** | `UserCard.tsx`, `Navbar.tsx` | UI components only |
| Folder Names | **kebab-case** | `user-profile/`, `auth-forms/` | Human-readable and URL-safe |

---

## 🧱 Shared/Backend Layer (Express.js, API, Infra)

| Type | Convention | Example | Notes |
|------|-------------|----------|--------|
| API Routes | **snake_case** | `user_routes.ts` | Matches traditional backend style |
| Controllers | **snake_case** | `auth_controller.ts` | Logical separation of request handling |
| Services | **snake_case** | `user_service.ts` | Core business logic layer |
| Models / Schemas | **PascalCase (class)** / **snake_case (file)** | `UserModel` → `user_model.ts` | Database abstractions |
| Middlewares | **snake_case** | `auth_middleware.ts` | Keeps naming consistent with Express style |
| Config / Constants | **snake_case** | `db_config.ts`, `env_config.ts` | Central configuration files |
| Folder Names | **snake_case** | `controllers/`, `services/`, `middlewares/` | Conventional backend format |

---

## 🧩 Export Naming

| Case | Used For | Example |
|------|-----------|---------|
| **PascalCase** | Components, Classes | `AuthProvider`, `UserService` |
| **camelCase** | Variables, Functions, Hooks | `useAuth`, `getUserData` |
| **UPPER_SNAKE_CASE** | Constants / Env | `API_URL`, `DEFAULT_TIMEOUT` |

---

## 🧠 Naming Philosophy

- Be **explicit, not clever** — names should instantly convey purpose.  
- Keep **file names short** but descriptive (avoid redundant suffixes like `component.tsx`).  
- Use **PascalCase for anything React renders**.  
- Use **snake_case for backend logic** to align with traditional server file structures.  
- Use **kebab-case for frontend utilities and configs** for readability and URL safety.  

---

## ✅ Examples Overview

| Layer | File | Convention | Purpose |
|-------|------|-------------|----------|
| Frontend | `AuthProvider.tsx` | PascalCase | React context provider |
| Frontend | `auth-utils.ts` | kebab-case | Helper functions |
| Frontend | `use-auth.ts` | kebab-case | Custom hook |
| Backend | `auth_controller.ts` | snake_case | Express controller |
| Backend | `user_service.ts` | snake_case | Business logic |
| Shared | `env_config.ts` | snake_case | Config shared between FE/BE |

---

## 🏁 Summary

**Frontend**
- Components → `PascalCase`
- Utilities & hooks → `kebab-case`
- Routes → reserved names (`page.tsx`, etc.)

**Backend**
- Logic & infra → `snake_case`
- Classes → `PascalCase`
- Constants → `UPPER_SNAKE_CASE`

---

_Consistent naming = predictable architecture = faster onboarding & fewer mistakes._
