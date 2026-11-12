import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/auth/auth_provider.dart';
import '../../../../core/api/api_client.dart';
import 'receptionist_models.dart';

/// Repository providing receptionist data, live backend synchronization,
/// and local state management for patients, appointments, and queue.
class ReceptionistRepository {
  // ─── Live API Integration Methods ───────────────────────────────────────────

  /// Fetch live data from backend for patients, appointments, queue, doctors, and departments.
  static Future<void> loadFromApi(WidgetRef ref) async {
    final client = ref.read(apiClientProvider);

    // Patients
    try {
      final patientsRes = await client.getPatients(limit: 100);
      final rawList = patientsRes['data'] as List<dynamic>? ?? [];
      final mappedPatients = rawList
          .map((p) => RegistrationPatient.fromDto(p as Map<String, dynamic>))
          .toList();
      ref.read(receptionistPatientsProvider.notifier).state = mappedPatients;
    } catch (_) {}

    // Appointments
    try {
      final apptsRes = await client.getAppointments();
      final mappedAppts = apptsRes
          .map((a) => ReceptionistAppointment.fromDto(a as Map<String, dynamic>))
          .toList();
      ref.read(receptionistAppointmentsProvider.notifier).state = mappedAppts;
    } catch (_) {}

    // Queue
    try {
      final queueRes = await client.getQueue();
      final mappedQueue = queueRes
          .map((q) => QueueEntry.fromDto(q as Map<String, dynamic>))
          .toList();
      ref.read(receptionistQueueProvider.notifier).state = mappedQueue;
    } catch (_) {}

    // Doctors
    try {
      final doctorsRes = await client.getDoctors();
      final mappedDoctors = doctorsRes
          .map((d) => DoctorItem.fromDto(d as Map<String, dynamic>))
          .toList();
      ref.read(receptionistDoctorsProvider.notifier).state = mappedDoctors;
    } catch (_) {}

    // Departments
    try {
      final deptsRes = await client.getDepartments();
      final mappedDepts = deptsRes
          .map((d) => DepartmentItem.fromDto(d as Map<String, dynamic>))
          .toList();
      ref.read(receptionistDepartmentsProvider.notifier).state = mappedDepts;
    } catch (_) {}
  }

  /// Search patients from API with live query.
  static Future<List<RegistrationPatient>> searchPatients(
      WidgetRef ref, String query) async {
    final client = ref.read(apiClientProvider);
    try {
      final res = await client.getPatients(search: query, limit: 30);
      final rawList = res['data'] as List<dynamic>? ?? [];
      return rawList
          .map((p) => RegistrationPatient.fromDto(p as Map<String, dynamic>))
          .toList();
    } catch (_) {
      final local = ref.read(receptionistPatientsProvider);
      final q = query.toLowerCase();
      return local
          .where((p) =>
              p.name.toLowerCase().contains(q) ||
              p.pid.toLowerCase().contains(q) ||
              p.phone.toLowerCase().contains(q))
          .toList();
    }
  }

  /// Register new patient via central API.
  static Future<RegistrationPatient?> registerPatient(
      WidgetRef ref, Map<String, dynamic> data) async {
    final client = ref.read(apiClientProvider);
    try {
      final created = await client.createPatient(data);
      final newPatient = RegistrationPatient.fromDto(created);
      ref
          .read(receptionistPatientsProvider.notifier)
          .update((list) => [newPatient, ...list]);
      return newPatient;
    } catch (_) {
      // Local fallback in offline mode
      final newPatient = RegistrationPatient(
        id: 'patient-${DateTime.now().millisecondsSinceEpoch}',
        pid: 'PID-${(1000 + (DateTime.now().millisecondsSinceEpoch % 9000))}',
        name: data['fullName'] as String? ??
            '${data['firstName'] ?? ''} ${data['lastName'] ?? ''}'.trim(),
        age: 30,
        gender: data['gender'] as String? ?? 'Other',
        phone: data['phoneNumber'] as String? ?? '—',
        email: data['email'] as String? ?? '—',
        address: data['address'] as String? ?? '—',
        bloodType: data['bloodType'] as String? ?? 'O+',
        emergencyContact: data['emergencyContactName'] as String? ?? 'Family',
        emergencyPhone: data['emergencyContactPhone'] as String? ?? '—',
        registrationDate: DateTime.now().toIso8601String().substring(0, 10),
        status: 'Active',
      );
      ref
          .read(receptionistPatientsProvider.notifier)
          .update((list) => [newPatient, ...list]);
      return newPatient;
    }
  }

