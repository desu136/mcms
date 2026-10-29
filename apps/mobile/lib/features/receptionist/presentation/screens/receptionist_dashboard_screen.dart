import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/storage/sqlite_database.dart';
import '../../../../core/auth/auth_provider.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/receptionist_repository.dart';
import '../../data/receptionist_models.dart';
import '../widgets/receptionist_app_bar.dart';
import '../widgets/receptionist_kpi_card.dart';
import '../widgets/appointment_card.dart';
import '../widgets/queue_entry_card.dart';
import 'receptionist_appointments_screen.dart';
import 'receptionist_patients_screen.dart';
import 'receptionist_queue_screen.dart';
import 'receptionist_more_screen.dart';

class ReceptionistDashboardScreen extends ConsumerStatefulWidget {
  final MobileDatabaseService dbService;

  const ReceptionistDashboardScreen({super.key, required this.dbService});

  @override
  ConsumerState<ReceptionistDashboardScreen> createState() =>
      _ReceptionistDashboardScreenState();
}

class _ReceptionistDashboardScreenState
    extends ConsumerState<ReceptionistDashboardScreen> {
  int _currentTabIndex = 0;

  void _onSelectTab(int index) {
    setState(() => _currentTabIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final receptionist = ref.watch(receptionistProfileProvider);

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: _currentTabIndex == 0
          ? ReceptionistAppBar(
              userName: receptionist.name,
              notificationCount: receptionist.unreadNotifications,
              onAvatarTap: () => _showProfileSheet(context),
              onNotificationsTap: () => _showNotificationsSheet(context),
            )
          : null,
      body: IndexedStack(
        index: _currentTabIndex,
        children: [
          _ReceptionistHomeBody(
            onNavigateTab: _onSelectTab,
            dbService: widget.dbService,
          ),
          ReceptionistAppointmentsScreen(onNavigateTab: _onSelectTab),
          const ReceptionistQueueScreen(),
          const ReceptionistPatientsScreen(),
          ReceptionistMoreScreen(dbService: widget.dbService),
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
                icon: Icons.calendar_month_rounded,
                label: 'Appointments',
                isActive: _currentTabIndex == 1,
                onTap: () => _onSelectTab(1),
              ),
              _NavItem(
                icon: Icons.queue_rounded,
                label: 'Queue',
                isActive: _currentTabIndex == 2,
                badge: ref
                    .watch(receptionistQueueProvider)
                    .where((q) =>
                        q.status.name == 'waiting' ||
                        q.status.name == 'called')
                    .length,
                onTap: () => _onSelectTab(2),
              ),
              _NavItem(
                icon: Icons.people_alt_rounded,
                label: 'Patients',
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

  void _showProfileSheet(BuildContext context) {
    final receptionist = ref.read(receptionistProfileProvider);
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => _ProfileSheet(receptionist: receptionist),
    );
  }

  void _showNotificationsSheet(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => const _NotificationsSheet(),
    );
  }
}

// ─── Home Body ────────────────────────────────────────────────────────────────

class _ReceptionistHomeBody extends ConsumerWidget {
  final void Function(int) onNavigateTab;
  final MobileDatabaseService dbService;

  const _ReceptionistHomeBody({
    required this.onNavigateTab,
    required this.dbService,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final kpis = ref.watch(receptionistKpisProvider);
    final appointments = ref.watch(receptionistAppointmentsProvider);
    final queue = ref.watch(receptionistQueueProvider);

    // Today's appointments (first 3)
    final todayAppts = appointments
        .where((a) =>
            a.date == 'Oct 27, 2026' &&
            a.status != ReceptionistAppointmentStatus.cancelled)
        .take(3)
        .toList();

    // Active queue (first 3)
    final activeQueue = queue
        .where((q) =>
            q.status == QueueStatus.waiting ||
            q.status == QueueStatus.called ||
            q.status == QueueStatus.inConsultation)
        .take(3)
        .toList();

    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Date pill
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryLight,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'Monday, Oct 27, 2026',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.primary,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Reception Overview',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Here\'s a summary of today\'s activity',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ),

        // ─── KPI Cards (2 columns) ────────────────────────────────────────
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.35,
            ),
            delegate: SliverChildListDelegate([
              ReceptionistKpiCard(
                label: 'Today\'s Patients',
                value: '${kpis.todayPatients}',
                icon: Icons.people_alt_rounded,
                iconColor: AppTheme.primary,
                iconBg: AppTheme.primaryLight,
                trend: '+6',
              ),
              ReceptionistKpiCard(
                label: 'Pending Queue',
                value: '${kpis.pendingQueue}',
                icon: Icons.queue_rounded,
                iconColor: AppTheme.warning,
                iconBg: AppTheme.warningLight,
              ),
              ReceptionistKpiCard(
                label: 'Appointments',
                value: '${kpis.todayAppointments}',
                icon: Icons.calendar_today_rounded,
                iconColor: AppTheme.purple,
                iconBg: AppTheme.purpleLight,
              ),
              ReceptionistKpiCard(
                label: 'Collected Today',
                value: 'ETB ${(kpis.collectedToday / 1000).toStringAsFixed(1)}k',
                icon: Icons.payments_rounded,
                iconColor: AppTheme.success,
                iconBg: AppTheme.successLight,
                trend: '+12%',
              ),
            ]),
          ),
        ),

        // ─── Quick Actions ────────────────────────────────────────────────
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Quick Actions',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    _QuickActionButton(
                      label: 'Register\nPatient',
                      icon: Icons.person_add_rounded,
                      color: AppTheme.primary,
                      bg: AppTheme.primaryLight,
                      onTap: () => onNavigateTab(3),
                    ),
                    const SizedBox(width: 10),
                    _QuickActionButton(
                      label: 'Book\nAppointment',
                      icon: Icons.calendar_month_rounded,
                      color: AppTheme.purple,
                      bg: AppTheme.purpleLight,
                      onTap: () => onNavigateTab(1),
                    ),
                    const SizedBox(width: 10),
                    _QuickActionButton(
                      label: 'Check\nIn Patient',
                      icon: Icons.how_to_reg_rounded,
                      color: AppTheme.success,
                      bg: AppTheme.successLight,
                      onTap: () => onNavigateTab(2),
                    ),
                    const SizedBox(width: 10),
                    _QuickActionButton(
                      label: 'Process\nBilling',
                      icon: Icons.receipt_long_rounded,
                      color: AppTheme.orange,
                      bg: AppTheme.orangeLight,
                      onTap: () => onNavigateTab(4),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),

        // ─── Today's Appointments ─────────────────────────────────────────
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
            child: Row(
              children: [
                const Expanded(
                  child: Text(
                    'Today\'s Appointments',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: () => onNavigateTab(1),
                  child: const Text(
                    'See All',
                    style: TextStyle(
                      fontSize: 13,
                      color: AppTheme.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, i) => AppointmentCard(appt: todayAppts[i]),
              childCount: todayAppts.length,
            ),
          ),
        ),

        // ─── Active Queue ─────────────────────────────────────────────────
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
            child: Row(
              children: [
                const Expanded(
                  child: Text(
                    'Active Queue',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: () => onNavigateTab(2),
                  child: const Text(
                    'See All',
                    style: TextStyle(
                      fontSize: 13,
                      color: AppTheme.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, i) => QueueEntryCard(entry: activeQueue[i]),
              childCount: activeQueue.length,
            ),
          ),
        ),
      ],
    );
  }
}

