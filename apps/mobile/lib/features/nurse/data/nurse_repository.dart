import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/auth/auth_provider.dart';
import '../../../../core/api/api_client.dart';
import 'nurse_models.dart';

/// Repository holding Nurse data, state notifiers, and clinical operations.
class NurseRepository {
  // ─── Live API Integration Methods ──────────────────────────────────────────

  static Future<void> loadFromApi(WidgetRef ref) async {
    final client = ref.read(apiClientProvider);

    // Queue (for Nursing Triage)
    try {
      final queueRes = await client.getQueue();
      final mappedQueue = queueRes
          .map((q) => NurseTriageQueueEntry.fromDto(q as Map<String, dynamic>))
          .toList();
      ref.read(nurseTriageQueueProvider.notifier).state = mappedQueue;
    } catch (e) {
      debugPrint('[NurseRepo] Error fetching queue: $e');
    }

    // Patients
    List<NursePatient> loadedPatients = [];
    try {
      final patientsRes = await client.getPatients(limit: 50);
      final rawList = patientsRes['data'] as List<dynamic>? ?? [];
      loadedPatients = rawList
          .map((p) => NursePatient.fromDto(p as Map<String, dynamic>))
          .toList();
      ref.read(nursePatientsProvider.notifier).state = loadedPatients;

      // Fetch latest vitals for loaded patients
      final allVitals = <VitalsRecord>[];
      for (final p in loadedPatients.take(15)) {
        try {
          final pVitals = await client.getPatientVitals(p.id, limit: 5);
          for (final v in pVitals) {
            allVitals.add(VitalsRecord.fromDto(v as Map<String, dynamic>));
          }
        } catch (_) {}
      }
      ref.read(nurseVitalsHistoryProvider.notifier).state = allVitals;
    } catch (e) {
      debugPrint('[NurseRepo] Error fetching patients: $e');
    }

    // Appointments (Ward Schedule)
    try {
      final apptsRes = await client.getAppointments();
      final mappedAppts = apptsRes
          .map((a) => NurseAppointment.fromDto(a as Map<String, dynamic>))
          .toList();
      ref.read(nurseAppointmentsProvider.notifier).state = mappedAppts;
    } catch (e) {
      debugPrint('[NurseRepo] Error fetching appointments: $e');
    }

    // Medications (eMAR)
    try {
      final medsRes = await client.getMedications();
      final mappedMeds = medsRes
          .map((m) => NurseMedication.fromDto(m as Map<String, dynamic>))
          .toList();
      ref.read(nurseMedicationsProvider.notifier).state = mappedMeds;
    } catch (e) {
      debugPrint('[NurseRepo] Error fetching medications: $e');
    }

    // Tasks
    try {
      final tasksRes = await client.getNursingTasks();
      final mappedTasks = tasksRes
          .map((t) => NursingTask.fromDto(t as Map<String, dynamic>))
          .toList();
      ref.read(nurseTasksProvider.notifier).state = mappedTasks;
    } catch (e) {
      debugPrint('[NurseRepo] Error fetching tasks: $e');
    }

    // Labs
    try {
      final labsRes = await client.getLabOrders();
      final mappedLabs = labsRes
          .map((l) => NurseLabSample.fromDto(l as Map<String, dynamic>))
          .toList();
      ref.read(nurseLabSamplesProvider.notifier).state = mappedLabs;
    } catch (e) {
      debugPrint('[NurseRepo] Error fetching labs: $e');
    }

    // Doctors
    try {
      final docsRes = await client.getDoctors();
      ref.read(nurseDoctorsProvider.notifier).state =
          docsRes.whereType<Map<String, dynamic>>().toList();
    } catch (e) {
      debugPrint('[NurseRepo] Error fetching doctors: $e');
    }

    // Departments
    try {
      final deptsRes = await client.getDepartments();
      ref.read(nurseDepartmentsProvider.notifier).state =
          deptsRes.whereType<Map<String, dynamic>>().toList();
    } catch (e) {
      debugPrint('[NurseRepo] Error fetching departments: $e');
    }
  }

