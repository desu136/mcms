import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'receptionist_models.dart';

/// Repository providing receptionist mock data. In production these
/// methods would call the MCMS REST API via MobileApiClient.
class ReceptionistRepository {
  // ─── Profile ──────────────────────────────────────────────────────────────

  static const currentReceptionist = ReceptionistProfile(
    name: 'Selam Bekele',
    role: 'Senior Receptionist',
    department: 'Front Desk',
    email: 'selam.bekele@mcms.health',
    phone: '+251 911 987 654',
    hospital: 'Tikur Anbessa Specialized Hospital',
    unreadNotifications: 4,
  );

  // ─── KPIs ─────────────────────────────────────────────────────────────────

  static ReceptionistKpis get kpis => const ReceptionistKpis(
        todayPatients: 47,
        pendingQueue: 12,
        todayAppointments: 31,
        pendingBills: 8,
        collectedToday: 24500,
        newRegistrations: 6,
      );

  // ─── Patients ─────────────────────────────────────────────────────────────

  static final List<RegistrationPatient> patients = [
    const RegistrationPatient(
      id: 'rp-1',
      pid: 'PID-001024',
      name: 'Aster Mulu',
      age: 28,
      gender: 'Female',
      phone: '+251 912 345 678',
      email: 'aster.mulu@email.com',
      address: 'Bole Sub-City, Addis Ababa',
      bloodType: 'O+',
      emergencyContact: 'Mulu Kebede',
      emergencyPhone: '+251 911 222 333',
      registrationDate: 'Mar 12, 2024',
      status: 'Active',
      conditions: ['Hypertension', 'Type 2 Diabetes'],
    ),
    const RegistrationPatient(
      id: 'rp-2',
      pid: 'PID-001087',
      name: 'Abebe Assefa',
      age: 29,
      gender: 'Male',
      phone: '+251 930 555 444',
      email: 'abebe.assefa@email.com',
      address: 'Lideta Sub-City, Addis Ababa',
      bloodType: 'A+',
      emergencyContact: 'Sara Assefa',
      emergencyPhone: '+251 912 777 888',
      registrationDate: 'Jun 05, 2024',
      status: 'Active',
      conditions: [],
    ),
    const RegistrationPatient(
      id: 'rp-3',
      pid: 'PID-001045',
      name: 'Tigist Alemu',
      age: 35,
      gender: 'Female',
      phone: '+251 911 777 888',
      email: 'tigist.alemu@email.com',
      address: 'Gullele Sub-City, Addis Ababa',
      bloodType: 'B+',
      emergencyContact: 'Kebede Alemu',
      emergencyPhone: '+251 930 123 456',
      registrationDate: 'Jan 20, 2024',
      status: 'Active',
      conditions: ['Sinus Tachycardia'],
    ),
    const RegistrationPatient(
      id: 'rp-4',
      pid: 'PID-001076',
      name: 'Getachew Tadesse',
      age: 50,
      gender: 'Male',
      phone: '+251 912 000 111',
      email: 'getachew.tadesse@email.com',
      address: 'Kolfe-Keranio Sub-City, Addis Ababa',
      bloodType: 'AB-',
      emergencyContact: 'Hiwot Tadesse',
      emergencyPhone: '+251 911 999 000',
      registrationDate: 'Feb 14, 2023',
      status: 'Active',
      conditions: ['Chronic Kidney Disease'],
    ),
    const RegistrationPatient(
      id: 'rp-5',
      pid: 'PID-001102',
      name: 'Hana Girma',
      age: 22,
      gender: 'Female',
      phone: '+251 914 321 654',
      email: 'hana.girma@email.com',
      address: 'Yeka Sub-City, Addis Ababa',
      bloodType: 'O-',
      emergencyContact: 'Girma Kebede',
      emergencyPhone: '+251 916 111 222',
      registrationDate: 'Oct 01, 2026',
      status: 'Active',
      conditions: [],
    ),
    const RegistrationPatient(
      id: 'rp-6',
      pid: 'PID-001110',
      name: 'Dawit Mesfin',
      age: 45,
      gender: 'Male',
      phone: '+251 920 888 999',
      email: 'dawit.mesfin@email.com',
      address: 'Akaki-Kaliti Sub-City, Addis Ababa',
      bloodType: 'A-',
      emergencyContact: 'Azeb Mesfin',
      emergencyPhone: '+251 921 333 444',
      registrationDate: 'Sep 15, 2026',
      status: 'Inactive',
      conditions: ['Asthma'],
    ),
  ];

  // ─── Appointments ─────────────────────────────────────────────────────────

