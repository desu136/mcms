import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/storage/sqlite_database.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/doctor_repository.dart';
import '../widgets/doctor_app_bar.dart';
import '../widgets/doctor_kpi_card.dart';
import '../widgets/schedule_item_card.dart';
import '../widgets/quick_action_button.dart';
import '../widgets/current_patient_card.dart';
import '../widgets/doctor_modals.dart';
import '../widgets/patient_detail_sheet.dart';
import 'doctor_appointments_screen.dart';
import 'doctor_patients_screen.dart';
import 'doctor_more_screen.dart';
import 'doctor_prescriptions_screen.dart';
import 'doctor_lab_results_screen.dart';
import 'doctor_medical_records_screen.dart';
import 'doctor_profile_screen.dart';

class DoctorDashboardScreen extends ConsumerStatefulWidget {
  final MobileDatabaseService dbService;

  const DoctorDashboardScreen({super.key, required this.dbService});

  @override
  ConsumerState<DoctorDashboardScreen> createState() =>
      _DoctorDashboardScreenState();
}

class _DoctorDashboardScreenState extends ConsumerState<DoctorDashboardScreen> {
  int _currentTabIndex = 0;

  void _onSelectTab(int index) {
    setState(() => _currentTabIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: _currentTabIndex == 0
          ? DoctorAppBar(
              onAvatarTap: () {
                _showDoctorMenu(context);
              },
              onNotificationsTap: () {
                _showNotificationsSheet(context);
              },
            )
          : null,
      body: IndexedStack(
        index: _currentTabIndex,
        children: [
          _DoctorHomeBody(
            onNavigateTab: _onSelectTab,
            dbService: widget.dbService,
          ),
          DoctorAppointmentsScreen(onNavigateTab: _onSelectTab),
          const DoctorPatientsScreen(),
          DoctorMoreScreen(dbService: widget.dbService),
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
        top: false,
        child: SizedBox(
          height: 60,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _navButton(
                index: 0,
                icon: Icons.home_rounded,
                activeIcon: Icons.home_rounded,
                label: 'Home',
              ),
              _navButton(
                index: 1,
                icon: Icons.calendar_month_outlined,
                activeIcon: Icons.calendar_month_rounded,
                label: 'Appointments',
              ),
              _navButton(
                index: 2,
                icon: Icons.people_outline_rounded,
                activeIcon: Icons.people_rounded,
                label: 'Patients',
              ),
              _navButton(
                index: 3,
                icon: Icons.menu_rounded,
                activeIcon: Icons.menu_rounded,
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
  }) {
    final isSelected = _currentTabIndex == index;
    const activeColor = Color(0xFF1E6BFF);
    const inactiveColor = Color(0xFF64748B);

    return Expanded(
      child: InkWell(
        onTap: () => _onSelectTab(index),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Top active bar indicator (like reference image)
            Container(
              height: 2.5,
              width: 32,
              decoration: BoxDecoration(
                color: isSelected ? activeColor : Colors.transparent,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 5),
            Icon(
              isSelected ? activeIcon : icon,
              color: isSelected ? activeColor : inactiveColor,
              size: 22,
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? activeColor : inactiveColor,
                letterSpacing: -0.2,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showDoctorMenu(BuildContext context) {
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
          children: [
            ListTile(
              leading: CircleAvatar(
                backgroundImage:
                    NetworkImage(DoctorRepository.currentDoctor.avatar),
              ),
              title: Text(DoctorRepository.currentDoctor.name,
                  style: const TextStyle(fontWeight: FontWeight.w700)),
              subtitle: Text(
                  '${DoctorRepository.currentDoctor.role} • ${DoctorRepository.currentDoctor.department}'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push<void>(
                  context,
                  MaterialPageRoute<void>(builder: (_) => const DoctorProfileScreen()),
                );
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.settings_outlined, color: Color(0xFF1E6BFF)),
              title: const Text('Workstation & Sync Settings'),
              onTap: () {
                Navigator.pop(context);
                _onSelectTab(3);
              },
            ),
          ],
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
            const Text(
              'Clinical Notifications',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 12),
            _notificationTile(
              'Lab Report Ready',
              'CBC test for Aster Mulu is now complete.',
              '10 mins ago',
              Icons.science_rounded,
              const Color(0xFFF97316),
            ),
            _notificationTile(
              'Patient Arrived',
              'Abebe Assefa has checked in for consultation.',
              '25 mins ago',
              Icons.person_pin_circle_rounded,
              const Color(0xFF1E6BFF),
            ),
            _notificationTile(
              'Sync Succeeded',
              'Offline queue synced with central server.',
              '1 hour ago',
              Icons.sync_rounded,
              const Color(0xFF10B981),
            ),
          ],
        ),
      ),
    );
  }

  Widget _notificationTile(
    String title,
    String desc,
    String time,
    IconData icon,
    Color color,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(
                        fontSize: 13, fontWeight: FontWeight.w700)),
                Text(desc,
                    style: const TextStyle(
                        fontSize: 11.5, color: Color(0xFF64748B))),
              ],
            ),
          ),
          Text(time,
              style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
        ],
      ),
    );
  }
}

