import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/nurse_models.dart';
import '../../data/nurse_repository.dart';
import '../widgets/nurse_modals.dart';

class NurseVitalsScreen extends ConsumerStatefulWidget {
  const NurseVitalsScreen({super.key});

  @override
  ConsumerState<NurseVitalsScreen> createState() => _NurseVitalsScreenState();
}

class _NurseVitalsScreenState extends ConsumerState<NurseVitalsScreen> {
  final _searchCtrl = TextEditingController();

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final vitalsList = ref.watch(nurseVitalsHistoryProvider);
    final patients = ref.watch(nursePatientsProvider);

    final query = _searchCtrl.text.trim().toLowerCase();
    final filtered = vitalsList.where((v) {
      if (query.isEmpty) return true;
      return v.patientName.toLowerCase().contains(query) ||
          v.patientPid.toLowerCase().contains(query) ||
          v.bp.contains(query);
    }).toList();

    final criticalCount = patients
        .where((p) => p.vitalsStatus == VitalsCondition.critical)
        .length;
    final elevatedCount = patients
        .where((p) =>
            p.vitalsStatus == VitalsCondition.highBp ||
            p.vitalsStatus == VitalsCondition.elevated)
        .length;
    final stableCount = patients
        .where((p) => p.vitalsStatus == VitalsCondition.normal)
        .length;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text(
          'Vital Signs Observation',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Color(0xFF0F172A),
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            onPressed: () => NurseModals.showRecordVitals(context, ref),
            icon: const Icon(Icons.add_circle_outline_rounded,
                color: Color(0xFF2563EB)),
            tooltip: 'New Reading',
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: const Color(0xFFE2E8F0), height: 1),
        ),
      ),
      body: Column(
        children: [
          // KPI strip
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                Expanded(
                  child: _kpiPill('Stable', '$stableCount',
                      const Color(0xFF10B981), const Color(0xFFECFDF5)),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _kpiPill('Elevated', '$elevatedCount',
                      const Color(0xFFF59E0B), const Color(0xFFFFFBEB)),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _kpiPill('Critical', '$criticalCount',
                      const Color(0xFFEF4444), const Color(0xFFFEF2F2)),
                ),
              ],
            ),
          ),

          // Search bar
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: TextField(
              controller: _searchCtrl,
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                hintText: 'Filter by patient or PID...',
                hintStyle:
                    const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                prefixIcon: const Icon(Icons.search_rounded,
                    color: Color(0xFF64748B), size: 20),
                filled: true,
                fillColor: const Color(0xFFF8FAFC),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
              ),
            ),
          ),

          // Readings list
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.monitor_heart_outlined,
                            size: 48, color: Colors.blueGrey.shade300),
                        const SizedBox(height: 12),
                        const Text(
                          'No vitals records found',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final item = filtered[index];
                      return _buildVitalsCard(item);
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => NurseModals.showRecordVitals(context, ref),
        backgroundColor: const Color(0xFF2563EB),
        foregroundColor: Colors.white,
        icon: const Icon(Icons.monitor_heart_rounded),
        label: const Text(
          'Log Reading',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
    );
  }

  Widget _kpiPill(String label, String value, Color color, Color bg) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVitalsCard(VitalsRecord record) {
    final sys = int.tryParse(record.bp.split('/').first) ?? 120;
    Color bpColor = const Color(0xFF10B981);
    if (sys >= 160) {
      bpColor = const Color(0xFFEF4444);
    } else if (sys >= 140) {
      bpColor = const Color(0xFFF97316);
    } else if (sys < 95) {
      bpColor = const Color(0xFF06B6D4);
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top: Patient name & timestamp
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        record.patientName,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      Text(
                        record.patientPid,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF2563EB),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    record.dateTime,
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF64748B),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Metrics Grid
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFF1F5F9)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _metricItem('Blood Pressure', record.bp, 'mmHg',
                      color: bpColor),
                  _metricItem('Pulse', '${record.hr}', 'bpm'),
                  _metricItem('Temp', '${record.temp}', '°C'),
                  _metricItem('SpO2', '${record.spo2}', '%',
                      color: record.spo2 < 95
                          ? const Color(0xFFEF4444)
                          : const Color(0xFF0F172A)),
                ],
              ),
            ),

            if (record.notes != null && record.notes!.isNotEmpty) ...[
              const SizedBox(height: 10),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.notes_rounded,
                      size: 14, color: Color(0xFF94A3B8)),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      record.notes!,
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF475569),
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
                ],
              ),
            ],

            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'By: ${record.recordedBy}',
                  style: const TextStyle(
                    fontSize: 11,
                    color: Color(0xFF94A3B8),
                  ),
                ),
                InkWell(
                  onTap: () {
                    final patients = ref.read(nursePatientsProvider);
                    final patient = patients.firstWhere(
                      (p) => p.id == record.patientId,
                      orElse: () => patients.first,
                    );
                    NurseModals.showRecordVitals(
                      context,
                      ref,
                      preselectedPatient: patient,
                    );
                  },
                  child: const Padding(
                    padding: EdgeInsets.symmetric(vertical: 2, horizontal: 4),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.refresh_rounded,
                            size: 14, color: Color(0xFF2563EB)),
                        SizedBox(width: 4),
                        Text(
                          'Re-check',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF2563EB),
                          ),
                        ),
                      ],
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

  Widget _metricItem(String label, String value, String unit, {Color? color}) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w600,
            color: Color(0xFF64748B),
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w800,
            color: color ?? const Color(0xFF0F172A),
          ),
        ),
        Text(
          unit,
          style: const TextStyle(fontSize: 9, color: Color(0xFF94A3B8)),
        ),
      ],
    );
  }
}
