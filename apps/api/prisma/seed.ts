import { PrismaClient, AccountStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─── Permission definitions ────────────────────────────────────────────────────

const PERMISSIONS = [
  // Auth
  { slug: 'auth:login', name: 'Login', module: 'auth', description: 'Authenticate with credentials' },
  { slug: 'auth:logout', name: 'Logout', module: 'auth', description: 'End an active session' },
  { slug: 'auth:refresh', name: 'Refresh Token', module: 'auth', description: 'Refresh access token' },
  { slug: 'auth:password_reset', name: 'Password Reset', module: 'auth', description: 'Reset own password' },

  // Users
  { slug: 'users:read', name: 'View Users', module: 'users', description: 'View user list and profiles' },
  { slug: 'users:create', name: 'Create User', module: 'users', description: 'Create new staff accounts' },
  { slug: 'users:update', name: 'Update User', module: 'users', description: 'Edit user details and roles' },
  { slug: 'users:delete', name: 'Delete User', module: 'users', description: 'Soft-delete a user account' },
  { slug: 'users:activate', name: 'Activate User', module: 'users', description: 'Re-activate an inactive account' },
  { slug: 'users:deactivate', name: 'Deactivate User', module: 'users', description: 'Deactivate a user account' },

  // Roles & Permissions
  { slug: 'roles:read', name: 'View Roles', module: 'roles', description: 'View role definitions' },
  { slug: 'roles:manage', name: 'Manage Roles', module: 'roles', description: 'Create and modify roles' },
  { slug: 'permissions:read', name: 'View Permissions', module: 'roles', description: 'View available permission slugs' },

  // Audit
  { slug: 'audit:read', name: 'View Audit Log', module: 'audit', description: 'Read the system audit trail' },

  // Sync
  { slug: 'sync:push', name: 'Sync Push', module: 'sync', description: 'Push offline operations to the server' },
  { slug: 'sync:pull', name: 'Sync Pull', module: 'sync', description: 'Pull server changes to the local store' },
] as const;

// ─── Role permission assignments ──────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: PERMISSIONS.map((p) => p.slug),

  CLINIC_ADMIN: [
    'auth:login', 'auth:logout', 'auth:refresh', 'auth:password_reset',
    'users:read', 'users:create', 'users:update', 'users:activate', 'users:deactivate',
    'roles:read', 'permissions:read',
    'audit:read',
    'sync:push', 'sync:pull',
  ],

  DOCTOR: [
    'auth:login', 'auth:logout', 'auth:refresh', 'auth:password_reset',
    'users:read',
    'sync:push', 'sync:pull',
  ],

  NURSE: [
    'auth:login', 'auth:logout', 'auth:refresh', 'auth:password_reset',
    'users:read',
    'sync:push', 'sync:pull',
  ],

  RECEPTIONIST: [
    'auth:login', 'auth:logout', 'auth:refresh', 'auth:password_reset',
    'users:read',
    'sync:push', 'sync:pull',
  ],

  PATIENT: [
    'auth:login', 'auth:logout', 'auth:refresh', 'auth:password_reset',
    'sync:pull',
  ],
};

// ─── Seed users ───────────────────────────────────────────────────────────────

