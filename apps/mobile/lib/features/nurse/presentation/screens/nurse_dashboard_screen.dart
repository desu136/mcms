import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/storage/sqlite_database.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/nurse_models.dart';
import '../../data/nurse_repository.dart';
import '../widgets/nurse_app_bar.dart';
import '../widgets/nurse_kpi_card.dart';
import '../widgets/nurse_modals.dart';
import 'nurse_patients_screen.dart';
import 'nurse_vitals_screen.dart';
import 'nurse_medications_screen.dart';
import 'nurse_more_screen.dart';
import 'nurse_lab_samples_screen.dart';
import 'nurse_profile_screen.dart';

class NurseDashboardScreen extends ConsumerStatefulWidget {
  final MobileDatabaseService dbService;

  const NurseDashboardScreen({super.key, required this.dbService});

  @override
  ConsumerState<NurseDashboardScreen> createState() =>
      _NurseDashboardScreenState();
}

class _NurseDashboardScreenState
    extends ConsumerState<NurseDashboardScreen> {
  int _currentTabIndex = 0;

  void _onSelectTab(int index) {
    setState(() => _currentTabIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final nurse = ref.watch(nurseProfileProvider);
    final activePatients = ref.watch(nursePatientsProvider).length;
    final dueMedsCount = ref
        .watch(nurseMedicationsProvider)
        .where((m) => m.status == MedStatus.dueSoon || m.status == MedStatus.pending)
        .length;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: _currentTabIndex == 0
          ? NurseAppBar(
              userName: nurse.name,
              ward: nurse.ward,
              avatar: nurse.avatar,
              notificationCount: nurse.unreadNotifications,
              onAvatarTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const NurseProfileScreen(),
                  ),
                );
              },
              onNotificationsTap: () {
                _showNotificationsSheet(context);
              },
            )
          : null,
      body: IndexedStack(
        index: _currentTabIndex,
        children: [
          _NurseHomeBody(onNavigateTab: _onSelectTab),
          const NursePatientsScreen(),
          const NurseVitalsScreen(),
          const NurseMedicationsScreen(),
          const NurseMoreScreen(),
        ],
      ),
      bottomNavigationBar: _buildBottomNav(activePatients, dueMedsCount),
    );
  }

  Widget _buildBottomNav(int activePatients, int dueMeds) {
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
        top: false,
        child: SizedBox(
          height: 60,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _navButton(
                index: 0,
                icon: Icons.dashboard_outlined,
                activeIcon: Icons.dashboard_rounded,
                label: 'Dashboard',
              ),
              _navButton(
                index: 1,
                icon: Icons.people_outline_rounded,
                activeIcon: Icons.people_rounded,
                label: 'Patients',
                badge: activePatients > 0 ? '$activePatients' : null,
              ),
              _navButton(
                index: 2,
                icon: Icons.monitor_heart_outlined,
                activeIcon: Icons.monitor_heart_rounded,
                label: 'Vitals',
              ),
              _navButton(
                index: 3,
                icon: Icons.medication_outlined,
                activeIcon: Icons.medication_rounded,
                label: 'eMAR',
                badge: dueMeds > 0 ? '$dueMeds' : null,
                badgeColor: const Color(0xFFF59E0B),
              ),
              _navButton(
                index: 4,
                icon: Icons.grid_view_rounded,
                activeIcon: Icons.grid_view_rounded,
                label: 'More',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _navButton({
    required int index,
    required IconData icon,
    required IconData activeIcon,
    required String label,
    String? badge,
    Color? badgeColor,
  }) {
    final isActive = _currentTabIndex == index;
    final color = isActive ? const Color(0xFF2563EB) : const Color(0xFF64748B);

    return InkWell(
      onTap: () => _onSelectTab(index),
      child: SizedBox(
        width: 68,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(isActive ? activeIcon : icon, color: color, size: 22),
                if (badge != null)
                  Positioned(
                    top: -4,
                    right: -10,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 4,
                        vertical: 1,
                      ),
                      decoration: BoxDecoration(
                        color: badgeColor ?? const Color(0xFF2563EB),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 16,
                        minHeight: 14,
                      ),
                      child: Text(
                        badge,
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
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                color: color,
              ),
              maxLines: 1,
            ),
          ],
        ),
      ),
    );
  }

  void _showNotificationsSheet(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Ward Alerts & Notifications',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF0F172A),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, size: 20),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const Divider(),
            _alertTile(
              'High Blood Pressure Alert',
              'Samuel Girma (Room 2B-03) reported BP 142/88 mmHg',
              const Color(0xFFEF4444),
            ),
            _alertTile(
              'STAT Lab Ordered',
              'Dr. Fitsum ordered STAT ABG for Getachew (1B-05)',
              const Color(0xFF9333EA),
            ),
            _alertTile(
              'Medication Due in 15 mins',
              'Amoxicillin IV drip due for Samuel Girma',
              const Color(0xFFF59E0B),
            ),
          ],
        ),
      ),
    );
  }

  Widget _alertTile(String title, String subtitle, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 10,
            height: 10,
            margin: const EdgeInsets.only(top: 4, right: 10),
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Home Tab Body Widget
// ─────────────────────────────────────────────────────────────────────────────

class _NurseHomeBody extends ConsumerWidget {
  final void Function(int) onNavigateTab;

  const _NurseHomeBody({required this.onNavigateTab});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final patients = ref.watch(nursePatientsProvider);
    final meds = ref.watch(nurseMedicationsProvider);
    final labSamples = ref.watch(nurseLabSamplesProvider);
    final tasks = ref.watch(nurseTasksProvider);

    final dueMeds =
        meds.where((m) => m.status == MedStatus.dueSoon).toList();
    final urgentLabs =
        labSamples.where((s) => s.priority == SamplePriority.urgent).length;
    final vitalsDue = patients
        .where((p) => p.vitalsStatus == VitalsCondition.critical)
        .length;

    return RefreshIndicator(
      onRefresh: () async {
        await Future<void>.delayed(const Duration(milliseconds: 300));
      },
      color: const Color(0xFF2563EB),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Shift Banner
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E40AF), Color(0xFF2563EB)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF2563EB).withValues(alpha: 0.25),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.schedule_rounded,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Morning Shift: 07:00 – 15:00',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Ward 3A • Lead Doctor: Dr. Fitsum Alemu',
                          style: TextStyle(
                            fontSize: 11,
                            color: Color(0xFFDBEAFE),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      'ACTIVE',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // KPI Grid
            Row(
              children: [
                Expanded(
                  child: NurseKpiCard(
                    title: 'Inpatients',
                    value: '${patients.length}',
                    icon: Icons.people_alt_rounded,
                    iconColor: const Color(0xFF2563EB),
                    iconBgColor: const Color(0xFFEFF6FF),
                    subtitle: 'Ward 3A beds occupied',
                    onTap: () => onNavigateTab(1),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: NurseKpiCard(
                    title: 'Pending Meds',
                    value: '${meds.where((m) => m.status != MedStatus.administered).length}',
                    icon: Icons.medication_rounded,
                    iconColor: const Color(0xFFF59E0B),
                    iconBgColor: const Color(0xFFFFFBEB),
                    subtitle: '${dueMeds.length} due now',
                    onTap: () => onNavigateTab(3),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: NurseKpiCard(
                    title: 'Vitals Alert',
                    value: '$vitalsDue',
                    icon: Icons.monitor_heart_rounded,
                    iconColor: const Color(0xFFEF4444),
                    iconBgColor: const Color(0xFFFEF2F2),
                    subtitle: 'Requires immediate vitals',
                    onTap: () => onNavigateTab(2),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: NurseKpiCard(
                    title: 'Urgent Labs',
                    value: '$urgentLabs',
                    icon: Icons.science_rounded,
                    iconColor: const Color(0xFF9333EA),
                    iconBgColor: const Color(0xFFFAF5FF),
                    subtitle: 'STAT specimen draws',
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (_) => const NurseLabSamplesScreen(),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Quick Actions Bar
            const Text(
              'Quick Clinical Actions',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                _actionBtn(
                  context,
                  icon: Icons.monitor_heart_rounded,
                  label: 'Log Vitals',
                  color: const Color(0xFF2563EB),
                  bg: const Color(0xFFEFF6FF),
                  onTap: () => NurseModals.showRecordVitals(context, ref),
                ),
                const SizedBox(width: 8),
                _actionBtn(
                  context,
                  icon: Icons.medication_rounded,
                  label: 'eMAR Meds',
                  color: const Color(0xFFF59E0B),
                  bg: const Color(0xFFFFFBEB),
                  onTap: () => onNavigateTab(3),
                ),
                const SizedBox(width: 8),
                _actionBtn(
                  context,
                  icon: Icons.colorize_rounded,
                  label: 'Lab Draw',
                  color: const Color(0xFF9333EA),
                  bg: const Color(0xFFFAF5FF),
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute<void>(
                        builder: (_) => const NurseLabSamplesScreen(),
                      ),
                    );
                  },
                ),
                const SizedBox(width: 8),
                _actionBtn(
                  context,
                  icon: Icons.add_task_rounded,
                  label: 'New Task',
                  color: const Color(0xFF10B981),
                  bg: const Color(0xFFECFDF5),
                  onTap: () => NurseModals.showAddTask(context, ref),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Due Medications Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Medications Due Now',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF0F172A),
                  ),
                ),
                TextButton(
                  onPressed: () => onNavigateTab(3),
                  child: const Text('View All eMAR'),
                ),
              ],
            ),
            if (dueMeds.isEmpty)
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.check_circle_rounded,
                        color: Color(0xFF10B981), size: 20),
                    SizedBox(width: 10),
                    Text(
                      'All scheduled doses for current hour administered!',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF10B981),
                      ),
                    ),
                  ],
                ),
              )
            else
              ...dueMeds.take(2).map(
                    (med) => _dueMedCard(context, ref, med),
                  ),
            const SizedBox(height: 20),

            // Today's Tasks Checklist
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Immediate Care Checklist',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF0F172A),
                  ),
                ),
                TextButton(
                  onPressed: () {
                    onNavigateTab(4); // More
                  },
                  child: const Text('View All'),
                ),
              ],
            ),
            ...tasks.take(3).map(
                  (t) => _taskMiniCard(context, ref, t),
                ),
          ],
        ),
      ),
    );
  }

  Widget _actionBtn(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
    required Color bg,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: color.withValues(alpha: 0.2)),
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 22),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: color,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _dueMedCard(BuildContext context, WidgetRef ref, NurseMedication med) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: Color(0xFFFDE68A)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundImage: NetworkImage(med.patientAvatar),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${med.medicationName} (${med.dose})',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  Text(
                    '${med.patientName} • ${med.room} • ${med.route}',
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF64748B),
                    ),
                  ),
                ],
              ),
            ),
            ElevatedButton(
              onPressed: () {
                NurseModals.showAdministerMedication(context, ref, med);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFF59E0B),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                elevation: 0,
              ),
              child: const Text(
                'Give',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _taskMiniCard(BuildContext context, WidgetRef ref, NursingTask task) {
    final isDone = task.status == TaskStatus.completed;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Checkbox(
            value: isDone,
            activeColor: const Color(0xFF10B981),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
            onChanged: (_) {
              ref.read(nurseTasksProvider.notifier).update((list) {
                return list.map((t) {
                  if (t.id == task.id) {
                    return t.copyWith(
                      status: isDone ? TaskStatus.pending : TaskStatus.completed,
                    );
                  }
                  return t;
                }).toList();
              });
            },
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  task.title,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    decoration: isDone ? TextDecoration.lineThrough : null,
                    color: isDone ? const Color(0xFF94A3B8) : const Color(0xFF0F172A),
                  ),
                ),
                Text(
                  '${task.patientName} (${task.room}) • Due ${task.dueTime}',
                  style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
