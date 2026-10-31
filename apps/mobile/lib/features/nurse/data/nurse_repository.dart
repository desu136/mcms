import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'nurse_models.dart';

/// Repository holding Nurse data, state notifiers, and clinical operations.
class NurseRepository {
  // ─── Current Nurse Profile ──────────────────────────────────────────────────
  static const currentNurse = NurseProfile(
    id: 'nurse-001',
    name: 'Aster Mulu',
    role: 'Staff Nurse',
    department: 'Cardiology & General Ward',
    ward: 'Ward 3A - Bed 01-12',
    email: 'aster.mulu@email.com',
    phone: '+251 912 345 678',
    location: 'Tikur Anbessa Hospital, Addis Ababa',
    avatar:
        'https://images.unsplash.com/photo-1594824813575-d143c683b7b2?auto=format&fit=crop&q=80&w=256',
    quote: 'Caring for patients is a work of heart.',
    unreadNotifications: 3,
    unreadMessages: 4,
    status: NurseStatus.online,
    licenseNumber: 'RN-2020-0456',
    qualification: 'Bachelor of Science in Nursing (BSN)',
    yearsOfExperience: '4 Years',
    specialization: 'Inpatient Clinical & Acute Care',
  );

  // ─── KPIs ───────────────────────────────────────────────────────────────────
  static const kpis = NurseKpis(
    activePatients: 10,
    pendingMeds: 5,
    vitalsDue: 4,
    urgentLabs: 2,
    tasksToday: 10,
    admissions: 3,
  );

