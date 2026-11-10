import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/lab_models.dart';

class LabOrderCard extends StatelessWidget {
  final LabTestOrder order;
  final VoidCallback? onTap;
  final VoidCallback? onAction;

  const LabOrderCard({
    super.key,
    required this.order,
    this.onTap,
    this.onAction,
  });

  Color get _priorityColor {
    switch (order.priority) {
      case LabPriority.stat:
        return AppTheme.danger;
      case LabPriority.urgent:
        return AppTheme.warning;
      case LabPriority.routine:
        return AppTheme.primary;
    }
  }

  Color get _priorityBg {
    switch (order.priority) {
      case LabPriority.stat:
        return AppTheme.dangerLight;
      case LabPriority.urgent:
        return AppTheme.warningLight;
      case LabPriority.routine:
        return AppTheme.primaryLight;
    }
  }

  String get _statusLabel {
    switch (order.status) {
      case LabOrderStatus.pending:
        return 'Pending Specimen';
      case LabOrderStatus.collected:
        return 'Sample Collected';
      case LabOrderStatus.inAnalysis:
        return 'In Analyzer Run';
      case LabOrderStatus.verified:
        return 'Verified & Released';
      case LabOrderStatus.cancelled:
        return 'Cancelled';
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
            // Top Row: Patient Info + Priority Tag
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Patient Avatar
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppTheme.primaryLight,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Text(
                      order.initials,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primary,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        order.patientName,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${order.patientPid} • ${order.patientAge}y • ${order.patientRoom}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _priorityBg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: _priorityColor.withValues(alpha: 0.3)),
                  ),
                  child: Text(
                    order.priority.name.toUpperCase(),
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: _priorityColor,
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),
            const Divider(color: AppTheme.borderLight, height: 1),
            const SizedBox(height: 12),

            // Middle Row: Test Name & Department
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        order.testName,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Icon(Icons.biotech_rounded,
                              size: 14, color: AppTheme.cyan),
                          const SizedBox(width: 4),
                          Text(
                            order.department,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppTheme.textSecondary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '•  ${order.orderedAt}',
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppTheme.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Status bar + Action button
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: order.status == LabOrderStatus.verified
                        ? AppTheme.successLight
                        : AppTheme.surfaceMuted,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        order.status == LabOrderStatus.verified
                            ? Icons.check_circle_rounded
                            : Icons.hourglass_top_rounded,
                        size: 13,
                        color: order.status == LabOrderStatus.verified
                            ? AppTheme.success
                            : AppTheme.textSecondary,
                      ),
                      const SizedBox(width: 5),
                      Text(
                        _statusLabel,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: order.status == LabOrderStatus.verified
                              ? AppTheme.success
                              : AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                if (onAction != null)
                  ElevatedButton(
                    onPressed: onAction,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      minimumSize: const Size(0, 32),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text(
                      order.status == LabOrderStatus.pending
                          ? 'Collect Sample'
                          : order.status == LabOrderStatus.collected
                              ? 'Run Analyzer'
                              : 'View Details',
                      style: const TextStyle(
                          fontSize: 11, fontWeight: FontWeight.w700),
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

