import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/storage/sqlite_database.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/clinic_admin_repository.dart';
import '../widgets/clinic_admin_app_bar.dart';
import '../widgets/clinic_admin_kpi_card.dart';
import '../widgets/clinic_admin_modals.dart';
import 'clinic_admin_facilities_screen.dart';
import 'clinic_admin_staff_screen.dart';
import 'clinic_admin_appointments_screen.dart';
import 'clinic_admin_more_screen.dart';

class ClinicAdminDashboardScreen extends ConsumerStatefulWidget {
  final MobileDatabaseService dbService;

  const ClinicAdminDashboardScreen({super.key, required this.dbService});

  @override
  ConsumerState<ClinicAdminDashboardScreen> createState() =>
      _ClinicAdminDashboardScreenState();
}

class _ClinicAdminDashboardScreenState
    extends ConsumerState<ClinicAdminDashboardScreen> {
  int _currentTabIndex = 0;

  void _onSelectTab(int index) {
    setState(() => _currentTabIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final profile = ref.watch(clinicAdminProfileProvider);
    final branches = ref.watch(clinicAdminBranchesProvider);
    final activities = ref.watch(clinicAdminActivitiesProvider);

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: _currentTabIndex == 0
          ? ClinicAdminAppBar(
              profile: profile,
              availableBranches: branches.map((b) => b.name).toList(),
              onBranchChanged: (newBranch) {
                ref
                    .read(clinicAdminChangeNotifierProvider.notifier)
                    .setActiveBranch(newBranch);
              },
              onAvatarTap: () => ClinicAdminModals.showProfileSheet(context, profile),
              onNotificationsTap: () =>
                  ClinicAdminModals.showNotificationsSheet(context, activities),
            )
          : null,
      body: IndexedStack(
        index: _currentTabIndex,
        children: [
          _ClinicAdminHomeBody(
            onNavigateTab: _onSelectTab,
            dbService: widget.dbService,
          ),
          const ClinicAdminFacilitiesScreen(),
          const ClinicAdminStaffScreen(),
          const ClinicAdminAppointmentsScreen(),
          ClinicAdminMoreScreen(dbService: widget.dbService),
        ],
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildBottomNav() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: const Border(
          top: BorderSide(color: Color(0xFFE2E8F0), width: 1),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, -3),
          ),
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
          child: Row(
            children: [
              _NavItem(
                icon: Icons.dashboard_rounded,
                label: 'Dashboard',
                isActive: _currentTabIndex == 0,
                onTap: () => _onSelectTab(0),
              ),
              _NavItem(
                icon: Icons.business_rounded,
                label: 'Facilities',
                isActive: _currentTabIndex == 1,
                onTap: () => _onSelectTab(1),
              ),
              _NavItem(
                icon: Icons.people_alt_rounded,
                label: 'Staff',
                isActive: _currentTabIndex == 2,
                onTap: () => _onSelectTab(2),
              ),
              _NavItem(
                icon: Icons.calendar_month_rounded,
                label: 'Schedule',
                isActive: _currentTabIndex == 3,
                onTap: () => _onSelectTab(3),
              ),
              _NavItem(
                icon: Icons.settings_rounded,
                label: 'Admin',
                isActive: _currentTabIndex == 4,
                onTap: () => _onSelectTab(4),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(10),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  icon,
                  size: 22,
                  color: isActive ? AppTheme.primary : AppTheme.textMuted,
                ),
                const SizedBox(height: 3),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                    color: isActive ? AppTheme.primary : AppTheme.textMuted,
                  ),
                  maxLines: 1,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ClinicAdminHomeBody extends ConsumerWidget {
  final ValueChanged<int> onNavigateTab;
  final MobileDatabaseService dbService;

  const _ClinicAdminHomeBody({
    required this.onNavigateTab,
    required this.dbService,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profile = ref.watch(clinicAdminProfileProvider);
    final stats = ref.watch(clinicAdminStatsProvider);
    final departments = ref.watch(clinicAdminDepartmentsProvider);
    final activities = ref.watch(clinicAdminActivitiesProvider);

    return RefreshIndicator(
      onRefresh: () async {
        await ref.read(clinicAdminChangeNotifierProvider.notifier).refresh();
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 30),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Facility Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E6BFF), Color(0xFF0D52D6)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF1E6BFF).withValues(alpha: 0.28),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.18),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: Color(0xFF4ADE80),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Text(
                              'FACILITY OPERATIONAL',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Text(
                        'Tier-1 Center',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    profile.clinicName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Active Branch: ${profile.activeBranch}',
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // Section Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'CLINIC PERFORMANCE OVERVIEW',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textMuted,
                    letterSpacing: 0.8,
                  ),
                ),
                Text(
                  'Updated live',
                  style: TextStyle(fontSize: 11, color: Colors.blueGrey.shade400),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // 4 Core KPI Cards Grid
            Row(
              children: [
                Expanded(
                  child: ClinicAdminKpiCard(
                    label: 'Total Patients',
                    value: '${stats.totalPatients}',
                    icon: Icons.people_alt_rounded,
                    iconColor: AppTheme.primary,
                    iconBg: AppTheme.primaryLight,
                    trend: stats.patientTrend,
                    isPositiveTrend: true,
                    subtitle: 'Active records',
                    onTap: () => onNavigateTab(3),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ClinicAdminKpiCard(
                    label: 'Appointments',
                    value: '${stats.todayAppointments}',
                    icon: Icons.calendar_month_rounded,
                    iconColor: AppTheme.purple,
                    iconBg: AppTheme.purpleLight,
                    subtitle: '${stats.completedAppointments} completed',
                    trend: '${stats.pendingAppointments} pending',
                    isPositiveTrend: true,
                    onTap: () => onNavigateTab(3),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: ClinicAdminKpiCard(
                    label: 'Active Doctors',
                    value: '${stats.activeDoctors}/${stats.totalDoctors}',
                    icon: Icons.medical_services_rounded,
                    iconColor: AppTheme.success,
                    iconBg: AppTheme.successLight,
                    subtitle: 'On Duty Today',
                    onTap: () => onNavigateTab(2),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ClinicAdminKpiCard(
                    label: 'Live Queue',
                    value: '${stats.waitingQueue}',
                    icon: Icons.queue_rounded,
                    iconColor: AppTheme.orange,
                    iconBg: AppTheme.orangeLight,
                    subtitle: 'Waiting consultation',
                    onTap: () => onNavigateTab(3),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Quick Administrative Actions
            const Text(
              'QUICK ADMINISTRATIVE ACTIONS',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: AppTheme.textMuted,
                letterSpacing: 0.8,
              ),
            ),
            const SizedBox(height: 10),

            Row(
              children: [
                Expanded(
                  child: _buildActionBtn(
                    context: context,
                    icon: Icons.business_rounded,
                    label: 'Add Branch',
                    color: AppTheme.primary,
                    bg: AppTheme.primaryLight,
                    onTap: () => ClinicAdminModals.showAddBranchModal(context, ref),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildActionBtn(
                    context: context,
                    icon: Icons.meeting_room_rounded,
                    label: 'Add Dept',
                    color: AppTheme.purple,
                    bg: AppTheme.purpleLight,
                    onTap: () => ClinicAdminModals.showAddDepartmentModal(context, ref),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildActionBtn(
                    context: context,
                    icon: Icons.person_add_alt_1_rounded,
                    label: 'Add Staff',
                    color: AppTheme.cyan,
                    bg: AppTheme.cyanLight,
                    onTap: () => ClinicAdminModals.showAddStaffModal(context, ref),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Departments & Room Allocation
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'DEPARTMENTS & WORKLOAD',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textMuted,
                    letterSpacing: 0.8,
                  ),
                ),
                TextButton(
                  onPressed: () => onNavigateTab(1),
                  style: TextButton.styleFrom(
                    visualDensity: VisualDensity.compact,
                    padding: EdgeInsets.zero,
                  ),
                  child: const Text(
                    'View All',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.primary,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),

            if (departments.isEmpty)
              Container(
                padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.border),
                ),
                child: const Center(
                  child: Text(
                    'No departments registered yet',
                    style: TextStyle(fontSize: 13, color: AppTheme.textMuted),
                  ),
                ),
              )
            else
              ...departments.take(3).map((dept) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppTheme.border),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppTheme.purpleLight,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.local_hospital_rounded,
                            color: AppTheme.purple, size: 18),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              dept.name,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Head: ${dept.headDoctor}',
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppTheme.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '${dept.roomCount} Rooms',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          Text(
                            '${dept.staffCount} Staff',
                            style: const TextStyle(
                              fontSize: 10,
                              color: AppTheme.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              }),

            const SizedBox(height: 18),

            // Recent Activity Stream
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'RECENT CLINIC AUDIT TRAIL',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textMuted,
                    letterSpacing: 0.8,
                  ),
                ),
                Text(
                  '${activities.length} entries',
                  style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                ),
              ],
            ),
            const SizedBox(height: 8),

            if (activities.isEmpty)
              Container(
                padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.border),
                ),
                child: const Center(
                  child: Text(
                    'No recent clinic events recorded',
                    style: TextStyle(fontSize: 13, color: AppTheme.textMuted),
                  ),
                ),
              )
            else
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.border),
                ),
                child: ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: activities.take(4).length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (context, i) {
                    final act = activities[i];
                    return ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                      leading: const CircleAvatar(
                        radius: 16,
                        backgroundColor: AppTheme.primaryLight,
                        child: Icon(Icons.bolt_rounded, size: 16, color: AppTheme.primary),
                      ),
                      title: Text(
                        act.title,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      subtitle: Text(
                        act.description,
                        style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                      ),
                      trailing: Text(
                        act.timeAgo,
                        style: const TextStyle(fontSize: 10, color: AppTheme.textMuted),
                      ),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionBtn({
    required BuildContext context,
    required IconData icon,
    required String label,
    required Color color,
    required Color bg,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppTheme.border),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: bg, shape: BoxShape.circle),
                child: Icon(icon, color: color, size: 18),
              ),
              const SizedBox(height: 8),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

