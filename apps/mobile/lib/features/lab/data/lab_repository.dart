import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'lab_models.dart';

/// Repository providing lab technician mock data and state management.
/// Designed for offline-first operation with local caching.
class LabRepository {
  // ─── Profile ──────────────────────────────────────────────────────────────

  static const currentTechnician = LabTechProfile(
    name: 'Dawit Tadesse',
    role: 'Senior Medical Laboratory Technologist',
    department: 'Clinical Pathology & Hematology',
    email: 'dawit.tadesse@mcms.health',
    phone: '+251 912 345 678',
    hospital: 'Tikur Anbessa Specialized Hospital',
    employeeId: 'EMP-LAB-019',
    shift: 'Morning (07:30 - 16:00)',
    unreadNotifications: 3,
    pendingSync: 0,
  );

  // ─── KPIs ─────────────────────────────────────────────────────────────────

  static LabKpis get kpis => const LabKpis(
        totalTestsToday: 148,
        pendingAnalysis: 24,
        samplesCollected: 62,
        verifiedResults: 118,
        criticalAlerts: 3,
        avgTurnaroundHours: 1.8,
      );

  // ─── Test Orders ──────────────────────────────────────────────────────────

  static final List<LabTestOrder> initialOrders = [
    const LabTestOrder(
      id: 'ord-101',
      orderNumber: 'ORD-2026-1048',
      patientName: 'Aster Mulu',
      patientPid: 'PID-001024',
      patientRoom: 'Room 3A-01',
      patientAge: 28,
      patientGender: 'Female',
      testName: 'Complete Blood Count (CBC)',
      testCode: 'CBC',
      department: 'Hematology',
      priority: LabPriority.stat,
      status: LabOrderStatus.inAnalysis,
      orderedAt: '08:30 AM',
      orderingDoctor: 'Dr. Tesfaye Alemu',
      sampleId: 'SMP-2026-0018',
    ),
    const LabTestOrder(
      id: 'ord-102',
      orderNumber: 'ORD-2026-1049',
      patientName: 'Abebe Assefa',
      patientPid: 'PID-001087',
      patientRoom: 'Outpatient Clinic',
      patientAge: 29,
      patientGender: 'Male',
      testName: 'Random Blood Sugar (RBS)',
      testCode: 'RBS',
      department: 'Biochemistry',
      priority: LabPriority.urgent,
      status: LabOrderStatus.pending,
      orderedAt: '09:15 AM',
      orderingDoctor: 'Dr. Hanna Girma',
      sampleId: 'SMP-2026-0021',
    ),
    const LabTestOrder(
      id: 'ord-103',
      orderNumber: 'ORD-2026-1050',
      patientName: 'Tigist Alemu',
      patientPid: 'PID-001045',
      patientRoom: 'Emergency Ward',
      patientAge: 35,
      patientGender: 'Female',
      testName: 'Liver Function Tests (LFT)',
      testCode: 'LFT',
      department: 'Biochemistry',
      priority: LabPriority.routine,
      status: LabOrderStatus.collected,
      orderedAt: '09:40 AM',
      orderingDoctor: 'Dr. Tesfaye Alemu',
      sampleId: 'SMP-2026-0024',
    ),
    const LabTestOrder(
      id: 'ord-104',
      orderNumber: 'ORD-2026-1051',
      patientName: 'Kebede Chala',
      patientPid: 'PID-001092',
      patientRoom: 'Ward 2-B',
      patientAge: 52,
      patientGender: 'Male',
      testName: 'Blood Culture & Sensitivity',
      testCode: 'BCS',
      department: 'Microbiology',
      priority: LabPriority.stat,
      status: LabOrderStatus.inAnalysis,
      orderedAt: '07:50 AM',
      orderingDoctor: 'Dr. Biruk Bekele',
      sampleId: 'SMP-2026-0015',
    ),
    const LabTestOrder(
      id: 'ord-105',
      orderNumber: 'ORD-2026-1052',
      patientName: 'Meron Tadesse',
      patientPid: 'PID-001064',
      patientRoom: 'ICU Bed 4',
      patientAge: 44,
      patientGender: 'Female',
      testName: 'Kidney Function Tests (KFT)',
      testCode: 'KFT',
      department: 'Biochemistry',
      priority: LabPriority.stat,
      status: LabOrderStatus.verified,
      orderedAt: '07:20 AM',
      orderingDoctor: 'Dr. Hanna Girma',
      sampleId: 'SMP-2026-0012',
    ),
  ];

