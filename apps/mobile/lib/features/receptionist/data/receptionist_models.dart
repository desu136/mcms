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