const SEED_USERS = [
  {
    email: 'admin@mcms.local',
    displayName: 'System Administrator',
    password: 'Admin@123456',
    roleName: 'SUPER_ADMIN',
    staffProfile: {
      employeeNumber: 'EMP-0001',
      jobTitle: 'System Administrator',
      department: 'IT',
    },
  },
  {
    email: 'clinic.admin@mcms.local',
    displayName: 'Clinic Administrator',
    password: 'ClinicAdmin@123456',
    roleName: 'CLINIC_ADMIN',
    staffProfile: {
      employeeNumber: 'EMP-0002',
      jobTitle: 'Clinic Administrator',
      department: 'Administration',
    },
  },
  {
    email: 'doctor@mcms.local',
    displayName: 'Dr. Jane Smith',
    password: 'Doctor@123456',
    roleName: 'DOCTOR',
    staffProfile: {
      employeeNumber: 'EMP-0003',
      jobTitle: 'General Practitioner',
      department: 'Medical',
      licenseNumber: 'MED-12345',
    },
  },
  {
    email: 'nurse@mcms.local',
    displayName: 'Nurse Alex Johnson',
    password: 'Nurse@123456',
    roleName: 'NURSE',
    staffProfile: {
      employeeNumber: 'EMP-0004',
      jobTitle: 'Registered Nurse',
      department: 'Medical',
      licenseNumber: 'RN-67890',
    },
  },
  {
    email: 'receptionist@mcms.local',
    displayName: 'Sarah Receptionist',
    password: 'Reception@123456',
    roleName: 'RECEPTIONIST',
    staffProfile: {
      employeeNumber: 'EMP-0005',
      jobTitle: 'Front Desk Receptionist',
      department: 'Administration',
    },
  },
] as const;

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_SEED !== 'true') {
    throw new Error(
      'REFUSING TO SEED: NODE_ENV is "production". Seed users contain development credentials and must NEVER be used in production. Set ALLOW_DEV_SEED=true only if intentional.',
    );
  }

  console.log('\n🌱 Starting MCMS database seed...\n');
  console.log('⚠️  DEVELOPMENT SEED: Default credentials should only be used in local dev.\n');

  // 1. Upsert all permissions
  console.log('📋 Seeding permissions...');
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { slug: perm.slug },
      update: { name: perm.name, module: perm.module, description: perm.description },
      create: perm,
    });
  }
  console.log(`   ✓ ${PERMISSIONS.length} permissions seeded`);

  // 2. Upsert system roles
  console.log('🎭 Seeding system roles...');
  const roleNames = Object.keys(ROLE_PERMISSIONS);
  const roleMap: Record<string, string> = {}; // name → id

  for (const roleName of roleNames) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `System role: ${roleName.toLowerCase().replace(/_/g, ' ')}`,
        isSystemRole: true,
      },
    });
    roleMap[roleName] = role.id;
  }
  console.log(`   ✓ ${roleNames.length} roles seeded`);

  // 3. Assign permissions to roles
  console.log('🔒 Assigning permissions to roles...');
  for (const [roleName, slugs] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleMap[roleName];
    if (!roleId) throw new Error(`Role not found: ${roleName}`);

    const permIds = await prisma.permission.findMany({
      where: { slug: { in: slugs as unknown as string[] } },
      select: { id: true },
    });

    // Remove existing and reassign
    await prisma.rolePermission.deleteMany({ where: { roleId } });
    await prisma.rolePermission.createMany({
      data: permIds.map(({ id }) => ({ roleId, permissionId: id })),
    });
    console.log(`   ✓ ${roleName}: ${permIds.length} permissions assigned`);
  }

  // 4. Seed staff users
  console.log('\n👤 Seeding staff users...');
  for (const userData of SEED_USERS) {
    const passwordHash = await bcrypt.hash(userData.password, 12);
    const roleId = roleMap[userData.roleName];
    if (!roleId) throw new Error(`Role not found: ${userData.roleName}`);

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        displayName: userData.displayName,
        passwordHash,
        accountStatus: AccountStatus.ACTIVE,
      },
    });

    // Assign role (idempotent)
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId } },
      update: {},
      create: { userId: user.id, roleId },
    });

    // Upsert staff profile
    if (userData.staffProfile) {
      await prisma.staffProfile.upsert({
        where: { userId: user.id },
        update: { ...userData.staffProfile },
        create: { userId: user.id, ...userData.staffProfile },
      });
    }

    console.log(`   ✓ ${userData.email} [${userData.roleName}] — password: ${userData.password}`);
  }

  console.log('\n✅ Database seeded successfully!\n');
  console.log('─'.repeat(60));
  console.log('SEED ACCOUNTS:');
  for (const u of SEED_USERS) {
    console.log(`  ${u.roleName.padEnd(16)} ${u.email.padEnd(30)} ${u.password}`);
  }
  console.log('─'.repeat(60));
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
