import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/receptionist_models.dart';

Color _queueStatusColor(QueueStatus s) {
  switch (s) {
    case QueueStatus.waiting:
      return AppTheme.warning;
    case QueueStatus.called:
      return AppTheme.primary;
    case QueueStatus.inConsultation:
      return AppTheme.purple;
    case QueueStatus.done:
      return AppTheme.success;
    case QueueStatus.noShow:
      return AppTheme.textMuted;
  }
}

Color _queueStatusBg(QueueStatus s) {
  switch (s) {
    case QueueStatus.waiting:
      return AppTheme.warningLight;
    case QueueStatus.called:
      return AppTheme.primaryLight;
    case QueueStatus.inConsultation:
      return AppTheme.purpleLight;
    case QueueStatus.done:
      return AppTheme.successLight;
    case QueueStatus.noShow:
      return AppTheme.surfaceMuted;
  }
}

Color _priorityColor(String priority) {
  switch (priority) {
    case 'Emergency':
      return AppTheme.danger;
    case 'Urgent':
      return AppTheme.orange;
    default:
      return AppTheme.success;
  }
}

Color _priorityBg(String priority) {
  switch (priority) {
    case 'Emergency':
      return AppTheme.dangerLight;
    case 'Urgent':
      return AppTheme.orangeLight;
    default:
      return AppTheme.successLight;
  }
}

/// Single queue row card with number, patient info, status, and priority.
class QueueEntryCard extends StatelessWidget {
  final QueueEntry entry;
  final VoidCallback? onCallNext;
  final VoidCallback? onMarkDone;

  const QueueEntryCard({
    super.key,
    required this.entry,
    this.onCallNext,
    this.onMarkDone,
  });

  @override
  Widget build(BuildContext context) {
    final statusColor = _queueStatusColor(entry.status);
    final statusBg = _queueStatusBg(entry.status);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Queue number badge
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: statusBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: statusColor.withValues(alpha: 0.3)),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '#${entry.queueNumber}',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: statusColor,
                    height: 1,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        entry.patientName,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                          color: AppTheme.textPrimary,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: _priorityBg(entry.priority),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        entry.priority,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: _priorityColor(entry.priority),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  entry.pid,
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppTheme.textMuted,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.local_hospital_outlined,
                        size: 13, color: AppTheme.textMuted),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        '${entry.doctorName} · ${entry.department}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppTheme.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Row(
                  children: [
                    const Icon(Icons.schedule_rounded,
                        size: 13, color: AppTheme.textMuted),
                    const SizedBox(width: 4),
                    Text(
                      'Checked in ${entry.checkinTime}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                    if (entry.status == QueueStatus.waiting) ...[
                      const SizedBox(width: 8),
                      Container(
                        width: 3,
                        height: 3,
                        decoration: const BoxDecoration(
                          color: AppTheme.textMuted,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Wait: ${entry.estimatedWait}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppTheme.warning,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 8),
                // Status + actions row
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: statusBg,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        entry.statusLabel,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: statusColor,
                        ),
                      ),
                    ),
                    const Spacer(),
                    if (entry.status == QueueStatus.waiting && onCallNext != null)
                      _ActionChip(
                        label: 'Call',
                        icon: Icons.call_rounded,
                        color: AppTheme.primary,
                        bg: AppTheme.primaryLight,
                        onTap: onCallNext!,
                      ),
                    if (entry.status == QueueStatus.inConsultation &&
                        onMarkDone != null) ...[
                      _ActionChip(
                        label: 'Done',
                        icon: Icons.check_circle_outline_rounded,
                        color: AppTheme.success,
                        bg: AppTheme.successLight,
                        onTap: onMarkDone!,
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final Color bg;
  final VoidCallback onTap;

  const _ActionChip({
    required this.label,
    required this.icon,
    required this.color,
    required this.bg,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 13, color: color),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
