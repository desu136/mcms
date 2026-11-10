// ─── Receptionist Models ───────────────────────────────────────────────────────

class ReceptionistProfile {
  final String name;
  final String role;
  final String department;
  final String email;
  final String phone;
  final String hospital;
  final int unreadNotifications;

  const ReceptionistProfile({
    required this.name,
    required this.role,
    required this.department,
    required this.email,
    required this.phone,
    required this.hospital,
    this.unreadNotifications = 0,
  });
}

// ─── Patient Registration ─────────────────────────────────────────────────────

class RegistrationPatient {
  final String id;
  final String pid;
  final String name;
  final int age;
  final String gender;
  final String phone;
  final String email;
  final String address;
  final String bloodType;
  final String emergencyContact;
  final String emergencyPhone;
  final String registrationDate;
  final String status; // 'Active', 'Inactive', 'Pending'
  final List<String> conditions;

  const RegistrationPatient({
    required this.id,
    required this.pid,
    required this.name,
    required this.age,
    required this.gender,
    required this.phone,
    required this.email,
    required this.address,
    required this.bloodType,
    required this.emergencyContact,
    required this.emergencyPhone,
    required this.registrationDate,
    required this.status,
    this.conditions = const [],
  });

  factory RegistrationPatient.fromDto(Map<String, dynamic> json) {
    final dName = json['fullName'] as String? ??
        '${json['firstName'] ?? ''} ${json['lastName'] ?? ''}'.trim();
    int age = 30;
    final dobStr = json['dateOfBirth'] as String?;
    if (dobStr != null && dobStr.isNotEmpty) {
      final dob = DateTime.tryParse(dobStr);
      if (dob != null) {
        age = (DateTime.now().difference(dob).inDays / 365.25).floor();
      }
    }

    String regDate = 'Recent';
    final createdStr = json['createdAt'] as String?;
    if (createdStr != null && createdStr.isNotEmpty) {
      final dt = DateTime.tryParse(createdStr);
      if (dt != null) {
        regDate = '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
      }
    }

    return RegistrationPatient(
      id: json['id'] as String? ?? '',
      pid: json['pid'] as String? ?? '',
      name: dName.isNotEmpty ? dName : 'Patient',
      age: age > 0 ? age : 30,
      gender: json['gender'] as String? ?? 'Other',
      phone: json['phoneNumber'] as String? ?? '—',
      email: json['email'] as String? ?? '—',
      address: json['address'] as String? ?? '—',
      bloodType: 'O+',
      emergencyContact: 'Family',
      emergencyPhone: '—',
      registrationDate: regDate,
      status: json['status'] == 'ACTIVE' ? 'Active' : (json['status'] as String? ?? 'Active'),
      conditions: const [],
    );
  }

  String get initials {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }
}

// ─── Appointment ──────────────────────────────────────────────────────────────

enum ReceptionistAppointmentStatus { confirmed, pending, cancelled, completed, inProgress }

class ReceptionistAppointment {
  final String id;
  final String patientName;
  final String patientId;
  final String pid;
  final String doctorName;
  final String department;
  final String date;
  final String time;
  final String reason;
  final ReceptionistAppointmentStatus status;
  final String? notes;

  const ReceptionistAppointment({
    required this.id,
    required this.patientName,
    required this.patientId,
    required this.pid,
    required this.doctorName,
    required this.department,
    required this.date,
    required this.time,
    required this.reason,
    required this.status,
    this.notes,
  });

  factory ReceptionistAppointment.fromDto(Map<String, dynamic> json) {
    String dateStr = 'Today';
    String timeStr = '09:00 AM';
    final dtRaw = json['appointmentDate'] as String?;
    if (dtRaw != null && dtRaw.isNotEmpty) {
      final dt = DateTime.tryParse(dtRaw);
      if (dt != null) {
        dateStr = '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
        final hour = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
        final ampm = dt.hour >= 12 ? 'PM' : 'AM';
        timeStr = '${hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')} $ampm';
      }
    }

    final rawStatus = (json['status'] as String? ?? 'CONFIRMED').toUpperCase();
    ReceptionistAppointmentStatus status = ReceptionistAppointmentStatus.confirmed;
    if (rawStatus == 'CANCELLED') {
      status = ReceptionistAppointmentStatus.cancelled;
    } else if (rawStatus == 'COMPLETED') {
      status = ReceptionistAppointmentStatus.completed;
    } else if (rawStatus == 'IN_PROGRESS' || rawStatus == 'IN_CONSULTATION') {
      status = ReceptionistAppointmentStatus.inProgress;
    } else if (rawStatus == 'PENDING' || rawStatus == 'SCHEDULED') {
      status = ReceptionistAppointmentStatus.pending;
    }

    return ReceptionistAppointment(
      id: json['id'] as String? ?? '',
      patientName: json['patientName'] as String? ?? 'Patient',
      patientId: json['patientId'] as String? ?? '',
      pid: json['patientPid'] as String? ?? '',
      doctorName: json['doctorName'] as String? ?? 'Attending Doctor',
      department: json['departmentName'] as String? ?? 'General Practice',
      date: dateStr,
      time: timeStr,
      reason: json['reason'] as String? ?? 'Consultation',
      status: status,
      notes: json['notes'] as String?,
    );
  }

  String get statusLabel {
    switch (status) {
      case ReceptionistAppointmentStatus.confirmed:
        return 'Confirmed';
      case ReceptionistAppointmentStatus.pending:
        return 'Pending';
      case ReceptionistAppointmentStatus.cancelled:
        return 'Cancelled';
      case ReceptionistAppointmentStatus.completed:
        return 'Completed';
      case ReceptionistAppointmentStatus.inProgress:
        return 'In Progress';
    }
  }

  String get patientInitials {
    final parts = patientName.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    }
    return patientName.isNotEmpty ? patientName[0].toUpperCase() : '?';
  }
}

