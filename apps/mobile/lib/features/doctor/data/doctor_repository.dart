import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'doctor_models.dart';

class DoctorRepository {
  static const currentDoctor = DoctorProfile(
    name: 'Dr. Fitsum Alemu',
    role: 'Cardiologist',
    department: 'Cardiology',
    avatar:
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    email: 'fitsum.alemu@mcms.health',
    phone: '+251 911 234 567',
    hospital: 'Tikur Anbessa Specialized Hospital',
    unreadNotifications: 3,
    unreadMessages: 3,
  );

  static final List<PatientItem> initialPatients = [
    const PatientItem(
      id: 'p-1',
      name: 'Aster Mulu',
      pid: 'PID-001024',
      age: 28,
      gender: 'Female',
      phone: '+251 912 345 678',
      email: 'aster.mulu@email.com',
      address: 'Bole Sub-City, Addis Ababa, Ethiopia',
      department: 'Cardiology',
      lastVisit: 'Oct 18, 2026',
      lastVisitReason: 'Follow-up Visit',
      nextAppointment: 'Oct 25, 2026 - 09:00 AM • Cardiology',
      status: 'Active',
      avatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      totalVisits: 5,
      conditions: ['Hypertension', 'Type 2 Diabetes', 'High Cholesterol'],
    ),
    const PatientItem(
      id: 'p-2',
      name: 'Abebe Assefa',
      pid: 'PID-001087',
      age: 29,
      gender: 'Male',
      phone: '+251 930 555 444',
      email: 'abebe.assefa@email.com',
      address: 'Lideta Sub-City, Addis Ababa, Ethiopia',
      department: 'Cardiology',
      lastVisit: 'Oct 19, 2026',
      lastVisitReason: 'Consultation',
      nextAppointment: 'Nov 02, 2026 - 10:30 AM • Cardiology',
      status: 'Active',
      avatar:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      totalVisits: 3,
      conditions: ['Normal Sinus Rhythm'],
    ),
    const PatientItem(
      id: 'p-3',
      name: 'Tigist Alemu',
      pid: 'PID-001045',
      age: 35,
      gender: 'Female',
      phone: '+251 911 777 888',
      email: 'tigist.alemu@email.com',
      address: 'Gullele Sub-City, Addis Ababa, Ethiopia',
      department: 'Cardiology',
      lastVisit: 'Oct 19, 2026',
      lastVisitReason: 'Consultation',
      nextAppointment: 'Oct 26, 2026 - 02:00 PM • Cardiology',
      status: 'Active',
      avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      totalVisits: 4,
      conditions: ['Sinus Tachycardia'],
    ),
    const PatientItem(
      id: 'p-4',
      name: 'Getachew Tadesse',
      pid: 'PID-001076',
      age: 50,
      gender: 'Male',
      phone: '+251 904 321 987',
      email: 'getachew.t@email.com',
      address: 'Arada Sub-City, Addis Ababa, Ethiopia',
      department: 'Cardiology',
      lastVisit: 'Oct 14, 2026',
      lastVisitReason: 'New Patient',
      nextAppointment: 'Oct 21, 2026 - 11:00 AM • Cardiology',
      status: 'Active',
      avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      totalVisits: 2,
      conditions: ['Atrial Fibrillation'],
    ),
    const PatientItem(
      id: 'p-5',
      name: 'Lidiya Kebede',
      pid: 'PID-001062',
      age: 31,
      gender: 'Female',
      phone: '+251 918 765 432',
      email: 'lidiya.kebede@email.com',
      address: 'Kirkos Sub-City, Addis Ababa, Ethiopia',
      department: 'Cardiology',
      lastVisit: 'Oct 15, 2026',
      lastVisitReason: 'Follow-up Visit',
      nextAppointment: 'Oct 22, 2026 - 02:00 PM • Cardiology',
      status: 'Active',
      avatar:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      totalVisits: 4,
      conditions: ['Mild Mitral Valve Prolapse'],
    ),
    const PatientItem(
      id: 'p-6',
      name: 'Samuel Girma',
      pid: 'PID-001087',
      age: 42,
      gender: 'Male',
      phone: '+251 911 223 456',
      email: 'samuel.girma@email.com',
      address: 'Kazanchis, Addis Ababa, Ethiopia',
      department: 'Cardiology',
      lastVisit: 'Oct 16, 2026',
      lastVisitReason: 'Consultation',
      status: 'Active',
      avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      totalVisits: 3,
      conditions: ['Coronary Artery Disease'],
    ),
  ];