  /// Book an appointment via central API.
  static Future<bool> createAppointment(
      WidgetRef ref, Map<String, dynamic> data) async {
    final client = ref.read(apiClientProvider);
    try {
      final created = await client.createAppointment(data);
      final newAppt = ReceptionistAppointment.fromDto(created);
      ref
          .read(receptionistAppointmentsProvider.notifier)
          .update((list) => [newAppt, ...list]);
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Cancel an appointment.
  static Future<bool> cancelAppointment(WidgetRef ref, String id) async {
    final client = ref.read(apiClientProvider);
    try {
      await client.updateAppointment(id, {'status': 'CANCELLED'});
      ref.read(receptionistAppointmentsProvider.notifier).update((list) => list
          .map((a) => a.id == id
              ? ReceptionistAppointment(
                  id: a.id,
                  patientName: a.patientName,
                  patientId: a.patientId,
                  pid: a.pid,
                  doctorName: a.doctorName,
                  doctorId: a.doctorId,
                  department: a.department,
                  departmentId: a.departmentId,
                  date: a.date,
                  time: a.time,
                  reason: a.reason,
                  status: ReceptionistAppointmentStatus.cancelled,
                  notes: a.notes,
                )
              : a)
          .toList());
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Reschedule an appointment.
  static Future<bool> rescheduleAppointment(
      WidgetRef ref, String id, String date, String time) async {
    final client = ref.read(apiClientProvider);
    try {
      final updated = await client.updateAppointment(id, {
        'appointmentDate': date,
        'startTime': time,
        'status': 'SCHEDULED',
      });
      final appt = ReceptionistAppointment.fromDto(updated);
      ref.read(receptionistAppointmentsProvider.notifier).update((list) =>
          list.map((a) => a.id == id ? appt : a).toList());
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Check-in appointment directly to live queue.
  static Future<QueueEntry?> checkInAppointmentToQueue(
      WidgetRef ref, ReceptionistAppointment appt,
      {String priority = 'NORMAL'}) async {
    final client = ref.read(apiClientProvider);
    try {
      final queuePayload = <String, dynamic>{
        'patientId': appt.patientId,
        'priority': priority,
      };
      if (appt.doctorId != null && appt.doctorId!.isNotEmpty) {
        queuePayload['assignedDoctorId'] = appt.doctorId;
      }
      if (appt.departmentId != null && appt.departmentId!.isNotEmpty) {
        queuePayload['departmentId'] = appt.departmentId;
      }

      final created = await client.addToQueue(queuePayload);
      final newQ = QueueEntry.fromDto(created);

      // Update appointment status to CHECKED_IN
      try {
        await client.updateAppointment(appt.id, {'status': 'CHECKED_IN'});
      } catch (_) {}

      // Update local state
      ref
          .read(receptionistQueueProvider.notifier)
          .update((list) => [newQ, ...list]);
      ref.read(receptionistAppointmentsProvider.notifier).update((list) => list
          .map((a) => a.id == appt.id
              ? ReceptionistAppointment(
                  id: a.id,
                  patientName: a.patientName,
                  patientId: a.patientId,
                  pid: a.pid,
                  doctorName: a.doctorName,
                  doctorId: a.doctorId,
                  department: a.department,
                  departmentId: a.departmentId,
                  date: a.date,
                  time: a.time,
                  reason: a.reason,
                  status: ReceptionistAppointmentStatus.checkedIn,
                  notes: a.notes,
                )
              : a)
          .toList());

      return newQ;
    } catch (_) {
      return null;
    }
  }

  /// Check-in / add patient to live queue.
  static Future<QueueEntry?> addToQueue(
      WidgetRef ref, Map<String, dynamic> data) async {
    final client = ref.read(apiClientProvider);
    try {
      final created = await client.addToQueue(data);
      final newQ = QueueEntry.fromDto(created);
      ref
          .read(receptionistQueueProvider.notifier)
          .update((list) => [newQ, ...list]);
      return newQ;
    } catch (_) {
      return null;
    }
  }

  /// Update queue entry status (e.g. called, in consultation, done, cancelled).
  static Future<bool> updateQueueStatus(
      WidgetRef ref, String id, String status) async {
    final client = ref.read(apiClientProvider);
    try {
      final updated = await client.updateQueueEntry(id, {'status': status});
      final qItem = QueueEntry.fromDto(updated);
      ref.read(receptionistQueueProvider.notifier).update(
            (list) => list.map((q) => q.id == id ? qItem : q).toList(),
          );
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Create and register a billing invoice.
  static void addBill(WidgetRef ref, BillingItem bill) {
    ref.read(receptionistBillsProvider.notifier).update((list) => [bill, ...list]);
  }

  /// Record payment for a bill.
  static void payBill(WidgetRef ref, String billId, String method) {
    ref.read(receptionistBillsProvider.notifier).update((list) => list.map((b) {
          if (b.id == billId) {
            return BillingItem(
              id: b.id,
              invoiceId: b.invoiceId,
              patientName: b.patientName,
              patientId: b.patientId,
              pid: b.pid,
              description: b.description,
              amount: b.amount,
              amountPaid: b.amount,
              status: BillingStatus.paid,
              date: b.date,
              dueDate: b.dueDate,
              paymentMethod: method,
            );
          }
          return b;
        }).toList());
  }
}

// ─── Riverpod State Providers ─────────────────────────────────────────────────

final receptionistProfileProvider = Provider<ReceptionistProfile>((ref) {
  final authService = ref.watch(authServiceProvider);
  final user = authService.currentUser;
  if (user != null) {
    final name = user.displayName.isNotEmpty
        ? user.displayName
        : '${user.firstName} ${user.lastName}'.trim();
    return ReceptionistProfile(
      name: name.isNotEmpty ? name : 'Receptionist',
      role: user.role,
      department: 'Front Desk',
      email: user.email,
      phone: '—',
      hospital: 'Tikur Anbessa Specialized Hospital',
      unreadNotifications: 0,
    );
  }
  return const ReceptionistProfile(
    name: 'Front Desk Staff',
    role: 'RECEPTIONIST',
    department: 'Front Desk',
    email: 'reception@mcms.health',
    phone: '—',
    hospital: 'Tikur Anbessa Specialized Hospital',
    unreadNotifications: 0,
  );
});

final receptionistPatientsProvider =
    StateProvider<List<RegistrationPatient>>((ref) => []);

final receptionistAppointmentsProvider =
    StateProvider<List<ReceptionistAppointment>>((ref) => []);

final receptionistQueueProvider =
    StateProvider<List<QueueEntry>>((ref) => []);

final receptionistBillsProvider =
    StateProvider<List<BillingItem>>((ref) => []);

final receptionistDoctorsProvider =
    StateProvider<List<DoctorItem>>((ref) => []);

final receptionistDepartmentsProvider =
    StateProvider<List<DepartmentItem>>((ref) => []);

final receptionistKpisProvider = Provider<ReceptionistKpis>((ref) {
  final patients = ref.watch(receptionistPatientsProvider);
  final appointments = ref.watch(receptionistAppointmentsProvider);
  final queue = ref.watch(receptionistQueueProvider);
  final bills = ref.watch(receptionistBillsProvider);

  final pendingQueueCount = queue
      .where((q) =>
          q.status == QueueStatus.waiting ||
          q.status == QueueStatus.called)
      .length;
  final pendingBillsCount =
      bills.where((b) => b.status == BillingStatus.pending).length;
  final collectedTodayAmount =
      bills.fold<double>(0.0, (sum, b) => sum + b.amountPaid);

  return ReceptionistKpis(
    todayPatients: patients.length,
    pendingQueue: pendingQueueCount,
    todayAppointments: appointments
        .where((a) => a.status != ReceptionistAppointmentStatus.cancelled)
        .length,
    pendingBills: pendingBillsCount,
    collectedToday: collectedTodayAmount,
    newRegistrations: patients.length,
  );
});
