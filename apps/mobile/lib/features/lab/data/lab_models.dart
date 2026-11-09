// ─── Lab Technician Models ───────────────────────────────────────────────────

class LabTechProfile {
  final String name;
  final String role;
  final String department;
  final String email;
  final String phone;
  final String hospital;
  final String employeeId;
  final String shift;
  final int unreadNotifications;
  final int pendingSync;

  const LabTechProfile({
    required this.name,
    required this.role,
    required this.department,
    required this.email,
    required this.phone,
    required this.hospital,
    required this.employeeId,
    required this.shift,
    this.unreadNotifications = 0,
    this.pendingSync = 0,
  });
}

// ─── Lab KPIs ─────────────────────────────────────────────────────────────────

class LabKpis {
  final int totalTestsToday;
  final int pendingAnalysis;
  final int samplesCollected;
  final int verifiedResults;
  final int criticalAlerts;
  final double avgTurnaroundHours;

  const LabKpis({
    required this.totalTestsToday,
    required this.pendingAnalysis,
    required this.samplesCollected,
    required this.verifiedResults,
    required this.criticalAlerts,
    required this.avgTurnaroundHours,
  });
}

// ─── Priority & Status Enums ──────────────────────────────────────────────────

enum LabPriority { stat, urgent, routine }

enum LabOrderStatus { pending, collected, inAnalysis, verified, cancelled }

enum LabSampleStatus { pendingCollection, collected, receivedInLab, processed, rejected }

enum ResultStatus { normal, abnormal, critical, pendingReview, verified }

// ─── Test Order ───────────────────────────────────────────────────────────────

class LabTestOrder {
  final String id;
  final String orderNumber;
  final String patientName;
  final String patientPid;
  final String patientRoom;
  final int patientAge;
  final String patientGender;
  final String testName;
  final String testCode;
  final String department;
  final LabPriority priority;
  final LabOrderStatus status;
  final String orderedAt;
  final String orderingDoctor;
  final String? sampleId;

  const LabTestOrder({
    required this.id,
    required this.orderNumber,
    required this.patientName,
    required this.patientPid,
    required this.patientRoom,
    required this.patientAge,
    required this.patientGender,
    required this.testName,
    required this.testCode,
    required this.department,
    required this.priority,
    required this.status,
    required this.orderedAt,
    required this.orderingDoctor,
    this.sampleId,
  });

  String get initials {
    final parts = patientName.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    }
    return patientName.isNotEmpty ? patientName[0].toUpperCase() : '?';
  }
}

// ─── Specimen / Sample ────────────────────────────────────────────────────────

class LabSample {
  final String id;
  final String sampleId;
  final String barcode;
  final String patientName;
  final String patientPid;
  final String specimenType;
  final String tubeColor;
  final String testName;
  final String department;
  final String collectionTime;
  final String collectedBy;
  final LabSampleStatus status;
  final String? notes;

  const LabSample({
    required this.id,
    required this.sampleId,
    required this.barcode,
    required this.patientName,
    required this.patientPid,
    required this.specimenType,
    required this.tubeColor,
    required this.testName,
    required this.department,
    required this.collectionTime,
    required this.collectedBy,
    required this.status,
    this.notes,
  });
}

// ─── Measured Parameter ───────────────────────────────────────────────────────

class LabMeasuredParam {
  final String name;
  final String value;
  final String unit;
  final String referenceRange;
  final String flag; // 'Normal', 'High', 'Low', 'Critical'

  const LabMeasuredParam({
    required this.name,
    required this.value,
    required this.unit,
    required this.referenceRange,
    required this.flag,
  });

  bool get isCritical => flag == 'Critical';
  bool get isAbnormal => flag == 'High' || flag == 'Low' || flag == 'Critical';
}

// ─── Test Result ──────────────────────────────────────────────────────────────

class LabTestResult {
  final String id;
  final String resultId;
  final String sampleId;
  final String orderId;
  final String patientName;
  final String patientPid;
  final String testName;
  final String department;
  final String resultSummary;
  final ResultStatus status;
  final String completedAt;
  final String? verifiedBy;
  final String? verifiedAt;
  final String doctorNotes;
  final List<LabMeasuredParam> parameters;

  const LabTestResult({
    required this.id,
    required this.resultId,
    required this.sampleId,
    required this.orderId,
    required this.patientName,
    required this.patientPid,
    required this.testName,
    required this.department,
    required this.resultSummary,
    required this.status,
    required this.completedAt,
    this.verifiedBy,
    this.verifiedAt,
    required this.doctorNotes,
    this.parameters = const [],
  });

  bool get hasCriticalFinding =>
      parameters.any((p) => p.isCritical) || status == ResultStatus.critical;
}

// ─── Panic / Critical Alert ───────────────────────────────────────────────────

class LabPanicAlert {
  final String id;
  final String title;
  final String parameter;
  final String value;
  final String referenceRange;
  final String patientName;
  final String patientPid;
  final String doctorName;
  final String timestamp;
  final bool isAcknowledged;

  const LabPanicAlert({
    required this.id,
    required this.title,
    required this.parameter,
    required this.value,
    required this.referenceRange,
    required this.patientName,
    required this.patientPid,
    required this.doctorName,
    required this.timestamp,
    this.isAcknowledged = false,
  });
}

// ─── Reagent Inventory Item ───────────────────────────────────────────────────

class LabInventoryItem {
  final String id;
  final String name;
  final String category;
  final String lotNumber;
  final int currentStock;
  final int minimumThreshold;
  final String unit;
  final String expiryDate;
  final int daysToExpiry;

  const LabInventoryItem({
    required this.id,
    required this.name,
    required this.category,
    required this.lotNumber,
    required this.currentStock,
    required this.minimumThreshold,
    required this.unit,
    required this.expiryDate,
    required this.daysToExpiry,
  });

  bool get isLowStock => currentStock <= minimumThreshold;
  bool get isExpiringSoon => daysToExpiry <= 30;
}