  // ─── In-Ward Patients ───────────────────────────────────────────────────────
  static final List<NursePatient> initialPatients = [
    const NursePatient(
      id: 'p-1',
      pid: 'PID-001024',
      name: 'Aster Mulu',
      age: 28,
      gender: 'Female',
      avatar:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=160',
      phone: '+251 912 345 678',
      email: 'aster.mulu@gmail.com',
      address: 'Bole Subcity, Addis Ababa',
      room: '3A-01',
      bed: 'Bed 01',
      department: 'Cardiology',
      visitReason: 'Post-op Cardiac Monitoring',
      status: PatientWardStatus.inWard,
      vitalsStatus: VitalsCondition.normal,
      vitals: PatientVitals(bp: '118/76', hr: 72, temp: 36.8, spo2: 98, respRate: 16),
      doctor: 'Dr. Fitsum Alemu',
      admissionDate: 'Oct 17, 2026',
      nextFollowUp: 'Oct 29, 2026 09:00 AM',
    ),
    const NursePatient(
      id: 'p-2',
      pid: 'PID-001087',
      name: 'Samuel Girma',
      age: 45,
      gender: 'Male',
      avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=160',
      phone: '+251 911 222 333',
      email: 'samuel.girma@email.com',
      address: 'Kirkos Subcity, Addis Ababa',
      room: '2B-03',
      bed: 'Bed 04',
      department: 'Internal Medicine',
      visitReason: 'Fever & Respiratory Distress',
      status: PatientWardStatus.waiting,
      vitalsStatus: VitalsCondition.highBp,
      vitals: PatientVitals(bp: '142/88', hr: 96, temp: 37.9, spo2: 96, respRate: 20),
      doctor: 'Dr. Hana Mengesha',
      admissionDate: 'Oct 18, 2026',
      nextFollowUp: 'Oct 29, 2026 10:00 AM',
    ),
    const NursePatient(
      id: 'p-3',
      pid: 'PID-001062',
      name: 'Lidya Kebede',
      age: 32,
      gender: 'Female',
      avatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=160',
      phone: '+251 913 111 444',
      email: 'lidya.kebede@email.com',
      address: 'Yeka Subcity, Addis Ababa',
      room: '4A-02',
      bed: 'Bed 02',
      department: 'Wound Care',
      visitReason: 'Surgical Wound Redressing',
      status: PatientWardStatus.inWard,
      vitalsStatus: VitalsCondition.normal,
      vitals: PatientVitals(bp: '110/70', hr: 78, temp: 36.6, spo2: 99, respRate: 16),
      doctor: 'Dr. Abebe Kebede',
      admissionDate: 'Oct 16, 2026',
      nextFollowUp: 'Oct 29, 2026 08:30 AM',
    ),
    const NursePatient(
      id: 'p-4',
      pid: 'PID-001076',
      name: 'Getachew Tadesse',
      age: 56,
      gender: 'Male',
      avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=160',
      phone: '+251 902 778 991',
      email: 'getachew.t@email.com',
      address: 'Arada Subcity, Addis Ababa',
      room: '1B-05',
      bed: 'Bed 05',
      department: 'Diabetes Care',
      visitReason: 'Severe Hyperglycemia',
      status: PatientWardStatus.inCare,
      vitalsStatus: VitalsCondition.critical,
      vitals: PatientVitals(bp: '168/102', hr: 102, temp: 38.2, spo2: 94, respRate: 22),
      doctor: 'Dr. Fitsum Alemu',
      admissionDate: 'Oct 15, 2026',
      nextFollowUp: 'Oct 29, 2026 09:15 AM',
    ),
    const NursePatient(
      id: 'p-5',
      pid: 'PID-001098',
      name: 'Betlehem Abebe',
      age: 22,
      gender: 'Female',
      avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=160',
      phone: '+251 913 667 221',
      email: 'betlehem.a@email.com',
      address: 'Nifas Silk, Addis Ababa',
      room: '3B-02',
      bed: 'Bed 03',
      department: 'Pediatrics / Youth',
      visitReason: 'Asthma Exacerbation',
      status: PatientWardStatus.inWard,
      vitalsStatus: VitalsCondition.lowBp,
      vitals: PatientVitals(bp: '96/60', hr: 88, temp: 37.0, spo2: 93, respRate: 24),
      doctor: 'Dr. Lealem Demissie',
      admissionDate: 'Oct 19, 2026',
    ),
    const NursePatient(
      id: 'p-6',
      pid: 'PID-001099',
      name: 'Daniel Wondimu',
      age: 48,
      gender: 'Male',
      avatar:
          'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=160',
      phone: '+251 911 556 778',
      email: 'daniel.w@email.com',
      address: 'Kolfe Keranio, Addis Ababa',
      room: '2A-04',
      bed: 'Bed 01',
      department: 'Orthopedics',
      visitReason: 'Post-op Tibia Fixation',
      status: PatientWardStatus.waiting,
      vitalsStatus: VitalsCondition.normal,
      vitals: PatientVitals(bp: '124/82', hr: 76, temp: 36.9, spo2: 98, respRate: 18),
      doctor: 'Dr. Fitsum Alemu',
      admissionDate: 'Oct 14, 2026',
    ),
    const NursePatient(
      id: 'p-7',
      pid: 'PID-001045',
      name: 'Tigist Alemu',
      age: 37,
      gender: 'Female',
      avatar:
          'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=160',
      phone: '+251 912 223 445',
      email: 'tigist.a@email.com',
      address: 'Akaki Kality, Addis Ababa',
      room: '4B-01',
      bed: 'Bed 02',
      department: 'Gynaecology',
      visitReason: 'Gestational Hypertension',
      status: PatientWardStatus.inCare,
      vitalsStatus: VitalsCondition.elevated,
      vitals: PatientVitals(bp: '138/90', hr: 88, temp: 37.2, spo2: 95, respRate: 18),
      doctor: 'Dr. Hana Mengesha',
      admissionDate: 'Oct 17, 2026',
    ),
    const NursePatient(
      id: 'p-8',
      pid: 'PID-001087',
      name: 'Abebe Assefa',
      age: 40,
      gender: 'Male',
      avatar:
          'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=160',
      phone: '+251 910 887 776',
      email: 'abebe.a@email.com',
      address: 'Gullele Subcity, Addis Ababa',
      room: '1A-03',
      bed: 'Bed 01',
      department: 'General Medicine',
      visitReason: 'Pneumonia Recovery',
      status: PatientWardStatus.discharged,
      vitalsStatus: VitalsCondition.normal,
      vitals: PatientVitals(bp: '120/78', hr: 70, temp: 36.7, spo2: 99, respRate: 16),
      doctor: 'Dr. Fitsum Alemu',
      admissionDate: 'Oct 12, 2026',
    ),
  ];