  static Future<bool> updateQueueStatusViaApi(
      WidgetRef ref, String queueId, String status,
      {String? doctorId, String? departmentId}) async {
    final client = ref.read(apiClientProvider);
    try {
      final payload = <String, dynamic>{'status': status};
      if (doctorId != null) payload['assignedDoctorId'] = doctorId;
      if (departmentId != null) payload['departmentId'] = departmentId;
      final updated = await client.updateQueueEntry(queueId, payload);
      final entry = NurseTriageQueueEntry.fromDto(updated);
      ref.read(nurseTriageQueueProvider.notifier).update(
            (list) => list.map((q) => q.id == queueId ? entry : q).toList(),
          );
      return true;
    } catch (e) {
      debugPrint('[NurseRepo] Error updating queue status: $e');
      return false;
    }
  }

  static Future<bool> recordVitalsViaApi(
      WidgetRef ref, Map<String, dynamic> data, {String? queueId}) async {
    final client = ref.read(apiClientProvider);
    try {
      final created = await client.recordVitals(data);
      final record = VitalsRecord.fromDto(created);
      ref
          .read(nurseVitalsHistoryProvider.notifier)
          .update((list) => [record, ...list]);

      // If triaged from a queue entry, advance queue status to WAITING_FOR_DOCTOR
      if (queueId != null && queueId.isNotEmpty) {
        await updateQueueStatusViaApi(ref, queueId, 'WAITING_FOR_DOCTOR');
      }

      // Update patient vitals in the active patient list
      final pId = data['patientId'] as String?;
      if (pId != null) {
        ref.read(nursePatientsProvider.notifier).update(
              (list) => list.map((p) {
                if (p.id == pId) {
                  return p.copyWith(
                    vitals: PatientVitals(
                      bp: record.bp,
                      hr: record.hr,
                      temp: record.temp,
                      spo2: record.spo2,
                      respRate: record.respRate,
                    ),
                  );
                }
                return p;
              }).toList(),
            );
      }
      return true;
    } catch (e) {
      debugPrint('[NurseRepo] Error recording vitals: $e');
      return false;
    }
  }

  static Future<bool> administerMedicationViaApi(
      WidgetRef ref, String medId, Map<String, dynamic> data) async {
    final client = ref.read(apiClientProvider);
    try {
      final updated = await client.administerMedication(medId, data);
      final medItem = NurseMedication.fromDto(updated);
      ref.read(nurseMedicationsProvider.notifier).update(
            (list) => list.map((m) => m.id == medId ? medItem : m).toList(),
          );
      return true;
    } catch (e) {
      debugPrint('[NurseRepo] Error administering medication: $e');
      return false;
    }
  }

  static Future<bool> updateNursingTaskViaApi(
      WidgetRef ref, String taskId, Map<String, dynamic> data) async {
    final client = ref.read(apiClientProvider);
    try {
      final updated = await client.updateNursingTask(taskId, data);
      final taskItem = NursingTask.fromDto(updated);
      ref.read(nurseTasksProvider.notifier).update(
            (list) => list.map((t) => t.id == taskId ? taskItem : t).toList(),
          );
      return true;
    } catch (e) {
      debugPrint('[NurseRepo] Error updating task: $e');
      return false;
    }
  }

  static Future<bool> createNursingTaskViaApi(
      WidgetRef ref, Map<String, dynamic> data) async {
    final client = ref.read(apiClientProvider);
    try {
      final created = await client.createNursingTask(data);
      final taskItem = NursingTask.fromDto(created);
      ref.read(nurseTasksProvider.notifier).update((list) => [taskItem, ...list]);
      return true;
    } catch (e) {
      debugPrint('[NurseRepo] Error creating task: $e');
      return false;
    }
  }

  static Future<bool> collectLabSampleViaApi(WidgetRef ref, String orderId,
      String sampleId, Map<String, dynamic> data) async {
    final client = ref.read(apiClientProvider);
    try {
      await client.collectLabSample(orderId, sampleId, data);
      ref.read(nurseLabSamplesProvider.notifier).update((list) {
        return list.map((s) {
          if (s.id == orderId || s.sampleId == sampleId) {
            return s.copyWith(
              status: SampleStatus.collected,
              collectedAt: 'Just now',
            );
          }
          return s;
        }).toList();
      });
      return true;
    } catch (e) {
      debugPrint('[NurseRepo] Error collecting lab sample: $e');
      return false;
    }
  }
}

// ─── Riverpod Providers ───────────────────────────────────────────────────────

