import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/storage/sqlite_database.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/lab_models.dart';
import '../../data/lab_repository.dart';
import '../widgets/lab_app_bar.dart';
import '../widgets/lab_kpi_card.dart';
import '../widgets/active_stat_specimen_card.dart';
import '../widgets/lab_quick_action_button.dart';
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
    final tech = ref.watch(labProfileProvider);
    final kpis = ref.watch(labKpisProvider);
    final orders = ref.watch(labOrdersProvider);
    final panicAlerts = ref.watch(labPanicAlertsProvider);
    final samples = ref.watch(labSamplesProvider);

    // Active STAT test under analysis
    final statOrder = orders.firstWhere(
      (o) => o.priority == LabPriority.stat,
      orElse: () => orders.first,
    );

    // Today's laboratory queue (first 4)
    final recentOrders = orders.take(4).toList();

    return RefreshIndicator(
      color: const Color(0xFF06B6D4),
      backgroundColor: Colors.white,
      onRefresh: () async {
        await Future<void>.delayed(const Duration(milliseconds: 500));
      },
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        children: [
          // ─── Welcome Header & Calendar Date Card (Matches Doctor Design) ───
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Welcome Back, ${tech.name}',
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.textPrimary,
                        letterSpacing: -0.3,
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 3),
                    const Text(
                      "Here's what's happening in your laboratory workstation today.",
                      style: TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF64748B),
                        height: 1.25,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),

              // Calendar Date Card
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.border, width: 1),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.02),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.calendar_month_outlined,
                      color: Color(0xFF06B6D4),
                      size: 16,
                    ),
                    SizedBox(width: 6),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Oct 19, 2026',
                          style: TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.textPrimary,
                            letterSpacing: -0.2,
                          ),
                        ),
                        Text(
                          'Monday',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF94A3B8),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // ─── 2x2 Grid of Rich KPI Cards with Full Internal Breakdowns ─────
          Row(
            children: [
              Expanded(
                child: LabKpiCard(
                  title: 'Total Tests Today',
                  value: '${kpis.totalTestsToday}',
                  valueColor: const Color(0xFF1E6BFF),
                  icon: Icons.biotech_rounded,
                  iconColor: const Color(0xFF1E6BFF),
                  iconBg: const Color(0xFFEFF6FF),
                  trendValue: '+12%',
                  isTrendUp: true,
                  isTrendPositive: true,
                  subtitle: '134 Routine • 14 STAT',
                  onTap: () => _showTestsBreakdownModal(context, orders),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: LabKpiCard(
                  title: 'Pending Analysis',
                  value: '${kpis.pendingAnalysis}',
                  valueColor: const Color(0xFFF59E0B),
                  icon: Icons.hourglass_top_rounded,
                  iconColor: const Color(0xFFD97706),
                  iconBg: const Color(0xFFFEF3C7),
                  trendValue: '-8%',
                  isTrendUp: false,
                  isTrendPositive: true,
                  subtitle: '6 Urgent in Analyzers',
                  onTap: () => _showAnalysisQueueModal(context, orders),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: LabKpiCard(
                  title: 'Samples Accessioned',
                  value: '${kpis.samplesCollected}',
                  valueColor: const Color(0xFF06B6D4),
                  icon: Icons.water_drop_rounded,
                  iconColor: const Color(0xFF06B6D4),
                  iconBg: const Color(0xFFECFEFF),
                  trendValue: '+5%',
                  isTrendUp: true,
                  isTrendPositive: true,
                  subtitle: '58 In Lab • 4 In Transit',
                  onTap: () => _showSamplesBreakdownModal(context, samples),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: LabKpiCard(
                  title: 'Verified Results',
                  value: '${kpis.verifiedResults}',
                  valueColor: const Color(0xFF10B981),
                  icon: Icons.fact_check_rounded,
                  iconColor: const Color(0xFF059669),
                  iconBg: const Color(0xFFECFDF5),
                  trendValue: '98.4%',
                  isTrendUp: true,
                  isTrendPositive: true,
                  subtitle: 'All Released to EMR',
                  onTap: () => _showVerifiedResultsModal(context),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // ─── Critical Panic Value Alert Banner ────────────────────────────
          if (panicAlerts.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFFECDD3), width: 1.2),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.warning_amber_rounded,
                              color: Color(0xFFDC2626), size: 18),
                          const SizedBox(width: 6),
                          Text(
                            '${panicAlerts.length} CRITICAL PANIC VALUES DETECTED',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFFDC2626),
                              letterSpacing: 0.3,
                            ),
                          ),
                        ],
                      ),
                      GestureDetector(
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute<void>(
                              builder: (_) => const LabMessagesScreen(),
                            ),
                          );
                        },
                        child: const Text(
                          'Notify Doctor →',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFFDC2626),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ...panicAlerts.map(
                    (alert) => Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Row(
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(
                              color: Color(0xFFDC2626),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              '${alert.patientName}: ${alert.parameter} (${alert.value}) • Ref: ${alert.referenceRange}',
                              style: const TextStyle(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF991B1B),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // ─── Active STAT Specimen Card (Matches CurrentPatientCard) ────────
          ActiveStatSpecimenCard(
            order: statOrder,
            onEnterResults: () => onNavigateTab(3),
            onNotifyDoctor: () {
              Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => const LabMessagesScreen(),
                ),
              );
            },
            onViewDetails: () => _showOrderDetailsSheet(context, statOrder),
          ),

          const SizedBox(height: 18),

          // ─── Quick Actions Row (2x2 Grid Matching Doctor Module) ──────────
          Row(
            children: [
              Expanded(
                child: LabQuickActionButton(
                  icon: Icons.qr_code_scanner_rounded,
                  label: 'Scan Tube Barcode',
                  iconColor: const Color(0xFF06B6D4),
                  iconBgColor: const Color(0xFFECFEFF),
                  onTap: () => onNavigateTab(2),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: LabQuickActionButton(
                  icon: Icons.edit_note_rounded,
                  label: 'Enter Lab Results',
                  iconColor: const Color(0xFF1E6BFF),
                  iconBgColor: const Color(0xFFEFF6FF),
                  onTap: () => onNavigateTab(3),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: LabQuickActionButton(
                  icon: Icons.precision_manufacturing_rounded,
                  label: 'Run Daily QC',
                  iconColor: const Color(0xFF10B981),
                  iconBgColor: const Color(0xFFECFDF5),
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute<void>(
                        builder: (_) => const LabQcScreen(),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: LabQuickActionButton(
                  icon: Icons.chat_rounded,
                  label: 'Clinical Intercom',
                  iconColor: const Color(0xFF8B5CF6),
                  iconBgColor: const Color(0xFFF5F3FF),
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute<void>(
                        builder: (_) => const LabMessagesScreen(),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          // ─── Today's Laboratory Queue Card (Matches Today's Schedule) ──────
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.border, width: 1),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.02),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.biotech_rounded,
                            color: Color(0xFF06B6D4), size: 20),
                        SizedBox(width: 8),
                        Text(
                          "Today's Laboratory Queue",
                          style: TextStyle(
                            fontSize: 14.5,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                      ],
                    ),
                    GestureDetector(
                      onTap: () => onNavigateTab(1),
                      child: const Text(
                        'See All',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF06B6D4),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                const SizedBox(height: 8),

                ...recentOrders.map((order) => _buildQueueItem(context, order)),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // ─── Analyzer Instrument QA Health Strip ──────────────────────────
          Container(
            padding: const EdgeInsets.all(14),
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
                        Icon(Icons.tune_rounded,
                            color: Color(0xFF06B6D4), size: 18),
                        SizedBox(width: 6),
                        Text(
                          'Analyzer Instrument QA Status',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                      ],
                    ),
                    GestureDetector(
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute<void>(
                            builder: (_) => const LabQcScreen(),
                          ),
                        );
                      },
                      child: const Text(
                        'Calibrate →',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF06B6D4),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(child: _analyzerPill('Sysmex XN-550', 'Passed', const Color(0xFF10B981))),
                    const SizedBox(width: 6),
                    Expanded(child: _analyzerPill('Cobas c311', 'Passed', const Color(0xFF10B981))),
                    const SizedBox(width: 6),
                    Expanded(child: _analyzerPill('GeneXpert', 'Ready', const Color(0xFF06B6D4))),
                    const SizedBox(width: 6),
                    Expanded(child: _analyzerPill('Mindray BC', 'Due', const Color(0xFFF59E0B))),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
        ],
      ),
    );
  }

  Widget _analyzerPill(String name, String status, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Column(
        children: [
          Text(
            name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            status,
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQueueItem(BuildContext context, LabTestOrder order) {
    final isStat = order.priority == LabPriority.stat;
    final isUrgent = order.priority == LabPriority.urgent;

    return InkWell(
      onTap: () => _showOrderDetailsSheet(context, order),
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            // Time Badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                order.orderedAt,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF475569),
                ),
              ),
            ),
            const SizedBox(width: 10),

            // Patient Info & Test
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          order.patientName,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F172A),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 6),
                      if (isStat)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 5, vertical: 1),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEF4444),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'STAT',
                            style: TextStyle(
                              fontSize: 8.5,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                            ),
                          ),
                        )
                      else if (isUrgent)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 5, vertical: 1),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF3C7),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'URGENT',
                            style: TextStyle(
                              fontSize: 8.5,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFFB45309),
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 1),
                  Text(
                    '${order.testName} • ${order.department}',
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF64748B),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),

            // Status chip
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: order.status == LabOrderStatus.inAnalysis
                    ? const Color(0xFFFEF3C7)
                    : order.status == LabOrderStatus.verified
                        ? const Color(0xFFDCFCE7)
                        : const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                order.status.name.toUpperCase(),
                style: TextStyle(
                  fontSize: 9.5,
                  fontWeight: FontWeight.w800,
                  color: order.status == LabOrderStatus.inAnalysis
                      ? const Color(0xFFB45309)
                      : order.status == LabOrderStatus.verified
                          ? const Color(0xFF15803D)
                          : const Color(0xFF1D4ED8),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Modal Sheet: Tests Today Breakdown ───────────────────────────────────
  void _showTestsBreakdownModal(BuildContext context, List<LabTestOrder> orders) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        height: MediaQuery.of(context).size.height * 0.8,
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
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
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Today\'s Tests Breakdown (148 Total)',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            const Text(
              'Laboratory work order distributions across hospital stations',
              style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 14),

            // Department distribution pills
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _deptPill('Hematology: 68', const Color(0xFF1E6BFF)),
                  _deptPill('Biochemistry: 52', const Color(0xFF06B6D4)),
                  _deptPill('Microbiology: 18', const Color(0xFF10B981)),
                  _deptPill('Serology: 10', const Color(0xFF8B5CF6)),
                ],
              ),
            ),
            const SizedBox(height: 14),
            const Divider(height: 1),
            const SizedBox(height: 10),

            Expanded(
              child: ListView.separated(
                itemCount: orders.length,
                separatorBuilder: (_, __) => const Divider(height: 1),
                itemBuilder: (ctx, i) {
                  final ord = orders[i];
                  return ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(
                      ord.patientName,
                      style: const TextStyle(
                          fontSize: 13.5, fontWeight: FontWeight.w700),
                    ),
                    subtitle: Text(
                      '${ord.testName} • ${ord.department} (${ord.orderedAt})',
                      style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                    ),
                    trailing: Text(
                      ord.status.name.toUpperCase(),
                      style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF06B6D4)),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF06B6D4),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                onPressed: () {
                  Navigator.pop(context);
                  onNavigateTab(1);
                },
                child: const Text('Open Full Lab Tests Screen'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Modal Sheet: Pending Analysis Queue ──────────────────────────────────
  void _showAnalysisQueueModal(BuildContext context, List<LabTestOrder> orders) {
    final pending = orders.where((o) => o.status != LabOrderStatus.verified).toList();

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        height: MediaQuery.of(context).size.height * 0.75,
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
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
              'In Analysis Queue (24 Active)',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Specimens loaded in automated analyzers and bench incubators',
              style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView.separated(
                itemCount: pending.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (ctx, i) {
                  final ord = pending[i];
                  return Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              ord.patientName,
                              style: const TextStyle(
                                  fontSize: 13, fontWeight: FontWeight.w800),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFEF3C7),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text(
                                'RUNNING',
                                style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w800,
                                    color: Color(0xFFB45309)),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${ord.testName} (${ord.department})',
                          style: const TextStyle(fontSize: 11.5, color: Color(0xFF475569)),
                        ),
                        const SizedBox(height: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: const LinearProgressIndicator(
                            value: 0.75,
                            backgroundColor: Color(0xFFE2E8F0),
                            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF06B6D4)),
                            minHeight: 5,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF06B6D4),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                icon: const Icon(Icons.edit_note_rounded, size: 18),
                label: const Text('Enter Results Now'),
                onPressed: () {
                  Navigator.pop(context);
                  onNavigateTab(3);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Modal Sheet: Samples Accessioning Breakdown ──────────────────────────
  void _showSamplesBreakdownModal(BuildContext context, List<LabSample> samples) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        height: MediaQuery.of(context).size.height * 0.75,
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
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
              'Specimen Accessioning Log (62)',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Barcoded blood, serum, and culture tubes checked into laboratory',
              style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView.separated(
                itemCount: samples.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (ctx, i) {
                  final s = samples[i];
                  return Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: const Color(0xFF06B6D4).withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.qr_code_2_rounded,
                              color: Color(0xFF06B6D4), size: 18),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${s.patientName} (${s.barcode})',
                                style: const TextStyle(
                                    fontSize: 13, fontWeight: FontWeight.w700),
                              ),
                              Text(
                                '${s.specimenType} • ${s.tubeColor} Tube',
                                style: const TextStyle(
                                    fontSize: 11, color: Color(0xFF64748B)),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFDCFCE7),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'RECEIVED',
                            style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF15803D)),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF06B6D4),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                icon: const Icon(Icons.qr_code_scanner_rounded, size: 18),
                label: const Text('Scan Tube Barcode'),
                onPressed: () {
                  Navigator.pop(context);
                  onNavigateTab(2);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Modal Sheet: Verified Results ────────────────────────────────────────
  void _showVerifiedResultsModal(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        height: MediaQuery.of(context).size.height * 0.7,
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
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
              'Verified & Released Results (118)',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              '100% transmitted to Hospital EMR • Turnaround compliance 98.4%',
              style: TextStyle(fontSize: 12, color: Color(0xFF10B981)),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView(
                children: [
                  _verifiedTile('Aster Mulu', 'CBC', 'Hb 6.4 (Critical Released)', '08:45 AM'),
                  _verifiedTile('Abebe Assefa', 'RBS', 'Glucose: 245 mg/dL (Normal release)', '09:30 AM'),
                  _verifiedTile('Tigist Alemu', 'LFT', 'ALT: 32 U/L, AST: 28 U/L (Normal)', '10:05 AM'),
                  _verifiedTile('Meron Tadesse', 'KFT', 'Creatinine: 1.1 mg/dL, BUN: 18 (Normal)', '10:20 AM'),
                ],
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: () {
                  Navigator.pop(context);
                  onNavigateTab(3);
                },
                child: const Text('View All in Results Tab'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _verifiedTile(String patient, String test, String result, String time) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(patient, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800)),
              Text('$test: $result', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
            ],
          ),
          Text(time, style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
        ],
      ),
    );
  }

  Widget _deptPill(String label, Color color) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }

  void _showOrderDetailsSheet(BuildContext context, LabTestOrder order) {
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
            Text(
              order.testName,
              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
            ),
            Text(
              '${order.orderNumber} • ${order.department}',
              style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 14),
            Text('Patient: ${order.patientName} (${order.patientPid})'),
            Text('Ward/Room: ${order.patientRoom}'),
            Text('Ordering Physician: ${order.orderingDoctor}'),
            Text('Ordered At: ${order.orderedAt}'),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

// ─── Navigation Item ──────────────────────────────────────────────────────────

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  final int badge;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.isActive,
    this.badge = 0,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = isActive ? const Color(0xFF06B6D4) : const Color(0xFF94A3B8);

    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  Icon(icon, color: color, size: 24),
                  if (badge > 0)
                    Positioned(
                      top: -3,
                      right: -6,
                      child: Container(
                        padding: const EdgeInsets.all(3),
                        decoration: const BoxDecoration(
                          color: Color(0xFFEF4444),
                          shape: BoxShape.circle,
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 15,
                          minHeight: 15,
                        ),
                        child: Text(
                          badge > 9 ? '9+' : '$badge',
                          style: const TextStyle(
                            fontSize: 9,
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 3),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                  color: color,
                ),
                maxLines: 1,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
