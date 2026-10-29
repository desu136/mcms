import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/nurse_models.dart';
import '../../data/nurse_repository.dart';

class NurseModals {
  NurseModals._();

  // ─── Record Vitals Sheet ──────────────────────────────────────────────────
  static void showRecordVitals(
    BuildContext context,
    WidgetRef ref, {
    NursePatient? preselectedPatient,
  }) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _RecordVitalsSheet(
        preselectedPatient: preselectedPatient,
      ),
    );
  }

  // ─── Administer Medication Sheet ──────────────────────────────────────────
  static void showAdministerMedication(
    BuildContext context,
    WidgetRef ref,
    NurseMedication med,
  ) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _AdministerMedSheet(med: med),
    );
  }

  // ─── Collect Lab Sample Sheet ─────────────────────────────────────────────
  static void showCollectLabSample(
    BuildContext context,
    WidgetRef ref,
    NurseLabSample sample,
  ) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _CollectLabSampleSheet(sample: sample),
    );
  }

  // ─── Add Nursing Task Sheet ───────────────────────────────────────────────
  static void showAddTask(BuildContext context, WidgetRef ref) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const _AddTaskSheet(),
    );
  }

  // ─── Patient Detail Sheet ─────────────────────────────────────────────────
  static void showPatientDetail(
    BuildContext context,
    WidgetRef ref,
    NursePatient patient,
  ) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _PatientDetailSheet(patient: patient),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Record Vitals Sheet Widget
// ─────────────────────────────────────────────────────────────────────────────

class _RecordVitalsSheet extends ConsumerStatefulWidget {
  final NursePatient? preselectedPatient;

  const _RecordVitalsSheet({this.preselectedPatient});

  @override
  ConsumerState<_RecordVitalsSheet> createState() => _RecordVitalsSheetState();
}

