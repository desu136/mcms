# Contributing to MCMS

Thank you for contributing to the Clinic Management System. This guide covers everything you need to know to work effectively within the team.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Getting Started](#2-getting-started)
3. [Branch Strategy](#3-branch-strategy)
4. [Commit Message Conventions](#4-commit-message-conventions)
5. [Pull Request Process](#5-pull-request-process)
6. [Code Quality Standards](#6-code-quality-standards)
7. [Application-Specific Guidelines](#7-application-specific-guidelines)
8. [Environment & Secrets Policy](#8-environment--secrets-policy)
9. [Database & Migration Rules](#9-database--migration-rules)
10. [Reporting Issues](#10-reporting-issues)

---

## 1. Prerequisites

Before writing any code, complete the [First-Run Setup](./README.md#5-first-run-setup-new-developer) in the README.

Ensure the following pass on your machine:

```bash
# TypeScript & JavaScript checks
pnpm typecheck
pnpm lint
pnpm build

# Flutter checks (from apps/mobile)
cd apps/mobile
flutter analyze
flutter test
```

All checks must pass before you open a Pull Request.

---

## 2. Getting Started

```bash
# 1. Fork or clone the repository
git clone <repo-url> mcms
cd mcms

# 2. Create your environment file
cp .env.example .env
# Edit .env and fill in all change_me_* values

# 3. Start infrastructure
pnpm infra:up

# 4. Install dependencies & set up DB
pnpm install
pnpm --filter=@mcms/api prisma:generate
pnpm db:migrate:dev
pnpm db:seed
pnpm build

# 5. Start development servers
pnpm dev
```

---

## 3. Branch Strategy

| Branch          | Purpose                                                |
| --------------- | ------------------------------------------------------ |
| `main`          | Stable, production-ready. **Protected — no direct push.** |
| `develop`       | Integration branch. All feature work merges here first. |
| `feature/<name>`| New features (e.g. `feature/appointment-booking`)     |
| `fix/<name>`    | Bug fixes (e.g. `fix/token-refresh-loop`)             |
| `chore/<name>`  | Tooling, deps, docs (e.g. `chore/update-prisma`)      |

### Workflow

```bash
# Always branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# Work, commit, push
git push origin feature/your-feature-name

# Open a PR targeting develop
```

- `develop` → `main` is done by the project lead after integration testing.
- Never push directly to `main` or `develop`.

---

## 4. Commit Message Conventions

We follow the **Conventional Commits** specification.

### Format

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | When to use                                       |
| ---------- | ------------------------------------------------- |
| `feat`     | New feature                                       |
| `fix`      | Bug fix                                           |
| `chore`    | Tooling, configuration, dependency updates        |
| `docs`     | Documentation changes only                       |
| `style`    | Formatting, whitespace (no logic change)          |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test`     | Adding or fixing tests                            |
| `perf`     | Performance improvements                          |
| `ci`       | CI/CD pipeline changes                            |

### Scopes

Use the package/app name as scope: `api`, `web`, `desktop`, `mobile`, `contracts`, `validation`, `api-client`, `domain`, `sync-core`, `ui-web`, `infra`.

### Examples

```
feat(api): add appointment scheduling endpoint
fix(web): correct token refresh loop on 401
chore(infra): upgrade PostgreSQL image to 16.3
docs(root): update first-run setup steps
test(api): add auth token reuse detection tests
```

### Rules

- Subject line: max **72 characters**, imperative mood, no period at end.
- Body: wrap at **100 characters**. Explain *why*, not *what*.
- Reference issues: `Closes #42`, `Fixes #17`.

---

## 5. Pull Request Process

### Before opening a PR

- [ ] All TypeScript packages pass `pnpm typecheck`
- [ ] All packages pass `pnpm lint`
- [ ] `pnpm build` succeeds
- [ ] `pnpm test` passes
- [ ] Flutter: `flutter analyze` passes with no issues (if mobile changes)
- [ ] No `.env` or real credentials committed
- [ ] No `console.log` debug statements left in production code
- [ ] New Prisma migrations have been reviewed and tested locally

### PR description template

```markdown
## Summary
Brief description of what this PR does and why.

## Changes
- List of key changes

## Testing
- How you tested this (commands run, endpoints hit, etc.)

## Screenshots (if UI change)
<!-- Add before/after screenshots if relevant -->

## Checklist
- [ ] typecheck passes
- [ ] lint passes
- [ ] build passes
- [ ] tests pass
- [ ] No secrets committed
```

### Review process

- At least **1 approval** required before merging into `develop`.
- Resolve all review comments before merging.
- Use **Squash and Merge** for feature branches to keep `develop` history clean.
- Use **Merge Commit** for `develop` → `main` to preserve the integration history.

---

## 6. Code Quality Standards

### TypeScript / JavaScript

- **No `any`**: Avoid `any` types. Use `unknown` and narrow properly.
- **No implicit returns**: All functions must have explicit return types where ambiguous.
- **Imports**: Use absolute imports with `@mcms/*` workspace packages. Never use relative `../../../` imports across package boundaries.
- **Errors**: Never silently swallow errors. Always log or rethrow.

### API (NestJS)

- All endpoints must have Swagger/OpenAPI decorators (`@ApiOperation`, `@ApiResponse`).
- All protected endpoints must use the `@UseGuards(JwtAuthGuard)` guard.
- All role-restricted endpoints must use `@Roles(...)` + `RolesGuard`.
- DTOs must use class-validator decorators; never trust raw request bodies.

### Web (Next.js)

- Server Components by default; use `'use client'` only when necessary.
- All pages that use `useSearchParams()` must be wrapped in `<Suspense>`.
- No hardcoded API URLs — always use `NEXT_PUBLIC_API_URL` from env.

### Desktop (Electron)

- All IPC channels must be declared in the preload script's `contextBridge`.
- Never use `nodeIntegration: true` in the BrowserWindow renderer.
- All SQLite operations must go through the main process IPC handlers.

### Mobile (Flutter)

- Follow the Repository pattern — UI never accesses SQLite or HTTP directly.
- Use Riverpod providers for all shared state.
- All generated files (`*.g.dart`, `*.freezed.dart`) must be committed if they are part of the build, or excluded via `.gitignore` if they are fully generated on-the-fly.

---

## 7. Application-Specific Guidelines

### Shared Packages (`packages/`)

- `@mcms/contracts`: Contains **only** TypeScript interfaces and OpenAPI spec. No runtime logic.
- `@mcms/validation`: Zod schemas only. Must be usable from both API and Web without circular deps.
- `@mcms/api-client`: The only place that constructs HTTP requests to the API. Never import `ky` directly in apps.
- `@mcms/domain`: Enums, branded ID types, and constants. No Prisma or HTTP imports.

### Database Schema Changes

See [Section 9 — Database & Migration Rules](#9-database--migration-rules).

### Adding a New Environment Variable

1. Add it to `.env.example` with a `change_me_*` placeholder and a descriptive comment.
2. Add it to the environment variables table in [README.md](./README.md#10-environment-variables).
3. Validate it at startup (e.g., with NestJS `ConfigService` or `zod.parse`).
4. Never hardcode a default value that would be used in production.

---

## 8. Environment & Secrets Policy

- **`.env` is gitignored**. Never commit it.
- **`.env.example` is committed**. It must contain only placeholder values.
- All secrets in `.env.example` must use the pattern `change_me_<description>`.
- If you add a new secret variable, add it to `.env.example` with a placeholder and document it.
- Never log secret values, even at `debug` level.
- Rotate any secret that was accidentally committed immediately and notify the team lead.

---

## 9. Database & Migration Rules

- Only `apps/api` connects to PostgreSQL. All other apps use their respective offline stores.
- **Never edit a migration file after it has been applied** (even locally). If you need to change a migration, create a new one.
- Always test migrations locally with `pnpm db:migrate:dev` before opening a PR.
- After adding a migration, regenerate the Prisma client: `pnpm --filter=@mcms/api prisma:generate`.
- Migrations that alter or drop columns must include a data migration or a clear explanation of data impact.
- Schema changes that break existing TypeScript types must update `@mcms/contracts` and `@mcms/domain` in the same PR.

---

## 10. Reporting Issues

- Use the project issue tracker (GitHub Issues or equivalent).
- Include:
  - Steps to reproduce
  - Expected vs. actual behavior
  - Environment details (OS, Node version, Docker version)
  - Relevant logs or screenshots
- For security vulnerabilities, contact the project lead directly — do not open a public issue.
