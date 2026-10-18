# MCMS — Production Clinic Management System Monorepo

Enterprise-grade, offline-capable Clinic Management System built with a pnpm workspace monorepo, Turborepo, NestJS, Next.js, Electron, and Flutter.

---

## 1. Monorepo Architecture

```
mcms/
├── apps/
│   ├── api/            # NestJS + TypeScript + Prisma ORM + PostgreSQL
│   ├── web/            # Next.js 15 (App Router) + Tailwind CSS + IndexedDB offline
│   ├── desktop/        # Electron + React + TypeScript + SQLite offline
│   └── mobile/         # Flutter + Dart + SQLite offline (Repository pattern)
├── packages/
│   ├── contracts/      # Shared API contracts, response types & OpenAPI 3.1 spec
│   ├── validation/     # Shared Zod schemas (auth, sync, domain)
│   ├── api-client/     # Typed HTTP client wrapper using ky
│   ├── domain/         # Shared domain types, enums, branded IDs, constants
│   ├── sync-core/      # Synchronization protocol contracts & semantics
│   ├── ui-web/         # Reusable web UI components
│   └── config/         # Shared TypeScript, ESLint, and Prettier configurations
├── infrastructure/     # Docker Compose & PostgreSQL initialization scripts
├── docker-compose.yml  # Root Docker Compose for central PostgreSQL service
├── pnpm-workspace.yaml # pnpm monorepo workspace definition
├── turbo.json          # Turborepo task pipeline configuration
└── .env.example        # Environment variable template
```

---

## 2. Technologies & Versions

| Component       | Framework / Technology  | Version                   | Purpose                               |
| --------------- | ----------------------- | ------------------------- | ------------------------------------- |
| Monorepo        | pnpm + Turborepo        | pnpm 12.14.0, Turbo 2.3+  | Fast caching, task orchestration      |
| Backend API     | NestJS + TypeScript     | NestJS 11, Node 20+       | Central authoritative backend         |
| ORM & Database  | Prisma ORM + PostgreSQL | Prisma 6, Postgres 16     | Central database authority            |
| Web Application | Next.js (App Router)    | Next.js 15, React 19      | Public landing & Staff portal         |
| Desktop App     | Electron + React        | Electron 34, React 19     | Clinical workstation with SQLite      |
| Mobile App      | Flutter + Dart          | Flutter 3.41+, Dart 3.11+ | Mobile clinical app with SQLite       |
| Contract Spec   | OpenAPI                 | OpenAPI 3.1               | Single source of truth for cross-lang |

---

## 3. Required Toolchain

Install all of the following before cloning or running the project.

| Tool            | Minimum Version | Install                                          |
| --------------- | --------------- | ------------------------------------------------ |
| Node.js         | 20.0.0          | https://nodejs.org                               |
| pnpm            | 9.0.0           | `npm install -g pnpm@latest`                     |
| Docker Desktop  | 4.x             | https://www.docker.com/products/docker-desktop   |
| Docker Compose  | 2.x (bundled)   | Bundled with Docker Desktop                      |
| Flutter SDK     | 3.41.0          | https://docs.flutter.dev/get-started/install     |
| Dart SDK        | 3.11.0          | Bundled with Flutter                             |
| Git             | 2.x             | https://git-scm.com                              |

> **Windows users**: Use PowerShell 7+ or Git Bash. WSL2 is recommended for Docker-based workflows.

---

## 4. Database Ownership & Rules

- **Central Authority**: `apps/api` is the **only** application that connects directly to PostgreSQL via Prisma.
- **Authoritative Schema**: Located at `apps/api/prisma/schema.prisma`.
- **Client Offline Storage**:
  - `apps/web`: IndexedDB (`apps/web/lib/offline/indexeddb.ts`)
  - `apps/desktop`: SQLite (`better-sqlite3`, `apps/desktop/src/storage/sqlite-client.ts`)
  - `apps/mobile`: SQLite (`sqflite`, `apps/mobile/lib/core/storage/sqlite_database.dart`)
- **No Unsafe Automatic Conflict Resolution**: Conflicts are surfaced via `CONFLICT` status with server version; clients handle reconciliation deterministically.

---

## 5. First-Run Setup (New Developer)

Follow these steps in order. Do not skip steps.

### Step 1 — Clone and enter the project

```bash
git clone <repo-url> mcms
cd mcms
```

### Step 2 — Create your local environment file

```bash
cp .env.example .env
```

Open `.env` and **set real values** for every `change_me_*` placeholder before proceeding.

> ⚠️ Never commit `.env`. It is listed in `.gitignore`.

### Step 3 — Start PostgreSQL via Docker

```bash
pnpm infra:up
```

This starts a PostgreSQL 16 container on **port 5433** (`mcms_dev`).
Verify it is healthy:

```bash
docker ps
```

### Step 4 — Install JavaScript/TypeScript dependencies

```bash
pnpm install
```

### Step 5 — Generate Prisma Client & apply migrations

```bash
# Generate the typed Prisma client
pnpm --filter=@mcms/api prisma:generate

# Apply all pending migrations
pnpm db:migrate:dev
```

### Step 6 — Seed the database (development only)

```bash
pnpm db:seed
```

This creates the default admin and doctor accounts. Credentials are printed to the console.
**The seed script will refuse to run if `NODE_ENV` is set to `production`.**

### Step 7 — Build shared packages