class _RecordVitalsSheetState extends ConsumerState<_RecordVitalsSheet> {
  late String _selectedPatientId;
  final _systolicCtrl = TextEditingController(text: '120');
  final _diastolicCtrl = TextEditingController(text: '80');
  final _hrCtrl = TextEditingController(text: '72');
  final _tempCtrl = TextEditingController(text: '36.8');
  final _spo2Ctrl = TextEditingController(text: '98');
  final _respCtrl = TextEditingController(text: '16');
  final _notesCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    final patients = ref.read(nursePatientsProvider);
    _selectedPatientId = widget.preselectedPatient?.id ??
        (patients.isNotEmpty ? patients.first.id : '');
  }

  @override
  void dispose() {
    _systolicCtrl.dispose();
    _diastolicCtrl.dispose();
    _hrCtrl.dispose();
    _tempCtrl.dispose();
    _spo2Ctrl.dispose();
    _respCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  void _saveVitals() {
    final patients = ref.read(nursePatientsProvider);
    final patient = patients.firstWhere(
      (p) => p.id == _selectedPatientId,
      orElse: () => patients.first,
    );

    final bp = '${_systolicCtrl.text.trim()}/${_diastolicCtrl.text.trim()}';
    final hr = int.tryParse(_hrCtrl.text) ?? 72;
    final temp = double.tryParse(_tempCtrl.text) ?? 36.8;
    final spo2 = int.tryParse(_spo2Ctrl.text) ?? 98;
    final resp = int.tryParse(_respCtrl.text) ?? 16;
    final notes = _notesCtrl.text.trim();

    // Determine status
    final sys = int.tryParse(_systolicCtrl.text) ?? 120;
    VitalsCondition vitalsStatus = VitalsCondition.normal;
    if (sys >= 160 || spo2 < 90 || temp > 38.5) {
      vitalsStatus = VitalsCondition.critical;
    } else if (sys >= 140) {
      vitalsStatus = VitalsCondition.highBp;
    } else if (sys < 95) {
      vitalsStatus = VitalsCondition.lowBp;
    } else if (sys > 125) {
      vitalsStatus = VitalsCondition.elevated;
    }

    final newRecord = VitalsRecord(
      id: 'vr-${DateTime.now().millisecondsSinceEpoch}',
      patientId: patient.id,
      patientName: patient.name,
      patientPid: patient.pid,
      dateTime: 'Today, ${TimeOfDay.now().format(context)}',
      bp: bp,
      hr: hr,
      temp: temp,
      spo2: spo2,
      respRate: resp,
      recordedBy: 'Sister Aster, RN',
      notes: notes.isNotEmpty ? notes : 'Routine vitals observation recorded.',
    );

    // Update Vitals history
    ref.read(nurseVitalsHistoryProvider.notifier).update(
          (list) => [newRecord, ...list],
        );

    // Update Patient vitals
    ref.read(nursePatientsProvider.notifier).update((list) {
      return list.map((p) {
        if (p.id == patient.id) {
          return p.copyWith(
            vitalsStatus: vitalsStatus,
            vitals: PatientVitals(
              bp: bp,
              hr: hr,
              temp: temp,
              spo2: spo2,
              respRate: resp,
            ),
          );
        }
        return p;
      }).toList();
    });

    // Add activity log
    ref.read(nurseActivitiesProvider.notifier).update((list) => [
          NurseActivityLog(
            id: 'act-${DateTime.now().millisecondsSinceEpoch}',
            title: 'Vitals recorded',
            time: 'Just now',
            description: '${patient.name} ($bp, $hr bpm, $spo2%)',
            type: 'task',
          ),
          ...list,
        ]);

    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Vitals recorded successfully for ${patient.name}'),
        backgroundColor: const Color(0xFF10B981),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final patients = ref.read(nursePatientsProvider);

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle bar
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFCBD5E1),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.monitor_heart_rounded,
                    color: Color(0xFF2563EB),
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Record Patient Vitals',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      Text(
                        'Enter current clinical parameters',
                        style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close_rounded, color: Color(0xFF94A3B8)),
                ),
              ],
            ),
            const SizedBox(height: 18),

            // Patient Selector
            const Text(
              'Select Patient',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Color(0xFF334155),
              ),
            ),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedPatientId,
                  isExpanded: true,
                  icon: const Icon(Icons.arrow_drop_down_rounded),
                  items: patients.map((p) {
                    return DropdownMenuItem<String>(
                      value: p.id,
                      child: Text(
                        '${p.name} (${p.room} • ${p.pid})',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedPatientId = val);
                  },
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Blood Pressure Row
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Systolic (mmHg)',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF475569),
                        ),
                      ),
                      const SizedBox(height: 6),
                      _buildTextField(_systolicCtrl, '120', TextInputType.number),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Diastolic (mmHg)',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF475569),
                        ),
                      ),
                      const SizedBox(height: 6),
                      _buildTextField(_diastolicCtrl, '80', TextInputType.number),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // HR & Temp
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Heart Rate (bpm)',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF475569),
                        ),
                      ),
                      const SizedBox(height: 6),
                      _buildTextField(_hrCtrl, '72', TextInputType.number),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Temperature (°C)',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF475569),
                        ),
                      ),
                      const SizedBox(height: 6),
                      _buildTextField(_tempCtrl, '36.8',
                          const TextInputType.numberWithOptions(decimal: true)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // SpO2 & Respiratory Rate
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Oxygen Sat. SpO2 (%)',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF475569),
                        ),
                      ),
                      const SizedBox(height: 6),
                      _buildTextField(_spo2Ctrl, '98', TextInputType.number),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Resp. Rate (/min)',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF475569),
                        ),
                      ),
                      const SizedBox(height: 6),
                      _buildTextField(_respCtrl, '16', TextInputType.number),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Notes
            const Text(
              'Clinical Notes (Optional)',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Color(0xFF475569),
              ),
            ),
            const SizedBox(height: 6),
            _buildTextField(_notesCtrl, 'Patient resting comfortably...',
                TextInputType.text,
                maxLines: 2),
            const SizedBox(height: 20),

            // Save CTA
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                onPressed: _saveVitals,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                icon: const Icon(Icons.check_circle_outline_rounded, size: 20),
                label: const Text(
                  'Record & Save Vitals',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController ctrl,
    String hint,
    TextInputType type, {
    int maxLines = 1,
  }) {
    return TextField(
      controller: ctrl,
      keyboardType: type,
      maxLines: maxLines,
      style: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: Color(0xFF0F172A),
      ),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFF2563EB), width: 1.5),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Administer Medication Sheet Widget
