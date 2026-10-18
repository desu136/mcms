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
| Monorepo        | pnpm + Turborepo        | pnpm 10+, Turbo 2.3+      | Fast caching, task orchestration      |
| Backend API     | NestJS + TypeScript     | NestJS 11, Node 20+       | Central authoritative backend         |
| ORM & Database  | Prisma ORM + PostgreSQL | Prisma 6, Postgres 16     | Central database authority            |
| Web Application | Next.js (App Router)    | Next.js 15, React 19      | Public landing & Staff portal         |
| Desktop App     | Electron + React        | Electron 34, React 19     | Clinical workstation with SQLite      |
| Mobile App      | Flutter + Dart          | Flutter 3.41+, Dart 3.11+ | Mobile clinical app with SQLite       |
| Contract Spec   | OpenAPI                 | OpenAPI 3.1               | Single source of truth for cross-lang |

---

## 3. Database Ownership & Rules

- **Central Authority**: `apps/api` is the **only** application that connects directly to PostgreSQL via Prisma.
- **Authoritative Schema**: Located at `apps/api/prisma/schema.prisma`.
- **Client Offline Storage**:
  - `apps/web`: IndexedDB (`apps/web/lib/offline/indexeddb.ts`)
  - `apps/desktop`: SQLite (`better-sqlite3`, `apps/desktop/src/storage/sqlite-client.ts`)
  - `apps/mobile`: SQLite (`sqflite`, `apps/mobile/lib/core/storage/sqlite_database.dart`)
- **No Unsafe Automatic Conflict Resolution**: Conflicts are surfaced via `CONFLICT` status with server version; clients handle reconciliation deterministically.

---

## 4. Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0 (`npm install -g pnpm@latest`)
- Docker & Docker Compose
- Flutter SDK (for mobile development)

### Environment Setup

```bash
cp .env.example .env
```

### 1. Start Infrastructure (PostgreSQL)

```bash
pnpm infra:up
# Or: docker compose up -d
```

### 2. Install JavaScript/TypeScript Dependencies

```bash
pnpm install
```

### 3. Build Shared Packages

```bash
pnpm build
```

### 4. Run Prisma Migrations & Seed Data

```bash
# Generate Prisma Client
pnpm --filter=@mcms/api prisma:generate

# Apply migrations
pnpm db:migrate:dev

# Seed database with initial admin & doctor accounts
pnpm db:seed
```

---

## 5. Development Commands

### Running Applications

```bash
# Run all applications simultaneously
pnpm dev

# Run only NestJS API (port 3001)
pnpm --filter=@mcms/api dev

# Run only Next.js Web App (port 3000)
pnpm --filter=@mcms/web dev

# Run Desktop Electron App (port 5173 + Electron)
pnpm --filter=@mcms/desktop dev

# Start Electron window
pnpm --filter=@mcms/desktop start
```

### Testing, Linting & Type Checking

```bash
# Typecheck all TypeScript packages
pnpm typecheck

# Lint all code
pnpm lint

# Format codebase
pnpm format
```

---

## 6. Flutter Mobile Workflow

Flutter uses its own toolchain and does not use pnpm:

```bash
cd apps/mobile

# Install Dart dependencies
flutter pub get

# Static analysis
flutter analyze

# Format check
dart format --output=none --set-exit-if-changed .

# Run widget tests
flutter test

# Run app
flutter run
```

---

## 7. Health Check Verification

The NestJS API exposes a central health check endpoint verifying database connectivity:

```
GET http://localhost:3001/api/v1/health
```

Expected Response:

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
