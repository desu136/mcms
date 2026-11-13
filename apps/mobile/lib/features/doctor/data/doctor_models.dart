class DoctorProfile {
  final String name;
  final String role;
  final String department;
  final String avatar;
  final String email;
  final String phone;
  final String hospital;
  final int unreadNotifications;
  final int unreadMessages;

  const DoctorProfile({
    required this.name,
    required this.role,
    required this.department,
    required this.avatar,
    required this.email,
    required this.phone,
    required this.hospital,
    this.unreadNotifications = 3,
    this.unreadMessages = 3,
  });
}

class PatientItem {
  final String id;
  final String name;
  final String pid;
  final int age;
  final String gender;
  final String phone;
  final String email;
  final String address;
  final String department;
  final String lastVisit;
  final String lastVisitReason;
  final String? nextAppointment;
  final String status;
  final String avatar;
  final int totalVisits;
  final List<String> conditions;

  const PatientItem({
    required this.id,
    required this.name,
    required this.pid,
    required this.age,
    required this.gender,
    required this.phone,
    required this.email,
    required this.address,
    required this.department,
    required this.lastVisit,
    required this.lastVisitReason,
    this.nextAppointment,
    required this.status,
    required this.avatar,
    required this.totalVisits,
    this.conditions = const [],
  });

  factory PatientItem.fromDto(Map<String, dynamic> json) {
    final rawName = json['fullName'] as String? ??
        '${json['firstName'] ?? ''} ${json['lastName'] ?? ''}'.trim();
    final name = rawName.isNotEmpty ? rawName : 'Unnamed Patient';
    final rawDob = json['dateOfBirth'] as String?;
    int age = 30;
    if (rawDob != null) {
      try {
        final dob = DateTime.parse(rawDob);
        age = DateTime.now().year - dob.year;
      } catch (_) {}
    }
    final rawId = json['id'] as String? ?? '';
    final pid = json['pid'] as String? ??
        (rawId.isNotEmpty ? 'PID-${rawId.substring(0, rawId.length > 6 ? 6 : rawId.length)}' : 'PID-000000');
    final gender = (json['gender'] as String? ?? 'Other').toUpperCase() == 'MALE'
        ? 'Male'
        : (json['gender'] as String? ?? 'Other').toUpperCase() == 'FEMALE'
            ? 'Female'
            : 'Other';

    return PatientItem(
      id: rawId,
      name: name,
      pid: pid,
      age: age,
      gender: gender,
      phone: json['phoneNumber'] as String? ?? '—',
      email: json['email'] as String? ?? '—',
      address: json['address'] as String? ?? 'Addis Ababa, Ethiopia',
      department: json['department'] as String? ?? 'General OPD',
      lastVisit: json['createdAt'] != null
          ? (json['createdAt'] as String).split('T').first
          : 'Today',
      lastVisitReason: 'Clinical Consultation',
      status: (json['status'] as String? ?? 'Active').toUpperCase() == 'INACTIVE'
          ? 'Inactive'
          : 'Active',
      avatar:
          'https://ui-avatars.com/api/?name=${Uri.encodeComponent(name)}&size=150&background=dbeafe&color=1e40af',
      totalVisits: (json['totalVisits'] as num?)?.toInt() ?? 1,
      conditions: (json['conditions'] as List<dynamic>?)
              ?.map((c) => c.toString())
              .toList() ??
          const [],
    );
  }
}

enum AppointmentStatus { completed, inProgress, upcoming, cancelled }

class AppointmentItem {
  final String id;
  final String time;
  final String date;
  final String patientName;
  final String patientId;
  final int age;
  final String gender;
  final String reason;
  final String department;
  final AppointmentStatus status;
  final String avatar;

  const AppointmentItem({
    required this.id,
    required this.time,
    required this.date,
    required this.patientName,
    required this.patientId,
    required this.age,
    required this.gender,
    required this.reason,
    required this.department,
    required this.status,
    required this.avatar,
  });

  factory AppointmentItem.fromDto(Map<String, dynamic> json) {
    final rawStatus = (json['status'] as String? ?? 'UPCOMING').toUpperCase();
    AppointmentStatus status = AppointmentStatus.upcoming;
    if (rawStatus == 'COMPLETED') {
      status = AppointmentStatus.completed;
    } else if (rawStatus == 'IN_PROGRESS' || rawStatus == 'CHECKED_IN') {
      status = AppointmentStatus.inProgress;
    } else if (rawStatus == 'CANCELLED') {
      status = AppointmentStatus.cancelled;
    }

    final pName = json['patientName'] as String? ?? 'Patient';
    final timeStr = json['startTime'] as String? ?? json['time'] as String? ?? '09:00 AM';
    final dateStr = json['appointmentDate'] as String? ?? json['date'] as String? ?? 'Today';

    return AppointmentItem(
      id: json['id'] as String? ?? '',
      time: timeStr,
      date: dateStr,
      patientName: pName,
      patientId: json['patientId'] as String? ?? '',
      age: (json['patientAge'] as num?)?.toInt() ?? 30,
      gender: json['patientGender'] as String? ?? 'Female',
      reason: json['reason'] as String? ?? json['type'] as String? ?? 'Consultation',
      department: json['branchName'] as String? ?? json['department'] as String? ?? 'General OPD',
      status: status,
      avatar:
          'https://ui-avatars.com/api/?name=${Uri.encodeComponent(pName)}&size=150&background=dbeafe&color=1e40af',
    );
  }