  static final List<ReceptionistAppointment> appointments = [
    const ReceptionistAppointment(
      id: 'apt-1',
      patientName: 'Aster Mulu',
      patientId: 'rp-1',
      pid: 'PID-001024',
      doctorName: 'Dr. Fitsum Alemu',
      department: 'Cardiology',
      date: 'Oct 27, 2026',
      time: '09:00 AM',
      reason: 'Follow-up Visit',
      status: ReceptionistAppointmentStatus.confirmed,
    ),
    const ReceptionistAppointment(
      id: 'apt-2',
      patientName: 'Abebe Assefa',
      patientId: 'rp-2',
      pid: 'PID-001087',
      doctorName: 'Dr. Hiwot Tesfaye',
      department: 'General Medicine',
      date: 'Oct 27, 2026',
      time: '10:30 AM',
      reason: 'General Consultation',
      status: ReceptionistAppointmentStatus.inProgress,
    ),
    const ReceptionistAppointment(
      id: 'apt-3',
      patientName: 'Tigist Alemu',
      patientId: 'rp-3',
      pid: 'PID-001045',
      doctorName: 'Dr. Fitsum Alemu',
      department: 'Cardiology',
      date: 'Oct 27, 2026',
      time: '02:00 PM',
      reason: 'Sinus Tachycardia Review',
      status: ReceptionistAppointmentStatus.confirmed,
    ),
    const ReceptionistAppointment(
      id: 'apt-4',
      patientName: 'Getachew Tadesse',
      patientId: 'rp-4',
      pid: 'PID-001076',
      doctorName: 'Dr. Solomon Bekele',
      department: 'Nephrology',
      date: 'Oct 27, 2026',
      time: '11:00 AM',
      reason: 'Kidney Function Test Review',
      status: ReceptionistAppointmentStatus.completed,
    ),
    const ReceptionistAppointment(
      id: 'apt-5',
      patientName: 'Hana Girma',
      patientId: 'rp-5',
      pid: 'PID-001102',
      doctorName: 'Dr. Rahel Haile',
      department: 'OB-GYN',
      date: 'Oct 27, 2026',
      time: '03:30 PM',
      reason: 'Routine Check-up',
      status: ReceptionistAppointmentStatus.pending,
    ),
    const ReceptionistAppointment(
      id: 'apt-6',
      patientName: 'Dawit Mesfin',
      patientId: 'rp-6',
      pid: 'PID-001110',
      doctorName: 'Dr. Tesfaye Worku',
      department: 'Pulmonology',
      date: 'Oct 28, 2026',
      time: '09:30 AM',
      reason: 'Asthma Management',
      status: ReceptionistAppointmentStatus.confirmed,
    ),
    const ReceptionistAppointment(
      id: 'apt-7',
      patientName: 'Yonas Haile',
      patientId: 'rp-7',
      pid: 'PID-001098',
      doctorName: 'Dr. Hiwot Tesfaye',
      department: 'General Medicine',
      date: 'Oct 27, 2026',
      time: '01:00 PM',
      reason: 'Fever and Fatigue',
      status: ReceptionistAppointmentStatus.cancelled,
    ),
  ];

  // ─── Queue ────────────────────────────────────────────────────────────────

  static final List<QueueEntry> queue = [
    const QueueEntry(
      id: 'q-1',
      queueNumber: 1,
      patientName: 'Abebe Assefa',
      patientId: 'rp-2',
      pid: 'PID-001087',
      reason: 'General Consultation',
      department: 'General Medicine',
      doctorName: 'Dr. Hiwot Tesfaye',
      checkinTime: '09:55 AM',
      estimatedWait: '0 min',
      status: QueueStatus.inConsultation,
      priority: 'Normal',
    ),
    const QueueEntry(
      id: 'q-2',
      queueNumber: 2,
      patientName: 'Aster Mulu',
      patientId: 'rp-1',
      pid: 'PID-001024',
      reason: 'Follow-up Visit',
      department: 'Cardiology',
      doctorName: 'Dr. Fitsum Alemu',
      checkinTime: '08:50 AM',
      estimatedWait: '5 min',
      status: QueueStatus.called,
      priority: 'Normal',
    ),
    const QueueEntry(
      id: 'q-3',
      queueNumber: 3,
      patientName: 'Hana Girma',
      patientId: 'rp-5',
      pid: 'PID-001102',
      reason: 'Routine Check-up',
      department: 'OB-GYN',
      doctorName: 'Dr. Rahel Haile',
      checkinTime: '09:10 AM',
      estimatedWait: '20 min',
      status: QueueStatus.waiting,
      priority: 'Normal',
    ),
    const QueueEntry(
      id: 'q-4',
      queueNumber: 4,
      patientName: 'Kebede Lemma',
      patientId: 'rp-8',
      pid: 'PID-001055',
      reason: 'Chest Pain',
      department: 'Emergency',
      doctorName: 'Dr. Solomon Bekele',
      checkinTime: '09:25 AM',
      estimatedWait: '0 min',
      status: QueueStatus.called,
      priority: 'Emergency',
    ),
    const QueueEntry(
      id: 'q-5',
      queueNumber: 5,
      patientName: 'Meseret Tadesse',
      patientId: 'rp-9',
      pid: 'PID-001063',
      reason: 'Blood Pressure Check',
      department: 'Cardiology',
      doctorName: 'Dr. Fitsum Alemu',
      checkinTime: '09:30 AM',
      estimatedWait: '35 min',
      status: QueueStatus.waiting,
      priority: 'Normal',
    ),
    const QueueEntry(
      id: 'q-6',
      queueNumber: 6,
      patientName: 'Biruk Tekeste',
      patientId: 'rp-10',
      pid: 'PID-001071',
      reason: 'Diabetes Follow-up',
      department: 'Endocrinology',
      doctorName: 'Dr. Desta Ayele',
      checkinTime: '09:40 AM',
      estimatedWait: '45 min',
      status: QueueStatus.waiting,
      priority: 'Normal',
    ),
    const QueueEntry(
      id: 'q-7',
      queueNumber: 7,
      patientName: 'Tigist Alemu',
      patientId: 'rp-3',
      pid: 'PID-001045',
      reason: 'Sinus Tachycardia Review',
      department: 'Cardiology',
      doctorName: 'Dr. Fitsum Alemu',
      checkinTime: '10:00 AM',
      estimatedWait: '55 min',
      status: QueueStatus.waiting,
      priority: 'Urgent',
    ),
  ];