  // ─── Initial Vitals Records ─────────────────────────────────────────────────
  static final List<VitalsRecord> initialVitals = [
    const VitalsRecord(
      id: 'vr-1',
      patientId: 'p-1',
      patientName: 'Aster Mulu',
      patientPid: 'PID-001024',
      dateTime: 'Today, 08:00 AM',
      bp: '118/76',
      hr: 72,
      temp: 36.8,
      spo2: 98,
      respRate: 16,
      recordedBy: 'Aster Mulu, RN',
      notes: 'Patient resting comfortably. Normal recovery.',
    ),
    const VitalsRecord(
      id: 'vr-2',
      patientId: 'p-2',
      patientName: 'Samuel Girma',
      patientPid: 'PID-001087',
      dateTime: 'Today, 07:30 AM',
      bp: '142/88',
      hr: 96,
      temp: 37.9,
      spo2: 96,
      respRate: 20,
      recordedBy: 'Aster Mulu, RN',
      notes: 'Mild pyrexia. Attending notified for antipyretic order.',
    ),
    const VitalsRecord(
      id: 'vr-3',
      patientId: 'p-4',
      patientName: 'Getachew Tadesse',
      patientPid: 'PID-001076',
      dateTime: 'Today, 06:45 AM',
      bp: '168/102',
      hr: 102,
      temp: 38.2,
      spo2: 94,
      respRate: 22,
      recordedBy: 'Aster Mulu, RN',
      notes: 'Critical BP reading. IV insulin infusion rate adjusted.',
    ),
    const VitalsRecord(
      id: 'vr-4',
      patientId: 'p-3',
      patientName: 'Lidya Kebede',
      patientPid: 'PID-001062',
      dateTime: 'Yesterday, 06:00 PM',
      bp: '110/70',
      hr: 78,
      temp: 36.6,
      spo2: 99,
      respRate: 16,
      recordedBy: 'Aster Mulu, RN',
      notes: 'Stable post redressing.',
    ),
    const VitalsRecord(
      id: 'vr-5',
      patientId: 'p-5',
      patientName: 'Betlehem Abebe',
      patientPid: 'PID-001098',
      dateTime: 'Yesterday, 04:30 PM',
      bp: '96/60',
      hr: 88,
      temp: 37.0,
      spo2: 93,
      respRate: 24,
      recordedBy: 'Aster Mulu, RN',
      notes: 'On 2L nasal cannula oxygen. Responding well.',
    ),
  ];

