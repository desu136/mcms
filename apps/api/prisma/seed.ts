import {
  PrismaClient,
  AccountStatus,
  TenantStatus,
  BranchStatus,
  Gender,
  RoomType,
  RoomStatus,
  BedStatus,
  AppointmentType,
  AppointmentStatus,
  AdmissionStatus,
  QueuePriority,
  QueueStatus,
  VitalsCondition,
  PrescriptionStatus,
  MedAdminStatus,
  TaskPriority,
  TaskStatus,
  LabOrderPriority,
  LabOrderStatus,
  LabSampleStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─── Permission Definitions ──────────────────────────────────────────────────

const PERMISSIONS = [
  // Auth
  { slug: 'auth:login', name: 'Login', module: 'auth', description: 'Authenticate with credentials' },
  { slug: 'auth:logout', name: 'Logout', module: 'auth', description: 'End active session' },
  { slug: 'auth:refresh', name: 'Refresh Token', module: 'auth', description: 'Refresh access token' },
  { slug: 'auth:password_reset', name: 'Password Reset', module: 'auth', description: 'Reset password' },

  // Tenant & Organization
  { slug: 'tenants:read', name: 'View Tenants', module: 'tenants', description: 'View organization details' },
  { slug: 'tenants:manage', name: 'Manage Tenants', module: 'tenants', description: 'Create and configure organizations' },

  // Branches
  { slug: 'branches:read', name: 'View Branches', module: 'branches', description: 'View clinic branch locations' },
  { slug: 'branches:manage', name: 'Manage Branches', module: 'branches', description: 'Create and configure physical facilities' },

  // Departments & Rooms
  { slug: 'departments:read', name: 'View Departments', module: 'departments', description: 'View clinical departments' },
  { slug: 'departments:manage', name: 'Manage Departments', module: 'departments', description: 'Configure departments and service points' },
  { slug: 'rooms:read', name: 'View Rooms & Beds', module: 'rooms', description: 'View rooms and beds availability' },
  { slug: 'rooms:manage', name: 'Manage Rooms & Beds', module: 'rooms', description: 'Configure consultation rooms and wards' },

  // Users & Staff
  { slug: 'users:read', name: 'View Users', module: 'users', description: 'View staff accounts and profiles' },
  { slug: 'users:create', name: 'Create Users', module: 'users', description: 'Create new staff members' },
  { slug: 'users:update', name: 'Update Users', module: 'users', description: 'Update staff roles and branch assignments' },
  { slug: 'users:delete', name: 'Delete Users', module: 'users', description: 'Deactivate user accounts' },

  // Roles
  { slug: 'roles:read', name: 'View Roles', module: 'roles', description: 'View RBAC roles' },
  { slug: 'roles:manage', name: 'Manage Roles', module: 'roles', description: 'Configure roles and permission matrices' },

  // Patients (Tenant-Wide Continuity)
  { slug: 'patients:read', name: 'View Patients', module: 'patients', description: 'Search and view patient medical charts' },
  { slug: 'patients:create', name: 'Register Patients', module: 'patients', description: 'Register new patients' },
  { slug: 'patients:update', name: 'Update Patients', module: 'patients', description: 'Edit patient demographic and contact info' },

  // Appointments & Queue (Branch-Scoped)
  { slug: 'appointments:read', name: 'View Appointments', module: 'appointments', description: 'View appointment bookings' },
  { slug: 'appointments:create', name: 'Book Appointments', module: 'appointments', description: 'Schedule new patient appointments' },
  { slug: 'appointments:manage', name: 'Manage Appointments', module: 'appointments', description: 'Reschedule or cancel appointments' },
  { slug: 'queue:read', name: 'View Queue', module: 'queue', description: 'View walk-in triage and department queues' },
  { slug: 'queue:manage', name: 'Manage Queue', module: 'queue', description: 'Check-in, call next, and complete visits' },

  // Doctor Workstation
  { slug: 'consultations:conduct', name: 'Conduct Consultations', module: 'clinical', description: 'Document diagnoses and encounter notes' },
  { slug: 'prescriptions:read', name: 'View Prescriptions', module: 'prescriptions', description: 'View patient medication orders' },
  { slug: 'prescriptions:create', name: 'Write Prescriptions', module: 'prescriptions', description: 'Issue electronic prescriptions' },

  // Nurse Workstation
  { slug: 'vitals:read', name: 'View Vitals', module: 'vitals', description: 'View patient vital signs history and charts' },
  { slug: 'vitals:record', name: 'Record Vitals', module: 'vitals', description: 'Log vital parameters and observe trends' },
  { slug: 'medications:administer', name: 'Administer Medications', module: 'emar', description: 'eMAR medication administration and signing' },
  { slug: 'tasks:manage', name: 'Nursing Care Tasks', module: 'nursing', description: 'Manage nursing checklists and care plans' },
  { slug: 'admissions:manage', name: 'Manage Inpatient Ward', module: 'inpatient', description: 'Admit, bed assign, and transfer patients' },

  // Laboratory Workstation
  { slug: 'lab:orders:read', name: 'View Lab Orders', module: 'laboratory', description: 'View laboratory test requisitions' },
  { slug: 'lab:orders:create', name: 'Order Lab Tests', module: 'laboratory', description: 'Request diagnostic laboratory tests' },
  { slug: 'lab:samples:collect', name: 'Collect Lab Samples', module: 'laboratory', description: 'Draw specimens, print barcodes, and dispatch' },
  { slug: 'lab:results:enter', name: 'Enter Lab Findings', module: 'laboratory', description: 'Input test measurements and report findings' },
  { slug: 'lab:results:verify', name: 'Verify Lab Reports', module: 'laboratory', description: 'Pathologist/senior verification of results' },

  // Audit & Sync
  { slug: 'audit:read', name: 'View Audit Logs', module: 'audit', description: 'Read tenant audit trails' },
  { slug: 'sync:push', name: 'Sync Push', module: 'sync', description: 'Push offline clinical changes' },
  { slug: 'sync:pull', name: 'Sync Pull', module: 'sync', description: 'Pull server updates to local cache' },
] as const;

// ─── Role Permission Matrices ─────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<string, string[]> = {
  // 1. Super Admin: Global cross-tenant access
  SUPER_ADMIN: PERMISSIONS.map((p) => p.slug),

  // 2. Clinic Admin: Manages organization, branches, staff, infrastructure
  CLINIC_ADMIN: [
    'auth:login', 'auth:logout', 'auth:refresh', 'auth:password_reset',
    'tenants:read', 'branches:read', 'branches:manage',
    'departments:read', 'departments:manage', 'rooms:read', 'rooms:manage',
    'users:read', 'users:create', 'users:update', 'users:delete',
    'roles:read',
    'patients:read', 'appointments:read', 'queue:read',
    'vitals:read', 'prescriptions:read', 'lab:orders:read',
    'audit:read', 'sync:push', 'sync:pull',
  ],

  // 3. Doctor Workstation
  DOCTOR: [
    'auth:login', 'auth:logout', 'auth:refresh', 'auth:password_reset',
    'branches:read', 'departments:read', 'rooms:read', 'users:read',
    'patients:read', 'patients:update',
    'appointments:read', 'appointments:create', 'appointments:manage',
    'queue:read', 'queue:manage',
    'consultations:conduct',
    'prescriptions:read', 'prescriptions:create',
    'vitals:read', 'vitals:record',
    'lab:orders:read', 'lab:orders:create',
    'admissions:manage',
    'sync:push', 'sync:pull',
  ],

  // 4. Nurse Workstation
  NURSE: [
    'auth:login', 'auth:logout', 'auth:refresh', 'auth:password_reset',
    'branches:read', 'departments:read', 'rooms:read',
    'patients:read',
    'appointments:read',
    'vitals:read', 'vitals:record',
    'medications:administer',
    'tasks:manage',
    'admissions:manage',
    'lab:orders:read', 'lab:samples:collect',
    'sync:push', 'sync:pull',
  ],

  // 5. Lab Technician / Laboratorist Workstation
  LAB_TECHNICIAN: [
    'auth:login', 'auth:logout', 'auth:refresh', 'auth:password_reset',
    'branches:read', 'departments:read',
    'patients:read',
    'lab:orders:read',
    'lab:samples:collect',
    'lab:results:enter',
    'lab:results:verify',
    'sync:push', 'sync:pull',
  ],

  // 6. Receptionist Workstation (Front Desk)
  RECEPTIONIST: [
    'auth:login', 'auth:logout', 'auth:refresh', 'auth:password_reset',
    'branches:read', 'departments:read', 'rooms:read', 'users:read',
    'patients:read', 'patients:create', 'patients:update',
    'appointments:read', 'appointments:create', 'appointments:manage',
    'queue:read', 'queue:manage',
    'sync:push', 'sync:pull',
  ],

  // Patient Portal
  PATIENT: [
    'auth:login', 'auth:logout', 'auth:refresh', 'auth:password_reset',
    'appointments:read', 'appointments:create',
    'prescriptions:read', 'vitals:read', 'lab:orders:read',
    'sync:pull',
  ],
};

