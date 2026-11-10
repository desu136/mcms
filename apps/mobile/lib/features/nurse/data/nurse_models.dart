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

  factory NursePatient.fromDto(Map<String, dynamic> json) {
    final rawName = json['fullName'] as String? ??
        '${json['firstName'] ?? ''} ${json['lastName'] ?? ''}'.trim();
    final name = rawName.isNotEmpty ? rawName : 'Patient';
    final rawId = json['id'] as String? ?? '';
    final pid = json['pid'] as String? ??
        (rawId.isNotEmpty ? 'PID-${rawId.substring(0, rawId.length > 6 ? 6 : rawId.length)}' : 'PID-000000');
    final rawDob = json['dateOfBirth'] as String?;
    int age = 30;
    if (rawDob != null) {
      try {
        final dob = DateTime.parse(rawDob);
        age = DateTime.now().year - dob.year;
      } catch (_) {}
    }

    final gender = (json['gender'] as String? ?? 'Other').toUpperCase() == 'MALE'
        ? 'Male'
        : (json['gender'] as String? ?? 'Other').toUpperCase() == 'FEMALE'
            ? 'Female'
            : 'Other';

    return NursePatient(
      id: rawId,
      pid: pid,
      name: name,
      age: age,
      gender: gender,
      avatar:
          'https://ui-avatars.com/api/?name=${Uri.encodeComponent(name)}&size=160&background=dbeafe&color=1e40af',
      phone: json['phoneNumber'] as String? ?? '—',
      email: json['email'] as String? ?? '—',
      address: json['address'] as String? ?? 'Addis Ababa',
      room: json['roomNumber'] as String? ?? 'Ward 3A',
      bed: json['bedNumber'] as String? ?? 'Bed 01',
      department: json['department'] as String? ?? 'Cardiology & OPD',
      visitReason: json['visitReason'] as String? ?? 'Clinical Inpatient Care',
      status: PatientWardStatus.inWard,
      vitalsStatus: VitalsCondition.normal,
      vitals: const PatientVitals(bp: '120/80', hr: 75, temp: 36.8, spo2: 98),
      doctor: json['doctorName'] as String? ?? 'Dr. Fitsum Alemu',
      admissionDate: json['createdAt'] != null
          ? (json['createdAt'] as String).split('T').first
          : 'Today',
      nextFollowUp: 'Tomorrow, 09:00 AM',
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

  factory VitalsRecord.fromDto(Map<String, dynamic> json) {
    final systolic = json['systolic'] ?? json['bloodPressureSystolic'] ?? 120;
    final diastolic = json['diastolic'] ?? json['bloodPressureDiastolic'] ?? 80;
    final bp = '$systolic/$diastolic';
    final hr = (json['heartRate'] as num?)?.toInt() ?? (json['pulse'] as num?)?.toInt() ?? 75;
    final temp = (json['temperature'] as num?)?.toDouble() ?? 36.8;
    final spo2 = (json['oxygenSaturation'] as num?)?.toInt() ?? (json['spo2'] as num?)?.toInt() ?? 98;
    final respRate = (json['respiratoryRate'] as num?)?.toInt() ?? 18;

    return VitalsRecord(
      id: json['id'] as String? ?? '',
      patientId: json['patientId'] as String? ?? '',
      patientName: json['patientName'] as String? ?? 'Patient',
      patientPid: json['patientPid'] as String? ?? 'PID-000000',
      dateTime: json['recordedAt'] != null
          ? (json['recordedAt'] as String).replaceFirst('T', ' ').substring(0, 16)
          : 'Today',
      bp: bp,
      hr: hr,
      temp: temp,
      spo2: spo2,
      respRate: respRate,
      recordedBy: json['recordedBy'] as String? ?? 'Staff Nurse',
      notes: json['notes'] as String?,
    );
  }
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

  factory NurseMedication.fromDto(Map<String, dynamic> json) {
    final rawStatus = (json['status'] as String? ?? 'PENDING').toUpperCase();
    MedStatus status = MedStatus.pending;
    if (rawStatus == 'ADMINISTERED' || rawStatus == 'COMPLETED') {
      status = MedStatus.administered;
    } else if (rawStatus == 'DUE_SOON') {
      status = MedStatus.dueSoon;
    } else if (rawStatus == 'MISSED') {
      status = MedStatus.missed;
    }

    final pName = json['patientName'] as String? ?? 'Patient';

    return NurseMedication(
      id: json['id'] as String? ?? '',
      patientId: json['patientId'] as String? ?? '',
      patientName: pName,
      patientPid: json['patientPid'] as String? ?? 'PID-000000',
      patientAvatar:
          'https://ui-avatars.com/api/?name=${Uri.encodeComponent(pName)}&size=160&background=dbeafe&color=1e40af',
      age: (json['patientAge'] as num?)?.toInt() ?? 30,
      gender: json['patientGender'] as String? ?? 'Female',
      room: json['room'] as String? ?? 'Ward 3A',
      department: json['department'] as String? ?? 'Cardiology',
      medicationName: json['medicationName'] as String? ?? json['name'] as String? ?? 'Medication',
      condition: json['condition'] as String? ?? 'Inpatient Care',
      dose: json['dose'] as String? ?? json['dosage'] as String? ?? '1 dose',
      route: json['route'] as String? ?? 'Oral',
      schedule: json['schedule'] as String? ?? 'Daily',
      nextDue: json['nextDue'] as String? ?? 'Today 02:00 PM',
      status: status,
      prescribingDoctor: json['prescribingDoctor'] as String? ?? 'Dr. Fitsum Alemu',
      instructions: json['instructions'] as String? ?? 'Administer with water after meals',
      lastAdministered: json['lastAdministered'] as String?,
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

  factory NurseLabSample.fromDto(Map<String, dynamic> json) {
    final rawStatus = (json['status'] as String? ?? 'PENDING').toUpperCase();
    SampleStatus status = SampleStatus.pending;
    if (rawStatus == 'COLLECTED') {
      status = SampleStatus.collected;
    } else if (rawStatus == 'IN_LAB' || rawStatus == 'PROCESSING') {
      status = SampleStatus.inLab;
    } else if (rawStatus == 'COMPLETED') {
      status = SampleStatus.completed;
    }

    final rawPriority = (json['priority'] as String? ?? 'NORMAL').toUpperCase();
    SamplePriority priority = SamplePriority.normal;
    if (rawPriority == 'URGENT') {
      priority = SamplePriority.urgent;
    } else if (rawPriority == 'HIGH') {
      priority = SamplePriority.high;
    }

    final pName = json['patientName'] as String? ?? 'Patient';

    return NurseLabSample(
      id: json['id'] as String? ?? '',
      sampleId: json['sampleId'] as String? ?? 'SMP-${(json['id'] ?? '').toString().substring(0, 6)}',
      patientId: json['patientId'] as String? ?? '',
      patientName: pName,
      patientPid: json['patientPid'] as String? ?? 'PID-000000',
      patientAvatar:
          'https://ui-avatars.com/api/?name=${Uri.encodeComponent(pName)}&size=160&background=dbeafe&color=1e40af',
      room: json['room'] as String? ?? 'Ward 3A',
      department: json['department'] as String? ?? 'Laboratory',
      testName: json['testName'] as String? ?? 'Lab Sample Test',
      sampleType: json['sampleType'] as String? ?? 'Blood',
      priority: priority,
      collectionTime: json['collectionTime'] as String? ?? 'Today 10:00 AM',
      status: status,
      doctor: json['doctor'] as String? ?? 'Dr. Fitsum Alemu',
      instructions: json['instructions'] as String?,
      collectedAt: json['collectedAt'] as String?,
      deliveredAt: json['deliveredAt'] as String?,
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

  factory NursingTask.fromDto(Map<String, dynamic> json) {
    final rawStatus = (json['status'] as String? ?? 'PENDING').toUpperCase();
    TaskStatus status = TaskStatus.pending;
    if (rawStatus == 'IN_PROGRESS') {
      status = TaskStatus.inProgress;
    } else if (rawStatus == 'SCHEDULED') {
      status = TaskStatus.scheduled;
    } else if (rawStatus == 'COMPLETED') {
      status = TaskStatus.completed;
    }

    final rawPriority = (json['priority'] as String? ?? 'MEDIUM').toUpperCase();
    TaskPriority priority = TaskPriority.medium;
    if (rawPriority == 'HIGH' || rawPriority == 'URGENT') {
      priority = TaskPriority.high;
    } else if (rawPriority == 'LOW') {
      priority = TaskPriority.low;
    }

    return NursingTask(
      id: json['id'] as String? ?? '',
      patientId: json['patientId'] as String? ?? '',
      patientName: json['patientName'] as String? ?? 'Patient',
      patientPid: json['patientPid'] as String? ?? 'PID-000000',
      room: json['room'] as String? ?? 'Ward 3A',
      title: json['title'] as String? ?? json['task'] as String? ?? 'Nursing Care Task',
      details: json['description'] as String? ?? json['details'] as String?,
      type: json['category'] as String? ?? json['type'] as String? ?? 'General Care',
      priority: priority,
      dueTime: json['dueTime'] as String? ?? '12:00 PM',
      dueDate: json['dueDate'] as String? ?? 'Today',
      status: status,
      completedAt: json['completedAt'] as String?,
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
