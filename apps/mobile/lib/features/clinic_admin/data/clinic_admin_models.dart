// ─── Clinic Admin Models ───────────────────────────────────────────────────────

class ClinicAdminProfile {
  final String id;
  final String name;
  final String role;
  final String email;
  final String phone;
  final String clinicName;
  final String clinicCode;
  final String activeBranch;
  final int unreadNotifications;

  const ClinicAdminProfile({
    required this.id,
    required this.name,
    required this.role,
    required this.email,
    required this.phone,
    required this.clinicName,
    required this.clinicCode,
    required this.activeBranch,
    this.unreadNotifications = 0,
  });

  static const empty = ClinicAdminProfile(
    id: '',
    name: 'Clinic Admin',
    role: 'Administrator',
    email: '',
    phone: '',
    clinicName: 'Medical Center',
    clinicCode: '',
    activeBranch: 'Main Facility',
    unreadNotifications: 0,
  );

  String get initials {
    final parts = name.trim().split(' ').where((p) => p.isNotEmpty).toList();
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    }
    return parts.isNotEmpty ? parts.first[0].toUpperCase() : 'CA';
  }
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

class ClinicDashboardStats {
  final int totalPatients;
  final String patientTrend;
  final int todayAppointments;
  final int completedAppointments;
  final int pendingAppointments;
  final int activeDoctors;
  final int totalDoctors;
  final int activeStaff;
  final int waitingQueue;
  final double todayRevenue;
  final int pendingInvoices;

  const ClinicDashboardStats({
    required this.totalPatients,
    required this.patientTrend,
    required this.todayAppointments,
    required this.completedAppointments,
    required this.pendingAppointments,
    required this.activeDoctors,
    required this.totalDoctors,
    required this.activeStaff,
    required this.waitingQueue,
    required this.todayRevenue,
    required this.pendingInvoices,
  });

  static const empty = ClinicDashboardStats(
    totalPatients: 0,
    patientTrend: '0%',
    todayAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    activeDoctors: 0,
    totalDoctors: 0,
    activeStaff: 0,
    waitingQueue: 0,
    todayRevenue: 0.0,
    pendingInvoices: 0,
  );

  factory ClinicDashboardStats.fromJson(Map<String, dynamic> json) {
    final todayAppts = json['todayAppointmentsCount'] as int? ?? 0;
    final totalDocs = json['totalDoctors'] as int? ?? 0;
    final totalDepts = json['totalDepartments'] as int? ?? 0;
    final totalPts = json['totalPatients'] as int? ?? 0;
    final queue = json['activeQueueCount'] as int? ?? 0;

    return ClinicDashboardStats(
      totalPatients: totalPts,
      patientTrend: 'Live',
      todayAppointments: todayAppts,
      completedAppointments: 0,
      pendingAppointments: todayAppts,
      activeDoctors: totalDocs,
      totalDoctors: totalDocs,
      activeStaff: totalDocs + totalDepts,
      waitingQueue: queue,
      todayRevenue: 0.0,
      pendingInvoices: 0,
    );
  }
}

// ─── Branch Model ─────────────────────────────────────────────────────────────

class ClinicBranchItem {
  final String id;
  final String name;
  final String code;
  final String address;
  final String phone;
  final String email;
  final bool isMainBranch;
  final String status; // 'Active', 'Maintenance', 'Inactive'
  final String managerName;
  final int staffCount;
  final int roomCount;
  final String operatingHours;

  const ClinicBranchItem({
    required this.id,
    required this.name,
    required this.code,
    required this.address,
    required this.phone,
    required this.email,
    required this.isMainBranch,
    required this.status,
    required this.managerName,
    required this.staffCount,
    required this.roomCount,
    required this.operatingHours,
  });

  factory ClinicBranchItem.fromJson(Map<String, dynamic> json) {
    final mgr = json['manager'] as Map<String, dynamic>?;
    final mgrName = mgr?['displayName'] as String? ??
        '${mgr?['firstName'] ?? ''} ${mgr?['lastName'] ?? ''}'.trim();

    return ClinicBranchItem(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      code: json['code'] as String? ?? '',
      address: json['address'] as String? ?? 'N/A',
      phone: json['phone'] as String? ?? json['phoneNumber'] as String? ?? 'N/A',
      email: json['email'] as String? ?? '',
      isMainBranch: json['isMainBranch'] as bool? ?? false,
      status: (json['status'] as String? ?? 'ACTIVE').toUpperCase() == 'ACTIVE' ? 'Active' : 'Inactive',
      managerName: mgrName.isNotEmpty ? mgrName : 'Facility Manager',
      staffCount: json['staffCount'] as int? ?? 0,
      roomCount: json['roomCount'] as int? ?? 0,
      operatingHours: json['operatingHours'] as String? ?? 'Standard Hours',
    );
  }

