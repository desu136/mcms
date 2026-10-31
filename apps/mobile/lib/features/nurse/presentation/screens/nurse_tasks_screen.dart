import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/nurse_models.dart';
import '../../data/nurse_repository.dart';
import '../widgets/nurse_modals.dart';

class NurseTasksScreen extends ConsumerStatefulWidget {
  const NurseTasksScreen({super.key});

  @override
  ConsumerState<NurseTasksScreen> createState() => _NurseTasksScreenState();
}

class _NurseTasksScreenState extends ConsumerState<NurseTasksScreen> {
  String _selectedFilter = 'All';

  @override
  Widget build(BuildContext context) {
    final tasks = ref.watch(nurseTasksProvider);

    final filtered = tasks.where((t) {
      switch (_selectedFilter) {
        case 'Pending':
          return t.status == TaskStatus.pending ||
              t.status == TaskStatus.inProgress;
        case 'Completed':
          return t.status == TaskStatus.completed;
        case 'High Priority':
          return t.priority == TaskPriority.high;
        default:
          return true;
      }
    }).toList();

    final completedCount =
        tasks.where((t) => t.status == TaskStatus.completed).length;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text(
          'Nursing Care Checklist',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Color(0xFF0F172A),
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            onPressed: () => NurseModals.showAddTask(context, ref),
            icon: const Icon(Icons.add_task_rounded, color: Color(0xFF2563EB)),
            tooltip: 'Add Task',
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: const Color(0xFFE2E8F0), height: 1),
        ),
      ),
      body: Column(
        children: [
          // Filter Bar
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                _chip('All', tasks.length),
                _chip('Pending', tasks.length - completedCount),
                _chip('Completed', completedCount),
                _chip(
                  'High Priority',
                  tasks.where((t) => t.priority == TaskPriority.high).length,
                  isAlert: true,
                ),
              ],
            ),
          ),

          // Tasks List
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.task_alt_rounded,
                          size: 48,
                          color: Colors.blueGrey.shade300,
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'No tasks in this category',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final task = filtered[index];
                      return _buildTaskCard(task);
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => NurseModals.showAddTask(context, ref),
        backgroundColor: const Color(0xFF2563EB),
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text(
          'Add Task',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
    );
  }

  Widget _chip(String label, int count, {bool isAlert = false}) {
    final isSelected = _selectedFilter == label;
    return GestureDetector(
      onTap: () => setState(() => _selectedFilter = label),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF2563EB) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? Colors.white : const Color(0xFF475569),
              ),
            ),
            const SizedBox(width: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
              decoration: BoxDecoration(
                color: isAlert && !isSelected
                    ? const Color(0xFFEF4444)
                    : isSelected
                        ? Colors.white.withValues(alpha: 0.25)
                        : const Color(0xFFE2E8F0),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '$count',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: isAlert && !isSelected
                      ? Colors.white
                      : isSelected
                          ? Colors.white
                          : const Color(0xFF475569),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTaskCard(NursingTask task) {
    final isDone = task.status == TaskStatus.completed;

    Color priorityColor = const Color(0xFF3B82F6);
    if (task.priority == TaskPriority.high) {
      priorityColor = const Color(0xFFEF4444);
    } else if (task.priority == TaskPriority.medium) {
      priorityColor = const Color(0xFFF59E0B);
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(
          color: isDone ? const Color(0xFFE2E8F0) : const Color(0xFFCBD5E1),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Checkbox
            Checkbox(
              value: isDone,
              activeColor: const Color(0xFF10B981),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(5),
              ),
              onChanged: (_) {
                ref.read(nurseTasksProvider.notifier).update((list) {
                  return list.map((t) {
                    if (t.id == task.id) {
                      return t.copyWith(
                        status: isDone
                            ? TaskStatus.pending
                            : TaskStatus.completed,
                        completedAt: isDone
                            ? null
                            : 'Today, ${TimeOfDay.now().format(context)}',
                      );
                    }
                    return t;
                  }).toList();
                });
              },
            ),
            const SizedBox(width: 8),

            // Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: priorityColor.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(5),
                        ),
                        child: Text(
                          task.priority.name.toUpperCase(),
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            color: priorityColor,
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(5),
                        ),
                        child: Text(
                          task.type,
                          style: const TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF475569),
                          ),
                        ),
                      ),
                      const Spacer(),
                      Text(
                        task.dueTime,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: isDone
                              ? const Color(0xFF94A3B8)
                              : const Color(0xFF2563EB),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    task.title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      decoration: isDone ? TextDecoration.lineThrough : null,
                      color: isDone
                          ? const Color(0xFF94A3B8)
                          : const Color(0xFF0F172A),
                    ),
                  ),
                  if (task.details != null) ...[
                    const SizedBox(height: 3),
                    Text(
                      task.details!,
                      style: TextStyle(
                        fontSize: 11,
                        color: isDone
                            ? const Color(0xFFCBD5E1)
                            : const Color(0xFF64748B),
                      ),
                    ),
                  ],
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(
                        Icons.person_outline_rounded,
                        size: 12,
                        color: Color(0xFF64748B),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${task.patientName} (${task.room})',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