// ─── Quick Action Button ──────────────────────────────────────────────────────

class _QuickActionButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final Color bg;
  final VoidCallback onTap;

  const _QuickActionButton({
    required this.label,
    required this.icon,
    required this.color,
    required this.bg,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: color.withValues(alpha: 0.2)),
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 24),
              const SizedBox(height: 6),
              Text(
                label,
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: color,
                  height: 1.2,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Bottom Nav Item ──────────────────────────────────────────────────────────

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
    required this.onTap,
    this.badge = 0,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.center,
              children: [
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: isActive
                        ? AppTheme.primaryLight
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    icon,
                    color: isActive
                        ? AppTheme.primary
                        : AppTheme.textMuted,
                    size: 22,
                  ),
                ),
                if (badge > 0)
                  Positioned(
                    top: 0,
                    right: 0,
                    child: Container(
                      width: 16,
                      height: 16,
                      decoration: const BoxDecoration(
                        color: AppTheme.danger,
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          '$badge',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight:
                    isActive ? FontWeight.w700 : FontWeight.w500,
                color: isActive ? AppTheme.primary : AppTheme.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Profile Sheet ────────────────────────────────────────────────────────────

class _ProfileSheet extends ConsumerWidget {
  final ReceptionistProfile receptionist;
  const _ProfileSheet({required this.receptionist});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 12),
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: const Color(0xFFE2E8F0),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 24),
          // Avatar
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1E6BFF), Color(0xFF0D52D6)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Center(
              child: Text(
                receptionist.name
                    .trim()
                    .split(' ')
                    .where((String p) => p.isNotEmpty)
                    .take(2)
                    .map((String p) => p[0].toUpperCase())
                    .join(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            receptionist.name,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '${receptionist.role} · ${receptionist.department}',
            style: const TextStyle(
              fontSize: 14,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            receptionist.hospital,
            style: const TextStyle(
              fontSize: 13,
              color: AppTheme.textMuted,
            ),
          ),
          const SizedBox(height: 24),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: _ProfileRow(
                icon: Icons.email_outlined, text: receptionist.email),
          ),
          const SizedBox(height: 10),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child:
                _ProfileRow(icon: Icons.phone_outlined, text: receptionist.phone),
          ),
          const SizedBox(height: 24),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () async {
                  Navigator.pop(context);
                  await ref.read(authProvider.notifier).logout();
                },
                icon: const Icon(Icons.logout_rounded, size: 18),
                label: const Text('Sign Out'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.danger,
                  side: const BorderSide(color: AppTheme.danger),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _ProfileRow extends StatelessWidget {
  final IconData icon;
  final String text;
  const _ProfileRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: AppTheme.surfaceMuted,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, size: 16, color: AppTheme.textSecondary),
        ),
        const SizedBox(width: 12),
        Text(
          text,
          style: const TextStyle(
            fontSize: 14,
            color: AppTheme.textSecondary,
          ),
        ),
      ],
    );
  }
}