  ClinicBranchItem copyWith({
    String? id,
    String? name,
    String? code,
    String? address,
    String? phone,
    String? email,
    bool? isMainBranch,
    String? status,
    String? managerName,
    int? staffCount,
    int? roomCount,
    String? operatingHours,
  }) {
    return ClinicBranchItem(
      id: id ?? this.id,
      name: name ?? this.name,
      code: code ?? this.code,
      address: address ?? this.address,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      isMainBranch: isMainBranch ?? this.isMainBranch,
      status: status ?? this.status,
      managerName: managerName ?? this.managerName,
      staffCount: staffCount ?? this.staffCount,
      roomCount: roomCount ?? this.roomCount,
      operatingHours: operatingHours ?? this.operatingHours,
    );
  }
}

// ─── Department Model ─────────────────────────────────────────────────────────

class ClinicDepartmentItem {
  final String id;
  final String name;
  final String code;
  final String headDoctor;
  final int roomCount;
  final int staffCount;
  final String status; // 'Active', 'Inactive'
  final String branchName;
  final String description;

  const ClinicDepartmentItem({
    required this.id,
    required this.name,
    required this.code,
    required this.headDoctor,
    required this.roomCount,
    required this.staffCount,
    required this.status,
    required this.branchName,
    required this.description,
  });

  factory ClinicDepartmentItem.fromJson(Map<String, dynamic> json) {
    return ClinicDepartmentItem(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      code: json['code'] as String? ?? '',
      headDoctor: json['headDoctor'] as String? ?? 'Lead Physician',
      roomCount: json['roomCount'] as int? ?? (json['rooms'] as List?)?.length ?? 0,
      staffCount: json['doctorCount'] as int? ?? 0,
      status: (json['isActive'] as bool? ?? true) ? 'Active' : 'Inactive',
      branchName: (json['branch'] as Map<String, dynamic>?)?['name'] as String? ?? 'Main Branch',
      description: json['description'] as String? ?? 'Clinical Department',
    );
  }

  ClinicDepartmentItem copyWith({
    String? id,
    String? name,
    String? code,
    String? headDoctor,
    int? roomCount,
    int? staffCount,
    String? status,
    String? branchName,
    String? description,
  }) {
    return ClinicDepartmentItem(
      id: id ?? this.id,
      name: name ?? this.name,
      code: code ?? this.code,
      headDoctor: headDoctor ?? this.headDoctor,
      roomCount: roomCount ?? this.roomCount,
      staffCount: staffCount ?? this.staffCount,
      status: status ?? this.status,
      branchName: branchName ?? this.branchName,
      description: description ?? this.description,
    );
  }
}

// ─── Staff Member Model ───────────────────────────────────────────────────────

class ClinicStaffMember {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String role; // 'Doctor', 'Nurse', 'Receptionist', 'Pharmacist', 'Lab Tech', 'Administrator'
  final String department;
  final String specialty;
  final String status; // 'Active', 'On Leave', 'Off Duty', 'Inactive'
  final String licenseNumber;
  final String joinedDate;
  final String shift; // 'Morning', 'Evening', 'Night', 'Full Day'

  const ClinicStaffMember({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.role,
    required this.department,
    required this.specialty,
    required this.status,
    required this.licenseNumber,
    required this.joinedDate,
    required this.shift,
  });

  factory ClinicStaffMember.fromJson(Map<String, dynamic> json) {
    final dName = json['displayName'] as String? ??
        '${json['firstName'] ?? ''} ${json['lastName'] ?? ''}'.trim();
    final roleRaw = json['role'] as String? ??
        ((json['roles'] as List?)?.isNotEmpty == true ? (json['roles'] as List).first.toString() : 'Staff');

    final roleFormatted = _formatRole(roleRaw);

    return ClinicStaffMember(
      id: json['id'] as String? ?? '',
      name: dName.isNotEmpty ? dName : (json['email'] as String? ?? 'Staff'),
      email: json['email'] as String? ?? '',
      phone: json['phoneNumber'] as String? ?? 'N/A',
      role: roleFormatted,
      department: (json['department'] as Map<String, dynamic>?)?['name'] as String? ??
          json['departmentName'] as String? ?? 'General Department',
      specialty: roleFormatted,
      status: (json['status'] as String? ?? 'ACTIVE').toUpperCase() == 'ACTIVE' ? 'Active' : 'Inactive',
      licenseNumber: json['id'] != null && (json['id'] as String).length >= 6
          ? 'LIC-${(json['id'] as String).substring(0, 6).toUpperCase()}'
          : 'LIC-ACTIVE',
      joinedDate: 'Staff Directory',
      shift: 'Standard Shift',
    );
  }

