import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/auth/auth_provider.dart';
import '../../../../core/api/api_client.dart';
import 'doctor_models.dart';

class DoctorRepository {
  static const defaultDoctor = DoctorProfile(
    name: 'Dr. Physician',
    role: 'Attending Physician',
    department: 'Outpatient Care',
    avatar:
        'https://ui-avatars.com/api/?name=Dr+Physician&size=150&background=dbeafe&color=1e40af',
    email: 'doctor@mcms.health',
    phone: '+251 911 000 000',
    hospital: 'Tikur Anbessa Specialized Hospital',
    unreadNotifications: 0,
    unreadMessages: 0,
  );
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
    this.patients = const [],
    this.appointments = const [],
    this.prescriptions = const [],
    this.labResults = const [],
    this.medicalRecords = const [],
    this.conversations = const [],
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
  DoctorNotifier() : super(const DoctorState());

  /// Load live data from the central API for patients, appointments, prescriptions, and lab results
  Future<void> loadFromApi(MobileApiClient client) async {
    List<PatientItem> mappedPatients = [];
    List<AppointmentItem> mappedAppts = [];
    List<PrescriptionItem> mappedRx = [];
    List<LabResultItem> mappedLabs = [];

    try {
      final patientsRes = await client.getPatients(limit: 50);
      final rawList = patientsRes['data'] as List<dynamic>? ?? [];
      mappedPatients = rawList
          .map((p) => PatientItem.fromDto(p as Map<String, dynamic>))
          .toList();
    } catch (_) {}

    try {
      final apptsRes = await client.getAppointments();
      mappedAppts = apptsRes
          .map((a) => AppointmentItem.fromDto(a as Map<String, dynamic>))
          .toList();
    } catch (_) {}

    try {
      final rxRes = await client.getPrescriptions();
      mappedRx = rxRes
          .map((r) => PrescriptionItem.fromDto(r as Map<String, dynamic>))
          .toList();
    } catch (_) {}

    try {
      final labsRes = await client.getLabOrders();
      mappedLabs = labsRes
          .map((l) => LabResultItem.fromDto(l as Map<String, dynamic>))
          .toList();
    } catch (_) {}

    // Synthesize medical records from live appointments and lab results
    final List<MedicalRecordItem> synthRecords = [];
    for (final a in mappedAppts) {
      synthRecords.add(
        MedicalRecordItem(
          id: 'rec-apt-${a.id}',
          patientId: a.patientId,
          patientName: a.patientName,
          visitDate: a.date,
          visitTime: a.time,
          visitType: a.reason.isNotEmpty ? a.reason : 'Consultation',
          department: a.department,
          doctorName: 'Attending Physician',
          doctorAvatar:
              'https://ui-avatars.com/api/?name=Attending+Physician&size=150&background=dbeafe&color=1e40af',
          diagnosisSummary: 'Consultation: ${a.reason}. Status: ${a.statusLabel}.',
          status: a.statusLabel,
        ),
      );
    }
    for (final l in mappedLabs) {
      synthRecords.add(
        MedicalRecordItem(
          id: 'rec-lab-${l.id}',
          patientId: l.patientId,
          patientName: l.patientName,
          visitDate: l.date,
          visitTime: 'Lab Order',
          visitType: l.testName,
          department: l.department,
          doctorName: 'Clinical Lab',
          doctorAvatar:
              'https://ui-avatars.com/api/?name=Clinical+Lab&size=150&background=dbeafe&color=1e40af',
          diagnosisSummary:
              'Test: ${l.testName}. Result: ${l.result}. Reference: ${l.referenceRange}',
          status: l.status,
        ),
      );
    }

    // Synthesize conversations from real doctors and patients
    final List<ConversationItem> synthConversations = [];
    try {
      final docList = await client.getDoctors();
      for (final d in docList) {
        if (d is Map<String, dynamic>) {
          final docName = d['displayName'] as String? ?? 'Doctor';
          final role = d['role'] as String? ?? 'Staff';
          final dept = d['department'] != null && d['department'] is Map
              ? d['department']['name'] as String? ?? 'Clinic'
              : 'Specialist';
          synthConversations.add(
            ConversationItem(
              id: 'doc-${d['id'] ?? docName}',
              name: docName.startsWith('Dr.') ? docName : 'Dr. $docName',
              avatar:
                  'https://ui-avatars.com/api/?name=${Uri.encodeComponent(docName)}&size=150&background=dbeafe&color=1e40af',
              role: '$role • $dept',
              lastMessage: 'Available for clinical consultation & handovers.',
              time: 'Today',
              unreadCount: 0,
              messages: [
                ChatMessageItem(
                  id: 'msg-doc-${d['id']}',
                  isMe: false,
                  senderName: docName,
                  text: 'Available for clinical consultation & handovers.',
                  time: 'Today',
                ),
              ],
            ),
          );
        }
      }
    } catch (_) {}

    for (final p in mappedPatients.take(8)) {
      synthConversations.add(
        ConversationItem(
          id: 'pat-${p.id}',
          name: p.name,
          avatar: p.avatar,
          role: 'Patient • ${p.pid}',
          lastMessage: 'Following the prescribed medical advice.',
          time: p.lastVisit,
          unreadCount: 0,
          messages: [
            ChatMessageItem(
              id: 'msg-pat-${p.id}',
              isMe: false,
              senderName: p.name,
              text: 'Hello doctor, thank you for the consultation.',
              time: p.lastVisit,
            ),
          ],
        ),
      );
    }

    state = DoctorState(
      patients: mappedPatients,
      appointments: mappedAppts,
      prescriptions: mappedRx,
      labResults: mappedLabs,
      medicalRecords: synthRecords,
      conversations: synthConversations,
    );
  }