  // ─── Samples ──────────────────────────────────────────────────────────────

  static final List<LabSample> initialSamples = [
    const LabSample(
      id: 'smp-1',
      sampleId: 'SMP-2026-0018',
      barcode: '8901234567890',
      patientName: 'Aster Mulu',
      patientPid: 'PID-001024',
      specimenType: 'Whole Blood',
      tubeColor: 'Lavender (EDTA)',
      testName: 'CBC',
      department: 'Hematology',
      collectionTime: '08:45 AM',
      collectedBy: 'Dawit Tadesse',
      status: LabSampleStatus.receivedInLab,
      notes: 'Bedside sample collected; no hemolysis.',
    ),
    const LabSample(
      id: 'smp-2',
      sampleId: 'SMP-2026-0021',
      barcode: '8901234567891',
      patientName: 'Abebe Assefa',
      patientPid: 'PID-001087',
      specimenType: 'Fluoride Plasma',
      tubeColor: 'Grey (Sodium Fluoride)',
      testName: 'RBS',
      department: 'Biochemistry',
      collectionTime: '09:20 AM',
      collectedBy: 'Sister Almaz',
      status: LabSampleStatus.collected,
      notes: 'Fasting specimen from outpatient clinic.',
    ),
    const LabSample(
      id: 'smp-3',
      sampleId: 'SMP-2026-0024',
      barcode: '8901234567892',
      patientName: 'Tigist Alemu',
      patientPid: 'PID-001045',
      specimenType: 'Serum',
      tubeColor: 'Gold (SST Gel)',
      testName: 'LFT & Enzymes',
      department: 'Biochemistry',
      collectionTime: '09:55 AM',
      collectedBy: 'Dawit Tadesse',
      status: LabSampleStatus.receivedInLab,
    ),
    const LabSample(
      id: 'smp-4',
      sampleId: 'SMP-2026-0015',
      barcode: '8901234567893',
      patientName: 'Kebede Chala',
      patientPid: 'PID-001092',
      specimenType: 'Blood Culture Bottle',
      tubeColor: 'Aerobic Bottle (Green)',
      testName: 'Blood Culture',
      department: 'Microbiology',
      collectionTime: '08:10 AM',
      collectedBy: 'Dr. Biruk Bekele',
      status: LabSampleStatus.processed,
      notes: 'Incubating in BacT/ALERT system.',
    ),
  ];

  // ─── Test Results ─────────────────────────────────────────────────────────