  static final List<AppointmentItem> initialAppointments = [
    const AppointmentItem(
      id: 'apt-1',
      time: '08:00 AM – 08:20 AM',
      date: 'Oct 19, 2026',
      patientName: 'Aster Mulu',
      patientId: 'PID-001024',
      age: 28,
      gender: 'Female',
      reason: 'Follow-up Visit',
      department: 'Cardiology',
      status: AppointmentStatus.completed,
      avatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    ),
    const AppointmentItem(
      id: 'apt-2',
      time: '08:40 AM – 09:00 AM',
      date: 'Oct 19, 2026',
      patientName: 'Abebe Assefa',
      patientId: 'PID-001087',
      age: 29,
      gender: 'Male',
      reason: 'Consultation',
      department: 'Cardiology',
      status: AppointmentStatus.completed,
      avatar:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    ),
    const AppointmentItem(
      id: 'apt-3',
      time: '09:20 AM – 09:40 AM',
      date: 'Oct 19, 2026',
      patientName: 'Tigist Alemu',
      patientId: 'PID-001045',
      age: 35,
      gender: 'Female',
      reason: 'Consultation',
      department: 'Cardiology',
      status: AppointmentStatus.inProgress,
      avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    ),
    const AppointmentItem(
      id: 'apt-4',
      time: '10:00 AM – 10:30 AM',
      date: 'Oct 19, 2026',
      patientName: 'Getachew Tadesse',
      patientId: 'PID-001076',
      age: 50,
      gender: 'Male',
      reason: 'New Patient',
      department: 'Cardiology',
      status: AppointmentStatus.upcoming,
      avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    ),
    const AppointmentItem(
      id: 'apt-5',
      time: '11:00 AM – 11:30 AM',
      date: 'Oct 19, 2026',
      patientName: 'Lidiya Kebede',
      patientId: 'PID-001062',
      age: 31,
      gender: 'Female',
      reason: 'Follow-up Visit',
      department: 'Cardiology',
      status: AppointmentStatus.upcoming,
      avatar:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    ),
  ];

  static final List<PrescriptionItem> initialPrescriptions = [
    const PrescriptionItem(
      id: 'rx-1',
      prescriptionId: 'RX-2026-048',
      patientName: 'Aster Mulu',
      patientId: 'PID-001024',
      patientAvatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      medication: 'Amoxicillin 500mg',
      dosage: '500mg TID',
      duration: '7 days',
      prescribedDate: 'Oct 19, 2026 09:15 AM',
      status: 'Active',
      department: 'Cardiology',
    ),
    const PrescriptionItem(
      id: 'rx-2',
      prescriptionId: 'RX-2026-047',
      patientName: 'Abebe Assefa',
      patientId: 'PID-001087',
      patientAvatar:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      medication: 'Lisinopril 10mg',
      dosage: '10mg Once daily',
      duration: '30 days',
      prescribedDate: 'Oct 19, 2026 08:50 AM',
      status: 'Active',
      department: 'Cardiology',
    ),
    const PrescriptionItem(
      id: 'rx-3',
      prescriptionId: 'RX-2026-046',
      patientName: 'Tigist Alemu',
      patientId: 'PID-001045',
      patientAvatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      medication: 'Metoprolol 25mg',
      dosage: '25mg Twice daily',
      duration: '60 days',
      prescribedDate: 'Oct 18, 2026 04:30 PM',
      status: 'Active',
      department: 'Cardiology',
    ),
    const PrescriptionItem(
      id: 'rx-4',
      prescriptionId: 'RX-2026-045',
      patientName: 'Getachew Tadesse',
      patientId: 'PID-001076',
      patientAvatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      medication: 'Atorvastatin 20mg',
      dosage: '20mg At bedtime',
      duration: '90 days',
      prescribedDate: 'Oct 17, 2026 11:20 AM',
      status: 'Pending Refill',
      department: 'Cardiology',
    ),
  ];

