import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/doctor_models.dart';

class ScheduleItemRow extends StatelessWidget {
  final AppointmentItem appointment;
  final VoidCallback? onTap;
  final bool showDivider;

  const ScheduleItemRow({
    super.key,
    required this.appointment,
    this.onTap,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    Color badgeBg;
    Color badgeFg;
    Color badgeBorder;

    switch (appointment.status) {
      case AppointmentStatus.completed:
        badgeBg = const Color(0xFFECFDF5);
        badgeFg = const Color(0xFF10B981);
        badgeBorder = const Color(0xFFA7F3D0);
        break;
      case AppointmentStatus.inProgress:
        badgeBg = const Color(0xFFEFF6FF);
        badgeFg = const Color(0xFF1E6BFF);
        badgeBorder = const Color(0xFFBFDBFE);
        break;
      case AppointmentStatus.upcoming:
        badgeBg = const Color(0xFFF0F9FF);
        badgeFg = const Color(0xFF0284C7);
        badgeBorder = const Color(0xFFBAE6FD);
        break;
      case AppointmentStatus.cancelled:
        badgeBg = const Color(0xFFFFF1F2);
        badgeFg = const Color(0xFFF43F5E);
        badgeBorder = const Color(0xFFFECDD3);
        break;
    }

    return Column(
      children: [
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
            child: Row(
              children: [
                // Time
                SizedBox(
                  width: 120,
                  child: Text(
                    appointment.time,
                    style: const TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF475569),
                      letterSpacing: -0.2,
                    ),
                  ),
                ),

                // Patient Avatar
                Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppTheme.border, width: 1),
                    image: DecorationImage(
                      image: NetworkImage(appointment.avatar),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                const SizedBox(width: 10),

                // Patient Name and Visit Reason
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        appointment.patientName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textPrimary,
                          letterSpacing: -0.2,
                        ),
                      ),
                      const SizedBox(height: 1),
                      Text(
                        appointment.reason,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w400,
                          color: Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),

                // Status Badge
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 9, vertical: 3.5),
                  decoration: BoxDecoration(
                    color: badgeBg,
                    border: Border.all(color: badgeBorder, width: 0.8),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    appointment.statusLabel,
                    style: TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w600,
                      color: badgeFg,
                      letterSpacing: -0.1,
                    ),
                  ),
                ),
                const SizedBox(width: 4),

                // Chevron
                const Icon(
                  Icons.chevron_right_rounded,
                  color: Color(0xFF94A3B8),
                  size: 18,
                ),
              ],
            ),
          ),
        ),
        if (showDivider)
          const Divider(
            height: 1,
            thickness: 0.8,
            color: Color(0xFFF1F5F9),
          ),
      ],
    );
  }
}