  Future<bool> createPrescriptionViaApi(
      MobileApiClient client, Map<String, dynamic> data) async {
    try {
      final created = await client.createPrescription(data);
      final rxItem = PrescriptionItem.fromDto(created);
      state = state.copyWith(prescriptions: [rxItem, ...state.prescriptions]);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> createLabOrderViaApi(
      MobileApiClient client, Map<String, dynamic> data) async {
    try {
      final created = await client.createLabOrder(data);
      final labItem = LabResultItem.fromDto(created);
      state = state.copyWith(labResults: [labItem, ...state.labResults]);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> referPatientViaApi(
    MobileApiClient client, {
    required String patientId,
    required String departmentId,
    String? roomId,
    String? doctorId,
    required String priority,
    required String referralType, // 'queue_transfer' | 'new_appointment'
    String? reason,
    String? notes,
    String? appointmentDate,
    String? appointmentTime,
    String? activeQueueEntryId,
  }) async {
    try {
      if (referralType == 'queue_transfer') {
        if (activeQueueEntryId != null && activeQueueEntryId.isNotEmpty) {
          await client.updateQueueEntry(activeQueueEntryId, {
            'departmentId': departmentId,
            if (roomId != null && roomId.isNotEmpty) 'roomId': roomId,
            if (doctorId != null && doctorId.isNotEmpty) 'assignedDoctorId': doctorId,
            'priority': priority,
            'status': 'WAITING',
          });
        } else {
          await client.addToQueue({
            'patientId': patientId,
            'departmentId': departmentId,
            if (roomId != null && roomId.isNotEmpty) 'roomId': roomId,
            if (doctorId != null && doctorId.isNotEmpty) 'assignedDoctorId': doctorId,
            'priority': priority,
          });
        }
      } else {
        await client.createAppointment({
          'patientId': patientId,
          'departmentId': departmentId,
          if (roomId != null && roomId.isNotEmpty) 'roomId': roomId,
          if (doctorId != null && doctorId.isNotEmpty) 'doctorId': doctorId,
          'appointmentDate': appointmentDate ??
              DateTime.now().toIso8601String().split('T').first,
          'startTime': appointmentTime ?? '09:00 AM',
          'type': 'OUTPATIENT',
          'reason': reason ?? 'Clinical Referral',
          'notes': notes ?? 'Patient referral',
        });
      }
      await loadFromApi(client);
      return true;
    } catch (_) {
      return false;
    }
  }

  void addPrescription(PrescriptionItem item) {
    state = state.copyWith(prescriptions: [item, ...state.prescriptions]);
  }

  void addLabOrder(LabResultItem item) {
    state = state.copyWith(labResults: [item, ...state.labResults]);
  }

  void addPatient(PatientItem item) {
    state = state.copyWith(patients: [item, ...state.patients]);
  }

  void sendMessage(String conversationId, String text, {String? senderName}) {
    final myName = senderName ?? 'Dr. Physician';
    final updated = state.conversations.map((c) {
      if (c.id == conversationId) {
        final newMsg = ChatMessageItem(
          id: 'msg-${DateTime.now().millisecondsSinceEpoch}',
          isMe: true,
          senderName: myName,
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

final doctorProfileProvider = Provider<DoctorProfile>((ref) {
  final user = ref.watch(authProvider).user;
  if (user != null) {
    final name = user.displayName.isNotEmpty
        ? (user.displayName.startsWith('Dr.') ? user.displayName : 'Dr. ${user.displayName}')
        : (user.email.startsWith('dr') ? user.email : 'Dr. ${user.email}');
    return DoctorProfile(
      name: name,
      role: 'Physician / Specialist',
      department: 'Cardiology & OPD',
      avatar:
          'https://ui-avatars.com/api/?name=${Uri.encodeComponent(name)}&size=150&background=dbeafe&color=1e40af',
      email: user.email,
      phone: '+251 911 234 567',
      hospital: 'Tikur Anbessa Specialized Hospital',
      unreadNotifications: 2,
      unreadMessages: 1,
    );
  }
  return DoctorRepository.defaultDoctor;
});

final doctorProvider =
    StateNotifierProvider<DoctorNotifier, DoctorState>((ref) {
  return DoctorNotifier();
});