  // ─── Initial Medication Administration Records (eMAR) ───────────────────────
  static final List<NurseMedication> initialMeds = [
    const NurseMedication(
      id: 'med-1',
      patientId: 'p-1',
      patientName: 'Aster Mulu',
      patientPid: 'PID-001024',
      patientAvatar:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=160',
      age: 28,
      gender: 'Female',
      room: 'Room 3A-01',
      department: 'Cardiology',
      medicationName: 'Metformin Hydrochloride',
      condition: 'Type 2 Diabetes',
      dose: '500 mg',
      route: 'Oral',
      schedule: 'BID',
      nextDue: '08:00 AM',
      status: MedStatus.administered,
      prescribingDoctor: 'Dr. Fitsum Alemu',
      instructions: 'Take with or immediately after meal.',
      lastAdministered: 'Today, 08:05 AM',
      sideEffects: 'Mild nausea',
    ),
    const NurseMedication(
      id: 'med-2',
      patientId: 'p-2',
      patientName: 'Samuel Girma',
      patientPid: 'PID-001087',
      patientAvatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=160',
      age: 45,
      gender: 'Male',
      room: 'Room 2B-03',
      department: 'Internal Medicine',
      medicationName: 'Amoxicillin + Clavulanic Acid',
      condition: 'Bacterial Chest Infection',
      dose: '1.2 g',
      route: 'Intravenous',
      schedule: 'TID',
      nextDue: '12:00 PM',
      status: MedStatus.dueSoon,
      prescribingDoctor: 'Dr. Hana Mengesha',
      instructions: 'Infuse over 30 mins with normal saline flush.',
    ),
    const NurseMedication(
      id: 'med-3',
      patientId: 'p-3',
      patientName: 'Lidya Kebede',
      patientPid: 'PID-001062',
      patientAvatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=160',
      age: 32,
      gender: 'Female',
      room: 'Room 4A-02',
      department: 'General Ward',
      medicationName: 'Paracetamol IV',
      condition: 'Post-op Analgesia',
      dose: '1,000 mg',
      route: 'Intravenous',
      schedule: 'QID',
      nextDue: '01:00 PM',
      status: MedStatus.pending,
      prescribingDoctor: 'Dr. Abebe Kebede',
      instructions: 'Administer every 6 hours as needed for pain scale > 4.',
    ),
    const NurseMedication(
      id: 'med-4',
      patientId: 'p-4',
      patientName: 'Getachew Tadesse',
      patientPid: 'PID-001076',
      patientAvatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=160',
      age: 56,
      gender: 'Male',
      room: 'Room 1B-05',
      department: 'Endocrinology',
      medicationName: 'Insulin (NovoRapid)',
      condition: 'Diabetic Ketoacidosis Prevention',
      dose: '10 units',
      route: 'Subcutaneous',
      schedule: 'Before Meals',
      nextDue: '12:30 PM',
      status: MedStatus.dueSoon,
      prescribingDoctor: 'Dr. Fitsum Alemu',
      instructions: 'Check blood glucose prior to injection. Inject in abdomen.',
    ),
    const NurseMedication(
      id: 'med-5',
      patientId: 'p-5',
      patientName: 'Betlehem Abebe',
      patientPid: 'PID-001098',
      patientAvatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=160',
      age: 22,
      gender: 'Female',
      room: 'Room 3B-02',
      department: 'Pediatrics / Pulmonology',
      medicationName: 'Salbutamol Nebulizer Solution',
      condition: 'Acute Bronchospasm',
      dose: '2.5 mg',
      route: 'Inhalation',
      schedule: 'PRN',
      nextDue: 'As needed',
      status: MedStatus.pending,
      prescribingDoctor: 'Dr. Lealem Demissie',
      instructions: 'Deliver via jet nebulizer with 6L/min oxygen.',
    ),
    const NurseMedication(
      id: 'med-6',
      patientId: 'p-7',
      patientName: 'Tigist Alemu',
      patientPid: 'PID-001045',
      patientAvatar:
          'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=160',
      age: 37,
      gender: 'Female',
      room: 'Room 4B-01',
      department: 'Gynaecology',
      medicationName: 'Labetalol HCl',
      condition: 'Gestational Hypertension',
      dose: '100 mg',
      route: 'Oral',
      schedule: 'BID',
      nextDue: '08:00 AM',
      status: MedStatus.administered,
      prescribingDoctor: 'Dr. Hana Mengesha',
      instructions: 'Monitor maternal heart rate; hold if HR < 60 bpm.',
      lastAdministered: 'Today, 08:15 AM',
    ),
  ];

