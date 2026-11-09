import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/lab_models.dart';

class LabSampleCard extends StatelessWidget {
  final LabSample sample;
  final VoidCallback? onTap;
  final VoidCallback? onCheckIn;

  const LabSampleCard({
    super.key,
    required this.sample,
    this.onTap,
    this.onCheckIn,
  });

  String get _statusLabel {
    switch (sample.status) {
      case LabSampleStatus.pendingCollection:
        return 'Pending Collection';
      case LabSampleStatus.collected:
        return 'Collected';
      case LabSampleStatus.receivedInLab:
        return 'Received in Lab';
      case LabSampleStatus.processed:
        return 'Processed';
      case LabSampleStatus.rejected:
        return 'Rejected';
    }
  }

  Color get _statusColor {
    switch (sample.status) {
      case LabSampleStatus.pendingCollection:
        return AppTheme.warning;
      case LabSampleStatus.collected:
        return AppTheme.primary;
      case LabSampleStatus.receivedInLab:
        return AppTheme.purple;
      case LabSampleStatus.processed:
        return AppTheme.success;
      case LabSampleStatus.rejected:
        return AppTheme.danger;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top: Specimen Barcode & Status
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceMuted,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.qr_code_2_rounded,
                          size: 16, color: AppTheme.textPrimary),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      sample.sampleId,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: _statusColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _statusLabel,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: _statusColor,
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 10),

            // Patient Info & Test Name
            Text(
              sample.patientName,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              '${sample.patientPid} • ${sample.testName} (${sample.department})',
              style: const TextStyle(
                fontSize: 12,
                color: AppTheme.textSecondary,
              ),
            ),

            const SizedBox(height: 10),

            // Tube & Specimen Type Pills
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppTheme.cyanLight,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.water_drop_rounded,
                          size: 11, color: AppTheme.cyan),
                      const SizedBox(width: 4),
                      Text(
                        sample.specimenType,
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.cyan,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 6),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppTheme.purpleLight,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    sample.tubeColor,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.purple,
                    ),
                  ),
                ),
                const Spacer(),
                if (sample.status == LabSampleStatus.collected && onCheckIn != null)
                  ElevatedButton(
                    onPressed: onCheckIn,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.purple,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      minimumSize: const Size(0, 28),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                    child: const Text(
                      'Receive in Lab',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

