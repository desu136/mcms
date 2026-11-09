import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/lab_models.dart';
import '../../data/lab_repository.dart';
import '../widgets/lab_order_card.dart';

class LabTestsScreen extends ConsumerStatefulWidget {
  final void Function(int)? onNavigateTab;

  const LabTestsScreen({super.key, this.onNavigateTab});

  @override
  ConsumerState<LabTestsScreen> createState() => _LabTestsScreenState();
}

class _LabTestsScreenState extends ConsumerState<LabTestsScreen> {
  String _searchQuery = '';
  String _selectedDepartment = 'All';
  LabPriority? _selectedPriority;
  final TextEditingController _searchController = TextEditingController();

  final List<String> _departments = [
    'All',
    'Hematology',
    'Biochemistry',
    'Microbiology',
    'Immunology',
    'Parasitology'
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final allOrders = ref.watch(labOrdersProvider);

    // Apply filters
    final filteredOrders = allOrders.where((order) {
      if (_selectedDepartment != 'All' &&
          order.department != _selectedDepartment) {
        return false;
      }
      if (_selectedPriority != null && order.priority != _selectedPriority) {
        return false;
      }
      if (_searchQuery.trim().isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final match = order.patientName.toLowerCase().includes(q) ||
            order.testName.toLowerCase().includes(q) ||
            order.patientPid.toLowerCase().includes(q) ||
            order.orderNumber.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text(
          'Lab Test Orders',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: AppTheme.textPrimary,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded,
                color: AppTheme.primary),
            onPressed: () => _showNewOrderDialog(context),
            tooltip: 'New Test Order',
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & Filter Box
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: Column(
              children: [
                // Search Field
                TextField(
                  controller: _searchController,
                  onChanged: (val) => setState(() => _searchQuery = val),
                  decoration: InputDecoration(
                    hintText: 'Search by patient, PID, or test name...',
                    hintStyle:
                        const TextStyle(fontSize: 13, color: AppTheme.textMuted),
                    prefixIcon: const Icon(Icons.search_rounded,
                        color: AppTheme.textMuted, size: 20),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear_rounded, size: 16),
                            onPressed: () {
                              _searchController.clear();
                              setState(() => _searchQuery = '');
                            },
                          )
                        : null,
                    filled: true,
                    fillColor: AppTheme.surfaceMuted,
                    contentPadding: const EdgeInsets.symmetric(vertical: 10),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),

                const SizedBox(height: 10),

                // Department Filter Pills
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: _departments.map((dept) {
                      final isSelected = _selectedDepartment == dept;
                      return Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: FilterChip(
                          selected: isSelected,
                          label: Text(dept),
                          labelStyle: TextStyle(
                            fontSize: 11,
                            fontWeight: isSelected
                                ? FontWeight.w700
                                : FontWeight.w500,
                            color: isSelected
                                ? Colors.white
                                : AppTheme.textSecondary,
                          ),
                          backgroundColor: Colors.white,
                          selectedColor: AppTheme.primary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                            side: BorderSide(
                              color: isSelected
                                  ? AppTheme.primary
                                  : AppTheme.border,
                            ),
                          ),
                          onSelected: (_) {
                            setState(() => _selectedDepartment = dept);
                          },
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),

          // Orders List
          Expanded(
            child: filteredOrders.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.assignment_late_outlined,
                            size: 48, color: AppTheme.textMuted),
                        const SizedBox(height: 12),
                        const Text(
                          'No laboratory orders found',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Try adjusting your search or department filter',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppTheme.textMuted,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filteredOrders.length,
                    itemBuilder: (context, index) {
                      final order = filteredOrders[index];
                      return LabOrderCard(
                        order: order,
                        onTap: () => _showOrderDetailSheet(context, order),
                        onAction: () {
                          if (order.status == LabOrderStatus.pending) {
                            ref
                                .read(labOrdersProvider.notifier)
                                .updateOrderStatus(
                                    order.id, LabOrderStatus.collected);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                    'Sample collected for ${order.patientName} (${order.testName})'),
                                backgroundColor: AppTheme.success,
                              ),
                            );
                          } else if (order.status == LabOrderStatus.collected) {
                            ref
                                .read(labOrdersProvider.notifier)
                                .updateOrderStatus(
                                    order.id, LabOrderStatus.inAnalysis);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                    '${order.testName} sent to analyzer'),
                                backgroundColor: AppTheme.primary,
                              ),
                            );
                          } else {
                            _showOrderDetailSheet(context, order);
                          }
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  void _showOrderDetailSheet(BuildContext context, LabTestOrder order) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
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
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      order.testName,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    Text(
                      'Order: ${order.orderNumber} • ${order.department}',
                      style: const TextStyle(
                          fontSize: 12, color: AppTheme.textSecondary),
                    ),
                  ],
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryLight,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    order.priority.name.toUpperCase(),
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.primary,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 12),
            _buildDetailRow('Patient', order.patientName),
            _buildDetailRow('PID / Record', order.patientPid),
            _buildDetailRow('Ward / Room', order.patientRoom),
            _buildDetailRow('Age & Gender', '${order.patientAge}y, ${order.patientGender}'),
            _buildDetailRow('Ordering Doctor', order.orderingDoctor),
            _buildDetailRow('Order Time', order.orderedAt),
            if (order.sampleId != null)
              _buildDetailRow('Sample Tube ID', order.sampleId!),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('Close'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(
                  fontSize: 13, color: AppTheme.textSecondary)),
          Text(value,
              style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary)),
        ],
      ),
    );
  }

  void _showNewOrderDialog(BuildContext context) {
    final patientNameCtrl = TextEditingController();
    final testNameCtrl = TextEditingController(text: 'Complete Blood Count (CBC)');
    String department = 'Hematology';
    LabPriority priority = LabPriority.urgent;

    showDialog<void>(
      context: context,
      builder: (dialogCtx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Create Lab Test Requisition',
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  controller: patientNameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Patient Name',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: testNameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Test Name',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: department,
                  decoration: const InputDecoration(
                    labelText: 'Department',
                    border: OutlineInputBorder(),
                  ),
                  items: ['Hematology', 'Biochemistry', 'Microbiology', 'Immunology']
                      .map((d) => DropdownMenuItem(value: d, child: Text(d)))
                      .toList(),
                  onChanged: (val) {
                    if (val != null) setDialogState(() => department = val);
                  },
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<LabPriority>(
                  value: priority,
                  decoration: const InputDecoration(
                    labelText: 'Priority',
                    border: OutlineInputBorder(),
                  ),
                  items: LabPriority.values
                      .map((p) => DropdownMenuItem(
                          value: p, child: Text(p.name.toUpperCase())))
                      .toList(),
                  onChanged: (val) {
                    if (val != null) setDialogState(() => priority = val);
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogCtx),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                if (patientNameCtrl.text.trim().isEmpty) return;
                final newOrd = LabTestOrder(
                  id: 'ord-${DateTime.now().millisecondsSinceEpoch}',
                  orderNumber: 'ORD-2026-${(1055 + DateTime.now().second)}',
                  patientName: patientNameCtrl.text.trim(),
                  patientPid: 'PID-001099',
                  patientRoom: 'Ward Ambulatory',
                  patientAge: 32,
                  patientGender: 'Female',
                  testName: testNameCtrl.text.trim(),
                  testCode: 'CBC',
                  department: department,
                  priority: priority,
                  status: LabOrderStatus.pending,
                  orderedAt: 'Just now',
                  orderingDoctor: 'Dr. Dawit (Mobile Requisition)',
                );
                ref.read(labOrdersProvider.notifier).addOrder(newOrd);
                Navigator.pop(dialogCtx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Test order registered successfully.'),
                    backgroundColor: AppTheme.success,
                  ),
                );
              },
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
              child: const Text('Submit Order',
                  style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}