```bash
pnpm build
```

### Step 8 — Start development servers

```bash
# Start everything (API + Web) in parallel
pnpm dev

# Or start individual apps:
pnpm --filter=@mcms/api dev        # API on http://localhost:3001
pnpm --filter=@mcms/web dev        # Web on http://localhost:3000
pnpm --filter=@mcms/desktop dev    # Desktop (Vite dev server on port 5173)
```

### Step 9 — Flutter mobile (separate toolchain)

Flutter does **not** use pnpm. Run all Flutter commands from `apps/mobile`:

```bash
cd apps/mobile
flutter pub get
flutter analyze    # must pass with no issues
flutter test       # run widget tests
flutter run        # launch on connected device/emulator
```

---

## 6. Development Scripts Reference

### Infrastructure

| Command              | Description                           |
| -------------------- | ------------------------------------- |
| `pnpm infra:up`      | Start PostgreSQL container (detached) |
| `pnpm infra:down`    | Stop PostgreSQL container             |
| `pnpm infra:logs`    | Follow Docker container logs          |
| `pnpm infra:reset`   | Stop and delete all Docker volumes    |

### Database

| Command               | Description                                   |
| --------------------- | --------------------------------------------- |
| `pnpm db:migrate:dev` | Apply pending migrations (development)        |
| `pnpm db:migrate`     | Apply pending migrations (CI / production)    |
| `pnpm db:seed`        | Seed initial dev data (dev only, guarded)     |
| `pnpm db:studio`      | Open Prisma Studio GUI                        |
| `pnpm db:reset`       | Drop & recreate DB, apply migrations, re-seed |

### Applications

| Command                             | Description                            |
| ----------------------------------- | -------------------------------------- |
| `pnpm dev`                          | Start all apps in parallel             |
| `pnpm build`                        | Build all apps & packages              |
| `pnpm --filter=@mcms/api dev`       | NestJS API on port 3001                |
| `pnpm --filter=@mcms/web dev`       | Next.js Web on port 3000               |
| `pnpm --filter=@mcms/desktop dev`   | Electron renderer (Vite) on port 5173  |
| `pnpm --filter=@mcms/desktop start` | Open Electron window (after build)     |

### Code Quality

| Command             | Description                            |
| ------------------- | -------------------------------------- |
| `pnpm typecheck`    | Type-check all TypeScript packages     |
| `pnpm lint`         | Lint all code                          |
| `pnpm lint:fix`     | Auto-fix lint issues                   |
| `pnpm format`       | Format all code with Prettier          |
| `pnpm format:check` | Check formatting without writing       |
| `pnpm test`         | Run all test suites                    |
| `pnpm clean`        | Remove all build artifacts             |

---

## 7. Health Check Verification

The NestJS API exposes a central health check endpoint verifying database connectivity:

```
GET http://localhost:3001/api/v1/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2026-10-18T12:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": "ok"
  }
}
```

---

## 8. Security Notes

- **JWT tokens**: Access tokens expire in 15 minutes. Refresh tokens support automatic rotation and reuse detection (token family revocation).
- **Seed credentials**: Never use seeded dev accounts in any non-development environment.
- **Quick-fill dev buttons**: The login page shows quick-fill test account buttons **only** when `NODE_ENV=development`.
- **Secret scanning**: All secrets use `change_me_*` placeholders in `.env.example`. Real secrets must never be committed.
- **Production guard**: `prisma/seed.ts` exits immediately if `NODE_ENV=production`.

---

## 9. Branch Strategy

| Branch          | Purpose                                            |
| --------------- | -------------------------------------------------- |
| `main`          | Stable, production-ready code. Protected.          |
| `develop`       | Integration branch. All features merged here first.|
| `feature/*`     | Individual feature branches                        |
| `fix/*`         | Bug fix branches                                   |
| `chore/*`       | Tooling, dependencies, docs                        |

- Open a **Pull Request** into `develop` for all new work.
- `main` ← `develop` merges require at least one review.
- See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full contribution guide.

---

## 10. Environment Variables

All required variables are documented in [`.env.example`](./.env.example).
Copy it to `.env` and fill in real values before running any application.

| Variable                 | Used By           | Description                             |
| ------------------------ | ----------------- | --------------------------------------- |
| `DATABASE_URL`           | API (Prisma)      | Full PostgreSQL connection string       |
| `POSTGRES_HOST/PORT/DB`  | API / Docker      | Individual PostgreSQL coordinates       |
| `JWT_SECRET`             | API               | HMAC secret for JWT signing (32+ chars) |
| `JWT_EXPIRES_IN`         | API               | Access token TTL (e.g. `15m`)           |
| `JWT_REFRESH_EXPIRES_IN` | API               | Refresh token TTL (e.g. `7d`)           |
| `API_PORT`               | API               | NestJS listen port (default `3001`)     |
| `NODE_ENV`               | All               | `development` \| `production` \| `test` |
| `NEXT_PUBLIC_API_URL`    | Web               | API base URL visible to the browser     |
| `NEXTAUTH_URL`           | Web               | Next.js auth callback URL               |
| `NEXTAUTH_SECRET`        | Web               | NextAuth signing secret                 |
| `DESKTOP_API_URL`        | Desktop           | API base URL for Electron renderer      |
| `MOBILE_API_BASE_URL`    | Mobile (env.dart) | API base URL for Flutter app            |
