// ─── Nurse Feature Models ───────────────────────────────────────────────────

enum NurseStatus { online, busy, offline }

class NurseProfile {
  final String id;
  final String name;
  final String role;
  final String department;
  final String ward;
  final String email;
  final String phone;
  final String location;
  final String avatar;
  final String quote;
  final int unreadNotifications;
  final int unreadMessages;
  final NurseStatus status;
  final String licenseNumber;
  final String qualification;
  final String yearsOfExperience;
  final String specialization;

  const NurseProfile({
    required this.id,
    required this.name,
    required this.role,
    required this.department,
    required this.ward,
    required this.email,
    required this.phone,
    required this.location,
    required this.avatar,
    required this.quote,
    this.unreadNotifications = 0,
    this.unreadMessages = 0,
    this.status = NurseStatus.online,
    this.licenseNumber = 'RN-2020-0456',
    this.qualification = 'Bachelor of Science in Nursing',
    this.yearsOfExperience = '4 Years',
    this.specialization = 'General & Critical Care Nursing',
  });

  String get initials {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : 'N';
  }
}

// ─── Nurse KPIs ─────────────────────────────────────────────────────────────

class NurseKpis {
  final int activePatients;
  final int pendingMeds;
  final int vitalsDue;
  final int urgentLabs;
  final int tasksToday;
  final int admissions;

  const NurseKpis({
    required this.activePatients,
    required this.pendingMeds,
    required this.vitalsDue,
    required this.urgentLabs,
    required this.tasksToday,
    required this.admissions,
  });
}

// ─── Patient Vitals Info ─────────────────────────────────────────────────────

class PatientVitals {
  final String bp;
  final int hr;
  final double temp;
  final int spo2;
  final int respRate;

  const PatientVitals({
    required this.bp,
    required this.hr,
    required this.temp,
    required this.spo2,
    this.respRate = 18,
  });

  PatientVitals copyWith({
    String? bp,
    int? hr,
    double? temp,
    int? spo2,
    int? respRate,
  }) {
    return PatientVitals(
      bp: bp ?? this.bp,
      hr: hr ?? this.hr,
      temp: temp ?? this.temp,
      spo2: spo2 ?? this.spo2,
      respRate: respRate ?? this.respRate,
    );
  }
}

// ─── In-Ward Patient ────────────────────────────────────────────────────────

enum PatientWardStatus { inWard, waiting, inCare, critical, discharged }

enum VitalsCondition { normal, highBp, lowBp, elevated, critical }

class NursePatient {
  final String id;
  final String pid;
  final String name;
  final int age;
  final String gender;
  final String avatar;
  final String phone;
  final String email;
  final String address;
  final String room;
  final String bed;
  final String department;
  final String visitReason;
  final PatientWardStatus status;
  final VitalsCondition vitalsStatus;
  final PatientVitals vitals;
  final String doctor;
  final String admissionDate;
  final String? nextFollowUp;

  const NursePatient({
    required this.id,
    required this.pid,
    required this.name,
    required this.age,
    required this.gender,
    required this.avatar,
    required this.phone,
    required this.email,
    required this.address,
    required this.room,
    required this.bed,
    required this.department,
    required this.visitReason,
    required this.status,
    required this.vitalsStatus,
    required this.vitals,
    required this.doctor,
    required this.admissionDate,
    this.nextFollowUp,
  });

  String get initials {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }

  NursePatient copyWith({
    PatientWardStatus? status,
    VitalsCondition? vitalsStatus,
    PatientVitals? vitals,
  }) {
    return NursePatient(
      id: id,
      pid: pid,
      name: name,
      age: age,
      gender: gender,
      avatar: avatar,
      phone: phone,
      email: email,
      address: address,
      room: room,
      bed: bed,
      department: department,
      visitReason: visitReason,
      status: status ?? this.status,
      vitalsStatus: vitalsStatus ?? this.vitalsStatus,
      vitals: vitals ?? this.vitals,
      doctor: doctor,
      admissionDate: admissionDate,
      nextFollowUp: nextFollowUp,
    );
  }
}

// ─── Vitals Log Reading ─────────────────────────────────────────────────────

class VitalsRecord {
  final String id;
  final String patientId;
  final String patientName;
  final String patientPid;
  final String dateTime;
  final String bp;
  final int hr;
  final double temp;
  final int spo2;
  final int respRate;
  final String recordedBy;
  final String? notes;

  const VitalsRecord({
    required this.id,
    required this.patientId,
    required this.patientName,
    required this.patientPid,
    required this.dateTime,
    required this.bp,
    required this.hr,
    required this.temp,
    required this.spo2,
    this.respRate = 18,
    required this.recordedBy,
    this.notes,
  });
}

// ─── Medication Administration Record ───────────────────────────────────────

enum MedStatus { administered, pending, dueSoon, missed, refillDue }

class NurseMedication {
  final String id;
  final String patientId;
  final String patientName;
  final String patientPid;
  final String patientAvatar;
  final int age;
  final String gender;
  final String room;
  final String department;
  final String medicationName;
  final String condition;
  final String dose;
  final String route; // Oral, Subcutaneous, Intravenous, etc.
  final String schedule; // BID, TID, QID, Daily, PRN
  final String nextDue;
  final MedStatus status;
  final String prescribingDoctor;
  final String instructions;
  final String? lastAdministered;
  final String? sideEffects;

  const NurseMedication({
    required this.id,
    required this.patientId,
    required this.patientName,
    required this.patientPid,
    required this.patientAvatar,
    required this.age,
    required this.gender,
    required this.room,
    required this.department,
    required this.medicationName,
    required this.condition,
    required this.dose,
    required this.route,
    required this.schedule,
    required this.nextDue,
    required this.status,
    required this.prescribingDoctor,
    required this.instructions,
    this.lastAdministered,
    this.sideEffects,
  });

