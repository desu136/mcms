import 'dart:async';
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
    'Checked In',
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
          a.statusLabel.toLowerCase() == _selectedFilter.toLowerCase();
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
              child: RefreshIndicator(
                onRefresh: () => ReceptionistRepository.loadFromApi(ref),
                child: filtered.isEmpty
                    ? _EmptyState(filter: _selectedFilter)
                    : ListView.builder(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.fromLTRB(20, 12, 20, 80),
                        itemCount: filtered.length,
                        itemBuilder: (_, i) => AppointmentCard(
                          appt: filtered[i],
                          onTap: () => _showAppointmentDetail(filtered[i]),
                        ),
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

class _AppointmentDetailSheet extends ConsumerWidget {
  final ReceptionistAppointment appt;
  const _AppointmentDetailSheet({required this.appt});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isCheckedIn = appt.status == ReceptionistAppointmentStatus.checkedIn;
    final isCancelled = appt.status == ReceptionistAppointmentStatus.cancelled;
    final isCompleted = appt.status == ReceptionistAppointmentStatus.completed;

    return DraggableScrollableSheet(
      initialChildSize: 0.65,
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
                              appt.pid.isNotEmpty ? appt.pid : 'No PID',
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
                  if (appt.notes != null && appt.notes!.isNotEmpty)
                    _DetailRow(label: 'Notes', value: appt.notes!),
                  const SizedBox(height: 24),

                  if (!isCancelled && !isCompleted) ...[
                    Row(
                      children: [
                        // Cancel button
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => _handleCancel(context, ref),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppTheme.danger,
                              side: const BorderSide(color: AppTheme.danger),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: const Text('Cancel Appt'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        // Reschedule button
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => _handleReschedule(context, ref),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppTheme.primary,
                              side: const BorderSide(color: AppTheme.primary),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: const Text('Reschedule'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Check-in button
                    if (!isCheckedIn)
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () => _handleCheckIn(context, ref),
                          icon: const Icon(Icons.how_to_reg_rounded),
                          label: const Text(
                            'Check In to Live Queue',
                            style: TextStyle(fontWeight: FontWeight.w700),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
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
    );
  }

  void _handleCheckIn(BuildContext context, WidgetRef ref) async {
    Navigator.pop(context);
    final entry = await ReceptionistRepository.checkInAppointmentToQueue(ref, appt);

    if (context.mounted) {
      if (entry != null) {
        unawaited(showDialog<void>(
          context: context,
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: const Row(
              children: [
                Icon(Icons.check_circle, color: AppTheme.success, size: 28),
                SizedBox(width: 10),
                Text('Checked In!'),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Patient: ${appt.patientName} (${appt.pid})'),
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
                        'QUEUE TICKET',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.primary,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '#${entry.queueNumber}',
                        style: const TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.w900,
                          color: AppTheme.primary,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Text('Doctor: ${appt.doctorName}'),
                Text('Department: ${appt.department}'),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('OK', style: TextStyle(fontWeight: FontWeight.w700)),
              ),
            ],
          ),
        ));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to check in patient. Check network connection.'),
            backgroundColor: AppTheme.danger,
          ),
        );
      }
    }
  }

  void _handleCancel(BuildContext context, WidgetRef ref) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cancel Appointment'),
        content: Text('Are you sure you want to cancel the appointment for ${appt.patientName}?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppTheme.danger),
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final ok = await ReceptionistRepository.cancelAppointment(ref, appt.id);
      if (context.mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(ok ? 'Appointment cancelled' : 'Failed to cancel appointment'),
            backgroundColor: ok ? AppTheme.primary : AppTheme.danger,
          ),
        );
      }
    }
  }

  void _handleReschedule(BuildContext context, WidgetRef ref) async {
    final now = DateTime.now();
    final pickedDate = await showDatePicker(
      context: context,
      initialDate: now.add(const Duration(days: 1)),
      firstDate: now,
      lastDate: now.add(const Duration(days: 90)),
    );

    if (pickedDate != null && context.mounted) {
      final dateStr =
          '${pickedDate.year}-${pickedDate.month.toString().padLeft(2, '0')}-${pickedDate.day.toString().padLeft(2, '0')}';
      Navigator.pop(context);
      final ok = await ReceptionistRepository.rescheduleAppointment(
          ref, appt.id, dateStr, '10:00 AM');
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(ok ? 'Appointment rescheduled to $dateStr' : 'Failed to reschedule'),
            backgroundColor: ok ? AppTheme.success : AppTheme.danger,
          ),
        );
      }
    }
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

class _BookAppointmentSheet extends ConsumerStatefulWidget {
  const _BookAppointmentSheet();

  @override
  ConsumerState<_BookAppointmentSheet> createState() =>
      _BookAppointmentSheetState();
}