  // ─── Initial Lab Samples ────────────────────────────────────────────────────
  static final List<NurseLabSample> initialLabSamples = [
    const NurseLabSample(
      id: 'smp-1',
      sampleId: 'SMP-2026-0018',
      patientId: 'p-1',
      patientName: 'Aster Mulu',
      patientPid: 'PID-001024',
      patientAvatar:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=160',
      room: 'Room 3A-01',
      department: 'Cardiology',
      testName: 'Complete Blood Count (CBC) + ESR',
      sampleType: 'Blood',
      priority: SamplePriority.urgent,
      collectionTime: '08:00 AM',
      status: SampleStatus.pending,
      doctor: 'Dr. Fitsum Alemu',
      instructions: 'Lavender top (EDTA) 3mL. Invert gently 8-10 times.',
    ),
    const NurseLabSample(
      id: 'smp-2',
      sampleId: 'SMP-2026-0019',
      patientId: 'p-2',
      patientName: 'Samuel Girma',
      patientPid: 'PID-001087',
      patientAvatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=160',
      room: 'Room 2B-03',
      department: 'Internal Medicine',
      testName: 'Blood Culture & Sensitivity',
      sampleType: 'Blood',
      priority: SamplePriority.high,
      collectionTime: '09:00 AM',
      status: SampleStatus.collected,
      doctor: 'Dr. Hana Mengesha',
      instructions: 'Aerobic & anaerobic blood culture bottles with aseptic technique.',
      collectedAt: 'Today, 09:12 AM',
    ),
    const NurseLabSample(
      id: 'smp-3',
      sampleId: 'SMP-2026-0020',
      patientId: 'p-3',
      patientName: 'Lidya Kebede',
      patientPid: 'PID-001062',
      patientAvatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=160',
      room: 'Room 4A-02',
      department: 'Wound Care',
      testName: 'Wound Swab for Microscopy',
      sampleType: 'Swab',
      priority: SamplePriority.normal,
      collectionTime: '10:00 AM',
      status: SampleStatus.inLab,
      doctor: 'Dr. Abebe Kebede',
      instructions: 'Sterile transport swab from deep margin.',
      collectedAt: 'Today, 10:05 AM',
      deliveredAt: 'Today, 10:25 AM',
    ),
    const NurseLabSample(
      id: 'smp-4',
      sampleId: 'SMP-2026-0021',
      patientId: 'p-4',
      patientName: 'Getachew Tadesse',
      patientPid: 'PID-001076',
      patientAvatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=160',
      room: 'Room 1B-05',
      department: 'Endocrinology',
      testName: 'Arterial Blood Gas (ABG) & Serum Electrolytes',
      sampleType: 'Blood',
      priority: SamplePriority.urgent,
      collectionTime: '11:00 AM',
      status: SampleStatus.pending,
      doctor: 'Dr. Fitsum Alemu',
      instructions: 'Heparinized syringe on ice. Send immediately to stat lab.',
    ),
  ];

  // ─── Initial Nursing Tasks ──────────────────────────────────────────────────
  static final List<NursingTask> initialTasks = [
    const NursingTask(
      id: 't-1',
      patientId: 'p-1',
      patientName: 'Aster Mulu',
      patientPid: 'PID-001024',
      room: '3A-01',
      title: 'Routine Vitals & ECG Check',
      details: 'Check BP, HR, SpO2, and capture 12-lead baseline ECG before ward round.',
      type: 'Vital Signs',
      priority: TaskPriority.high,
      dueTime: '08:30 AM',
      dueDate: 'Today',
      status: TaskStatus.completed,
      completedAt: 'Today, 08:25 AM',
    ),
    const NursingTask(
      id: 't-2',
      patientId: 'p-2',
      patientName: 'Samuel Girma',
      patientPid: 'PID-001087',
      room: '2B-03',
      title: 'Administer IV Antibiotic Drip',
      details: 'Amoxicillin-Clavulanic acid 1.2g in 100mL NS.',
      type: 'Medication',
      priority: TaskPriority.high,
      dueTime: '12:00 PM',
      dueDate: 'Today',
      status: TaskStatus.inProgress,
    ),
    const NursingTask(
      id: 't-3',
      patientId: 'p-3',
      patientName: 'Lidya Kebede',
      patientPid: 'PID-001062',
      room: '4A-02',
      title: 'Sterile Wound Dressing Change',
      details: 'Clean right leg incision with chlorhexidine; apply silver foam dressing.',
      type: 'Wound Care',
      priority: TaskPriority.medium,
      dueTime: '11:00 AM',
      dueDate: 'Today',
      status: TaskStatus.pending,
    ),
    const NursingTask(
      id: 't-4',
      patientId: 'p-4',
      patientName: 'Getachew Tadesse',
      patientPid: 'PID-001076',
      room: '1B-05',
      title: 'Collect STAT Arterial Blood Gas',
      details: 'STAT sample request by Dr. Fitsum for blood gas and glucose profiling.',
      type: 'Lab Sample',
      priority: TaskPriority.high,
      dueTime: '11:30 AM',
      dueDate: 'Today',
      status: TaskStatus.pending,
    ),
    const NursingTask(
      id: 't-5',
      patientId: 'p-5',
      patientName: 'Betlehem Abebe',
      patientPid: 'PID-001098',
      room: '3B-02',
      title: 'Continuous SpO2 & Oxygen Titration',
      details: 'Maintain SpO2 between 94-98% via nasal cannula.',
      type: 'Vital Signs',
      priority: TaskPriority.medium,
      dueTime: '01:00 PM',
      dueDate: 'Today',
      status: TaskStatus.scheduled,
    ),
    const NursingTask(
      id: 't-6',
      patientId: 'p-7',
      patientName: 'Tigist Alemu',
      patientPid: 'PID-001045',
      room: '4B-01',
      title: 'Discharge Education & Medication Counseling',
      details: 'Review BP self-monitoring log, low-sodium dietary precautions.',
      type: 'Education',
      priority: TaskPriority.low,
      dueTime: '02:30 PM',
      dueDate: 'Today',
      status: TaskStatus.scheduled,
    ),
  ];

