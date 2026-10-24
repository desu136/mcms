import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/storage/sqlite_database.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/doctor_repository.dart';
import 'doctor_medical_records_screen.dart';
import 'doctor_prescriptions_screen.dart';
import 'doctor_lab_results_screen.dart';
import 'doctor_messages_screen.dart';
import 'doctor_profile_screen.dart';
import 'doctor_settings_screen.dart';

class DoctorMoreScreen extends ConsumerWidget {
  final MobileDatabaseService dbService;

  const DoctorMoreScreen({super.key, required this.dbService});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    const doctor = DoctorRepository.currentDoctor;
    final state = ref.watch(doctorProvider);
    final unreadMessages =
        state.conversations.fold<int>(0, (sum, c) => sum + c.unreadCount);

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Clinical Workstation Menu'),
        elevation: 0,
        backgroundColor: Colors.white,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: AppTheme.border, height: 1),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Doctor Mini Profile Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.border),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.02),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFF1E6BFF), width: 1.5),
                      image: DecorationImage(
                        image: NetworkImage(doctor.avatar),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          doctor.name,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${doctor.role} • ${doctor.department}',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF1E6BFF),
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.arrow_forward_ios_rounded,
                        size: 16, color: Color(0xFF94A3B8)),
                    onPressed: () {
                      Navigator.push<void>(
                        context,
                        MaterialPageRoute<void>(
                          builder: (_) => const DoctorProfileScreen(),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Clinical Modules Menu
            _sectionHeader('Clinical Services'),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.border),
              ),
              child: Column(
                children: [
                  _menuItem(
                    context,
                    icon: Icons.description_outlined,
                    iconColor: const Color(0xFF1E6BFF),
                    iconBg: const Color(0xFFEFF6FF),
                    title: 'Medical Records',
                    subtitle: 'Consultation history & clinical charts',
                    onTap: () => Navigator.push<void>(
                      context,
                      MaterialPageRoute<void>(
                        builder: (_) => const DoctorMedicalRecordsScreen(),
                      ),
                    ),
                  ),
                  _divider(),
                  _menuItem(
                    context,
                    icon: Icons.medication_rounded,
                    iconColor: const Color(0xFF8B5CF6),
                    iconBg: const Color(0xFFF5F3FF),
                    title: 'Prescriptions',
                    subtitle: 'Active scripts, refills & drug orders',
                    onTap: () => Navigator.push<void>(
                      context,
                      MaterialPageRoute<void>(
                        builder: (_) => const DoctorPrescriptionsScreen(),
                      ),
                    ),
                  ),
                  _divider(),
                  _menuItem(
                    context,
                    icon: Icons.science_rounded,
                    iconColor: const Color(0xFFF97316),
                    iconBg: const Color(0xFFFFF7ED),
                    title: 'Lab Results',
                    subtitle: 'Pathology, blood panels & reports',
                    onTap: () => Navigator.push<void>(
                      context,
                      MaterialPageRoute<void>(
                        builder: (_) => const DoctorLabResultsScreen(),
                      ),
                    ),
                  ),
                  _divider(),
                  _menuItem(
                    context,
                    icon: Icons.chat_bubble_outline_rounded,
                    iconColor: const Color(0xFF10B981),
                    iconBg: const Color(0xFFECFDF5),
                    title: 'Messages',
                    subtitle: 'Direct patient & hospital staff comms',
                    badge: unreadMessages > 0 ? '$unreadMessages' : null,
                    onTap: () => Navigator.push<void>(
                      context,
                      MaterialPageRoute<void>(
                        builder: (_) => const DoctorMessagesScreen(),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // System & Settings
            _sectionHeader('Preferences & Workstation'),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.border),
              ),
              child: Column(
                children: [
                  _menuItem(
                    context,
                    icon: Icons.settings_outlined,
                    iconColor: const Color(0xFF64748B),
                    iconBg: const Color(0xFFF1F5F9),
                    title: 'Settings & Local SQLite Sync',
                    subtitle: 'Offline queue, version & credentials',
                    onTap: () => Navigator.push<void>(
                      context,
                      MaterialPageRoute<void>(
                        builder: (_) =>
                            DoctorSettingsScreen(dbService: dbService),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  static Widget _sectionHeader(String title) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Padding(
        padding: const EdgeInsets.only(left: 4, bottom: 8),
        child: Text(
          title,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: Color(0xFF64748B),
            letterSpacing: 0.2,
          ),
        ),
      ),
    );
  }

  static Widget _menuItem(
    BuildContext context, {
    required IconData icon,
    required Color iconColor,
    required Color iconBg,
    required String title,
    required String subtitle,
    String? badge,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: iconBg,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF64748B),
                    ),
                  ),
                ],
              ),
            ),
            if (badge != null) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFFEF4444),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  badge,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(width: 8),
            ],
            const Icon(Icons.chevron_right_rounded,
                color: Color(0xFF94A3B8), size: 18),
          ],
        ),
      ),
    );
  }

  static Widget _divider() =>
      const Divider(height: 1, thickness: 0.8, color: Color(0xFFF1F5F9));
}
