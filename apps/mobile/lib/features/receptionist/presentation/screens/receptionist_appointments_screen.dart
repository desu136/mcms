import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/receptionist_repository.dart';
import '../../data/receptionist_models.dart';
import '../widgets/appointment_card.dart';

class ReceptionistAppointmentsScreen extends ConsumerStatefulWidget {
  final void Function(int)? onNavigateTab;

  const ReceptionistAppointmentsScreen({super.key, this.onNavigateTab});

  @override
  ConsumerState<ReceptionistAppointmentsScreen> createState() =>
      _ReceptionistAppointmentsScreenState();
}

class _ReceptionistAppointmentsScreenState
    extends ConsumerState<ReceptionistAppointmentsScreen> {
  String _selectedFilter = 'All';
  final TextEditingController _searchCtrl = TextEditingController();
  String _searchQuery = '';

  final List<String> _filters = [
    'All',
    'Confirmed',
    'In Progress',
    'Pending',
    'Completed',
    'Cancelled',
  ];

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final appointments = ref.watch(receptionistAppointmentsProvider);

    final filtered = appointments.where((a) {
      final matchFilter = _selectedFilter == 'All' ||
          a.statusLabel == _selectedFilter;
      final q = _searchQuery.toLowerCase();
      final matchSearch = q.isEmpty ||
          a.patientName.toLowerCase().contains(q) ||
          a.pid.toLowerCase().contains(q) ||
          a.doctorName.toLowerCase().contains(q);
      return matchFilter && matchSearch;
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            _buildHeader(context, appointments.length),
            // Search bar
            _buildSearchBar(),
            // Filter chips
            _buildFilterChips(),
            // List
            Expanded(
              child: filtered.isEmpty
                  ? _EmptyState(filter: _selectedFilter)
                  : ListView.builder(
                      padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
                      itemCount: filtered.length,
                      itemBuilder: (_, i) => AppointmentCard(
                        appt: filtered[i],
                        onTap: () => _showAppointmentDetail(filtered[i]),
                      ),
                    ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showBookAppointmentSheet(context),
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text(
          'Book Appointment',
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
              color: AppTheme.purpleLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.calendar_month_rounded,
                color: AppTheme.purple, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Appointments',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textPrimary,
                  ),
                ),
                Text(
                  '$total scheduled',
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

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
      child: TextField(
        controller: _searchCtrl,
        onChanged: (v) => setState(() => _searchQuery = v),
        decoration: InputDecoration(
          hintText: 'Search patient, PID, doctor…',
          hintStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 14),
          prefixIcon: const Icon(Icons.search_rounded,
              color: AppTheme.textMuted, size: 20),
          suffixIcon: _searchQuery.isNotEmpty
              ? GestureDetector(
                  onTap: () {
                    _searchCtrl.clear();
                    setState(() => _searchQuery = '');
                  },
                  child: const Icon(Icons.close_rounded,
                      color: AppTheme.textMuted, size: 18),
                )
              : null,
          filled: true,
          fillColor: AppTheme.surfaceMuted,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        ),
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
                      color: isActive ? Colors.white : AppTheme.textSecondary,
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

  void _showAppointmentDetail(ReceptionistAppointment appt) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _AppointmentDetailSheet(appt: appt),
    );
  }

  void _showBookAppointmentSheet(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _BookAppointmentSheet(),
    );
  }
}

// ─── Empty State ──────────────────────────────────────────────────────────────

class _EmptyState extends StatelessWidget {
  final String filter;
  const _EmptyState({required this.filter});

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
            child: const Icon(Icons.calendar_today_outlined,
                size: 32, color: AppTheme.textMuted),
          ),
          const SizedBox(height: 16),
          Text(
            filter == 'All'
                ? 'No appointments found'
                : 'No $filter appointments',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Try adjusting your search or filter',
            style: TextStyle(fontSize: 13, color: AppTheme.textMuted),
          ),
        ],
      ),
    );
  }
}

// ─── Appointment Detail Sheet ─────────────────────────────────────────────────

