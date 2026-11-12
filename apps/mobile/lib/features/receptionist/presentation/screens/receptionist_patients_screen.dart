import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/receptionist_repository.dart';
import '../../data/receptionist_models.dart';

class ReceptionistPatientsScreen extends ConsumerStatefulWidget {
  const ReceptionistPatientsScreen({super.key});

  @override
  ConsumerState<ReceptionistPatientsScreen> createState() =>
      _ReceptionistPatientsScreenState();
}

class _ReceptionistPatientsScreenState
    extends ConsumerState<ReceptionistPatientsScreen> {
  final TextEditingController _searchCtrl = TextEditingController();
  String _searchQuery = '';
  String _selectedStatus = 'All';
  final List<String> _statusFilters = ['All', 'Active', 'Inactive', 'Pending'];

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final patients = ref.watch(receptionistPatientsProvider);

    final filtered = patients.where((p) {
      final q = _searchQuery.toLowerCase();
      final matchSearch = q.isEmpty ||
          p.name.toLowerCase().contains(q) ||
          p.pid.toLowerCase().contains(q) ||
          p.phone.toLowerCase().contains(q);
      final matchStatus =
          _selectedStatus == 'All' || p.status.toLowerCase() == _selectedStatus.toLowerCase();
      return matchSearch && matchStatus;
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            _buildHeader(context, patients.length),
            // Search
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
              child: TextField(
                controller: _searchCtrl,
                onChanged: (v) => setState(() => _searchQuery = v),
                decoration: InputDecoration(
                  hintText: 'Search name, PID, phone…',
                  hintStyle:
                      const TextStyle(color: AppTheme.textMuted, fontSize: 14),
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
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 12),
                ),
              ),
            ),
            // Status chips
            SizedBox(
              height: 48,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.fromLTRB(20, 10, 20, 0),
                children: _statusFilters.map((s) {
                  final isActive = s == _selectedStatus;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedStatus = s),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding:
                            const EdgeInsets.symmetric(horizontal: 14),
                        decoration: BoxDecoration(
                          color: isActive
                              ? AppTheme.primary
                              : AppTheme.surfaceMuted,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Center(
                          child: Text(
                            s,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: isActive
                                  ? Colors.white
                                  : AppTheme.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            // Count
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 10, 20, 0),
              child: Row(
                children: [
                  Text(
                    '${filtered.length} patient${filtered.length != 1 ? 's' : ''}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppTheme.textMuted,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            // List
            Expanded(
              child: RefreshIndicator(
                onRefresh: () => ReceptionistRepository.loadFromApi(ref),
                child: filtered.isEmpty
                    ? _EmptyPatientsState()
                    : ListView.builder(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.fromLTRB(20, 8, 20, 80),
                        itemCount: filtered.length,
                        itemBuilder: (_, i) => _PatientCard(
                          patient: filtered[i],
                          onTap: () => _showPatientDetail(filtered[i]),
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showRegisterPatientSheet(context),
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.person_add_rounded),
        label: const Text(
          'Register Patient',
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
              color: AppTheme.primaryLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.people_alt_rounded,
                color: AppTheme.primary, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Patient Directory',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textPrimary,
                  ),
                ),
                Text(
                  '$total registered patients',
                  style:
                      const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showPatientDetail(RegistrationPatient patient) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _PatientDetailSheet(patient: patient),
    );
  }

  void _showRegisterPatientSheet(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _RegisterPatientSheet(),
    );
  }
}

// ─── Patient Card ─────────────────────────────────────────────────────────────

class _PatientCard extends StatelessWidget {
  final RegistrationPatient patient;
  final VoidCallback onTap;

  const _PatientCard({required this.patient, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF06B6D4), Color(0xFF1E6BFF)],
                  ),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Center(
                  child: Text(
                    patient.initials,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            patient.name,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: patient.status.toLowerCase() == 'active'
                                ? AppTheme.successLight
                                : AppTheme.surfaceMuted,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            patient.status,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: patient.status.toLowerCase() == 'active'
                                  ? AppTheme.success
                                  : AppTheme.textMuted,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${patient.pid} · ${patient.age} yrs · ${patient.gender}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppTheme.textMuted,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.phone_outlined,
                            size: 12, color: AppTheme.textMuted),
                        const SizedBox(width: 4),
                        Text(
                          patient.phone,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right_rounded,
                  color: AppTheme.textMuted, size: 20),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Empty State ──────────────────────────────────────────────────────────────

class _EmptyPatientsState extends StatelessWidget {
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
          const Text(
            'No patients found',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Try registering a new patient or adjust search filter',
            style: TextStyle(fontSize: 13, color: AppTheme.textMuted),
          ),
        ],
      ),
    );
  }
}

// ─── Patient Detail Sheet ─────────────────────────────────────────────────────

class _PatientDetailSheet extends ConsumerWidget {
  final RegistrationPatient patient;
  const _PatientDetailSheet({required this.patient});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DraggableScrollableSheet(
      initialChildSize: 0.72,
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
            Expanded(
              child: ListView(
                controller: controller,
                padding: const EdgeInsets.all(24),
                children: [
                  // Avatar + name
                  Row(
                    children: [
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF06B6D4), Color(0xFF1E6BFF)],
                          ),
                          borderRadius: BorderRadius.circular(18),
                        ),
                        child: Center(
                          child: Text(
                            patient.initials,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 22,
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
                              patient.name,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            Text(
                              patient.pid,
                              style: const TextStyle(
                                  fontSize: 13, color: AppTheme.textMuted),
                            ),
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: AppTheme.successLight,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                patient.status,
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.success,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  const Divider(),
                  const SizedBox(height: 12),
                  // Personal info
                  _Section(title: 'Personal Information', children: [
                    _InfoRow(icon: Icons.cake_outlined,
                        label: 'Age', value: '${patient.age} years'),
                    _InfoRow(icon: Icons.wc_rounded,
                        label: 'Gender', value: patient.gender),
                    _InfoRow(icon: Icons.bloodtype_outlined,
                        label: 'Blood Type', value: patient.bloodType),
                    _InfoRow(icon: Icons.phone_outlined,
                        label: 'Phone', value: patient.phone),
                    _InfoRow(icon: Icons.email_outlined,
                        label: 'Email', value: patient.email),
                    _InfoRow(icon: Icons.location_on_outlined,
                        label: 'Address', value: patient.address),
                    _InfoRow(icon: Icons.calendar_today_outlined,
                        label: 'Registered', value: patient.registrationDate),
                  ]),
                  const SizedBox(height: 16),
                  _Section(title: 'Emergency Contact', children: [
                    _InfoRow(icon: Icons.person_outline,
                        label: 'Name', value: patient.emergencyContact),
                    _InfoRow(icon: Icons.phone_outlined,
                        label: 'Phone', value: patient.emergencyPhone),
                  ]),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _quickCheckIn(context, ref),
                          icon: const Icon(Icons.how_to_reg_rounded, size: 18),
                          label: const Text('Check In to Queue'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _quickCheckIn(BuildContext context, WidgetRef ref) async {
    Navigator.pop(context);
    final entry = await ReceptionistRepository.addToQueue(ref, {
      'patientId': patient.id,
      'priority': 'NORMAL',
      'reason': 'Consultation',
    });

    if (context.mounted) {
      if (entry != null) {
        unawaited(showDialog<void>(
          context: context,
          builder: (ctx) => AlertDialog(
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: const Row(
              children: [
                Icon(Icons.check_circle, color: AppTheme.success, size: 28),
                SizedBox(width: 10),
                Text('Checked In!'),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('${patient.name} (${patient.pid})'),
                const SizedBox(height: 14),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryLight,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      const Text(
                        'QUEUE TICKET',
                        style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.primary),
                      ),
                      Text(
                        '#${entry.queueNumber}',
                        style: const TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.w900,
                            color: AppTheme.primary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('OK',
                      style: TextStyle(fontWeight: FontWeight.w700))),
            ],
          ),
        ));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to check in patient. Check network.'),
            backgroundColor: AppTheme.danger,
          ),
        );
      }
    }
  }
}

class _Section extends StatelessWidget {
  final String title;
  final List<Widget> children;
  const _Section({required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 10),
        ...children,
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoRow(
      {required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: AppTheme.textMuted),
          const SizedBox(width: 10),
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: const TextStyle(
                  fontSize: 13,
                  color: AppTheme.textMuted,
                  fontWeight: FontWeight.w500),
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

// ─── Register Patient Sheet ───────────────────────────────────────────────────

class _RegisterPatientSheet extends ConsumerStatefulWidget {
  const _RegisterPatientSheet();

  @override
  ConsumerState<_RegisterPatientSheet> createState() =>
      _RegisterPatientSheetState();
}

class _RegisterPatientSheetState extends ConsumerState<_RegisterPatientSheet> {
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _emergencyNameCtrl = TextEditingController();
  final _emergencyPhoneCtrl = TextEditingController();

  String _gender = 'Male';
  String _bloodType = 'O+';
  DateTime _dob = DateTime.now().subtract(const Duration(days: 365 * 28));
  bool _isSubmitting = false;

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _phoneCtrl.dispose();
    _emailCtrl.dispose();
    _addressCtrl.dispose();
    _emergencyNameCtrl.dispose();
    _emergencyPhoneCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final existingPatients = ref.watch(receptionistPatientsProvider);

    // Duplicate detection check
    final phoneInput = _phoneCtrl.text.trim();
    final emailInput = _emailCtrl.text.trim();
    final duplicateMatch = (phoneInput.isNotEmpty || emailInput.isNotEmpty)
        ? existingPatients.where((p) =>
            (phoneInput.isNotEmpty && p.phone.isNotEmpty && p.phone == phoneInput) ||
            (emailInput.isNotEmpty && p.email.isNotEmpty && p.email.toLowerCase() == emailInput.toLowerCase())).firstOrNull
        : null;

    final age = (DateTime.now().difference(_dob).inDays / 365.25).floor();

    return Padding(
      padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: DraggableScrollableSheet(
          initialChildSize: 0.9,
          maxChildSize: 0.95,
          minChildSize: 0.5,
          expand: false,
          builder: (_, controller) => Column(
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
                    'Register New Patient',
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
                child: ListView(
                  controller: controller,
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  children: [
                    // Duplicate Warning Banner
                    if (duplicateMatch != null) ...[
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppTheme.warningLight,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                              color: AppTheme.warning.withValues(alpha: 0.4)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.warning_amber_rounded,
                                color: AppTheme.warning),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                'Possible duplicate found: ${duplicateMatch.name} (${duplicateMatch.pid})',
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.textPrimary,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),
                    ],

                    const _FieldLabel('First Name *'),
                    _SimpleField(controller: _firstNameCtrl, hint: 'First name'),
                    const SizedBox(height: 14),

                    const _FieldLabel('Last Name *'),
                    _SimpleField(controller: _lastNameCtrl, hint: 'Last name'),
                    const SizedBox(height: 14),

                    // Date of Birth & Gender
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const _FieldLabel('Date of Birth'),
                              GestureDetector(
                                onTap: () async {
                                  final picked = await showDatePicker(
                                    context: context,
                                    initialDate: _dob,
                                    firstDate: DateTime(1920),
                                    lastDate: DateTime.now(),
                                  );
                                  if (picked != null) {
                                    setState(() => _dob = picked);
                                  }
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 12, vertical: 12),
                                  decoration: BoxDecoration(
                                    color: AppTheme.surfaceMuted,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.calendar_today_rounded,
                                          size: 14, color: AppTheme.primary),
                                      const SizedBox(width: 6),
                                      Text(
                                        '${_dob.year}-${_dob.month.toString().padLeft(2, '0')}-${_dob.day.toString().padLeft(2, '0')} ($age y)',
                                        style: const TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w600),
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
                              const _FieldLabel('Gender'),
                              Container(
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 10),
                                decoration: BoxDecoration(
                                  color: AppTheme.surfaceMuted,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: DropdownButtonHideUnderline(
                                  child: DropdownButton<String>(
                                    value: _gender,
                                    isExpanded: true,
                                    items: ['Male', 'Female', 'Other']
                                        .map((g) => DropdownMenuItem(
                                            value: g, child: Text(g)))
                                        .toList(),
                                    onChanged: (g) =>
                                        setState(() => _gender = g!),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    const _FieldLabel('Phone Number *'),
                    _SimpleField(
                      controller: _phoneCtrl,
                      hint: '+251 9XX XXX XXX',
                      keyboardType: TextInputType.phone,
                      onChanged: (_) => setState(() {}),
                    ),
                    const SizedBox(height: 14),

                    const _FieldLabel('Email Address'),
                    _SimpleField(
                      controller: _emailCtrl,
                      hint: 'patient@email.com',
                      keyboardType: TextInputType.emailAddress,
                      onChanged: (_) => setState(() {}),
                    ),
                    const SizedBox(height: 14),

                    const _FieldLabel('Address / Residence'),
                    _SimpleField(
                      controller: _addressCtrl,
                      hint: 'Sub-city, House No, Addis Ababa',
                    ),
                    const SizedBox(height: 14),

                    const _FieldLabel('Blood Type'),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children:
                          ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
                              .map((bt) {
                        final isSelected = bt == _bloodType;
                        return GestureDetector(
                          onTap: () => setState(() => _bloodType = bt),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 14, vertical: 8),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? AppTheme.dangerLight
                                  : AppTheme.surfaceMuted,
                              borderRadius: BorderRadius.circular(8),
                              border: isSelected
                                  ? Border.all(
                                      color: AppTheme.danger
                                          .withValues(alpha: 0.4))
                                  : null,
                            ),
                            child: Text(
                              bt,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: isSelected
                                    ? AppTheme.danger
                                    : AppTheme.textSecondary,
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),

                    const _FieldLabel('Emergency Contact Name'),
                    _SimpleField(
                      controller: _emergencyNameCtrl,
                      hint: 'Family member / contact name',
                    ),
                    const SizedBox(height: 14),

                    const _FieldLabel('Emergency Contact Phone'),
                    _SimpleField(
                      controller: _emergencyPhoneCtrl,
                      hint: '+251 9XX XXX XXX',
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: 24),

                    ElevatedButton(
                      onPressed: _isSubmitting ? null : _submitRegistration,
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
                              'Complete Patient Registration',
                              style: TextStyle(
                                  fontWeight: FontWeight.w700, fontSize: 15),
                            ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _submitRegistration() async {
    final firstName = _firstNameCtrl.text.trim();
    final lastName = _lastNameCtrl.text.trim();
    if (firstName.isEmpty || lastName.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter first and last name')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final dobStr =
        '${_dob.year}-${_dob.month.toString().padLeft(2, '0')}-${_dob.day.toString().padLeft(2, '0')}';

    final data = <String, dynamic>{
      'firstName': firstName,
      'lastName': lastName,
      'phoneNumber': _phoneCtrl.text.trim().isNotEmpty ? _phoneCtrl.text.trim() : null,
      'email': _emailCtrl.text.trim().isNotEmpty ? _emailCtrl.text.trim() : null,
      'gender': _gender.toUpperCase(),
      'bloodType': _bloodType,
      'dateOfBirth': dobStr,
      'address': _addressCtrl.text.trim().isNotEmpty ? _addressCtrl.text.trim() : null,
      'emergencyContactName': _emergencyNameCtrl.text.trim().isNotEmpty
          ? _emergencyNameCtrl.text.trim()
          : null,
      'emergencyContactPhone': _emergencyPhoneCtrl.text.trim().isNotEmpty
          ? _emergencyPhoneCtrl.text.trim()
          : null,
    };

    final newPatient = await ReceptionistRepository.registerPatient(ref, data);

    if (mounted) {
      setState(() => _isSubmitting = false);
      Navigator.pop(context);

      if (newPatient != null) {
        unawaited(showDialog<void>(
          context: context,
          builder: (ctx) => AlertDialog(
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: const Row(
              children: [
                Icon(Icons.check_circle, color: AppTheme.success, size: 28),
                SizedBox(width: 10),
                Text('Registered!'),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  newPatient.name,
                  style: const TextStyle(
                      fontSize: 16, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 12),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryLight,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      const Text(
                        'ASSIGNED PID',
                        style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.primary),
                      ),
                      Text(
                        newPatient.pid,
                        style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.w900,
                            color: AppTheme.primary),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                Text('Phone: ${newPatient.phone}'),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Done',
                    style: TextStyle(fontWeight: FontWeight.w700)),
              ),
            ],
          ),
        ));
      }
    }
  }
}

class _FieldLabel extends StatelessWidget {
  final String text;
  const _FieldLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: AppTheme.textSecondary,
        ),
      ),
    );
  }
}

class _SimpleField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final TextInputType keyboardType;
  final void Function(String)? onChanged;

  const _SimpleField({
    required this.controller,
    required this.hint,
    this.keyboardType = TextInputType.text,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      onChanged: onChanged,
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
    );
  }
}