  static final List<LabTestResult> initialResults = [
    const LabTestResult(
      id: 'res-1',
      resultId: 'RES-2026-0048',
      sampleId: 'SMP-2026-0018',
      orderId: 'ORD-2026-1048',
      patientName: 'Aster Mulu',
      patientPid: 'PID-001024',
      testName: 'Complete Blood Count (CBC)',
      department: 'Hematology',
      resultSummary: 'WBC 7.4 ×10⁹/L • Hb 6.4 g/dL (Critical)',
      status: ResultStatus.critical,
      completedAt: 'Today, 09:30 AM',
      doctorNotes: 'Critical low hemoglobin flag triggered. Immediate transfusion alert sent to attending physician Dr. Tesfaye.',
      parameters: [
        LabMeasuredParam(name: 'White Blood Cells (WBC)', value: '7.4', unit: '×10⁹/L', referenceRange: '4.0 - 11.0', flag: 'Normal'),
        LabMeasuredParam(name: 'Hemoglobin (Hb)', value: '6.4', unit: 'g/dL', referenceRange: '12.0 - 16.0', flag: 'Critical'),
        LabMeasuredParam(name: 'Hematocrit (Hct)', value: '21.5', unit: '%', referenceRange: '36.0 - 48.0', flag: 'Low'),
        LabMeasuredParam(name: 'Platelets (PLT)', value: '235', unit: '×10³/µL', referenceRange: '150 - 450', flag: 'Normal'),
        LabMeasuredParam(name: 'RBC Count', value: '2.8', unit: '×10⁶/µL', referenceRange: '3.8 - 5.2', flag: 'Low'),
      ],
    ),
    const LabTestResult(
      id: 'res-2',
      resultId: 'RES-2026-0049',
      sampleId: 'SMP-2026-0021',
      orderId: 'ORD-2026-1049',
      patientName: 'Abebe Assefa',
      patientPid: 'PID-001087',
      testName: 'Random Blood Sugar (RBS)',
      department: 'Biochemistry',
      resultSummary: 'Glucose: 112 mg/dL (Normal)',
      status: ResultStatus.verified,
      completedAt: 'Today, 09:45 AM',
      verifiedBy: 'Dawit Tadesse',
      verifiedAt: 'Today, 09:50 AM',
      doctorNotes: 'Glycemic control within normal target range.',
      parameters: [
        LabMeasuredParam(name: 'Random Blood Glucose', value: '112', unit: 'mg/dL', referenceRange: '70 - 140', flag: 'Normal'),
      ],
    ),
    const LabTestResult(
      id: 'res-3',
      resultId: 'RES-2026-0050',
      sampleId: 'SMP-2026-0012',
      orderId: 'ORD-2026-1052',
      patientName: 'Meron Tadesse',
      patientPid: 'PID-001064',
      testName: 'Kidney Function Tests (KFT)',
      department: 'Biochemistry',
      resultSummary: 'Serum Creatinine: 2.4 mg/dL (High)',
      status: ResultStatus.abnormal,
      completedAt: 'Today, 08:35 AM',
      verifiedBy: 'Dawit Tadesse',
      verifiedAt: 'Today, 08:45 AM',
      doctorNotes: 'Elevated creatinine. Recommend nephrology follow-up.',
      parameters: [
        LabMeasuredParam(name: 'Serum Creatinine', value: '2.4', unit: 'mg/dL', referenceRange: '0.6 - 1.2', flag: 'High'),
        LabMeasuredParam(name: 'Blood Urea Nitrogen (BUN)', value: '38', unit: 'mg/dL', referenceRange: '7 - 20', flag: 'High'),
        LabMeasuredParam(name: 'eGFR', value: '28', unit: 'mL/min/1.73m²', referenceRange: '> 60', flag: 'Low'),
      ],
    ),
  ];

  // ─── Panic Alerts ─────────────────────────────────────────────────────────

  static final List<LabPanicAlert> initialAlerts = [
    const LabPanicAlert(
      id: 'pa-1',
      title: 'Critical Hemoglobin Level',
      parameter: 'Hemoglobin (Hb)',
      value: '6.4 g/dL',
      referenceRange: '12.0 - 16.0 g/dL',
      patientName: 'Aster Mulu',
      patientPid: 'PID-001024',
      doctorName: 'Dr. Tesfaye Alemu',
      timestamp: '09:32 AM',
      isAcknowledged: false,
    ),
    const LabPanicAlert(
      id: 'pa-2',
      title: 'Severe Hypoglycemia Warning',
      parameter: 'Blood Glucose',
      value: '38 mg/dL',
      referenceRange: '70 - 140 mg/dL',
      patientName: 'Hagos Fisseha',
      patientPid: 'PID-001031',
      doctorName: 'Dr. Hanna Girma',
      timestamp: '08:15 AM',
      isAcknowledged: true,
    ),
  ];

  // ─── Inventory ────────────────────────────────────────────────────────────

  static final List<LabInventoryItem> initialInventory = [
    const LabInventoryItem(
      id: 'inv-1',
      name: 'EDTA Vacutainer Tubes (3mL)',
      category: 'Phlebotomy Supplies',
      lotNumber: 'LOT-EDTA-2026A',
      currentStock: 350,
      minimumThreshold: 100,
      unit: 'Tubes',
      expiryDate: 'Dec 2027',
      daysToExpiry: 410,
    ),
    const LabInventoryItem(
      id: 'inv-2',
      name: 'Mindray CBC Reagent Pack (Diff Lyse)',
      category: 'Hematology Reagents',
      lotNumber: 'LOT-LYS-9912',
      currentStock: 4,
      minimumThreshold: 5,
      unit: 'Bottles (20L)',
      expiryDate: 'Nov 28, 2026',
      daysToExpiry: 19,
    ),
    const LabInventoryItem(
      id: 'inv-3',
      name: 'Glucose Hexokinase Reagent',
      category: 'Chemistry Reagents',
      lotNumber: 'LOT-GLU-4401',
      currentStock: 12,
      minimumThreshold: 6,
      unit: 'Kits (500 tests)',
      expiryDate: 'Jan 2027',
      daysToExpiry: 60,
    ),
  ];
}