  // ─── Initial Appointments / Ward Schedule ───────────────────────────────────
  static final List<NurseAppointment> initialAppointments = [
    const NurseAppointment(
      id: 'apt-1',
      patientId: 'p-1',
      patientName: 'Aster Mulu',
      patientPid: 'PID-001024',
      avatar:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=160',
      age: 28,
      gender: 'Female',
      department: 'Cardiology',
      reason: 'Attending Physician Ward Rounds',
      appointmentTime: '09:30 AM',
      date: 'Today',
      status: 'On Time',
      doctor: 'Dr. Fitsum Alemu',
    ),
    const NurseAppointment(
      id: 'apt-2',
      patientId: 'p-4',
      patientName: 'Getachew Tadesse',
      patientPid: 'PID-001076',
      avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=160',
      age: 56,
      gender: 'Male',
      department: 'Endocrinology',
      reason: 'Nephrology Consult & Bedside Ultrasound',
      appointmentTime: '11:15 AM',
      date: 'Today',
      status: 'Upcoming',
      doctor: 'Dr. Fitsum Alemu',
    ),
    const NurseAppointment(
      id: 'apt-3',
      patientId: 'p-3',
      patientName: 'Lidya Kebede',
      patientPid: 'PID-001062',
      avatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=160',
      age: 32,
      gender: 'Female',
      department: 'Surgery',
      reason: 'Surgical Team Incision Review',
      appointmentTime: '02:00 PM',
      date: 'Today',
      status: 'Scheduled',
      doctor: 'Dr. Abebe Kebede',
    ),
  ];

  // ─── Conversations & Chat ───────────────────────────────────────────────────
  static final List<NurseConversation> initialConversations = [
    const NurseConversation(
      id: 'conv-1',
      name: 'Dr. Fitsum Alemu',
      role: 'Attending Cardiologist',
      category: 'staff',
      avatar:
          'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=160',
      isOnline: true,
      lastMessage: 'Please prepare Aster Mulu in 3A-01 for echo at 10 AM.',
      time: '08:42 AM',
      unreadCount: 1,
    ),
    const NurseConversation(
      id: 'conv-2',
      name: 'Central Diagnostic Lab',
      role: 'Pathology & Stat Lab',
      category: 'staff',
      avatar: '',
      isOnline: true,
      lastMessage: 'STAT ABG result for Getachew (PID-001076) is ready in system.',
      time: '08:15 AM',
      unreadCount: 2,
    ),
    const NurseConversation(
      id: 'conv-3',
      name: 'Dr. Hana Mengesha',
      role: 'Consultant Internist',
      category: 'staff',
      avatar:
          'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=160',
      isOnline: true,
      lastMessage: 'Can you please check Samuel’s temperature once more?',
      time: '07:55 AM',
      unreadCount: 1,
    ),
    const NurseConversation(
      id: 'conv-4',
      name: 'Inpatient Pharmacy',
      role: 'Dispensary Station 3',
      category: 'staff',
      avatar: '',
      isOnline: false,
      lastMessage: 'Insulin pens delivered to Ward 3B refrigerator.',
      time: 'Yesterday',
      unreadCount: 0,
    ),
  ];

