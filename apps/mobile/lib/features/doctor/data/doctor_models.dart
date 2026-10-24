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
}

class MedicalRecordItem {
  final String id;
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
