import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/receptionist_repository.dart';
import '../../data/receptionist_models.dart';
import '../widgets/queue_entry_card.dart';

class ReceptionistQueueScreen extends ConsumerStatefulWidget {
  const ReceptionistQueueScreen({super.key});

  @override
  ConsumerState<ReceptionistQueueScreen> createState() =>
      _ReceptionistQueueScreenState();
}

class _ReceptionistQueueScreenState
    extends ConsumerState<ReceptionistQueueScreen> {
  String _selectedFilter = 'All';
  final List<String> _filters = [
    'All',
    'Waiting',
    'Called',
    'In Consultation',
    'Done',
  ];

  @override
  Widget build(BuildContext context) {
    final queue = ref.watch(receptionistQueueProvider);

    final filtered = queue.where((q) {
      if (_selectedFilter == 'All') return true;
      return q.statusLabel.toLowerCase() == _selectedFilter.toLowerCase();
    }).toList();

    // Stats
    final waiting =
        queue.where((q) => q.status == QueueStatus.waiting).length;
    final called =
        queue.where((q) => q.status == QueueStatus.called).length;
    final inConsult =
        queue.where((q) => q.status == QueueStatus.inConsultation).length;

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            _buildHeader(context, queue.length),
            // Stats bar
            _buildStatsBar(waiting, called, inConsult),
            // Filter chips
            _buildFilterChips(),
            // Queue list
            Expanded(
              child: RefreshIndicator(
                onRefresh: () => ReceptionistRepository.loadFromApi(ref),
                child: filtered.isEmpty
                    ? _EmptyQueueState(filter: _selectedFilter)
                    : ListView.builder(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.fromLTRB(20, 12, 20, 80),
                        itemCount: filtered.length,
                        itemBuilder: (_, i) {
                          final entry = filtered[i];
                          return QueueEntryCard(
                            entry: entry,
                            onTap: () => _showEntryDetail(entry),
                            onCallNext: entry.status == QueueStatus.waiting
                                ? () => _callPatient(entry)
                                : null,
                            onMarkDone:
                                entry.status == QueueStatus.inConsultation ||
                                        entry.status == QueueStatus.called
                                    ? () => _markDone(entry)
                                    : null,
                          );
                        },
                      ),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddToQueueSheet(context),
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text(
          'Issue Queue Ticket',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, int total) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppTheme.warningLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.queue_rounded,
                color: AppTheme.warning, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Patient Queue',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textPrimary,
                  ),
                ),
                Text(
                  '$total tickets today',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.textMuted,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsBar(int waiting, int called, int inConsult) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 14),
      child: Row(
        children: [
          _StatPill(label: 'Waiting', count: waiting, color: AppTheme.warning),
          const SizedBox(width: 10),
          _StatPill(label: 'Called', count: called, color: AppTheme.primary),
          const SizedBox(width: 10),
          _StatPill(
              label: 'Consulting', count: inConsult, color: AppTheme.purple),
        ],
      ),
    );
  }

  Widget _buildFilterChips() {
    return SizedBox(
      height: 48,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.fromLTRB(20, 10, 20, 0),
        children: _filters.map((f) {
          final isActive = f == _selectedFilter;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: GestureDetector(
              onTap: () => setState(() => _selectedFilter = f),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: isActive ? AppTheme.primary : AppTheme.surfaceMuted,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Center(
                  child: Text(
                    f,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color:
                          isActive ? Colors.white : AppTheme.textSecondary,
                    ),
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  void _callPatient(QueueEntry entry) async {
    final success =
        await ReceptionistRepository.updateQueueStatus(ref, entry.id, 'CALLED');

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success
              ? 'Called ticket #${entry.queueNumber} (${entry.patientName})'
              : 'Failed to update queue status'),
          backgroundColor: success ? AppTheme.primary : AppTheme.danger,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  void _markDone(QueueEntry entry) async {
    final success = await ReceptionistRepository.updateQueueStatus(
        ref, entry.id, 'COMPLETED');

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success
              ? 'Ticket #${entry.queueNumber} marked as completed'
              : 'Failed to complete queue entry'),
          backgroundColor: success ? AppTheme.success : AppTheme.danger,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  void _showEntryDetail(QueueEntry entry) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _QueueEntryDetailSheet(entry: entry),
    );
  }

  void _showAddToQueueSheet(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _AddToQueueSheet(),
    );
  }
}

class _StatPill extends StatelessWidget {
  final String label;
  final int count;
  final Color color;

  const _StatPill({
    required this.label,
    required this.count,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            FittedBox(
              child: Text(
                '$count',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: color,
                ),
              ),
            ),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyQueueState extends StatelessWidget {
  final String filter;
  const _EmptyQueueState({required this.filter});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: AppTheme.surfaceMuted,
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Icon(Icons.people_outline,
                size: 32, color: AppTheme.textMuted),
          ),
          const SizedBox(height: 16),
          Text(
            filter == 'All' ? 'No patients in queue' : 'No $filter patients',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Check in patients or book an appointment',
            style: TextStyle(fontSize: 13, color: AppTheme.textMuted),
          ),
        ],
      ),
    );
  }
}