// ─────────────────────────────────────────────────────────────────────────────

class _AdministerMedSheet extends ConsumerWidget {
  final NurseMedication med;

  const _AdministerMedSheet({required this.med});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle bar
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFFCBD5E1),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.medication_liquid_rounded,
                  color: Color(0xFF2563EB),
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Administer Medication (eMAR)',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    Text(
                      'Verify 5 Rights of Drug Administration',
                      style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close_rounded, color: Color(0xFF94A3B8)),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Patient Pill
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundImage: NetworkImage(med.patientAvatar),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        med.patientName,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      Text(
                        '${med.patientPid} • ${med.room} • ${med.gender}, ${med.age}y',
                        style: const TextStyle(
                          fontSize: 11,
                          color: Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Medication Details Card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFBFDBFE)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      med.medicationName,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF1E3A8A),
                      ),
                    ),
                    Container(
                      padding:
                          const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2563EB),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        med.dose,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _specBadge(Icons.route_rounded, med.route),
                    const SizedBox(width: 8),
                    _specBadge(Icons.schedule_rounded, med.schedule),
                    const SizedBox(width: 8),
                    _specBadge(Icons.person_rounded, med.prescribingDoctor),
                  ],
                ),
                if (med.instructions.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    'Instructions: ${med.instructions}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF1E40AF),
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Confirm Action
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: () {
                // Update Medication State
                ref.read(nurseMedicationsProvider.notifier).update((list) {
                  return list.map((m) {
                    if (m.id == med.id) {
                      return m.copyWith(
                        status: MedStatus.administered,
                        lastAdministered:
                            'Today, ${TimeOfDay.now().format(context)}',
                      );
                    }
                    return m;
                  }).toList();
                });

                // Add Activity
                ref.read(nurseActivitiesProvider.notifier).update((list) => [
                      NurseActivityLog(
                        id: 'act-${DateTime.now().millisecondsSinceEpoch}',
                        title: 'Medication administered',
                        time: 'Just now',
                        description:
                            '${med.medicationName} (${med.dose}) given to ${med.patientName}',
                        type: 'medication',
                      ),
                      ...list,
                    ]);

                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      'Administered ${med.medicationName} to ${med.patientName}',
                    ),
                    backgroundColor: const Color(0xFF10B981),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              icon: const Icon(Icons.check_circle_rounded, size: 20),
              label: const Text(
                'Confirm Administration (eMAR Sign)',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
              ),
            ),
          ),
        ],
      ),
    );
  }

  static Widget _specBadge(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: const Color(0xFFBFDBFE)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: const Color(0xFF2563EB)),
          const SizedBox(width: 4),
          Text(
            text,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1E40AF),
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Collect Lab Sample Sheet Widget
// ─────────────────────────────────────────────────────────────────────────────

class _CollectLabSampleSheet extends ConsumerWidget {
  final NurseLabSample sample;