class _DoctorHomeBody extends ConsumerWidget {
  final void Function(int) onNavigateTab;
  final MobileDatabaseService dbService;

  const _DoctorHomeBody({
    required this.onNavigateTab,
    required this.dbService,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(doctorProvider);
    final appointments = state.appointments;
    final patients = state.patients;
    final currentPatient = patients.first; // Aster Mulu

    return RefreshIndicator(
      color: const Color(0xFF1E6BFF),
      backgroundColor: Colors.white,
      onRefresh: () async {
        await Future<void>.delayed(const Duration(milliseconds: 500));
      },
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        children: [
          // ─── Welcome Back Header & Date Card ──────────────────────────────
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Welcome Back, Dr. Fitsum Alemu',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.textPrimary,
                        letterSpacing: -0.3,
                        height: 1.2,
                      ),
                    ),
                    SizedBox(height: 3),
                    Text(
                      "Here's what's happening with your patients today.",
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

              // Date Card
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
                      color: Color(0xFF1E6BFF),
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

          // ─── Compact Summary KPI Cards (2x2 Grid) WITHOUT Icons ───────────
          Row(
            children: [
              Expanded(
                child: DoctorKpiCard(
                  title: "Today's Appointments",
                  value: '9',
                  valueColor: const Color(0xFF1E6BFF),
                  trendValue: '2',
                  isTrendUp: true,
                  isTrendPositive: true,
                  onTap: () => onNavigateTab(1),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: DoctorKpiCard(
                  title: 'Patients Seen Today',
                  value: '7',
                  valueColor: const Color(0xFF10B981),
                  trendValue: '3',
                  isTrendUp: true,
                  isTrendPositive: true,
                  onTap: () => onNavigateTab(2),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: DoctorKpiCard(
                  title: 'Pending Prescriptions',
                  value: '4',
                  valueColor: const Color(0xFF8B5CF6),
                  trendValue: '2',
                  isTrendUp: false,
                  isTrendPositive: false,
                  onTap: () {
                    Navigator.push<void>(
                      context,
                      MaterialPageRoute<void>(
                          builder: (_) => const DoctorPrescriptionsScreen()),
                    );
                  },
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: DoctorKpiCard(
                  title: 'Lab Results Pending',
                  value: '6',
                  valueColor: const Color(0xFFF97316),
                  trendValue: '1',
                  isTrendUp: true,
                  isTrendPositive: true,
                  onTap: () {
                    Navigator.push<void>(
                      context,
                      MaterialPageRoute<void>(
                          builder: (_) => const DoctorLabResultsScreen()),
                    );
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),

          // ─── Today's Schedule Card ─────────────────────────────────────────
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
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 28,
                          height: 28,
                          decoration: BoxDecoration(
                            color: const Color(0xFFEFF6FF),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            Icons.calendar_month_outlined,
                            color: Color(0xFF1E6BFF),
                            size: 16,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          "Today's Schedule",
                          style: TextStyle(
                            fontSize: 14.5,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.textPrimary,
                            letterSpacing: -0.2,
                          ),
                        ),
                      ],
                    ),
                    GestureDetector(
                      onTap: () => onNavigateTab(1),
                      child: const Row(
                        children: [
                          Text(
                            'View All',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF1E6BFF),
                            ),
                          ),
                          SizedBox(width: 2),
                          Icon(
                            Icons.chevron_right_rounded,
                            color: Color(0xFF1E6BFF),
                            size: 16,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Divider(
                    height: 1, thickness: 0.8, color: Color(0xFFF1F5F9)),
                const SizedBox(height: 2),

                // 5 Schedule Rows
                ...appointments.take(5).map((apt) {
                  return ScheduleItemRow(
                    appointment: apt,
                    showDivider: apt != appointments.take(5).last,
                    onTap: () {
                      final p = patients.firstWhere(
                        (item) => item.pid == apt.patientId,
                        orElse: () => patients.first,
                      );
                      showModalBottomSheet<void>(
                        context: context,
                        isScrollControlled: true,
                        backgroundColor: Colors.transparent,
                        builder: (_) => PatientDetailSheet(
                          patient: p,
                          onPrescribe: () {
                            showModalBottomSheet<void>(
                              context: context,
                              isScrollControlled: true,
                              backgroundColor: Colors.transparent,
                              builder: (_) => AddPrescriptionSheet(
                                patients: patients,
                                onAdd: (item) => ref
                                    .read(doctorProvider.notifier)
                                    .addPrescription(item),
                              ),
                            );
                          },
                          onOrderLab: () {
                            showModalBottomSheet<void>(
                              context: context,
                              isScrollControlled: true,
                              backgroundColor: Colors.transparent,
                              builder: (_) => OrderLabSheet(
                                patients: patients,
                                onAdd: (item) => ref
                                    .read(doctorProvider.notifier)
                                    .addLabOrder(item),
                              ),
                            );
                          },
                          onViewRecords: () {
                            Navigator.push<void>(
                              context,
                              MaterialPageRoute<void>(
                                builder: (_) =>
                                    const DoctorMedicalRecordsScreen(),
                              ),
                            );
                          },
                        ),
                      );
                    },
                  );
                }),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // ─── Quick Actions Card ────────────────────────────────────────────
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
                const Row(
                  children: [
                    Icon(
                      Icons.bolt_rounded,
                      color: Color(0xFF1E6BFF),
                      size: 20,
                    ),
                    SizedBox(width: 8),
                    Text(
                      'Quick Actions',
                      style: TextStyle(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary,
                        letterSpacing: -0.2,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // 2x2 Grid of Actions
                Row(
                  children: [
                    Expanded(
                      child: QuickActionButton(
                        icon: Icons.calendar_month_outlined,
                        label: 'View Appointments',
                        iconColor: const Color(0xFF1E6BFF),
                        iconBgColor: const Color(0xFFEFF6FF),
                        onTap: () => onNavigateTab(1),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: QuickActionButton(
                        icon: Icons.medication_rounded,
                        label: 'Add Prescription',
                        iconColor: const Color(0xFF8B5CF6),
                        iconBgColor: const Color(0xFFF5F3FF),
                        onTap: () {
                          showModalBottomSheet<void>(
                            context: context,
                            isScrollControlled: true,
                            backgroundColor: Colors.transparent,
                            builder: (_) => AddPrescriptionSheet(
                              patients: patients,
                              onAdd: (item) => ref
                                  .read(doctorProvider.notifier)
                                  .addPrescription(item),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: QuickActionButton(
                        icon: Icons.science_rounded,
                        label: 'Order Lab Test',
                        iconColor: const Color(0xFFF97316),
                        iconBgColor: const Color(0xFFFFF7ED),
                        onTap: () {
                          showModalBottomSheet<void>(
                            context: context,
                            isScrollControlled: true,
                            backgroundColor: Colors.transparent,
                            builder: (_) => OrderLabSheet(
                              patients: patients,
                              onAdd: (item) => ref
                                  .read(doctorProvider.notifier)
                                  .addLabOrder(item),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: QuickActionButton(
                        icon: Icons.description_outlined,
                        label: 'View Patient Records',
                        iconColor: const Color(0xFF10B981),
                        iconBgColor: const Color(0xFFECFDF5),
                        onTap: () => onNavigateTab(2),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // ─── Current Patient Card ──────────────────────────────────────────
          CurrentPatientCard(
            patient: currentPatient,
            onViewRecord: () {
              Navigator.push<void>(
                context,
                MaterialPageRoute<void>(
                  builder: (_) => const DoctorMedicalRecordsScreen(),
                ),
              );
            },
            onTap: () {
              showModalBottomSheet<void>(
                context: context,
                isScrollControlled: true,
                backgroundColor: Colors.transparent,
                builder: (_) => PatientDetailSheet(
                  patient: currentPatient,
                  onPrescribe: () {
                    showModalBottomSheet<void>(
                      context: context,
                      isScrollControlled: true,
                      backgroundColor: Colors.transparent,
                      builder: (_) => AddPrescriptionSheet(
                        patients: patients,
                        onAdd: (item) => ref
                            .read(doctorProvider.notifier)
                            .addPrescription(item),
                      ),
                    );
                  },
                  onOrderLab: () {
                    showModalBottomSheet<void>(
                      context: context,
                      isScrollControlled: true,
                      backgroundColor: Colors.transparent,
                      builder: (_) => OrderLabSheet(
                        patients: patients,
                        onAdd: (item) => ref
                            .read(doctorProvider.notifier)
                            .addLabOrder(item),
                      ),
                    );
                  },
                  onViewRecords: () {
                    Navigator.push<void>(
                      context,
                      MaterialPageRoute<void>(
                        builder: (_) => const DoctorMedicalRecordsScreen(),
                      ),
                    );
                  },
                ),
              );
            },
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}