// ─── Queue Entry Detail Sheet ─────────────────────────────────────────────────

class _QueueEntryDetailSheet extends ConsumerWidget {
  final QueueEntry entry;
  const _QueueEntryDetailSheet({required this.entry});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDone = entry.status == QueueStatus.done;

    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      maxChildSize: 0.85,
      minChildSize: 0.4,
      builder: (_, controller) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFFE2E8F0),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView(
                controller: controller,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryLight,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '#${entry.queueNumber}',
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: AppTheme.primary,
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              entry.patientName,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            Text(
                              entry.pid.isNotEmpty ? entry.pid : 'No PID',
                              style: const TextStyle(
                                fontSize: 13,
                                color: AppTheme.textMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  _InfoItem(label: 'Priority', value: entry.priority),
                  _InfoItem(label: 'Status', value: entry.statusLabel),
                  _InfoItem(label: 'Department', value: entry.department),
                  _InfoItem(label: 'Doctor', value: entry.doctorName),
                  _InfoItem(label: 'Check-in Time', value: entry.checkinTime),
                  _InfoItem(label: 'Estimated Wait', value: entry.estimatedWait),
                  _InfoItem(label: 'Chief Complaint', value: entry.reason),
                  const SizedBox(height: 24),

                  if (!isDone) ...[
                    Row(
                      children: [
                        if (entry.status == QueueStatus.waiting)
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () {
                                Navigator.pop(context);
                                ReceptionistRepository.updateQueueStatus(
                                    ref, entry.id, 'CALLED');
                              },
                              icon: const Icon(Icons.campaign_rounded),
                              label: const Text('Call Patient'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primary,
                                foregroundColor: Colors.white,
                                padding:
                                    const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                            ),
                          ),
                        if (entry.status == QueueStatus.called) ...[
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () {
                                Navigator.pop(context);
                                ReceptionistRepository.updateQueueStatus(
                                    ref, entry.id, 'IN_CONSULTATION');
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.purple,
                                foregroundColor: Colors.white,
                                padding:
                                    const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              child: const Text('Start Consultation'),
                            ),
                          ),
                          const SizedBox(width: 10),
                        ],
                        if (entry.status == QueueStatus.inConsultation ||
                            entry.status == QueueStatus.called) ...[
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () {
                                Navigator.pop(context);
                                ReceptionistRepository.updateQueueStatus(
                                    ref, entry.id, 'COMPLETED');
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.success,
                                foregroundColor: Colors.white,
                                padding:
                                    const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              child: const Text('Complete'),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton(
                      onPressed: () async {
                        final confirm = await showDialog<bool>(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            title: const Text('Cancel Ticket'),
                            content: Text(
                                'Cancel queue ticket #${entry.queueNumber} for ${entry.patientName}?'),
                            actions: [
                              TextButton(
                                  onPressed: () => Navigator.pop(ctx, false),
                                  child: const Text('No')),
                              TextButton(
                                onPressed: () => Navigator.pop(ctx, true),
                                style: TextButton.styleFrom(
                                    foregroundColor: AppTheme.danger),
                                child: const Text('Yes, Cancel'),
                              ),
                            ],
                          ),
                        );
                        if (confirm == true && context.mounted) {
                          Navigator.pop(context);
                          unawaited(ReceptionistRepository.updateQueueStatus(
                              ref, entry.id, 'CANCELLED'));
                        }
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.danger,
                        side: const BorderSide(color: AppTheme.danger),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Center(child: Text('Cancel Ticket')),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoItem extends StatelessWidget {
  final String label;
  final String value;
  const _InfoItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 13,
                color: AppTheme.textMuted,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 13,
                color: AppTheme.textPrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Add To Queue Sheet ───────────────────────────────────────────────────────

class _AddToQueueSheet extends ConsumerStatefulWidget {
  const _AddToQueueSheet();

  @override
  ConsumerState<_AddToQueueSheet> createState() => _AddToQueueSheetState();
}

class _AddToQueueSheetState extends ConsumerState<_AddToQueueSheet> {
  RegistrationPatient? _selectedPatient;
  DoctorItem? _selectedDoctor;
  DepartmentItem? _selectedDepartment;
  final _reasonCtrl = TextEditingController();
  String _priority = 'Normal';
  bool _isSubmitting = false;

  @override
  void dispose() {
    _reasonCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final patients = ref.watch(receptionistPatientsProvider);
    final doctors = ref.watch(receptionistDoctorsProvider);
    final departments = ref.watch(receptionistDepartmentsProvider);

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      maxChildSize: 0.95,
      minChildSize: 0.5,
      builder: (_, controller) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFFE2E8F0),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 16),
            const Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Issue Queue Ticket',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.textPrimary,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView(
                controller: controller,
                children: [
                  // Patient picker
                  const Text(
                    'Select Patient *',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceMuted,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<RegistrationPatient>(
                        hint: const Text('Select patient'),
                        value: _selectedPatient,
                        isExpanded: true,
                        items: patients
                            .map((p) => DropdownMenuItem(
                                  value: p,
                                  child: Text('${p.name} (${p.pid})'),
                                ))
                            .toList(),
                        onChanged: (p) => setState(() => _selectedPatient = p),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Doctor picker
                  const Text(
                    'Assigned Doctor (Optional)',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceMuted,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<DoctorItem>(
                        hint: const Text('Select doctor'),
                        value: _selectedDoctor,
                        isExpanded: true,
                        items: doctors
                            .map((d) => DropdownMenuItem(
                                  value: d,
                                  child: Text('${d.name} (${d.specialization})'),
                                ))
                            .toList(),
                        onChanged: (d) => setState(() => _selectedDoctor = d),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Department picker
                  const Text(
                    'Department (Optional)',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceMuted,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<DepartmentItem>(
                        hint: const Text('Select department'),
                        value: _selectedDepartment,
                        isExpanded: true,
                        items: departments
                            .map((d) => DropdownMenuItem(
                                  value: d,
                                  child: Text(d.name),
                                ))
                            .toList(),
                        onChanged: (d) =>
                            setState(() => _selectedDepartment = d),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Priority
                  const Text(
                    'Priority Level *',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: ['Normal', 'Urgent', 'Emergency'].map((p) {
                      final isSelected = p == _priority;
                      Color c = p == 'Emergency'
                          ? AppTheme.danger
                          : p == 'Urgent'
                              ? AppTheme.orange
                              : AppTheme.success;
                      return Expanded(
                        child: Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: GestureDetector(
                            onTap: () => setState(() => _priority = p),
                            child: Container(
                              padding:
                                  const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? c.withValues(alpha: 0.12)
                                    : AppTheme.surfaceMuted,
                                borderRadius: BorderRadius.circular(10),
                                border: isSelected
                                    ? Border.all(
                                        color: c.withValues(alpha: 0.4))
                                    : null,
                              ),
                              child: Center(
                                child: Text(
                                  p,
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color:
                                        isSelected ? c : AppTheme.textSecondary,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 14),

                  // Reason / chief complaint
                  const Text(
                    'Chief Complaint / Notes',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _reasonCtrl,
                    maxLines: 2,
                    decoration: InputDecoration(
                      hintText: 'Reason for visit',
                      hintStyle: const TextStyle(
                          color: AppTheme.textMuted, fontSize: 13),
                      filled: true,
                      fillColor: AppTheme.surfaceMuted,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.all(14),
                    ),
                  ),
                  const SizedBox(height: 24),

                  ElevatedButton(
                    onPressed: _isSubmitting ? null : _submitToQueue,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: _isSubmitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                                color: Colors.white, strokeWidth: 2),
                          )
                        : const Text(
                            'Issue Ticket & Add to Queue',
                            style: TextStyle(
                                fontWeight: FontWeight.w700, fontSize: 15),
                          ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _submitToQueue() async {
    if (_selectedPatient == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a registered patient')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final priorityUpper = _priority == 'Emergency'
        ? 'EMERGENCY'
        : _priority == 'Urgent'
            ? 'URGENT'
            : 'NORMAL';

    final payload = <String, dynamic>{
      'patientId': _selectedPatient!.id,
      'priority': priorityUpper,
      'reason': _reasonCtrl.text.trim().isNotEmpty
          ? _reasonCtrl.text.trim()
          : 'Consultation',
    };

    if (_selectedDoctor != null) {
      payload['assignedDoctorId'] = _selectedDoctor!.id;
    }
    if (_selectedDepartment != null) {
      payload['departmentId'] = _selectedDepartment!.id;
    }

    final entry = await ReceptionistRepository.addToQueue(ref, payload);

    if (mounted) {
      setState(() => _isSubmitting = false);
      Navigator.pop(context);

      if (entry != null) {
        unawaited(showDialog<void>(
          context: context,
          builder: (ctx) => AlertDialog(
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: const Row(
              children: [
                Icon(Icons.confirmation_number_rounded,
                    color: AppTheme.primary, size: 28),
                SizedBox(width: 10),
                Text('Ticket Issued'),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '${_selectedPatient!.name} (${_selectedPatient!.pid})',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 14),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryLight,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      const Text(
                        'QUEUE NUMBER',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.primary,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '#${entry.queueNumber}',
                        style: const TextStyle(
                          fontSize: 34,
                          fontWeight: FontWeight.w900,
                          color: AppTheme.primary,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Text('Priority: $_priority'),
                if (_selectedDoctor != null)
                  Text('Doctor: ${_selectedDoctor!.name}'),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('OK',
                    style: TextStyle(fontWeight: FontWeight.w700)),
              ),
            ],
          ),
        ));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to issue ticket. Please check connection.'),
            backgroundColor: AppTheme.danger,
          ),
        );
      }
    }
  }
}