// ─── Riverpod State Providers ─────────────────────────────────────────────────

final labProfileProvider = Provider<LabTechProfile>((ref) {
  return LabRepository.currentTechnician;
});

final labKpisProvider = Provider<LabKpis>((ref) {
  return LabRepository.kpis;
});

class LabOrdersNotifier extends StateNotifier<List<LabTestOrder>> {
  LabOrdersNotifier() : super(LabRepository.initialOrders);

  void addOrder(LabTestOrder order) {
    state = [order, ...state];
  }

  void updateOrderStatus(String orderId, LabOrderStatus newStatus) {
    state = [
      for (final order in state)
        if (order.id == orderId)
          LabTestOrder(
            id: order.id,
            orderNumber: order.orderNumber,
            patientName: order.patientName,
            patientPid: order.patientPid,
            patientRoom: order.patientRoom,
            patientAge: order.patientAge,
            patientGender: order.patientGender,
            testName: order.testName,
            testCode: order.testCode,
            department: order.department,
            priority: order.priority,
            status: newStatus,
            orderedAt: order.orderedAt,
            orderingDoctor: order.orderingDoctor,
            sampleId: order.sampleId,
          )
        else
          order
    ];
  }
}

final labOrdersProvider =
    StateNotifierProvider<LabOrdersNotifier, List<LabTestOrder>>((ref) {
  return LabOrdersNotifier();
});

class LabSamplesNotifier extends StateNotifier<List<LabSample>> {
  LabSamplesNotifier() : super(LabRepository.initialSamples);

  void addSample(LabSample sample) {
    state = [sample, ...state];
  }

  void updateSampleStatus(String sampleId, LabSampleStatus newStatus) {
    state = [
      for (final s in state)
        if (s.id == sampleId)
          LabSample(
            id: s.id,
            sampleId: s.sampleId,
            barcode: s.barcode,
            patientName: s.patientName,
            patientPid: s.patientPid,
            specimenType: s.specimenType,
            tubeColor: s.tubeColor,
            testName: s.testName,
            department: s.department,
            collectionTime: s.collectionTime,
            collectedBy: s.collectedBy,
            status: newStatus,
            notes: s.notes,
          )
        else
          s
    ];
  }
}

final labSamplesProvider =
    StateNotifierProvider<LabSamplesNotifier, List<LabSample>>((ref) {
  return LabSamplesNotifier();
});

class LabResultsNotifier extends StateNotifier<List<LabTestResult>> {
  LabResultsNotifier() : super(LabRepository.initialResults);

  void verifyAndReleaseResult(String resultId, String technicianName) {
    state = [
      for (final r in state)
        if (r.id == resultId)
          LabTestResult(
            id: r.id,
            resultId: r.resultId,
            sampleId: r.sampleId,
            orderId: r.orderId,
            patientName: r.patientName,
            patientPid: r.patientPid,
            testName: r.testName,
            department: r.department,
            resultSummary: r.resultSummary,
            status: ResultStatus.verified,
            completedAt: r.completedAt,
            verifiedBy: technicianName,
            verifiedAt: 'Just now',
            doctorNotes: r.doctorNotes,
            parameters: r.parameters,
          )
        else
          r
    ];
  }

  void addResult(LabTestResult result) {
    state = [result, ...state];
  }
}

final labResultsProvider =
    StateNotifierProvider<LabResultsNotifier, List<LabTestResult>>((ref) {
  return LabResultsNotifier();
});

final labPanicAlertsProvider = Provider<List<LabPanicAlert>>((ref) {
  return LabRepository.initialAlerts;
});

final labInventoryProvider = Provider<List<LabInventoryItem>>((ref) {
  return LabRepository.initialInventory;
});