// ─── Queue Entry ──────────────────────────────────────────────────────────────

enum QueueStatus { waiting, called, inConsultation, done, noShow }

class QueueEntry {
  final String id;
  final int queueNumber;
  final String patientName;
  final String patientId;
  final String pid;
  final String reason;
  final String department;
  final String doctorName;
  final String checkinTime;
  final String estimatedWait; // e.g. '15 min'
  final QueueStatus status;
  final String priority; // 'Normal', 'Urgent', 'Emergency'

  const QueueEntry({
    required this.id,
    required this.queueNumber,
    required this.patientName,
    required this.patientId,
    required this.pid,
    required this.reason,
    required this.department,
    required this.doctorName,
    required this.checkinTime,
    required this.estimatedWait,
    required this.status,
    required this.priority,
  });

  factory QueueEntry.fromDto(Map<String, dynamic> json) {
    int qNum = 1;
    if (json['queueNumber'] is int) {
      qNum = json['queueNumber'] as int;
    } else if (json['queueNumber'] != null) {
      qNum = int.tryParse(json['queueNumber'].toString()) ?? 1;
    }

    String timeStr = 'Just now';
    final rawTime = json['checkedInAt'] as String? ?? json['createdAt'] as String?;
    if (rawTime != null && rawTime.isNotEmpty) {
      final dt = DateTime.tryParse(rawTime);
      if (dt != null) {
        final hour = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
        final ampm = dt.hour >= 12 ? 'PM' : 'AM';
        timeStr = '${hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')} $ampm';
      }
    }

    final rawStatus = (json['status'] as String? ?? 'WAITING').toUpperCase();
    QueueStatus status = QueueStatus.waiting;
    if (rawStatus == 'CALLED') {
      status = QueueStatus.called;
    } else if (rawStatus == 'IN_CONSULTATION' || rawStatus == 'IN_PROGRESS') {
      status = QueueStatus.inConsultation;
    } else if (rawStatus == 'COMPLETED' || rawStatus == 'DONE') {
      status = QueueStatus.done;
    } else if (rawStatus == 'NO_SHOW') {
      status = QueueStatus.noShow;
    }

    return QueueEntry(
      id: json['id'] as String? ?? '',
      queueNumber: qNum,
      patientName: json['patientName'] as String? ?? 'Patient',
      patientId: json['patientId'] as String? ?? '',
      pid: json['patientPid'] as String? ?? '',
      reason: json['chiefComplaint'] as String? ?? json['reason'] as String? ?? 'Consultation',
      department: json['departmentName'] as String? ?? 'General Practice',
      doctorName: json['doctorName'] as String? ?? 'Attending Doctor',
      checkinTime: timeStr,
      estimatedWait: json['estimatedWait'] as String? ?? '10 min',
      status: status,
      priority: json['priority'] as String? ?? 'Normal',
    );
  }

  String get statusLabel {
    switch (status) {
      case QueueStatus.waiting:
        return 'Waiting';
      case QueueStatus.called:
        return 'Called';
      case QueueStatus.inConsultation:
        return 'In Consultation';
      case QueueStatus.done:
        return 'Done';
      case QueueStatus.noShow:
        return 'No Show';
    }
  }

  String get patientInitials {
    final parts = patientName.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    }
    return patientName.isNotEmpty ? patientName[0].toUpperCase() : '?';
  }
}

// ─── Billing ──────────────────────────────────────────────────────────────────

enum BillingStatus { paid, pending, overdue, partiallyPaid }

class BillingItem {
  final String id;
  final String invoiceId;
  final String patientName;
  final String patientId;
  final String pid;
  final String description;
  final double amount;
  final double amountPaid;
  final BillingStatus status;
  final String date;
  final String dueDate;
  final String paymentMethod; // 'Cash', 'Card', 'Insurance', 'Pending'

  const BillingItem({
    required this.id,
    required this.invoiceId,
    required this.patientName,
    required this.patientId,
    required this.pid,
    required this.description,
    required this.amount,
    required this.amountPaid,
    required this.status,
    required this.date,
    required this.dueDate,
    required this.paymentMethod,
  });

  double get balance => amount - amountPaid;

  String get statusLabel {
    switch (status) {
      case BillingStatus.paid:
        return 'Paid';
      case BillingStatus.pending:
        return 'Pending';
      case BillingStatus.overdue:
        return 'Overdue';
      case BillingStatus.partiallyPaid:
        return 'Partial';
    }
  }

  String get patientInitials {
    final parts = patientName.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    }
    return patientName.isNotEmpty ? patientName[0].toUpperCase() : '?';
  }
}

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────

class ReceptionistKpis {
  final int todayPatients;
  final int pendingQueue;
  final int todayAppointments;
  final int pendingBills;
  final double collectedToday;
  final int newRegistrations;

  const ReceptionistKpis({
    required this.todayPatients,
    required this.pendingQueue,
    required this.todayAppointments,
    required this.pendingBills,
    required this.collectedToday,
    required this.newRegistrations,
  });
}