  static String _formatRole(String raw) {
    final upper = raw.toUpperCase();
    if (upper.contains('DOCTOR')) return 'Doctor';
    if (upper.contains('NURSE')) return 'Nurse';
    if (upper.contains('RECEPTION')) return 'Receptionist';
    if (upper.contains('PHARM')) return 'Pharmacist';
    if (upper.contains('LAB')) return 'Lab Tech';
    if (upper.contains('ADMIN')) return 'Administrator';
    return raw;
  }

  bool get isDoctor => role.toLowerCase() == 'doctor';

  String get initials {
    final parts = name.trim().split(' ').where((p) => p.isNotEmpty).toList();
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    }
    return parts.isNotEmpty ? parts.first[0].toUpperCase() : '?';
  }

  ClinicStaffMember copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    String? role,
    String? department,
    String? specialty,
    String? status,
    String? licenseNumber,
    String? joinedDate,
    String? shift,
  }) {
    return ClinicStaffMember(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      department: department ?? this.department,
      specialty: specialty ?? this.specialty,
      status: status ?? this.status,
      licenseNumber: licenseNumber ?? this.licenseNumber,
      joinedDate: joinedDate ?? this.joinedDate,
      shift: shift ?? this.shift,
    );
  }
}

// ─── Appointment Model ────────────────────────────────────────────────────────

class ClinicAppointmentItem {
  final String id;
  final String patientName;
  final String patientPid;
  final String doctorName;
  final String department;
  final String date;
  final String time;
  final String type; // 'In-Person', 'Follow-up', 'Consultation', 'Emergency'
  final String status; // 'Confirmed', 'In Progress', 'Completed', 'Cancelled'
  final String roomNumber;

  const ClinicAppointmentItem({
    required this.id,
    required this.patientName,
    required this.patientPid,
    required this.doctorName,
    required this.department,
    required this.date,
    required this.time,
    required this.type,
    required this.status,
    required this.roomNumber,
  });

  factory ClinicAppointmentItem.fromJson(Map<String, dynamic> json) {
    final patient = json['patient'] as Map<String, dynamic>?;
    final doctor = json['doctor'] as Map<String, dynamic>?;
    final dept = json['department'] as Map<String, dynamic>?;

    final dateStr = json['appointmentDate'] as String? ?? '';
    String displayDate = 'Today';
    String displayTime = json['timeSlot'] as String? ?? 'Scheduled';
    if (dateStr.isNotEmpty) {
      try {
        final parsed = DateTime.parse(dateStr);
        displayDate = '${parsed.year}-${parsed.month.toString().padLeft(2, '0')}-${parsed.day.toString().padLeft(2, '0')}';
        if (displayTime == 'Scheduled') {
          displayTime = '${parsed.hour.toString().padLeft(2, '0')}:${parsed.minute.toString().padLeft(2, '0')}';
        }
      } catch (_) {}
    }

    return ClinicAppointmentItem(
      id: json['id'] as String? ?? '',
      patientName: patient?['fullName'] as String? ?? json['patientName'] as String? ?? 'Patient',
      patientPid: patient?['pid'] as String? ?? json['patientPid'] as String? ?? 'N/A',
      doctorName: doctor?['displayName'] as String? ?? json['doctorName'] as String? ?? 'Doctor',
      department: dept?['name'] as String? ?? json['departmentName'] as String? ?? 'General Department',
      date: displayDate,
      time: displayTime,
      type: json['type'] as String? ?? 'Consultation',
      status: _formatStatus(json['status'] as String? ?? 'CONFIRMED'),
      roomNumber: json['roomNumber'] as String? ?? 'Consultation Room',
    );
  }

  static String _formatStatus(String s) {
    final upper = s.toUpperCase();
    if (upper == 'COMPLETED') return 'Completed';
    if (upper == 'IN_CONSULTATION' || upper == 'IN PROGRESS') return 'In Progress';
    if (upper == 'CANCELLED') return 'Cancelled';
    return 'Confirmed';
  }
}

// ─── Activity Log Model ───────────────────────────────────────────────────────

class ClinicActivityItem {
  final String id;
  final String title;
  final String description;
  final String timeAgo;
  final String type; // 'patient', 'staff', 'billing', 'appointment'

  const ClinicActivityItem({
    required this.id,
    required this.title,
    required this.description,
    required this.timeAgo,
    required this.type,
  });

  factory ClinicActivityItem.fromJson(Map<String, dynamic> json) {
    return ClinicActivityItem(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? 'Audit Event',
      description: json['description'] as String? ?? '',
      timeAgo: json['timeAgo'] as String? ?? 'Just now',
      type: json['type'] as String? ?? 'appointment',
    );
  }
}