class _BookAppointmentSheetState extends ConsumerState<_BookAppointmentSheet> {
  final _formKey = GlobalKey<FormState>();
  RegistrationPatient? _selectedPatient;
  DoctorItem? _selectedDoctor;
  DepartmentItem? _selectedDepartment;
  final _reasonCtrl = TextEditingController();

  DateTime _selectedDate = DateTime.now();
  String _selectedTime = '09:00 AM';
  bool _isSubmitting = false;

  final _times = [
    '08:00 AM',
    '08:30 AM',
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
  ];

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
                  'Book New Appointment',
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
                    // Patient picker
                    const Text(
                      'Patient *',
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
                          hint: const Text('Select registered patient'),
                          value: _selectedPatient,
                          isExpanded: true,
                          items: patients
                              .map(
                                (p) => DropdownMenuItem(
                                  value: p,
                                  child: Text('${p.name} (${p.pid})'),
                                ),
                              )
                              .toList(),
                          onChanged: (p) => setState(() => _selectedPatient = p),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Doctor picker
                    const Text(
                      'Doctor',
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
                          hint: const Text('Select attending doctor (optional)'),
                          value: _selectedDoctor,
                          isExpanded: true,
                          items: doctors
                              .map(
                                (d) => DropdownMenuItem(
                                  value: d,
                                  child: Text('${d.name} (${d.specialization})'),
                                ),
                              )
                              .toList(),
                          onChanged: (d) => setState(() => _selectedDoctor = d),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Department picker
                    const Text(
                      'Department',
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
                          hint: const Text('Select department (optional)'),
                          value: _selectedDepartment,
                          isExpanded: true,
                          items: departments
                              .map(
                                (d) => DropdownMenuItem(
                                  value: d,
                                  child: Text(d.name),
                                ),
                              )
                              .toList(),
                          onChanged: (d) => setState(() => _selectedDepartment = d),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Date & Time pickers in row
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Date *',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.textSecondary,
                                ),
                              ),
                              const SizedBox(height: 6),
                              GestureDetector(
                                onTap: () async {
                                  final picked = await showDatePicker(
                                    context: context,
                                    initialDate: _selectedDate,
                                    firstDate: DateTime.now(),
                                    lastDate: DateTime.now().add(const Duration(days: 90)),
                                  );
                                  if (picked != null) {
                                    setState(() => _selectedDate = picked);
                                  }
                                },
                                child: Container(
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    color: AppTheme.surfaceMuted,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.calendar_today_rounded,
                                          size: 16, color: AppTheme.primary),
                                      const SizedBox(width: 8),
                                      Text(
                                        '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w600,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Time Slot *',
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
                                padding: const EdgeInsets.symmetric(horizontal: 10),
                                child: DropdownButtonHideUnderline(
                                  child: DropdownButton<String>(
                                    value: _selectedTime,
                                    isExpanded: true,
                                    items: _times
                                        .map((t) => DropdownMenuItem(value: t, child: Text(t, style: const TextStyle(fontSize: 13))))
                                        .toList(),
                                    onChanged: (t) => setState(() => _selectedTime = t!),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Reason / Notes
                    const Text(
                      'Reason / Chief Complaint',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _reasonCtrl,
                      maxLines: 3,
                      decoration: InputDecoration(
                        hintText: 'e.g. Follow-up consultation, fever and headache…',
                        hintStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
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

                    // Submit button
                    ElevatedButton(
                      onPressed: _isSubmitting ? null : _submitAppointment,
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
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : const Text(
                              'Confirm & Book Appointment',
                              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
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

  void _submitAppointment() async {
    if (_selectedPatient == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a patient')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final dateStr =
        '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}';

    final payload = <String, dynamic>{
      'patientId': _selectedPatient!.id,
      'appointmentDate': dateStr,
      'startTime': _selectedTime,
      'type': 'CONSULTATION',
      'reason': _reasonCtrl.text.trim().isNotEmpty
          ? _reasonCtrl.text.trim()
          : 'Consultation',
      'notes': _reasonCtrl.text.trim().isNotEmpty ? _reasonCtrl.text.trim() : null,
    };

    if (_selectedDoctor != null) {
      payload['doctorId'] = _selectedDoctor!.id;
    }
    if (_selectedDepartment != null) {
      payload['departmentId'] = _selectedDepartment!.id;
    }

    final success = await ReceptionistRepository.createAppointment(ref, payload);

    if (mounted) {
      setState(() => _isSubmitting = false);
      Navigator.pop(context);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success
              ? 'Appointment booked for ${_selectedPatient!.name}'
              : 'Failed to book appointment'),
          backgroundColor: success ? AppTheme.success : AppTheme.danger,
        ),
      );
    }
  }
}