  String get statusLabel {
    switch (status) {
      case AppointmentStatus.completed:
        return 'Completed';
      case AppointmentStatus.inProgress:
        return 'In Progress';
      case AppointmentStatus.upcoming:
        return 'Upcoming';
      case AppointmentStatus.cancelled:
        return 'Cancelled';
    }
  }
}

class PrescriptionItem {
  final String id;
  final String prescriptionId;
  final String patientName;
  final String patientId;
  final String patientAvatar;
  final String medication;
  final String dosage;
  final String duration;
  final String prescribedDate;
  final String status; // 'Active', 'Completed', 'Pending Refill'
  final String department;

  const PrescriptionItem({
    required this.id,
    required this.prescriptionId,
    required this.patientName,
    required this.patientId,
    required this.patientAvatar,
    required this.medication,
    required this.dosage,
    required this.duration,
    required this.prescribedDate,
    required this.status,
    required this.department,
  });

  factory PrescriptionItem.fromDto(Map<String, dynamic> json) {
    final pName = json['patientName'] as String? ?? 'Patient';
    final rawMed = json['medication'] as String?;
    String medication = rawMed ?? '';
    if (medication.isEmpty && json['medications'] is List && (json['medications'] as List).isNotEmpty) {
      final firstMed = (json['medications'] as List).first;
      if (firstMed is Map) {
        medication = firstMed['name'] as String? ?? 'Medication';
      }
    }
    if (medication.isEmpty) medication = 'Prescribed Medication';

    return PrescriptionItem(
      id: json['id'] as String? ?? '',
      prescriptionId: json['prescriptionNumber'] as String? ??
          (json['id'] != null ? 'RX-${json['id'].toString().substring(0, 6)}' : 'RX-000000'),
      patientName: pName,
      patientId: json['patientId'] as String? ?? '',
      patientAvatar:
          'https://ui-avatars.com/api/?name=${Uri.encodeComponent(pName)}&size=150&background=dbeafe&color=1e40af',
      medication: medication,
      dosage: json['dosage'] as String? ?? '1 tablet daily',
      duration: json['duration'] as String? ?? '7 days',
      prescribedDate: json['createdAt'] != null
          ? (json['createdAt'] as String).split('T').first
          : 'Today',
      status: json['status'] as String? ?? 'Active',
      department: json['department'] as String? ?? 'Cardiology',
    );
  }
}

class LabResultItem {
  final String id;
  final String patientName;
  final String patientId;
  final String avatar;
  final String testName;
  final String department;
  final String result;
  final String referenceRange;
  final String status; // 'Completed', 'Pending', 'Abnormal'
  final String date;

  const LabResultItem({
    required this.id,
    required this.patientName,
    required this.patientId,
    required this.avatar,
    required this.testName,
    required this.department,
    required this.result,
    required this.referenceRange,
    required this.status,
    required this.date,
  });

  factory LabResultItem.fromDto(Map<String, dynamic> json) {
    final pName = json['patientName'] as String? ?? 'Patient';
    final rawTest = json['testName'] as String?;
    String test = rawTest ?? '';
    if (test.isEmpty && json['tests'] is List && (json['tests'] as List).isNotEmpty) {
      final first = (json['tests'] as List).first;
      if (first is Map) {
        test = first['testName'] as String? ?? 'Lab Test';
      } else {
        test = first.toString();
      }
    }
    if (test.isEmpty) test = 'General Lab Order';

    return LabResultItem(
      id: json['id'] as String? ?? '',
      patientName: pName,
      patientId: json['patientId'] as String? ?? '',
      avatar:
          'https://ui-avatars.com/api/?name=${Uri.encodeComponent(pName)}&size=150&background=dbeafe&color=1e40af',
      testName: test,
      department: json['department'] as String? ?? 'Laboratory',
      result: json['result'] as String? ?? 'Pending evaluation',
      referenceRange: json['referenceRange'] as String? ?? 'Normal',
      status: (json['status'] as String? ?? 'Pending'),
      date: json['createdAt'] != null
          ? (json['createdAt'] as String).split('T').first
          : 'Today',
    );
  }
}

class MedicalRecordItem {
  final String id;
  final String? patientId;
  final String? patientName;
  final String visitDate;
  final String visitTime;
  final String visitType;
  final String department;
  final String doctorName;
  final String doctorAvatar;
  final String diagnosisSummary;
  final String status;

  const MedicalRecordItem({
    required this.id,
    this.patientId,
    this.patientName,
    required this.visitDate,
    required this.visitTime,
    required this.visitType,
    required this.department,
    required this.doctorName,
    required this.doctorAvatar,
    required this.diagnosisSummary,
    required this.status,
  });
}

class ChatMessageItem {
  final String id;
  final bool isMe;
  final String senderName;
  final String text;
  final String time;

  const ChatMessageItem({
    required this.id,
    required this.isMe,
    required this.senderName,
    required this.text,
    required this.time,
  });
}

class ConversationItem {
  final String id;
  final String name;
  final String avatar;
  final String role;
  final String lastMessage;
  final String time;
  final int unreadCount;
  final List<ChatMessageItem> messages;

  const ConversationItem({
    required this.id,
    required this.name,
    required this.avatar,
    required this.role,
    required this.lastMessage,
    required this.time,
    this.unreadCount = 0,
    this.messages = const [],
  });
}
