import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/storage/sqlite_database.dart';
import '../../../../core/auth/auth_provider.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/clinic_admin_repository.dart';
import '../../../auth/presentation/screens/login_screen.dart';
import '../../../doctor/presentation/screens/doctor_dashboard_screen.dart';
import '../../../nurse/presentation/screens/nurse_dashboard_screen.dart';
import '../../../receptionist/presentation/screens/receptionist_dashboard_screen.dart';

class ClinicAdminMoreScreen extends ConsumerWidget {
  final MobileDatabaseService dbService;

  const ClinicAdminMoreScreen({super.key, required this.dbService});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profile = ref.watch(clinicAdminProfileProvider);
    final stats = ref.watch(clinicAdminStatsProvider);

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text(
          'Clinic Administration',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppTheme.textPrimary,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Admin Profile & Clinic Header Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: AppTheme.primary,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Center(
                          child: Text(
                            profile.initials,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              profile.name,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${profile.role} • ${profile.clinicCode}',
                              style: const TextStyle(
                                color: Color(0xFF94A3B8),
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Divider(color: Color(0xFF334155), height: 1),
                  const SizedBox(height: 14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildHeaderInfoItem('Clinic Name', profile.clinicName),
                      _buildHeaderInfoItem('Active Branch', profile.activeBranch),
                      _buildHeaderInfoItem('Accreditation', 'MOH Tier-1'),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // Financial & Billing Snapshot
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.account_balance_wallet_rounded,
                              size: 18, color: AppTheme.success),
                          SizedBox(width: 8),
                          Text(
                            'Financial Snapshot (Today)',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.successLight,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text(
                          'Healthy',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.success,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Collections',
                              style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              'ETB ${stats.todayRevenue.toStringAsFixed(0)}',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(width: 1, height: 36, color: AppTheme.border),
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.only(left: 16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Pending Invoices',
                                style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                '${stats.pendingInvoices} Claims',
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w800,
                                  color: AppTheme.warning,
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

            const SizedBox(height: 20),

            // Operational Settings Section
            _buildSectionHeader('Operational Management'),
            const SizedBox(height: 8),
            _buildSettingsTile(
              icon: Icons.access_time_rounded,
              iconColor: AppTheme.primary,
              title: 'Operating Hours & Shift Rosters',
              subtitle: 'Manage regular clinical and emergency on-call hours',
              onTap: () {
                _showInfoDialog(context, 'Operating Hours',
                    'Main Campus: 24/7 Emergency & Inpatient\nOutpatient: 08:00 AM - 08:00 PM\nSunday: 09:00 AM - 02:00 PM');
              },
            ),
            _buildSettingsTile(
              icon: Icons.sync_rounded,
              iconColor: AppTheme.purple,
              title: 'Local Database & Offline Sync',
              subtitle: 'SQLite cache active · 100% synchronized',
              onTap: () {
                _showInfoDialog(context, 'Offline Sync Status',
                    'Local database: Active\nStorage: SQLite persistent\nLast synced: Just now\nPending write mutations: 0');
              },
            ),
            _buildSettingsTile(
              icon: Icons.security_rounded,
              iconColor: AppTheme.cyan,
              title: 'Security, Roles & Access Logs',
              subtitle: 'Review clinical audit trail and permissions',
              onTap: () {
                _showInfoDialog(context, 'Audit & Security',
                    'All medical records and billing actions are logged with timestamp, user ID, and IP signature.');
              },
            ),

            const SizedBox(height: 20),

            // Workstation Preview Switcher
            _buildSectionHeader('Preview Workstations (Admin Oversight)'),
            const SizedBox(height: 8),
            _buildSettingsTile(
              icon: Icons.medical_services_rounded,
              iconColor: AppTheme.primary,
              title: 'Doctor Workstation',
              subtitle: 'View active physician clinical schedule & consultation queue',
              onTap: () {
                Navigator.push<void>(
                  context,
                  MaterialPageRoute<void>(builder: (_) => DoctorDashboardScreen(dbService: dbService)),
                );
              },
            ),
            _buildSettingsTile(
              icon: Icons.health_and_safety_rounded,
              iconColor: AppTheme.success,
              title: 'Nurse Workstation',
              subtitle: 'View vitals triage queue, bed occupancy & medication schedule',
              onTap: () {
                Navigator.push<void>(
                  context,
                  MaterialPageRoute<void>(builder: (_) => NurseDashboardScreen(dbService: dbService)),
                );
              },
            ),
            _buildSettingsTile(
              icon: Icons.badge_rounded,
              iconColor: AppTheme.orange,
              title: 'Receptionist Workstation',
              subtitle: 'View front desk admissions, token dispenser & patient queue',
              onTap: () {
                Navigator.push<void>(
                  context,
                  MaterialPageRoute<void>(builder: (_) => ReceptionistDashboardScreen(dbService: dbService)),
                );
              },
            ),

            const SizedBox(height: 24),

            // Log Out Button
            OutlinedButton.icon(
              onPressed: () => _confirmLogout(context, ref),
              icon: const Icon(Icons.logout_rounded, color: AppTheme.danger, size: 20),
              label: const Text(
                'Sign Out of Clinic Admin',
                style: TextStyle(
                  color: AppTheme.danger,
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                ),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFFECDD3), width: 1.5),
                backgroundColor: AppTheme.dangerLight,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeaderInfoItem(String title, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.w500),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
        ),
      ],
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title.toUpperCase(),
      style: const TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w800,
        color: AppTheme.textMuted,
        letterSpacing: 0.8,
      ),
    );
  }

  Widget _buildSettingsTile({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.border),
      ),
      child: ListTile(
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: iconColor.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: iconColor, size: 20),
        ),
        title: Text(
          title,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppTheme.textPrimary,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: const TextStyle(
            fontSize: 12,
            color: AppTheme.textSecondary,
          ),
        ),
        trailing: const Icon(Icons.chevron_right_rounded, color: AppTheme.textMuted, size: 20),
      ),
    );
  }

  void _showInfoDialog(BuildContext context, String title, String message) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
        content: Text(message, style: const TextStyle(fontSize: 14, color: AppTheme.textSecondary)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('OK', style: TextStyle(fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  void _confirmLogout(BuildContext context, WidgetRef ref) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Confirm Sign Out', style: TextStyle(fontWeight: FontWeight.w700)),
        content: const Text('Are you sure you want to log out of the Clinic Admin workstation?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await ref.read(authProvider.notifier).logout();
              if (context.mounted) {
                Navigator.of(context).pushAndRemoveUntil<void>(
                  MaterialPageRoute<void>(builder: (_) => LoginScreen(dbService: dbService)),
                  (route) => false,
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.danger,
            ),
            child: const Text('Sign Out', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}

