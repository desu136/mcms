import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/nurse_models.dart';
import '../../data/nurse_repository.dart';
import '../widgets/nurse_modals.dart';

class NurseAppointmentsScreen extends ConsumerStatefulWidget {
  final int initialTab;

  const NurseAppointmentsScreen({super.key, this.initialTab = 0});

  @override
  ConsumerState<NurseAppointmentsScreen> createState() =>
      _NurseAppointmentsScreenState();
}

class _NurseAppointmentsScreenState
    extends ConsumerState<NurseAppointmentsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedPriorityFilter = 'ALL';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 2,
      vsync: this,
      initialIndex: widget.initialTab,
    );
    WidgetsBinding.instance.addPostFrameCallback((_) {
      NurseRepository.loadFromApi(ref);
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final queue = ref.watch(nurseTriageQueueProvider);
    final appointments = ref.watch(nurseAppointmentsProvider);

    final waitingTriageCount = queue.where((q) {
      final s = q.status.toUpperCase();
      return s == 'WAITING_FOR_TRIAGE' || s == 'TRIAGE_IN_PROGRESS';
    }).length;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text(
          'Patient Flow & Triage',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Color(0xFF0F172A),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Color(0xFF2563EB)),
            tooltip: 'Refresh Queue',
            onPressed: () => NurseRepository.loadFromApi(ref),
          ),
        ],
        backgroundColor: Colors.white,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFF2563EB),
          unselectedLabelColor: const Color(0xFF64748B),
          labelStyle:
              const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
          unselectedLabelStyle:
              const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
          indicatorColor: const Color(0xFF2563EB),
          indicatorWeight: 3,
          tabs: [
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Triage Queue'),
                  if (waitingTriageCount > 0) ...[
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 1),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEF4444),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '$waitingTriageCount',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Ward Schedule'),
                  if (appointments.isNotEmpty) ...[
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 1),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '${appointments.length}',
                        style: const TextStyle(
                          color: Color(0xFF2563EB),
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildTriageQueueTab(queue),
          _buildWardScheduleTab(appointments),
        ],
      ),
    );
  }

  // ─── Triage Queue Tab ───────────────────────────────────────────────────────

  Widget _buildTriageQueueTab(List<NurseTriageQueueEntry> queue) {
    var filtered = queue;
    if (_selectedPriorityFilter != 'ALL') {
      filtered = queue
          .where((q) => q.priority.toUpperCase() == _selectedPriorityFilter)
          .toList();
    }

    return RefreshIndicator(
      onRefresh: () => NurseRepository.loadFromApi(ref),
      color: const Color(0xFF2563EB),
      child: Column(
        children: [
          // Filter Chips Row
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _filterChip('ALL', 'All Patients (${queue.length})'),
                  const SizedBox(width: 8),
                  _filterChip('EMERGENCY', 'Emergency',
                      color: const Color(0xFFEF4444)),
                  const SizedBox(width: 8),
                  _filterChip('URGENT', 'Urgent',
                      color: const Color(0xFFF59E0B)),
                  const SizedBox(width: 8),
                  _filterChip('ROUTINE', 'Routine',
                      color: const Color(0xFF2563EB)),
                ],
              ),
            ),
          ),
          const Divider(height: 1, color: Color(0xFFE2E8F0)),

          // Queue List
          Expanded(
            child: filtered.isEmpty
                ? ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: [
                      SizedBox(
                          height: MediaQuery.of(context).size.height * 0.15),
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.all(32),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.people_outline_rounded,
                                size: 56,
                                color: Colors.blueGrey.shade200,
                              ),
                              const SizedBox(height: 14),
                              const Text(
                                'No patients in Triage Queue',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF334155),
                                ),
                              ),
                              const SizedBox(height: 6),
                              const Text(
                                'Incoming patients checked in by the Receptionist will appear here immediately for nursing triage.',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF64748B),
                                ),
                              ),
                              const SizedBox(height: 20),
                              OutlinedButton.icon(
                                onPressed: () =>
                                    NurseRepository.loadFromApi(ref),
                                icon: const Icon(Icons.refresh_rounded, size: 18),
                                label: const Text('Check Now'),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      return _buildTriageCard(filtered[index]);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _filterChip(String filterKey, String label, {Color? color}) {
    final isSelected = _selectedPriorityFilter == filterKey;
    final activeColor = color ?? const Color(0xFF2563EB);

    return InkWell(
      onTap: () => setState(() => _selectedPriorityFilter = filterKey),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? activeColor : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
            color: isSelected ? Colors.white : const Color(0xFF475569),
          ),
        ),
      ),
    );
  }

  Widget _buildTriageCard(NurseTriageQueueEntry entry) {
    final isWaitingTriage = entry.status == 'WAITING_FOR_TRIAGE';
    final isTriageInProgress = entry.status == 'TRIAGE_IN_PROGRESS';
    final isWaitingDoctor = entry.status == 'WAITING_FOR_DOCTOR';
    final isInConsultation = entry.status == 'IN_CONSULTATION';

    Color priorityColor = const Color(0xFF2563EB);
    Color priorityBg = const Color(0xFFEFF6FF);
    if (entry.priority == 'EMERGENCY') {
      priorityColor = const Color(0xFFEF4444);
      priorityBg = const Color(0xFFFEF2F2);
    } else if (entry.priority == 'URGENT') {
      priorityColor = const Color(0xFFF59E0B);
      priorityBg = const Color(0xFFFFFBEB);
    }

    Color statusColor = const Color(0xFFF59E0B);
    Color statusBg = const Color(0xFFFFFBEB);
    String statusLabel = 'WAITING TRIAGE';
    if (isTriageInProgress) {
      statusColor = const Color(0xFF2563EB);
      statusBg = const Color(0xFFEFF6FF);
      statusLabel = 'TRIAGING';
    } else if (isWaitingDoctor) {
      statusColor = const Color(0xFF7C3AED);
      statusBg = const Color(0xFFF3E8FF);
      statusLabel = 'WAITING DOCTOR';
    } else if (isInConsultation) {
      statusColor = const Color(0xFF10B981);
      statusBg = const Color(0xFFECFDF5);
      statusLabel = 'IN CONSULTATION';
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: entry.priority == 'EMERGENCY'
              ? const Color(0xFFFCA5A5)
              : const Color(0xFFE2E8F0),
          width: entry.priority == 'EMERGENCY' ? 1.5 : 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top ticket row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Ticket #${entry.ticketNumber}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: priorityBg,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                            color: priorityColor.withValues(alpha: 0.3)),
                      ),
                      child: Text(
                        entry.priority,
                        style: TextStyle(
                          color: priorityColor,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: statusBg,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    statusLabel,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: statusColor,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Patient Info
            Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: const Color(0xFF2563EB),
                  child: Text(
                    entry.patientName.isNotEmpty
                        ? entry.patientName[0].toUpperCase()
                        : 'P',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        entry.patientName,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${entry.patientPid} • ${entry.gender}, ${entry.age}y • ${entry.departmentName}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Time & Reason Info Box
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFF1F5F9)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.access_time_rounded,
                      size: 14, color: Color(0xFF64748B)),
                  const SizedBox(width: 6),
                  Text(
                    'Checked in: ${entry.checkInTime} (${entry.waitMinutes}m wait)',
                    style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF475569),
                        fontWeight: FontWeight.w600),
                  ),
                  if (entry.doctorName != null) ...[
                    const Spacer(),
                    const Icon(Icons.person_outline_rounded,
                        size: 14, color: Color(0xFF7C3AED)),
                    const SizedBox(width: 4),
                    Text(
                      entry.doctorName!,
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF7C3AED),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Action Buttons Row
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      NurseModals.showRecordVitals(
                        context,
                        ref,
                        queueEntryId: entry.id,
                        preselectedPatientId: entry.patientId,
                        preselectedPatientName: entry.patientName,
                        preselectedPatientPid: entry.patientPid,
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isWaitingTriage || isTriageInProgress
                          ? const Color(0xFF2563EB)
                          : const Color(0xFFF1F5F9),
                      foregroundColor: isWaitingTriage || isTriageInProgress
                          ? Colors.white
                          : const Color(0xFF334155),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      elevation: 0,
                    ),
                    icon: const Icon(Icons.monitor_heart_rounded, size: 16),
                    label: Text(
                      isWaitingTriage ? 'Start Triage' : 'Record Vitals',
                      style: const TextStyle(
                          fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      NurseModals.showForwardToDoctor(context, ref, entry);
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF7C3AED),
                      side: const BorderSide(color: Color(0xFFDDD6FE)),
                      backgroundColor: const Color(0xFFFAF5FF),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    icon: const Icon(Icons.send_rounded, size: 15),
                    label: const Text(
                      'Forward to Doctor',
                      style:
                          TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ─── Ward Schedule Tab ──────────────────────────────────────────────────────

  Widget _buildWardScheduleTab(List<NurseAppointment> appointments) {
    return RefreshIndicator(
      onRefresh: () => NurseRepository.loadFromApi(ref),
      color: const Color(0xFF2563EB),
      child: appointments.isEmpty
          ? ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: [
                SizedBox(
                    height: MediaQuery.of(context).size.height * 0.25),
                Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.calendar_month_outlined,
                        size: 48,
                        color: Colors.blueGrey.shade300,
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'No scheduled ward rounds today',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: appointments.length,
              itemBuilder: (context, index) {
                final apt = appointments[index];
                return _buildAppointmentCard(apt);
              },
            ),
    );
  }

  Widget _buildAppointmentCard(NurseAppointment apt) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 22,
                  backgroundColor: const Color(0xFF2563EB),
                  backgroundImage:
                      apt.avatar.isNotEmpty ? NetworkImage(apt.avatar) : null,
                  child: apt.avatar.isEmpty
                      ? Text(
                          apt.patientName.isNotEmpty
                              ? apt.patientName[0].toUpperCase()
                              : 'P',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        )
                      : null,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        apt.patientName,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      Text(
                        '${apt.patientPid} • ${apt.department}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF2563EB),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    apt.status,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF2563EB),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFF1F5F9)),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.event_note_rounded,
                    size: 16,
                    color: Color(0xFF64748B),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      apt.reason,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1E293B),
                      ),
                    ),
                  ),
                  const Icon(
                    Icons.access_time_rounded,
                    size: 14,
                    color: Color(0xFF64748B),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    apt.appointmentTime,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF2563EB),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(
                  Icons.person_outline_rounded,
                  size: 13,
                  color: Color(0xFF64748B),
                ),
                const SizedBox(width: 4),
                Text(
                  'Attending: ${apt.doctor}',
                  style:
                      const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