final nurseProfileProvider = Provider<NurseProfile>((ref) {
  final user = ref.watch(authProvider).user;
  if (user != null) {
    final name = user.displayName.isNotEmpty
        ? user.displayName
        : (user.firstName.isNotEmpty
            ? '${user.firstName} ${user.lastName}'.trim()
            : user.email);
    return NurseProfile(
      id: user.id,
      name: name,
      role: user.role == 'NURSE' ? 'Staff Nurse (RN)' : user.role,
      department: user.department ?? 'Nursing Department',
      ward: user.department ?? 'Nursing Station',
      email: user.email,
      phone: user.phoneNumber ?? '',
      location: 'MCMS Medical Center',
      avatar:
          'https://ui-avatars.com/api/?name=${Uri.encodeComponent(name)}&size=256&background=dbeafe&color=1e40af',
      quote: 'Caring for patients is a work of heart.',
      unreadNotifications: 0,
      unreadMessages: 0,
      status: NurseStatus.online,
      licenseNumber: user.licenseNumber ?? 'RN-LICENSED',
      qualification: 'Registered Nurse',
      yearsOfExperience: 'Clinical Staff',
      specialization: 'Inpatient Care',
    );
  }
  return const NurseProfile(
    id: '',
    name: 'Nurse',
    role: 'Staff Nurse',
    department: 'Nursing Department',
    ward: 'Nursing Station',
    email: '',
    phone: '',
    location: 'MCMS Medical Center',
    avatar: 'https://ui-avatars.com/api/?name=Nurse&size=256&background=dbeafe&color=1e40af',
    quote: '',
    unreadNotifications: 0,
    unreadMessages: 0,
    status: NurseStatus.offline,
    licenseNumber: '',
    qualification: '',
    yearsOfExperience: '',
    specialization: '',
  );
});

final nurseKpisProvider = Provider<NurseKpis>((ref) {
  final patients = ref.watch(nursePatientsProvider);
  final meds = ref.watch(nurseMedicationsProvider);
  final tasks = ref.watch(nurseTasksProvider);
  final labs = ref.watch(nurseLabSamplesProvider);
  final queue = ref.watch(nurseTriageQueueProvider);

  final pendingMedsCount =
      meds.where((m) => m.status != MedStatus.administered).length;
  final urgentLabsCount =
      labs.where((l) => l.priority == SamplePriority.urgent).length;
  final pendingTasksCount =
      tasks.where((t) => t.status != TaskStatus.completed).length;
  final triageDueCount = queue
      .where((q) =>
          q.status == 'WAITING_FOR_TRIAGE' || q.status == 'TRIAGE_IN_PROGRESS')
      .length;

  return NurseKpis(
    activePatients: patients.length,
    pendingMeds: pendingMedsCount,
    vitalsDue: triageDueCount,
    urgentLabs: urgentLabsCount,
    tasksToday: pendingTasksCount,
    admissions: patients.where((p) => p.status == PatientWardStatus.inWard).length,
  );
});

final nursePatientsProvider = StateProvider<List<NursePatient>>((ref) {
  return [];
});

final nurseVitalsHistoryProvider = StateProvider<List<VitalsRecord>>((ref) {
  return [];
});

final nurseMedicationsProvider = StateProvider<List<NurseMedication>>((ref) {
  return [];
});

final nurseLabSamplesProvider = StateProvider<List<NurseLabSample>>((ref) {
  return [];
});

final nurseTasksProvider = StateProvider<List<NursingTask>>((ref) {
  return [];
});

final nurseAppointmentsProvider = StateProvider<List<NurseAppointment>>((ref) {
  return [];
});

final nurseTriageQueueProvider = StateProvider<List<NurseTriageQueueEntry>>((ref) {
  return [];
});

final nurseDoctorsProvider = StateProvider<List<Map<String, dynamic>>>((ref) {
  return [];
});

final nurseDepartmentsProvider = StateProvider<List<Map<String, dynamic>>>((ref) {
  return [];
});

final nurseConversationsProvider = StateProvider<List<NurseConversation>>((ref) {
  return [];
});

final nurseChatMessagesProvider =
    StateProvider<Map<String, List<NurseChatMessage>>>((ref) {
  return {};
});

final nurseActivitiesProvider = StateProvider<List<NurseActivityLog>>((ref) {
  return [];
});
