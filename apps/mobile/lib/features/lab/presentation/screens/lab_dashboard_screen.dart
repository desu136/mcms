import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/storage/sqlite_database.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/lab_models.dart';
import '../../data/lab_repository.dart';
import '../widgets/lab_app_bar.dart';
import '../widgets/lab_kpi_card.dart';
import '../widgets/lab_order_card.dart';
import 'lab_tests_screen.dart';
import 'lab_samples_screen.dart';
import 'lab_results_screen.dart';
import 'lab_more_screen.dart';
import 'lab_profile_screen.dart';
import 'lab_messages_screen.dart';
import 'lab_qc_screen.dart';

class LabDashboardScreen extends ConsumerStatefulWidget {
  final MobileDatabaseService dbService;

  const LabDashboardScreen({super.key, required this.dbService});

  @override
  ConsumerState<LabDashboardScreen> createState() => _LabDashboardScreenState();
}

class _LabDashboardScreenState extends ConsumerState<LabDashboardScreen> {
  int _currentTabIndex = 0;

  void _onSelectTab(int index) {
    setState(() => _currentTabIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final tech = ref.watch(labProfileProvider);

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: _currentTabIndex == 0
          ? LabAppBar(
              userName: tech.name,
              department: tech.department,
              notificationCount: tech.unreadNotifications,
              onAvatarTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const LabProfileScreen(),
                  ),
                );
              },
              onNotificationsTap: () => _showNotificationsSheet(context),
            )
          : null,
      body: IndexedStack(
        index: _currentTabIndex,
        children: [
          _LabHomeBody(
            onNavigateTab: _onSelectTab,
            dbService: widget.dbService,
          ),
          LabTestsScreen(onNavigateTab: _onSelectTab),
          const LabSamplesScreen(),
          const LabResultsScreen(),
          LabMoreScreen(dbService: widget.dbService),
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
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            children: [
              _NavItem(
                icon: Icons.dashboard_rounded,
                label: 'Dashboard',
                isActive: _currentTabIndex == 0,
                onTap: () => _onSelectTab(0),
              ),
              _NavItem(
                icon: Icons.biotech_rounded,
                label: 'Lab Tests',
                isActive: _currentTabIndex == 1,
                onTap: () => _onSelectTab(1),
              ),
              _NavItem(
                icon: Icons.water_drop_rounded,
                label: 'Samples',
                isActive: _currentTabIndex == 2,
                badge: ref
                    .watch(labSamplesProvider)
                    .where((s) => s.status == LabSampleStatus.collected)
                    .length,
                onTap: () => _onSelectTab(2),
              ),
              _NavItem(
                icon: Icons.fact_check_rounded,
                label: 'Results',
                isActive: _currentTabIndex == 3,
                onTap: () => _onSelectTab(3),
              ),
              _NavItem(
                icon: Icons.more_horiz_rounded,
                label: 'More',
                isActive: _currentTabIndex == 4,
                onTap: () => _onSelectTab(4),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showProfileSheet(BuildContext context, LabTechProfile tech) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF06B6D4), Color(0xFF1E6BFF)],
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Center(
                    child: Icon(Icons.science_rounded,
                        color: Colors.white, size: 28),
                  ),
                ),
                const SizedBox(width: 14),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tech.name,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    Text(
                      '${tech.employeeId} • ${tech.role}',
                      style: const TextStyle(
                          fontSize: 12, color: AppTheme.textSecondary),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 12),
            _buildProfileRow(Icons.email_outlined, tech.email),
            _buildProfileRow(Icons.phone_outlined, tech.phone),
            _buildProfileRow(Icons.local_hospital_outlined, tech.hospital),
            _buildProfileRow(Icons.access_time_rounded, tech.shift),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppTheme.textMuted),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                  fontSize: 13, color: AppTheme.textSecondary),
            ),
          ),
        ],
      ),
    );
  }

  void _showNotificationsSheet(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Laboratory Alerts & STAT Notifications',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 14),
            _buildNotifItem('STAT Request: Blood Culture for ICU Bed 4',
                'Dr. Biruk Bekele • 12m ago', AppTheme.danger),
            _buildNotifItem('Critical Low Hemoglobin released for Aster Mulu',
                'Automatic SMS dispatch sent to Dr. Tesfaye • 28m ago', AppTheme.warning),
            _buildNotifItem('Analyzer Mindray BC-5000 self-test passed',
                'Quality Control valid • 1h ago', AppTheme.success),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) => const LabMessagesScreen(),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF06B6D4),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                icon: const Icon(Icons.chat_rounded, size: 16),
                label: const Text('Open Clinical Intercom & Messages'),
              ),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  Widget _buildNotifItem(String title, String subtitle, Color dotColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 8,
            height: 8,
            margin: const EdgeInsets.only(top: 5),
            decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary),
                ),
                Text(
                  subtitle,
                  style: const TextStyle(
                      fontSize: 11, color: AppTheme.textMuted),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Home Body ────────────────────────────────────────────────────────────────

class _LabHomeBody extends ConsumerWidget {
  final void Function(int) onNavigateTab;
  final MobileDatabaseService dbService;

  const _LabHomeBody({
    required this.onNavigateTab,
    required this.dbService,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final kpis = ref.watch(labKpisProvider);
    final orders = ref.watch(labOrdersProvider);
    final panicAlerts = ref.watch(labPanicAlertsProvider);

    // Pending tests today
    final pendingOrders = orders
        .where((o) => o.status != LabOrderStatus.verified)
        .take(3)
        .toList();

    return CustomScrollView(
      slivers: [
        // Title & Header Banner
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Date pill
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryLight,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'Tuesday, Oct 19, 2026',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.primary,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Laboratory Workstation',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Manage bedside phlebotomy, specimen accessioning & results verification',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ),

        // ─── KPI Cards (2 columns grid) ──────────────────────────────────
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.35,
            ),
            delegate: SliverChildListDelegate([
              LabKpiCard(
                label: 'Tests Today',
                value: '${kpis.totalTestsToday}',
                icon: Icons.biotech_rounded,
                iconColor: AppTheme.primary,
                iconBg: AppTheme.primaryLight,
                trend: '+12%',
                onTap: () => onNavigateTab(1),
              ),
              LabKpiCard(
                label: 'In Analysis Queue',
                value: '${kpis.pendingAnalysis}',
                icon: Icons.hourglass_top_rounded,
                iconColor: AppTheme.warning,
                iconBg: AppTheme.warningLight,
                onTap: () => onNavigateTab(1),
              ),
              LabKpiCard(
                label: 'Samples Collected',
                value: '${kpis.samplesCollected}',
                icon: Icons.water_drop_rounded,
                iconColor: AppTheme.cyan,
                iconBg: AppTheme.cyanLight,
                onTap: () => onNavigateTab(2),
              ),
              LabKpiCard(
                label: 'Verified & Released',
                value: '${kpis.verifiedResults}',
                icon: Icons.fact_check_rounded,
                iconColor: AppTheme.success,
                iconBg: AppTheme.successLight,
                trend: '94%',
                onTap: () => onNavigateTab(3),
              ),
            ]),
          ),
        ),

        // ─── Urgent Panic Alerts Banner ──────────────────────────────────
        if (panicAlerts.isNotEmpty)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.dangerLight,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                      color: AppTheme.danger.withValues(alpha: 0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.warning_amber_rounded,
                            color: AppTheme.danger, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          '${panicAlerts.length} Critical Panic Value Alerts',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.danger,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Column(
                      children: panicAlerts.map((alert) {
                        return Padding(
                          padding: const EdgeInsets.only(top: 6),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${alert.patientName}: ${alert.parameter} (${alert.value})',
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: AppTheme.textPrimary,
                                ),
                              ),
                              Text(
                                alert.doctorName,
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: AppTheme.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
            ),
          ),

        // ─── Quick Actions Row ───────────────────────────────────────────
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => onNavigateTab(2),
                    icon: const Icon(Icons.qr_code_scanner_rounded, size: 16),
                    label: const Text('Scan Tube Barcode',
                        style: TextStyle(
                            fontSize: 12, fontWeight: FontWeight.w700)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => onNavigateTab(3),
                    icon: const Icon(Icons.edit_note_rounded, size: 18),
                    label: const Text('Enter Results',
                        style: TextStyle(
                            fontSize: 12, fontWeight: FontWeight.w700)),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.primary,
                      side: const BorderSide(color: AppTheme.primary),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),

        // ─── Active Analysis & Pending Orders ────────────────────────────
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Pending Test Analysis',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textPrimary,
                  ),
                ),
                GestureDetector(
                  onTap: () => onNavigateTab(1),
                  child: const Text(
                    'View All',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),

        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final order = pendingOrders[index];
                return LabOrderCard(
                  order: order,
                  onTap: () => onNavigateTab(1),
                );
              },
              childCount: pendingOrders.length,
            ),
          ),
        ),

        const SliverToBoxAdapter(child: SizedBox(height: 32)),
      ],
    );
  }
}

// ─── Navigation Item ──────────────────────────────────────────────────────────

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  final int? badge;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.isActive,
    this.badge,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = isActive ? AppTheme.primary : AppTheme.textMuted;

    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(icon, color: color, size: 24),
                if (badge != null && badge! > 0)
                  Positioned(
                    top: -4,
                    right: -6,
                    child: Container(
                      padding: const EdgeInsets.all(3),
                      decoration: const BoxDecoration(
                        color: AppTheme.danger,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 14,
                        minHeight: 14,
                      ),
                      child: Text(
                        '$badge',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isActive ? FontWeight.w800 : FontWeight.w500,
                color: color,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

