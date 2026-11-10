import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class AnalyzerQcItem {
  final String id;
  final String name;
  final String model;
  final String department;
  final String status; // 'Passed', 'Calibrating', 'Due', 'Alert'
  final String lastCalibration;
  final String nextDue;
  final int reagentLevelPercent;
  final String controlLot;
  final String westgardStatus;

  const AnalyzerQcItem({
    required this.id,
    required this.name,
    required this.model,
    required this.department,
    required this.status,
    required this.lastCalibration,
    required this.nextDue,
    required this.reagentLevelPercent,
    required this.controlLot,
    required this.westgardStatus,
  });
}

class LabQcScreen extends StatefulWidget {
  const LabQcScreen({super.key});

  @override
  State<LabQcScreen> createState() => _LabQcScreenState();
}

class _LabQcScreenState extends State<LabQcScreen> {
  final List<AnalyzerQcItem> _analyzers = [
    const AnalyzerQcItem(
      id: 'eq-1',
      name: 'Sysmex Hematology Analyzer',
      model: 'Sysmex XN-550 (5-Part Diff)',
      department: 'Hematology Bench',
      status: 'Passed',
      lastCalibration: 'Today, 06:45 AM',
      nextDue: 'Tomorrow, 06:00 AM',
      reagentLevelPercent: 78,
      controlLot: 'LOT-XN-8841 (Normal / High / Low)',
      westgardStatus: 'In Control (1-2s Passed, 0 Violations)',
    ),
    const AnalyzerQcItem(
      id: 'eq-2',
      name: 'Cobas Clinical Chemistry System',
      model: 'Roche Cobas c311 Analyzer',
      department: 'Biochemistry Bench',
      status: 'Passed',
      lastCalibration: 'Today, 07:15 AM',
      nextDue: 'Tomorrow, 07:00 AM',
      reagentLevelPercent: 62,
      controlLot: 'LOT-PRECI-204 (Level 1 & 2)',
      westgardStatus: 'In Control (Calibrated for Glucose, LFT, BUN)',
    ),
    const AnalyzerQcItem(
      id: 'eq-3',
      name: 'GeneXpert Molecular Diagnostics',
      model: 'Cepheid GeneXpert IV',
      department: 'Molecular & Microbiology',
      status: 'Passed',
      lastCalibration: 'Yesterday, 17:00 PM',
      nextDue: 'Friday, 17:00 PM',
      reagentLevelPercent: 91,
      controlLot: 'LOT-GX-MTB-901',
      westgardStatus: 'Internal Probe QC Valid',
    ),
    const AnalyzerQcItem(
      id: 'eq-4',
      name: 'Mindray Automated Analyzer',
      model: 'Mindray BC-5380',
      department: 'Outpatient Backup Bench',
      status: 'Due',
      lastCalibration: '48h ago',
      nextDue: 'Immediate Calibration Required',
      reagentLevelPercent: 35,
      controlLot: 'LOT-MR-4412',
      westgardStatus: 'QC Run Expired: Run daily 3-level calibrator',
    ),
  ];

  void _runCalibration(AnalyzerQcItem item) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.precision_manufacturing_rounded,
                color: Color(0xFF06B6D4)),
            const SizedBox(width: 8),
            const Text(
              'Run Daily Calibrator',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Initiate automated 3-level control run on ${item.name} (${item.model})?',
              style: const TextStyle(fontSize: 13, color: Color(0xFF334155)),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFBBF7D0)),
              ),
              child: Text(
                'Control Lot: ${item.controlLot}\nReagent Volume: ${item.reagentLevelPercent}% Available',
                style: const TextStyle(
                  fontSize: 11,
                  color: Color(0xFF166534),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF06B6D4),
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: const Color(0xFF10B981),
                  content: Text(
                    'Calibration batch started for ${item.name}. Westgard Levey-Jennings plot updating...',
                  ),
                ),
              );
            },
            child: const Text('Start Run'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text(
          'Analyzer QA & Calibration',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Color(0xFF0F172A),
          ),
        ),
        elevation: 0,
        backgroundColor: Colors.white,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: AppTheme.border, height: 1),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Banner summary card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF06B6D4), Color(0xFF1E6BFF)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.verified_user_rounded,
                        color: Colors.white, size: 22),
                    SizedBox(width: 8),
                    Text(
                      'ISO 15189 Quality Control Standard',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 6),
                Text(
                  '3 of 4 Analyzers in Verified Status. Daily Levey-Jennings control charts and multi-rule Westgard validation active.',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Analyzers List
          ..._analyzers.map(_buildAnalyzerCard),

          const SizedBox(height: 16),

          // Daily Maintenance Checklist
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Daily Bench Maintenance Log',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(height: 12),
                _checkItem('Aspiration probe flush & bleach decontamination', true),
                _checkItem('Background count validation (< 0.2 x 10^3/uL)', true),
                _checkItem('Reagent inventory barcode scan & lot check', true),
                _checkItem('Waste container drain & biological neutralization', false),
              ],
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildAnalyzerCard(AnalyzerQcItem item) {
    final isPassed = item.status == 'Passed';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isPassed ? AppTheme.border : const Color(0xFFFDE68A),
          width: isPassed ? 1 : 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: isPassed
                      ? const Color(0xFFECFDF5)
                      : const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Icon(
                    Icons.precision_manufacturing_rounded,
                    color: isPassed
                        ? const Color(0xFF059669)
                        : const Color(0xFFD97706),
                    size: 24,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.name,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    Text(
                      '${item.model} • ${item.department}',
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isPassed
                      ? const Color(0xFFDCFCE7)
                      : const Color(0xFFFEF9C3),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  item.status.toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: isPassed
                        ? const Color(0xFF15803D)
                        : const Color(0xFF854D0E),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),
          const Divider(height: 1),
          const SizedBox(height: 10),

          // Details grid
          Row(
            children: [
              Expanded(
                child: _miniInfo('Last QC Run', item.lastCalibration),
              ),
              Expanded(
                child: _miniInfo('Next Due', item.nextDue),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // Reagent Bar
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Reagent Level',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF64748B),
                          ),
                        ),
                        Text(
                          '${item.reagentLevelPercent}%',
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: item.reagentLevelPercent / 100,
                        backgroundColor: const Color(0xFFF1F5F9),
                        valueColor: AlwaysStoppedAnimation<Color>(
                          item.reagentLevelPercent > 40
                              ? const Color(0xFF06B6D4)
                              : const Color(0xFFF59E0B),
                        ),
                        minHeight: 6,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 14),
              OutlinedButton.icon(
                onPressed: () => _runCalibration(item),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFF06B6D4)),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                icon: const Icon(Icons.play_arrow_rounded,
                    size: 16, color: Color(0xFF06B6D4)),
                label: const Text(
                  'Run QC',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF06B6D4),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.ssid_chart_rounded,
                    size: 14, color: Color(0xFF64748B)),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    item.westgardStatus,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF475569),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _miniInfo(String title, String val) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
        ),
        const SizedBox(height: 1),
        Text(
          val,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: Color(0xFF0F172A),
          ),
        ),
      ],
    );
  }

  Widget _checkItem(String title, bool done) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(
            done ? Icons.check_circle_rounded : Icons.radio_button_unchecked,
            color: done ? const Color(0xFF10B981) : const Color(0xFF94A3B8),
            size: 18,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              title,
              style: TextStyle(
                fontSize: 12,
                color: done ? const Color(0xFF0F172A) : const Color(0xFF64748B),
                fontWeight: done ? FontWeight.w600 : FontWeight.w400,
                decoration: done ? TextDecoration.lineThrough : null,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