  static final List<LabResultItem> initialLabResults = [
    const LabResultItem(
      id: 'lab-1',
      patientName: 'Aster Mulu',
      patientId: 'PID-001024',
      avatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      testName: 'Complete Blood Count (CBC)',
      department: 'Hematology',
      result: 'WBC: 7.8 ×10³/µL, Hgb: 13.2 g/dL',
      referenceRange: '4.0 - 11.0, 12.0 - 16.0',
      status: 'Completed',
      date: 'Oct 18, 2026',
    ),
    const LabResultItem(
      id: 'lab-2',
      patientName: 'Samuel Girma',
      patientId: 'PID-001087',
      avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      testName: 'Lipid Profile Panel',
      department: 'Biochemistry',
      result: 'Cholesterol: 245 mg/dL (High)',
      referenceRange: '< 200 mg/dL',
      status: 'Abnormal',
      date: 'Oct 17, 2026',
    ),
    const LabResultItem(
      id: 'lab-3',
      patientName: 'Tigist Alemu',
      patientId: 'PID-001045',
      avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      testName: '12-Lead Electrocardiogram',
      department: 'Cardiology',
      result: 'Sinus Tachycardia, HR 105 bpm',
      referenceRange: '60 - 100 bpm',
      status: 'Completed',
      date: 'Oct 16, 2026',
    ),
    const LabResultItem(
      id: 'lab-4',
      patientName: 'Getachew Tadesse',
      patientId: 'PID-001076',
      avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      testName: 'Echocardiogram 2D',
      department: 'Cardiology',
      result: 'Pending Analysis in Core Lab',
      referenceRange: 'Normal EF > 55%',
      status: 'Pending',
      date: 'Oct 19, 2026',
    ),
  ];

  static final List<MedicalRecordItem> initialMedicalRecords = [
    const MedicalRecordItem(
      id: 'rec-1',
      visitDate: 'Oct 18, 2026',
      visitTime: '09:40 AM',
      visitType: 'Follow-up Visit',
      department: 'Cardiology',
      doctorName: 'Dr. Fitsum Alemu',
      doctorAvatar:
          'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      diagnosisSummary:
          'Essential Hypertension controlled. BP 124/82 mmHg. Continue Lisinopril 10mg once daily.',
      status: 'Completed',
    ),
    const MedicalRecordItem(
      id: 'rec-2',
      visitDate: 'Oct 12, 2026',
      visitTime: '10:15 AM',
      visitType: 'Consultation',
      department: 'Internal Medicine',
      doctorName: 'Dr. Hiwet Desta',
      doctorAvatar:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      diagnosisSummary:
          'Acute viral upper respiratory tract infection. Hydration and symptomatic therapy advised.',
      status: 'Completed',
    ),
    const MedicalRecordItem(
      id: 'rec-3',
      visitDate: 'Oct 05, 2026',
      visitTime: '02:30 PM',
      visitType: 'Lab Investigation',
      department: 'Laboratory',
      doctorName: 'Lab Tech Team',
      doctorAvatar:
          'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=150&auto=format&fit=crop&q=80',
      diagnosisSummary:
          'Routine CBC and fasting blood sugar within normal limits. HbA1c 5.6%.',
      status: 'Completed',
    ),
  ];