  static final Map<String, List<NurseChatMessage>> initialChatMessages = {
    'conv-1': [
      const NurseChatMessage(
        id: 'msg-1',
        conversationId: 'conv-1',
        sender: 'other',
        senderName: 'Dr. Fitsum Alemu',
        text: 'Morning Sister Aster, how did Aster Mulu do through the night?',
        time: '08:10 AM',
      ),
      const NurseChatMessage(
        id: 'msg-2',
        conversationId: 'conv-1',
        sender: 'nurse',
        senderName: 'Aster Mulu, RN',
        text: 'Morning Doctor! Slept well, BP 118/76, HR 72 regular. No complaint of chest pain.',
        time: '08:14 AM',
      ),
      const NurseChatMessage(
        id: 'msg-3',
        conversationId: 'conv-1',
        sender: 'other',
        senderName: 'Dr. Fitsum Alemu',
        text: 'Please prepare Aster Mulu in 3A-01 for echo at 10 AM.',
        time: '08:42 AM',
      ),
    ],
  };

  // ─── Activity Log ───────────────────────────────────────────────────────────
  static final List<NurseActivityLog> initialActivities = [
    const NurseActivityLog(
      id: 'act-1',
      title: 'Medication administered',
      time: 'Today, 08:05 AM',
      description: 'Metformin 500mg given to Aster Mulu (PID-001024)',
      type: 'medication',
    ),
    const NurseActivityLog(
      id: 'act-2',
      title: 'Vital signs logged',
      time: 'Today, 08:00 AM',
      description: 'Aster Mulu: BP 118/76, HR 72, SpO2 98%',
      type: 'task',
    ),
    const NurseActivityLog(
      id: 'act-3',
      title: 'Lab sample collected',
      time: 'Today, 07:45 AM',
      description: 'Blood culture drawn for Samuel Girma (PID-001087)',
      type: 'task',
    ),
    const NurseActivityLog(
      id: 'act-4',
      title: 'Shift sign-in',
      time: 'Today, 07:00 AM',
      description: 'Morning Shift logged in at Ward 3A Station',
      type: 'login',
    ),
  ];
}

// ─── Riverpod Providers ───────────────────────────────────────────────────────

final nurseProfileProvider = Provider<NurseProfile>((_) => NurseRepository.currentNurse);

final nurseKpisProvider = Provider<NurseKpis>((_) => NurseRepository.kpis);

final nursePatientsProvider = StateProvider<List<NursePatient>>((ref) {
  return NurseRepository.initialPatients;
});

final nurseVitalsHistoryProvider = StateProvider<List<VitalsRecord>>((ref) {
  return NurseRepository.initialVitals;
});

final nurseMedicationsProvider = StateProvider<List<NurseMedication>>((ref) {
  return NurseRepository.initialMeds;
});

final nurseLabSamplesProvider = StateProvider<List<NurseLabSample>>((ref) {
  return NurseRepository.initialLabSamples;
});

final nurseTasksProvider = StateProvider<List<NursingTask>>((ref) {
  return NurseRepository.initialTasks;
});

final nurseAppointmentsProvider = StateProvider<List<NurseAppointment>>((ref) {
  return NurseRepository.initialAppointments;
});

final nurseConversationsProvider = StateProvider<List<NurseConversation>>((ref) {
  return NurseRepository.initialConversations;
});

final nurseChatMessagesProvider =
    StateProvider<Map<String, List<NurseChatMessage>>>((ref) {
  return NurseRepository.initialChatMessages;
});

final nurseActivitiesProvider = StateProvider<List<NurseActivityLog>>((ref) {
  return NurseRepository.initialActivities;
});