// ─── Notifications Sheet ──────────────────────────────────────────────────────

class _NotificationsSheet extends StatelessWidget {
  const _NotificationsSheet();

  @override
  Widget build(BuildContext context) {
    final notifications = [
      const _NotifData(
        icon: Icons.queue_rounded,
        color: AppTheme.warning,
        bg: AppTheme.warningLight,
        title: 'Queue Alert',
        body: 'Patient #4 (Kebede Lemma) marked Emergency',
        time: '5 min ago',
      ),
      const _NotifData(
        icon: Icons.calendar_month_rounded,
        color: AppTheme.primary,
        bg: AppTheme.primaryLight,
        title: 'New Appointment',
        body: 'Appointment booked for Hana Girma at 3:30 PM',
        time: '18 min ago',
      ),
      const _NotifData(
        icon: Icons.receipt_long_rounded,
        color: AppTheme.danger,
        bg: AppTheme.dangerLight,
        title: 'Overdue Invoice',
        body: 'INV-2026-0835 for Dawit Mesfin is overdue',
        time: '2 hrs ago',
      ),
      const _NotifData(
        icon: Icons.person_add_rounded,
        color: AppTheme.success,
        bg: AppTheme.successLight,
        title: 'New Registration',
        body: 'Hana Girma registered as a new patient',
        time: '3 hrs ago',
      ),
    ];

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 12),
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: const Color(0xFFE2E8F0),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 20),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                Text(
                  'Notifications',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textPrimary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          ...notifications.map(
            (n) => Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: n.bg,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(n.icon, color: n.color, size: 18),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          n.title,
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          n.body,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          n.time,
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppTheme.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

class _NotifData {
  final IconData icon;
  final Color color;
  final Color bg;
  final String title;
  final String body;
  final String time;
  const _NotifData({
    required this.icon,
    required this.color,
    required this.bg,
    required this.title,
    required this.body,
    required this.time,
  });
}
