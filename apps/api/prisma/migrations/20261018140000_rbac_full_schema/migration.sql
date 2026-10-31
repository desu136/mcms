-- ============================================================
-- Migration: rbac_full_schema
-- Description: Full RBAC schema — replaces simple role column
--   with Role/Permission/UserRole/RolePermission tables.
--   Adds StaffProfile, PasswordReset, and enhanced AuthSession.
-- ============================================================

-- CreateEnum for AccountStatus
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'LOCKED', 'PENDING_VERIFICATION');

-- ── Drop old Role enum and is_active/role columns from users ─────────────────

-- Add new columns first (with defaults so existing rows are valid)
ALTER TABLE "users"
  ADD COLUMN "account_status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "failed_login_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "locked_at" TIMESTAMP(3),
  ADD COLUMN "last_login_at" TIMESTAMP(3),
  ADD COLUMN "last_login_ip" TEXT,
  ADD COLUMN "password_changed_at" TIMESTAMP(3);

-- Migrate is_active → account_status
UPDATE "users" SET "account_status" = 'INACTIVE' WHERE "is_active" = false;

-- Drop old columns
ALTER TABLE "users"
  DROP COLUMN "is_active",
  DROP COLUMN "role";

-- Drop old Role enum
DROP TYPE "Role";

-- ── Enhance auth_sessions ─────────────────────────────────────────────────────

-- Rename refresh_token to refresh_token_hash, add new columns
ALTER TABLE "auth_sessions"
  RENAME COLUMN "refresh_token" TO "refresh_token_hash";

ALTER TABLE "auth_sessions"
  ADD COLUMN "token_family" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  ADD COLUMN "access_token_jti" TEXT,
  ADD COLUMN "revoked_at" TIMESTAMP(3),
  ADD COLUMN "ip_address" TEXT,
  ADD COLUMN "user_agent" TEXT;

-- Drop old unique on refresh_token, add new unique constraints
DROP INDEX IF EXISTS "auth_sessions_refresh_token_key";
CREATE UNIQUE INDEX "auth_sessions_refresh_token_hash_key" ON "auth_sessions"("refresh_token_hash");
CREATE UNIQUE INDEX "auth_sessions_access_token_jti_key" ON "auth_sessions"("access_token_jti") WHERE "access_token_jti" IS NOT NULL;
CREATE INDEX "auth_sessions_user_id_idx" ON "auth_sessions"("user_id");
CREATE INDEX "auth_sessions_token_family_idx" ON "auth_sessions"("token_family");
CREATE INDEX "auth_sessions_expires_at_idx" ON "auth_sessions"("expires_at");

-- ── Create staff_profiles ─────────────────────────────────────────────────────

CREATE TABLE "staff_profiles" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "employee_number" TEXT,
  "job_title" TEXT,
  "department" TEXT,
  "phone_number" TEXT,
  "license_number" TEXT,

  CONSTRAINT "staff_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "staff_profiles_user_id_key" ON "staff_profiles"("user_id");
CREATE UNIQUE INDEX "staff_profiles_employee_number_key" ON "staff_profiles"("employee_number") WHERE "employee_number" IS NOT NULL;

ALTER TABLE "staff_profiles"
  ADD CONSTRAINT "staff_profiles_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Create password_resets ────────────────────────────────────────────────────

CREATE TABLE "password_resets" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "token_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "used_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "password_resets_token_hash_key" ON "password_resets"("token_hash");
CREATE INDEX "password_resets_user_id_idx" ON "password_resets"("user_id");

ALTER TABLE "password_resets"
  ADD CONSTRAINT "password_resets_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Create roles ──────────────────────────────────────────────────────────────

CREATE TABLE "roles" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "is_system_role" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- ── Create permissions ────────────────────────────────────────────────────────

CREATE TABLE "permissions" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "permissions_slug_key" ON "permissions"("slug");
CREATE INDEX "permissions_module_idx" ON "permissions"("module");

-- ── Create user_roles ─────────────────────────────────────────────────────────

CREATE TABLE "user_roles" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "role_id" TEXT NOT NULL,
  "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "granted_by" TEXT,

  CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");

ALTER TABLE "user_roles"
  ADD CONSTRAINT "user_roles_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_roles"
  ADD CONSTRAINT "user_roles_role_id_fkey"
  FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Create role_permissions ───────────────────────────────────────────────────

CREATE TABLE "role_permissions" (
  "id" TEXT NOT NULL,
  "role_id" TEXT NOT NULL,
  "permission_id" TEXT NOT NULL,
  "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

ALTER TABLE "role_permissions"
  ADD CONSTRAINT "role_permissions_role_id_fkey"
  FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "role_permissions"
  ADD CONSTRAINT "role_permissions_permission_id_fkey"
  FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Enhance audit_logs ────────────────────────────────────────────────────────

ALTER TABLE "audit_logs"
  ADD COLUMN "resource_id" TEXT,
  ADD COLUMN "user_agent" TEXT;

CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- ── Add indexes to users ──────────────────────────────────────────────────────

CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_account_status_idx" ON "users"("account_status");