  // ─── Billing ──────────────────────────────────────────────────────────────

  static final List<BillingItem> bills = [
    const BillingItem(
      id: 'bill-1',
      invoiceId: 'INV-2026-0847',
      patientName: 'Aster Mulu',
      patientId: 'rp-1',
      pid: 'PID-001024',
      description: 'Cardiology Consultation + ECG',
      amount: 1800,
      amountPaid: 1800,
      status: BillingStatus.paid,
      date: 'Oct 27, 2026',
      dueDate: 'Oct 27, 2026',
      paymentMethod: 'Card',
    ),
    const BillingItem(
      id: 'bill-2',
      invoiceId: 'INV-2026-0848',
      patientName: 'Abebe Assefa',
      patientId: 'rp-2',
      pid: 'PID-001087',
      description: 'General Consultation',
      amount: 600,
      amountPaid: 0,
      status: BillingStatus.pending,
      date: 'Oct 27, 2026',
      dueDate: 'Oct 30, 2026',
      paymentMethod: 'Pending',
    ),
    const BillingItem(
      id: 'bill-3',
      invoiceId: 'INV-2026-0849',
      patientName: 'Getachew Tadesse',
      patientId: 'rp-4',
      pid: 'PID-001076',
      description: 'Nephrology Consultation + Lab Tests',
      amount: 3200,
      amountPaid: 1500,
      status: BillingStatus.partiallyPaid,
      date: 'Oct 27, 2026',
      dueDate: 'Nov 03, 2026',
      paymentMethod: 'Insurance',
    ),
    const BillingItem(
      id: 'bill-4',
      invoiceId: 'INV-2026-0835',
      patientName: 'Dawit Mesfin',
      patientId: 'rp-6',
      pid: 'PID-001110',
      description: 'Pulmonology Consultation',
      amount: 900,
      amountPaid: 0,
      status: BillingStatus.overdue,
      date: 'Oct 20, 2026',
      dueDate: 'Oct 25, 2026',
      paymentMethod: 'Cash',
    ),
    const BillingItem(
      id: 'bill-5',
      invoiceId: 'INV-2026-0850',
      patientName: 'Hana Girma',
      patientId: 'rp-5',
      pid: 'PID-001102',
      description: 'OB-GYN Check-up + Ultrasound',
      amount: 2400,
      amountPaid: 2400,
      status: BillingStatus.paid,
      date: 'Oct 27, 2026',
      dueDate: 'Oct 27, 2026',
      paymentMethod: 'Cash',
    ),
    const BillingItem(
      id: 'bill-6',
      invoiceId: 'INV-2026-0851',
      patientName: 'Tigist Alemu',
      patientId: 'rp-3',
      pid: 'PID-001045',
      description: 'Cardiology + Holter Monitor',
      amount: 4500,
      amountPaid: 0,
      status: BillingStatus.pending,
      date: 'Oct 27, 2026',
      dueDate: 'Nov 03, 2026',
      paymentMethod: 'Pending',
    ),
  ];
}

// ─── Providers ────────────────────────────────────────────────────────────────

final receptionistProfileProvider = Provider<ReceptionistProfile>(
  (_) => ReceptionistRepository.currentReceptionist,
);

final receptionistKpisProvider = Provider<ReceptionistKpis>(
  (_) => ReceptionistRepository.kpis,
);

final receptionistPatientsProvider =
    StateProvider<List<RegistrationPatient>>((ref) {
  return ReceptionistRepository.patients;
});

final receptionistAppointmentsProvider =
    StateProvider<List<ReceptionistAppointment>>((ref) {
  return ReceptionistRepository.appointments;
});

final receptionistQueueProvider = StateProvider<List<QueueEntry>>((ref) {
  return ReceptionistRepository.queue;
});

final receptionistBillsProvider = StateProvider<List<BillingItem>>((ref) {
  return ReceptionistRepository.bills;
});