// ─── Main Seeding Routine ─────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('\n🏥 Initializing MCMS Multi-Tenant & Multi-Branch Database Seed...\n');

  // 1. Seed Permissions
  console.log('📋 Seeding Permissions...');
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { slug: perm.slug },
      update: { name: perm.name, module: perm.module, description: perm.description },
      create: perm,
    });
  }
  console.log(`   ✓ ${PERMISSIONS.length} permissions verified.`);

  // 2. Seed System Roles
  console.log('🎭 Seeding System Roles...');
  const roleMap: Record<string, string> = {};
  for (const roleName of Object.keys(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `${roleName.replace(/_/g, ' ')} workstation role`,
        isSystemRole: true,
      },
    });
    roleMap[roleName] = role.id;
  }
  console.log(`   ✓ ${Object.keys(ROLE_PERMISSIONS).length} roles verified.`);

  // 3. Assign Role Permissions
  console.log('🔒 Assigning Permissions to Roles...');
  for (const [roleName, slugs] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleMap[roleName];
    if (!roleId) continue;

    const permIds = await prisma.permission.findMany({
      where: { slug: { in: slugs } },
      select: { id: true },
    });

    await prisma.rolePermission.deleteMany({ where: { roleId } });
    await prisma.rolePermission.createMany({
      data: permIds.map(({ id }) => ({ roleId, permissionId: id })),
    });
    console.log(`   ✓ ${roleName}: ${permIds.length} permissions configured.`);
  }

  // 4. Seed Demo Tenant (Healthcare Network)
  console.log('\n🏢 Seeding Demo Organization (Tenant)...');
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'bethezatha-health' },
    update: {},
    create: {
      name: 'Bethezatha Specialized Health Network',
      slug: 'bethezatha-health',
      code: 'BSHN',
      contactEmail: 'contact@bethezatha.health',
      contactPhone: '+251 115 514 141',
      address: 'Stadium Area, Ras Desta Damtew St',
      city: 'Addis Ababa',
      country: 'Ethiopia',
      status: TenantStatus.ACTIVE,
      settings: {
        currency: 'ETB',
        timezone: 'Africa/Addis_Ababa',
        pidFormat: 'PID-{YYYY}-{00000}',
        allowCrossBranchEhr: true,
      },
    },
  });
  console.log(`   ✓ Tenant: ${demoTenant.name} (${demoTenant.code})`);

  // 5. Seed Multiple Physical Branches
  console.log('\n📍 Seeding Physical Branches...');
  const branchMain = await prisma.branch.upsert({
    where: { tenantId_code: { tenantId: demoTenant.id, code: 'BSHN-MAIN' } },
    update: {},
    create: {
      tenantId: demoTenant.id,
      name: 'Main Specialized Hospital (Tikur Anbessa Area)',
      code: 'BSHN-MAIN',
      isMainBranch: true,
      phone: '+251 115 514 141',
      email: 'main@bethezatha.health',
      address: 'Ras Desta Damtew St, Kirkos Subcity',
      city: 'Addis Ababa',
      status: BranchStatus.ACTIVE,
    },
  });

  const branchBole = await prisma.branch.upsert({
    where: { tenantId_code: { tenantId: demoTenant.id, code: 'BSHN-BOL' } },
    update: {},
    create: {
      tenantId: demoTenant.id,
      name: 'Bole Ambulatory & Diagnostic Center',
      code: 'BSHN-BOL',
      isMainBranch: false,
      phone: '+251 116 630 000',
      email: 'bole@bethezatha.health',
      address: 'Cameroon St, Near Edna Mall, Bole Subcity',
      city: 'Addis Ababa',
      status: BranchStatus.ACTIVE,
    },
  });

  const branchSarbet = await prisma.branch.upsert({
    where: { tenantId_code: { tenantId: demoTenant.id, code: 'BSHN-SAR' } },
    update: {},
    create: {
      tenantId: demoTenant.id,
      name: 'Sarbet Community Medical Center',
      code: 'BSHN-SAR',
      isMainBranch: false,
      phone: '+251 113 720 000',
      email: 'sarbet@bethezatha.health',
      address: 'Roosevelt St, Next to AU HQ, Nifas Silk',
      city: 'Addis Ababa',
      status: BranchStatus.ACTIVE,
    },
  });
  console.log(`   ✓ Branch 1 (Main): ${branchMain.name}`);
  console.log(`   ✓ Branch 2: ${branchBole.name}`);
  console.log(`   ✓ Branch 3: ${branchSarbet.name}`);

  // 6. Seed Clinical Departments & Rooms for Main Branch
  console.log('\n🏨 Seeding Departments & Rooms for Main Branch...');
  const deptCardio = await prisma.department.upsert({
    where: { branchId_code: { branchId: branchMain.id, code: 'CARD' } },
    update: {},
    create: {
      tenantId: demoTenant.id,
      branchId: branchMain.id,
      name: 'Cardiology & Intensive Ward',
      code: 'CARD',
      color: '#2563EB',
      icon: 'heart-pulse',
    },
  });

  const deptGeneral = await prisma.department.upsert({
    where: { branchId_code: { branchId: branchMain.id, code: 'GEN' } },
    update: {},
    create: {
      tenantId: demoTenant.id,
      branchId: branchMain.id,
      name: 'General & Internal Medicine',
      code: 'GEN',
      color: '#10B981',
      icon: 'stethoscope',
    },
  });

  const deptLab = await prisma.department.upsert({
    where: { branchId_code: { branchId: branchMain.id, code: 'LAB' } },
    update: {},
    create: {
      tenantId: demoTenant.id,
      branchId: branchMain.id,
      name: 'Diagnostic Pathology & Stat Lab',
      code: 'LAB',
      color: '#9333EA',
      icon: 'microscope',
    },
  });

  // Rooms & Beds
  const roomCardio = await prisma.room.upsert({
    where: { branchId_roomNumber: { branchId: branchMain.id, roomNumber: '301' } },
    update: {},
    create: {
      branchId: branchMain.id,
      departmentId: deptCardio.id,
      name: 'Cardiac Consultation Room 1',
      roomNumber: '301',
      roomType: RoomType.CONSULTATION,
      status: RoomStatus.AVAILABLE,
    },
  });

  const roomWard3A = await prisma.room.upsert({
    where: { branchId_roomNumber: { branchId: branchMain.id, roomNumber: '3A-01' } },
    update: {},
    create: {
      branchId: branchMain.id,
      departmentId: deptCardio.id,
      name: 'Inpatient Ward 3A',
      roomNumber: '3A-01',
      roomType: RoomType.WARD,
      status: RoomStatus.OCCUPIED,
    },
  });

  const bed1 = await prisma.bed.upsert({
    where: { roomId_bedNumber: { roomId: roomWard3A.id, bedNumber: 'Bed 01' } },
    update: {},
    create: {
      roomId: roomWard3A.id,
      bedNumber: 'Bed 01',
      status: BedStatus.OCCUPIED,
    },
  });
  console.log(`   ✓ Departments & Rooms initialized for ${branchMain.name}.`);

  // 7. Seed Staff Accounts for all 6 Primary Roles
  console.log('\n👥 Seeding Staff Users for All 6 Roles...');
  const SEED_STAFF = [
    {
      email: 'admin@mcms.local',
      displayName: 'System Super Administrator',
      password: 'Admin@123456',
      role: 'SUPER_ADMIN',
      tenantId: null, // Cross-tenant global
      branches: [],
      profile: {
        employeeNumber: 'EMP-SYS-001',
        jobTitle: 'Chief System Architect',
        department: 'IT & Infrastructure',
      },
    },
    {
      email: 'clinic.admin@mcms.local',
      displayName: 'Dr. Bethlehem Tadesse (Admin)',
      password: 'ClinicAdmin@123456',
      role: 'CLINIC_ADMIN',
      tenantId: demoTenant.id,
      branches: [
        { branchId: branchMain.id, isPrimary: true },
        { branchId: branchBole.id, isPrimary: false },
        { branchId: branchSarbet.id, isPrimary: false },
      ],
      profile: {
        employeeNumber: 'EMP-ADM-001',
        jobTitle: 'Medical Director & Clinic Admin',
        department: 'Administration',
        phoneNumber: '+251 911 100 200',
      },
    },
    {
      email: 'doctor@mcms.local',
      displayName: 'Dr. Fitsum Alemu',
      password: 'Doctor@123456',
      role: 'DOCTOR',
      tenantId: demoTenant.id,
      branches: [
        { branchId: branchMain.id, isPrimary: true },
        { branchId: branchBole.id, isPrimary: false },
      ],
      profile: {
        employeeNumber: 'EMP-DOC-001',
        jobTitle: 'Senior Consultant Cardiologist',
        department: 'Cardiology',
        phoneNumber: '+251 911 234 567',
        licenseNumber: 'MD-2018-0982',
      },
    },
    {
      email: 'nurse@mcms.local',
      displayName: 'Sister Aster Mulu',
      password: 'Nurse@123456',
      role: 'NURSE',
      tenantId: demoTenant.id,
      branches: [{ branchId: branchMain.id, isPrimary: true }],
      profile: {
        employeeNumber: 'EMP-NUR-001',
        jobTitle: 'Charge Nurse (Ward 3A)',
        department: 'Cardiology & Inpatient Ward',
        phoneNumber: '+251 912 345 678',
        licenseNumber: 'RN-2020-0456',
      },
    },
    {
      email: 'lab@mcms.local',
      displayName: 'Getachew Tadesse',
      password: 'Lab@123456',
      role: 'LAB_TECHNICIAN',
      tenantId: demoTenant.id,
      branches: [{ branchId: branchMain.id, isPrimary: true }],
      profile: {
        employeeNumber: 'EMP-LAB-001',
        jobTitle: 'Senior Medical Laboratory Technologist',
        department: 'Diagnostic Pathology',
        phoneNumber: '+251 913 456 789',
        licenseNumber: 'MLT-2019-1123',
      },
    },
    {
      email: 'receptionist@mcms.local',
      displayName: 'Sarah Receptionist',
      password: 'Reception@123456',
      role: 'RECEPTIONIST',
      tenantId: demoTenant.id,
      branches: [{ branchId: branchMain.id, isPrimary: true }],
      profile: {
        employeeNumber: 'EMP-REC-001',
        jobTitle: 'Head Front Desk Receptionist',
        department: 'Customer Care & Triage',
        phoneNumber: '+251 914 567 890',
      },
    },
  ];

  const createdUsers: Record<string, any> = {};

  for (const staff of SEED_STAFF) {
    const passwordHash = await bcrypt.hash(staff.password, 12);
    const roleId = roleMap[staff.role];
    if (!roleId) throw new Error(`Role not found: ${staff.role}`);

    const user = await prisma.user.upsert({
      where: { email: staff.email },
      update: {
        displayName: staff.displayName,
        tenantId: staff.tenantId,
        passwordHash,
      },
      create: {
        email: staff.email,
        displayName: staff.displayName,
        passwordHash,
        tenantId: staff.tenantId,
        accountStatus: AccountStatus.ACTIVE,
      },
    });

    createdUsers[staff.role] = user;

    // Assign Role
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId } },
      update: {},
      create: { userId: user.id, roleId },
    });

    // Profile
    if (staff.profile) {
      await prisma.staffProfile.upsert({
        where: { userId: user.id },
        update: { ...staff.profile },
        create: { userId: user.id, ...staff.profile },
      });
    }

    // Branch Assignments
    for (const b of staff.branches) {
      await prisma.userBranch.upsert({
        where: { userId_branchId: { userId: user.id, branchId: b.branchId } },
        update: { isPrimary: b.isPrimary },
        create: { userId: user.id, branchId: b.branchId, isPrimary: b.isPrimary },
      });
    }

    console.log(`   ✓ [${staff.role.padEnd(14)}] ${staff.email.padEnd(28)} -> ${staff.displayName}`);
  }

  // 8. Seed Demo Patients (Shared across tenant)
  console.log('\n🧑‍⚕️ Seeding Demo Patients (Tenant-Wide EHR)...');
  const patient1 = await prisma.patient.upsert({
    where: { tenantId_pid: { tenantId: demoTenant.id, pid: 'PID-001024' } },
    update: {},
    create: {
      tenantId: demoTenant.id,
      pid: 'PID-001024',
      firstName: 'Aster',
      lastName: 'Mulu',
      fullName: 'Aster Mulu',
      dateOfBirth: new Date('1998-03-15'),
      gender: Gender.FEMALE,
      phoneNumber: '+251 912 345 678',
      email: 'aster.mulu@email.com',
      address: 'Bole Subcity, Woreda 03',
      city: 'Addis Ababa',
      bloodType: 'O+',
      allergies: 'Penicillin (mild rash)',
      emergencyContactName: 'Mulu Kebede',
      emergencyContactPhone: '+251 911 222 333',
      emergencyContactRel: 'Mother',
    },
  });

  const patient2 = await prisma.patient.upsert({
    where: { tenantId_pid: { tenantId: demoTenant.id, pid: 'PID-001087' } },
    update: {},
    create: {
      tenantId: demoTenant.id,
      pid: 'PID-001087',
      firstName: 'Samuel',
      lastName: 'Girma',
      fullName: 'Samuel Girma',
      dateOfBirth: new Date('1981-07-22'),
      gender: Gender.MALE,
      phoneNumber: '+251 911 222 333',
      email: 'samuel.girma@email.com',
      address: 'Kirkos Subcity',
      city: 'Addis Ababa',
      bloodType: 'A+',
      allergies: 'None',
      emergencyContactName: 'Sara Girma',
      emergencyContactPhone: '+251 912 777 888',
      emergencyContactRel: 'Spouse',
    },
  });
  console.log(`   ✓ Patient 1: ${patient1.fullName} (${patient1.pid})`);
  console.log(`   ✓ Patient 2: ${patient2.fullName} (${patient2.pid})`);

  // 9. Seed Inpatient Admission, Vitals & Medication (Nurse workstation data)
  console.log('\n💉 Seeding Inpatient Admission & Vitals Observations...');
  const admission1 = await prisma.admission.create({
    data: {
      tenantId: demoTenant.id,
      branchId: branchMain.id,
      patientId: patient1.id,
      bedId: bed1.id,
      admittingDoctorId: createdUsers['DOCTOR']?.id,
      admissionDiagnosis: 'Post-op Cardiac Monitoring',
      status: AdmissionStatus.ADMITTED,
    },
  });

  await prisma.vitalReading.create({
    data: {
      tenantId: demoTenant.id,
      patientId: patient1.id,
      admissionId: admission1.id,
      recordedById: createdUsers['NURSE']?.id,
      systolicBp: 118,
      diastolicBp: 76,
      heartRate: 72,
      temperature: 36.8,
      spo2: 98,
      condition: VitalsCondition.NORMAL,
      notes: 'Patient resting comfortably in Ward 3A, Bed 01.',
    },
  });

  await prisma.medicationAdministration.create({
    data: {
      tenantId: demoTenant.id,
      patientId: patient1.id,
      admissionId: admission1.id,
      medicationName: 'Metformin Hydrochloride',
      dose: '500 mg',
      route: 'Oral',
      schedule: 'BID',
      scheduledTime: '08:00 AM',
      status: MedAdminStatus.ADMINISTERED,
      administeredById: createdUsers['NURSE']?.id,
      administeredAt: new Date(),
      instructions: 'Take with or immediately after meal.',
    },
  });

  // 10. Seed Lab Order & Sample (Doctor & Lab Tech workstation data)
  console.log('🔬 Seeding Lab Requisition & Diagnostic Specimen...');
  const labOrder1 = await prisma.labOrder.create({
    data: {
      tenantId: demoTenant.id,
      branchId: branchMain.id,
      patientId: patient1.id,
      orderingDoctorId: createdUsers['DOCTOR']?.id,
      orderNumber: 'LAB-2026-0042',
      priority: LabOrderPriority.URGENT,
      status: LabOrderStatus.SAMPLE_COLLECTED,
      clinicalNotes: 'Check complete blood counts and inflammatory markers.',
      samples: {
        create: {
          sampleId: 'SMP-2026-0018',
          sampleType: 'Blood',
          tubeType: 'Lavender Top (EDTA 3mL)',
          status: LabSampleStatus.COLLECTED,
          collectedById: createdUsers['NURSE']?.id,
          collectedAt: new Date(),
        },
      },
    },
  });

  // 11. Seed Receptionist Walk-in Queue
  console.log('🎫 Seeding Front Desk Walk-in Queue...');
  await prisma.queueEntry.create({
    data: {
      tenantId: demoTenant.id,
      branchId: branchMain.id,
      patientId: patient2.id,
      departmentId: deptGeneral.id,
      assignedDoctorId: createdUsers['DOCTOR']?.id,
      ticketNumber: 'A-01',
      priority: QueuePriority.ROUTINE,
      status: QueueStatus.WAITING,
    },
  });

  console.log('\n============================================================');
  console.log('✅ MULTI-TENANT & MULTI-BRANCH DATABASE SEED COMPLETE!');
  console.log('============================================================\n');
  console.log('ORGANIZATION (TENANT):');
  console.log(`  Name: ${demoTenant.name}`);
  console.log(`  Code: ${demoTenant.code} | Slug: ${demoTenant.slug}\n`);
  console.log('BRANCHES:');
  console.log(`  1. [MAIN] ${branchMain.name} (${branchMain.code})`);
  console.log(`  2. [AMB]  ${branchBole.name} (${branchBole.code})`);
  console.log(`  3. [COMM] ${branchSarbet.name} (${branchSarbet.code})\n`);
  console.log('PRIMARY ROLES & CREDENTIALS:');
  for (const s of SEED_STAFF) {
    console.log(`  ${s.role.padEnd(16)} ${s.email.padEnd(30)} ${s.password}`);
  }
  console.log('============================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