class _AppointmentDetailSheet extends StatelessWidget {
  final ReceptionistAppointment appt;
  const _AppointmentDetailSheet({required this.appt});

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      maxChildSize: 0.9,
      minChildSize: 0.4,
      builder: (_, controller) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
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
            Expanded(
              child: ListView(
                controller: controller,
                padding: const EdgeInsets.all(24),
                children: [
                  // Avatar + name
                  Row(
                    children: [
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF1E6BFF), Color(0xFF0D52D6)],
                          ),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Center(
                          child: Text(
                            appt.patientInitials,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              appt.patientName,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            Text(
                              appt.pid,
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
                  _DetailRow(label: 'Date', value: appt.date),
                  _DetailRow(label: 'Time', value: appt.time),
                  _DetailRow(label: 'Doctor', value: appt.doctorName),
                  _DetailRow(label: 'Department', value: appt.department),
                  _DetailRow(label: 'Reason', value: appt.reason),
                  _DetailRow(label: 'Status', value: appt.statusLabel),
                  if (appt.notes != null)
                    _DetailRow(label: 'Notes', value: appt.notes!),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.pop(context),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppTheme.danger,
                            side: const BorderSide(color: AppTheme.danger),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text('Cancel Appointment'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => Navigator.pop(context),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text('Check In'),
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

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  const _DetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
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

// ─── Book Appointment Sheet ───────────────────────────────────────────────────

class _BookAppointmentSheet extends StatefulWidget {
  const _BookAppointmentSheet();

  @override
  State<_BookAppointmentSheet> createState() => _BookAppointmentSheetState();
}

class _BookAppointmentSheetState extends State<_BookAppointmentSheet> {
  final _formKey = GlobalKey<FormState>();
  final _patientCtrl = TextEditingController();
  final _reasonCtrl = TextEditingController();
  String _selectedDept = 'Cardiology';
  String _selectedTime = '09:00 AM';

  final _depts = [
    'Cardiology', 'General Medicine', 'OB-GYN',
    'Nephrology', 'Pulmonology', 'Endocrinology', 'Emergency'
  ];
  final _times = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  @override
  void dispose() {
    _patientCtrl.dispose();
    _reasonCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.75,
      maxChildSize: 0.95,
      minChildSize: 0.5,
      builder: (_, controller) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
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
            const SizedBox(height: 16),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 24),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Book Appointment',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textPrimary,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: Form(
                key: _formKey,
                child: ListView(
                  controller: controller,
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  children: [
                    _FormField(
                      label: 'Patient Name / PID',
                      controller: _patientCtrl,
                      hint: 'Enter patient name or PID',
                    ),
                    const SizedBox(height: 14),
                    _DropdownField(
                      label: 'Department',
                      value: _selectedDept,
                      items: _depts,
                      onChanged: (v) => setState(() => _selectedDept = v!),
                    ),
                    const SizedBox(height: 14),
                    _DropdownField(
                      label: 'Preferred Time',
                      value: _selectedTime,
                      items: _times,
                      onChanged: (v) => setState(() => _selectedTime = v!),
                    ),
                    const SizedBox(height: 14),
                    _FormField(
                      label: 'Reason for Visit',
                      controller: _reasonCtrl,
                      hint: 'Brief reason',
                      maxLines: 3,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: const Text('Appointment booked successfully'),
                            backgroundColor: AppTheme.success,
                            behavior: SnackBarBehavior.floating,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Book Appointment',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 15,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FormField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final String hint;
  final int maxLines;

  const _FormField({
    required this.label,
    required this.controller,
    required this.hint,
    this.maxLines = 1,
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
        TextFormField(
          controller: controller,
          maxLines: maxLines,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: AppTheme.textMuted),
            filled: true,
            fillColor: AppTheme.surfaceMuted,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            contentPadding: const EdgeInsets.all(14),
          ),
        ),
      ],
    );
  }
}

class _DropdownField extends StatelessWidget {
  final String label;
  final String value;
  final List<String> items;
  final void Function(String?) onChanged;

  const _DropdownField({
    required this.label,
    required this.value,
    required this.items,
    required this.onChanged,
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
        Container(
          decoration: BoxDecoration(
            color: AppTheme.surfaceMuted,
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 14),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: value,
              isExpanded: true,
              onChanged: onChanged,
              items: items
                  .map((i) => DropdownMenuItem(value: i, child: Text(i)))
                  .toList(),
              style: const TextStyle(
                fontSize: 14,
                color: AppTheme.textPrimary,
                fontFamily: 'Inter',
              ),
            ),
          ),
        ),
      ],
    );
  }
}
