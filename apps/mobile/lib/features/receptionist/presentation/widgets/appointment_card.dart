import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/receptionist_models.dart';

// ─── Status Badge ──────────────────────────────────────────────────────────────

Color _appointmentStatusColor(ReceptionistAppointmentStatus s) {
  switch (s) {
    case ReceptionistAppointmentStatus.confirmed:
      return AppTheme.primary;
    case ReceptionistAppointmentStatus.pending:
      return AppTheme.warning;
    case ReceptionistAppointmentStatus.cancelled:
      return AppTheme.danger;
    case ReceptionistAppointmentStatus.completed:
      return AppTheme.success;
    case ReceptionistAppointmentStatus.inProgress:
      return AppTheme.purple;
  }
}

Color _appointmentStatusBg(ReceptionistAppointmentStatus s) {
  switch (s) {
    case ReceptionistAppointmentStatus.confirmed:
      return AppTheme.primaryLight;
    case ReceptionistAppointmentStatus.pending:
      return AppTheme.warningLight;
    case ReceptionistAppointmentStatus.cancelled:
      return AppTheme.dangerLight;
    case ReceptionistAppointmentStatus.completed:
      return AppTheme.successLight;
    case ReceptionistAppointmentStatus.inProgress:
      return AppTheme.purpleLight;
  }
}

/// Single appointment row card.
class AppointmentCard extends StatelessWidget {
  final ReceptionistAppointment appt;
  final VoidCallback? onTap;

  const AppointmentCard({super.key, required this.appt, this.onTap});

  @override
  Widget build(BuildContext context) {
    final statusColor = _appointmentStatusColor(appt.status);
    final statusBg = _appointmentStatusBg(appt.status);

    return GestureDetector(
      onTap: onTap,
      child: Container(
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
            // Avatar circle
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppTheme.primary.withValues(alpha: 0.8),
                    AppTheme.primaryDark,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(
                child: Text(
                  appt.patientInitials,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
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
                          appt.patientName,
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
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: statusBg,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          appt.statusLabel,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: statusColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    appt.pid,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppTheme.textMuted,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.access_time_rounded,
                          size: 13, color: AppTheme.textMuted),
                      const SizedBox(width: 4),
                      Text(
                        '${appt.time} · ${appt.date}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppTheme.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Row(
                    children: [
                      const Icon(Icons.person_outline_rounded,
                          size: 13, color: AppTheme.textMuted),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          '${appt.doctorName} · ${appt.department}',
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
                  Text(
                    appt.reason,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppTheme.textMuted,
                      fontStyle: FontStyle.italic,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