  static final List<ConversationItem> initialConversations = [
    const ConversationItem(
      id: 'c-1',
      name: 'Aster Mulu',
      avatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      role: 'Patient • PID-001024',
      lastMessage: 'Doctor, should I take the Lisinopril before breakfast?',
      time: '09:25 AM',
      unreadCount: 1,
      messages: [
        ChatMessageItem(
          id: 'm-1',
          isMe: false,
          senderName: 'Aster Mulu',
          text: 'Good morning Dr. Fitsum. I picked up the new prescription.',
          time: '09:20 AM',
        ),
        ChatMessageItem(
          id: 'm-2',
          isMe: false,
          senderName: 'Aster Mulu',
          text: 'Doctor, should I take the Lisinopril before breakfast?',
          time: '09:25 AM',
        ),
      ],
    ),
    const ConversationItem(
      id: 'c-2',
      name: 'Lab Tech Team',
      avatar:
          'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=150&auto=format&fit=crop&q=80',
      role: 'Laboratory Department',
      lastMessage: 'Echocardiogram report for Getachew Tadesse is uploaded.',
      time: '08:45 AM',
      unreadCount: 1,
      messages: [
        ChatMessageItem(
          id: 'm-3',
          isMe: false,
          senderName: 'Lab Tech Team',
          text: 'Echocardiogram report for Getachew Tadesse is uploaded.',
          time: '08:45 AM',
        ),
      ],
    ),
    const ConversationItem(
      id: 'c-3',
      name: 'Nurse Sara Haile',
      avatar:
          'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
      role: 'Triage Nurse • Cardiology',
      lastMessage: 'Patient Aster Mulu vital signs recorded and in consultation.',
      time: '08:05 AM',
      unreadCount: 1,
      messages: [
        ChatMessageItem(
          id: 'm-4',
          isMe: false,
          senderName: 'Nurse Sara',
          text: 'Patient Aster Mulu vital signs recorded and in consultation.',
          time: '08:05 AM',
        ),
      ],
    ),
  ];
}

// ─── Riverpod State Notifier for Doctor Data ─────────────────────────────────

class DoctorState {
  final List<PatientItem> patients;
  final List<AppointmentItem> appointments;
  final List<PrescriptionItem> prescriptions;
  final List<LabResultItem> labResults;
  final List<MedicalRecordItem> medicalRecords;
  final List<ConversationItem> conversations;

  const DoctorState({
    required this.patients,
    required this.appointments,
    required this.prescriptions,
    required this.labResults,
    required this.medicalRecords,
    required this.conversations,
  });

  DoctorState copyWith({
    List<PatientItem>? patients,
    List<AppointmentItem>? appointments,
    List<PrescriptionItem>? prescriptions,
    List<LabResultItem>? labResults,
    List<MedicalRecordItem>? medicalRecords,
    List<ConversationItem>? conversations,
  }) {
    return DoctorState(
      patients: patients ?? this.patients,
      appointments: appointments ?? this.appointments,
      prescriptions: prescriptions ?? this.prescriptions,
      labResults: labResults ?? this.labResults,
      medicalRecords: medicalRecords ?? this.medicalRecords,
      conversations: conversations ?? this.conversations,
    );
  }
}

class DoctorNotifier extends StateNotifier<DoctorState> {
  DoctorNotifier()
      : super(
          DoctorState(
            patients: DoctorRepository.initialPatients,
            appointments: DoctorRepository.initialAppointments,
            prescriptions: DoctorRepository.initialPrescriptions,
            labResults: DoctorRepository.initialLabResults,
            medicalRecords: DoctorRepository.initialMedicalRecords,
            conversations: DoctorRepository.initialConversations,
          ),
        );

  void addPrescription(PrescriptionItem item) {
    state = state.copyWith(prescriptions: [item, ...state.prescriptions]);
  }

  void addLabOrder(LabResultItem item) {
    state = state.copyWith(labResults: [item, ...state.labResults]);
  }

  void addPatient(PatientItem item) {
    state = state.copyWith(patients: [item, ...state.patients]);
  }

  void sendMessage(String conversationId, String text) {
    final updated = state.conversations.map((c) {
      if (c.id == conversationId) {
        final newMsg = ChatMessageItem(
          id: 'msg-${DateTime.now().millisecondsSinceEpoch}',
          isMe: true,
          senderName: 'Dr. Fitsum Alemu',
          text: text,
          time: 'Just now',
        );
        return ConversationItem(
          id: c.id,
          name: c.name,
          avatar: c.avatar,
          role: c.role,
          lastMessage: text,
          time: 'Just now',
          unreadCount: 0,
          messages: [...c.messages, newMsg],
        );
      }
      return c;
    }).toList();
    state = state.copyWith(conversations: updated);
  }
}

final doctorProvider =
    StateNotifierProvider<DoctorNotifier, DoctorState>((ref) {
  return DoctorNotifier();
});