  const _CollectLabSampleSheet({required this.sample});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFFCBD5E1),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF3E8FF),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.science_rounded,
                  color: Color(0xFF9333EA),
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Collect Lab Sample',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    Text(
                      'Specimen barcode & protocol confirmation',
                      style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close_rounded, color: Color(0xFF94A3B8)),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Sample card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      sample.sampleId,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF2563EB),
                      ),
                    ),
                    Container(
                      padding:
                          const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: sample.priority == SamplePriority.urgent
                            ? const Color(0xFFFEE2E2)
                            : const Color(0xFFE0E7FF),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        sample.priority.name.toUpperCase(),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: sample.priority == SamplePriority.urgent
                              ? const Color(0xFFDC2626)
                              : const Color(0xFF4338CA),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  sample.testName,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Patient: ${sample.patientName} (${sample.patientPid} • ${sample.room})',
                  style: const TextStyle(fontSize: 12, color: Color(0xFF475569)),
                ),
                const SizedBox(height: 4),
                Text(
                  'Ordered by: ${sample.doctor}',
                  style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                ),
                if (sample.instructions != null) ...[
                  const SizedBox(height: 6),
                  Text(
                    'Handling: ${sample.instructions}',
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF9333EA),
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 20),

          // CTA
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: () {
                ref.read(nurseLabSamplesProvider.notifier).update((list) {
                  return list.map((s) {
                    if (s.id == sample.id) {
                      return s.copyWith(
                        status: SampleStatus.collected,
                        collectedAt:
                            'Today, ${TimeOfDay.now().format(context)}',
                      );
                    }
                    return s;
                  }).toList();
                });

                ref.read(nurseActivitiesProvider.notifier).update((list) => [
                      NurseActivityLog(
                        id: 'act-${DateTime.now().millisecondsSinceEpoch}',
                        title: 'Lab sample collected',
                        time: 'Just now',
                        description:
                            '${sample.testName} (${sample.sampleId}) collected for ${sample.patientName}',
                        type: 'task',
                      ),
                      ...list,
                    ]);

                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      'Sample ${sample.sampleId} marked as Collected',
                    ),
                    backgroundColor: const Color(0xFF9333EA),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF9333EA),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              icon: const Icon(Icons.qr_code_scanner_rounded, size: 20),
              label: const Text(
                'Verify & Mark Collected',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Add Nursing Task Sheet Widget
// ─────────────────────────────────────────────────────────────────────────────

class _AddTaskSheet extends ConsumerStatefulWidget {
  const _AddTaskSheet();

  @override
  ConsumerState<_AddTaskSheet> createState() => _AddTaskSheetState();
}

class _AddTaskSheetState extends ConsumerState<_AddTaskSheet> {
  final _titleCtrl = TextEditingController();
  final _detailsCtrl = TextEditingController();
  late String _selectedPatientId;
  String _selectedType = 'Medication';
  TaskPriority _selectedPriority = TaskPriority.medium;
  final String _dueTime = '12:00 PM';

  @override
  void initState() {
    super.initState();
    final patients = ref.read(nursePatientsProvider);
    _selectedPatientId = patients.isNotEmpty ? patients.first.id : '';
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _detailsCtrl.dispose();
    super.dispose();
  }

  void _saveTask() {
    if (_titleCtrl.text.trim().isEmpty) return;

    final patients = ref.read(nursePatientsProvider);
    final patient = patients.firstWhere(
      (p) => p.id == _selectedPatientId,
      orElse: () => patients.first,
    );

    final newTask = NursingTask(
      id: 't-${DateTime.now().millisecondsSinceEpoch}',
      patientId: patient.id,
      patientName: patient.name,
      patientPid: patient.pid,
      room: patient.room,
      title: _titleCtrl.text.trim(),
      details: _detailsCtrl.text.trim().isNotEmpty
          ? _detailsCtrl.text.trim()
          : null,
      type: _selectedType,
      priority: _selectedPriority,
      dueTime: _dueTime,
      dueDate: 'Today',
      status: TaskStatus.pending,
    );

    ref.read(nurseTasksProvider.notifier).update((list) => [newTask, ...list]);

    ref.read(nurseActivitiesProvider.notifier).update((list) => [
          NurseActivityLog(
            id: 'act-${DateTime.now().millisecondsSinceEpoch}',
            title: 'Task created',
            time: 'Just now',
            description: '${newTask.title} for ${patient.name}',
            type: 'task',
          ),
          ...list,
        ]);

    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Nursing task added to shift schedule'),
        backgroundColor: Color(0xFF2563EB),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final patients = ref.read(nursePatientsProvider);

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFCBD5E1),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.assignment_add,
                    color: Color(0xFF2563EB),
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'New Nursing Task',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      Text(
                        'Schedule care task for inpatient',
                        style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close_rounded, color: Color(0xFF94A3B8)),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Patient
            const Text(
              'Patient',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedPatientId,
                  isExpanded: true,
                  items: patients.map((p) {
                    return DropdownMenuItem<String>(
                      value: p.id,
                      child: Text('${p.name} (${p.room})'),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedPatientId = val);
                  },
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Title
            const Text(
              'Task Title',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _titleCtrl,
              decoration: InputDecoration(
                hintText: 'e.g. Flush peripheral IV line & dressing check',
                filled: true,
                fillColor: const Color(0xFFF8FAFC),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Type & Priority
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Type',
                          style: TextStyle(
                              fontSize: 12, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      DropdownButtonFormField<String>(
                        initialValue: _selectedType,
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: const Color(0xFFF8FAFC),
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 10),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide:
                                const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                        ),
                        items: const [
                          DropdownMenuItem(
                              value: 'Medication', child: Text('Medication')),
                          DropdownMenuItem(
                              value: 'Vital Signs', child: Text('Vital Signs')),
                          DropdownMenuItem(
                              value: 'Wound Care', child: Text('Wound Care')),
                          DropdownMenuItem(
                              value: 'Lab Sample', child: Text('Lab Sample')),
                          DropdownMenuItem(
                              value: 'Education', child: Text('Education')),
                        ],
                        onChanged: (val) {
                          if (val != null) setState(() => _selectedType = val);
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Priority',
                          style: TextStyle(
                              fontSize: 12, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      DropdownButtonFormField<TaskPriority>(
                        initialValue: _selectedPriority,
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: const Color(0xFFF8FAFC),
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 10),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide:
                                const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                        ),
                        items: const [
                          DropdownMenuItem(
                              value: TaskPriority.high, child: Text('High')),
                          DropdownMenuItem(
                              value: TaskPriority.medium, child: Text('Medium')),
                          DropdownMenuItem(
                              value: TaskPriority.low, child: Text('Low')),
                        ],
                        onChanged: (val) {
                          if (val != null) {
                            setState(() => _selectedPriority = val);
                          }
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Submit
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                onPressed: _saveTask,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                icon: const Icon(Icons.add_task_rounded, size: 20),
                label: const Text(
                  'Add Task',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Patient Detail Sheet Widget
// ─────────────────────────────────────────────────────────────────────────────

class _PatientDetailSheet extends ConsumerWidget {
  final NursePatient patient;

  const _PatientDetailSheet({required this.patient});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.all(20),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFCBD5E1),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Top Profile Card
            Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundImage: NetworkImage(patient.avatar),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        patient.name,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${patient.pid} • Room ${patient.room} (${patient.bed})',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF2563EB),
                        ),
                      ),
                      Text(
                        '${patient.gender}, ${patient.age} yrs • Admitted ${patient.admissionDate}',
                        style: const TextStyle(
                          fontSize: 11,
                          color: Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),

            // Vitals Strip
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _vitalMetric('BP', patient.vitals.bp, 'mmHg'),
                  _vitalMetric('HR', '${patient.vitals.hr}', 'bpm'),
                  _vitalMetric('Temp', '${patient.vitals.temp}', '°C'),
                  _vitalMetric('SpO2', '${patient.vitals.spo2}', '%'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Clinical Info
            _infoRow('Department', patient.department),
            _infoRow('Admission Reason', patient.visitReason),
            _infoRow('Attending Doctor', patient.doctor),
            _infoRow('Emergency Phone', patient.phone),
            const SizedBox(height: 20),

            // Quick Actions
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      NurseModals.showRecordVitals(context, ref,
                          preselectedPatient: patient);
                    },
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFF2563EB)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    icon: const Icon(Icons.monitor_heart_rounded,
                        color: Color(0xFF2563EB), size: 18),
                    label: const Text(
                      'Record Vitals',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF2563EB),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      NurseModals.showAddTask(context, ref);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    icon: const Icon(Icons.add_task_rounded, size: 18),
                    label: const Text(
                      'Add Task',
                      style:
                          TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  static Widget _vitalMetric(String label, String value, String unit) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            color: Color(0xFF64748B),
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0F172A),
          ),
        ),
        Text(
          unit,
          style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
        ),
      ],
    );
  }

  static Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF64748B),
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1E293B),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