  NurseMedication copyWith({
    MedStatus? status,
    String? lastAdministered,
    String? nextDue,
  }) {
    return NurseMedication(
      id: id,
      patientId: patientId,
      patientName: patientName,
      patientPid: patientPid,
      patientAvatar: patientAvatar,
      age: age,
      gender: gender,
      room: room,
      department: department,
      medicationName: medicationName,
      condition: condition,
      dose: dose,
      route: route,
      schedule: schedule,
      nextDue: nextDue ?? this.nextDue,
      status: status ?? this.status,
      prescribingDoctor: prescribingDoctor,
      instructions: instructions,
      lastAdministered: lastAdministered ?? this.lastAdministered,
      sideEffects: sideEffects,
    );
  }
}

// ─── Lab Sample Collection ──────────────────────────────────────────────────

enum SamplePriority { urgent, high, normal }
enum SampleStatus { pending, collected, inLab, completed }

class NurseLabSample {
  final String id;
  final String sampleId;
  final String patientId;
  final String patientName;
  final String patientPid;
  final String patientAvatar;
  final String room;
  final String department;
  final String testName;
  final String sampleType; // Blood, Urine, Stool, Swab, Sputum
  final SamplePriority priority;
  final String collectionTime;
  final SampleStatus status;
  final String doctor;
  final String? instructions;
  final String? collectedAt;
  final String? deliveredAt;

  const NurseLabSample({
    required this.id,
    required this.sampleId,
    required this.patientId,
    required this.patientName,
    required this.patientPid,
    required this.patientAvatar,
    required this.room,
    required this.department,
    required this.testName,
    required this.sampleType,
    required this.priority,
    required this.collectionTime,
    required this.status,
    required this.doctor,
    this.instructions,
    this.collectedAt,
    this.deliveredAt,
  });

  NurseLabSample copyWith({
    SampleStatus? status,
    String? collectedAt,
    String? deliveredAt,
  }) {
    return NurseLabSample(
      id: id,
      sampleId: sampleId,
      patientId: patientId,
      patientName: patientName,
      patientPid: patientPid,
      patientAvatar: patientAvatar,
      room: room,
      department: department,
      testName: testName,
      sampleType: sampleType,
      priority: priority,
      collectionTime: collectionTime,
      status: status ?? this.status,
      doctor: doctor,
      instructions: instructions,
      collectedAt: collectedAt ?? this.collectedAt,
      deliveredAt: deliveredAt ?? this.deliveredAt,
    );
  }
}

// ─── Nursing Tasks ──────────────────────────────────────────────────────────

enum TaskPriority { high, medium, low }
enum TaskStatus { pending, inProgress, scheduled, completed }

class NursingTask {
  final String id;
  final String patientId;
  final String patientName;
  final String patientPid;
  final String room;
  final String title;
  final String? details;
  final String type; // Medication, Vital Signs, Wound Care, Lab Sample, Education
  final TaskPriority priority;
  final String dueTime;
  final String dueDate;
  final TaskStatus status;
  final String? completedAt;

  const NursingTask({
    required this.id,
    required this.patientId,
    required this.patientName,
    required this.patientPid,
    required this.room,
    required this.title,
    this.details,
    required this.type,
    required this.priority,
    required this.dueTime,
    required this.dueDate,
    required this.status,
    this.completedAt,
  });

  NursingTask copyWith({
    TaskStatus? status,
    String? completedAt,
  }) {
    return NursingTask(
      id: id,
      patientId: patientId,
      patientName: patientName,
      patientPid: patientPid,
      room: room,
      title: title,
      details: details,
      type: type,
      priority: priority,
      dueTime: dueTime,
      dueDate: dueDate,
      status: status ?? this.status,
      completedAt: completedAt ?? this.completedAt,
    );
  }
}

// ─── Appointments / Ward Schedule ───────────────────────────────────────────

class NurseAppointment {
  final String id;
  final String patientId;
  final String patientName;
  final String patientPid;
  final String avatar;
  final int age;
  final String gender;
  final String department;
  final String reason;
  final String appointmentTime;
  final String date;
  final String status;
  final String doctor;

  const NurseAppointment({
    required this.id,
    required this.patientId,
    required this.patientName,
    required this.patientPid,
    required this.avatar,
    required this.age,
    required this.gender,
    required this.department,
    required this.reason,
    required this.appointmentTime,
    required this.date,
    required this.status,
    required this.doctor,
  });
}

// ─── Communication / Messages ───────────────────────────────────────────────

class NurseConversation {
  final String id;
  final String name;
  final String role;
  final String category; // staff, patient
  final String avatar;
  final bool isOnline;
  final String lastMessage;
  final String time;
  final int unreadCount;
  final String? pid;

  const NurseConversation({
    required this.id,
    required this.name,
    required this.role,
    required this.category,
    required this.avatar,
    this.isOnline = false,
    required this.lastMessage,
    required this.time,
    this.unreadCount = 0,
    this.pid,
  });

  String get initials {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }
}

class NurseChatMessage {
  final String id;
  final String conversationId;
  final String sender; // 'nurse' or 'other'
  final String senderName;
  final String text;
  final String time;
  final bool read;

  const NurseChatMessage({
    required this.id,
    required this.conversationId,
    required this.sender,
    required this.senderName,
    required this.text,
    required this.time,
    this.read = true,
  });
}

// ─── Activity Log ───────────────────────────────────────────────────────────

class NurseActivityLog {
  final String id;
  final String title;
  final String time;
  final String description;
  final String type; // profile, task, message, medication, login

  const NurseActivityLog({
    required this.id,
    required this.title,
    required this.time,
    required this.description,
    required this.type,
  });
}
