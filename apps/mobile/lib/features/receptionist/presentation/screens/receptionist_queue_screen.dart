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
    'All', 'Waiting', 'Called', 'In Consultation', 'Done',
  ];

  @override
  Widget build(BuildContext context) {
    final queue = ref.watch(receptionistQueueProvider);

    final filtered = queue.where((q) {
      if (_selectedFilter == 'All') return true;
      return q.statusLabel == _selectedFilter;
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
              child: filtered.isEmpty
                  ? _EmptyQueueState(filter: _selectedFilter)
                  : ListView.builder(
                      padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
                      itemCount: filtered.length,
                      itemBuilder: (_, i) {
                        final entry = filtered[i];
                        return QueueEntryCard(
                          entry: entry,
                          onCallNext: entry.status == QueueStatus.waiting
                              ? () => _callPatient(entry)
                              : null,
                          onMarkDone:
                              entry.status == QueueStatus.inConsultation
                                  ? () => _markDone(entry)
                                  : null,
                        );
                      },
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
          'Add to Queue',
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
                  '$total in queue today',
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

  void _callPatient(QueueEntry entry) {
    final queue = ref.read(receptionistQueueProvider);
    final updated = queue.map((q) {
      if (q.id == entry.id) {
        return QueueEntry(
          id: q.id,
          queueNumber: q.queueNumber,
          patientName: q.patientName,
          patientId: q.patientId,
          pid: q.pid,
          reason: q.reason,
          department: q.department,
          doctorName: q.doctorName,
          checkinTime: q.checkinTime,
          estimatedWait: q.estimatedWait,
          status: QueueStatus.called,
          priority: q.priority,
        );
      }
      return q;
    }).toList();
    ref.read(receptionistQueueProvider.notifier).state = updated;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${entry.patientName} has been called'),
        backgroundColor: AppTheme.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  void _markDone(QueueEntry entry) {
    final queue = ref.read(receptionistQueueProvider);
    final updated = queue.map((q) {
      if (q.id == entry.id) {
        return QueueEntry(
          id: q.id,
          queueNumber: q.queueNumber,
          patientName: q.patientName,
          patientId: q.patientId,
          pid: q.pid,
          reason: q.reason,
          department: q.department,
          doctorName: q.doctorName,
          checkinTime: q.checkinTime,
          estimatedWait: q.estimatedWait,
          status: QueueStatus.done,
          priority: q.priority,
        );
      }
      return q;
    }).toList();
    ref.read(receptionistQueueProvider.notifier).state = updated;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${entry.patientName} marked as done'),
        backgroundColor: AppTheme.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
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
            Text(
              '$count',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: color,
              ),
            ),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                color: color.withValues(alpha: 0.8),
                fontWeight: FontWeight.w600,
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
            child: const Icon(Icons.queue_outlined,
                size: 32, color: AppTheme.textMuted),
          ),
          const SizedBox(height: 16),
          Text(
            filter == 'All' ? 'Queue is empty' : 'No $filter patients',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppTheme.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Add to Queue Sheet ───────────────────────────────────────────────────────

class _AddToQueueSheet extends StatefulWidget {
  const _AddToQueueSheet();

  @override
  State<_AddToQueueSheet> createState() => _AddToQueueSheetState();
}

class _AddToQueueSheetState extends State<_AddToQueueSheet> {
  final _patientCtrl = TextEditingController();
  final _reasonCtrl = TextEditingController();
  String _priority = 'Normal';

  @override
  void dispose() {
    _patientCtrl.dispose();
    _reasonCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFFE2E8F0),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Add Patient to Queue',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 16),
            _SheetField(
                label: 'Patient Name / PID',
                controller: _patientCtrl,
                hint: 'Search patient…'),
            const SizedBox(height: 12),
            _SheetField(
                label: 'Reason',
                controller: _reasonCtrl,
                hint: 'Reason for visit'),
            const SizedBox(height: 12),
            const Text('Priority',
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textSecondary)),
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
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? c.withValues(alpha: 0.12)
                              : AppTheme.surfaceMuted,
                          borderRadius: BorderRadius.circular(10),
                          border: isSelected
                              ? Border.all(color: c.withValues(alpha: 0.4))
                              : null,
                        ),
                        child: Center(
                          child: Text(
                            p,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: isSelected ? c : AppTheme.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Text('Patient added to queue'),
                      backgroundColor: AppTheme.success,
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text(
                  'Add to Queue',
                  style:
                      TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SheetField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final String hint;

  const _SheetField({
    required this.label,
    required this.controller,
    required this.hint,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppTheme.textSecondary,
          ),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: AppTheme.textMuted),
            filled: true,
            fillColor: AppTheme.surfaceMuted,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          ),
        ),
      ],
    );
  }
}
