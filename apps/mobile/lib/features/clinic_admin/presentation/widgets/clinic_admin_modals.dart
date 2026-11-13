import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/clinic_admin_models.dart';
import '../../data/clinic_admin_repository.dart';

class ClinicAdminModals {
  ClinicAdminModals._();

  /// Modal bottom sheet to add a new Branch
  static void showAddBranchModal(BuildContext context, WidgetRef ref) {
    final nameCtrl = TextEditingController();
    final codeCtrl = TextEditingController();
    final addressCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final managerCtrl = TextEditingController();
    final roomsCtrl = TextEditingController(text: '8');

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom,
        ),
        child: Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.all(24),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: const Color(0xFFCBD5E1),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.business_rounded,
                        color: AppTheme.primary,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'Add New Branch',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                _buildField(label: 'Branch Name', controller: nameCtrl, hint: 'e.g. Gerji Satellite Center'),
                const SizedBox(height: 12),
                _buildField(label: 'Branch Code', controller: codeCtrl, hint: 'e.g. BR-GRJ-04'),
                const SizedBox(height: 12),
                _buildField(label: 'Physical Address', controller: addressCtrl, hint: 'e.g. Gerji Imperial, Addis Ababa'),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(child: _buildField(label: 'Phone', controller: phoneCtrl, hint: '+251 11...')),
                    const SizedBox(width: 12),
                    Expanded(child: _buildField(label: 'Email', controller: emailCtrl, hint: 'branch@mcms.local')),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(child: _buildField(label: 'Manager in Charge', controller: managerCtrl, hint: 'e.g. Dr. Hanna B.')),
                    const SizedBox(width: 12),
                    Expanded(child: _buildField(label: 'Room Count', controller: roomsCtrl, hint: '8', keyboardType: TextInputType.number)),
                  ],
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () {
                    if (nameCtrl.text.trim().isEmpty) return;
                    final newBranch = ClinicBranchItem(
                      id: 'branch-${DateTime.now().millisecondsSinceEpoch}',
                      name: nameCtrl.text.trim(),
                      code: codeCtrl.text.trim().isNotEmpty ? codeCtrl.text.trim() : 'BR-NEW',
                      address: addressCtrl.text.trim().isNotEmpty ? addressCtrl.text.trim() : 'Addis Ababa',
                      phone: phoneCtrl.text.trim().isNotEmpty ? phoneCtrl.text.trim() : '+251 110 000 000',
                      email: emailCtrl.text.trim().isNotEmpty ? emailCtrl.text.trim() : 'branch@mcms.local',
                      isMainBranch: false,
                      status: 'Active',
                      managerName: managerCtrl.text.trim().isNotEmpty ? managerCtrl.text.trim() : 'Assigned Admin',
                      staffCount: 1,
                      roomCount: int.tryParse(roomsCtrl.text.trim()) ?? 6,
                      operatingHours: 'Mon - Sat: 8:00 AM - 6:00 PM',
                    );
                    ref.read(clinicAdminChangeNotifierProvider.notifier).addBranch(newBranch);
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Branch "${newBranch.name}" created successfully'),
                        backgroundColor: AppTheme.success,
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text(
                    'Create Branch',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white),
                  ),
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Modal bottom sheet to add a new Department
  static void showAddDepartmentModal(BuildContext context, WidgetRef ref) {
    final nameCtrl = TextEditingController();
    final codeCtrl = TextEditingController();
    final headCtrl = TextEditingController();
    final roomsCtrl = TextEditingController(text: '4');
    final descCtrl = TextEditingController();

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.all(24),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: const Color(0xFFCBD5E1),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppTheme.purpleLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.meeting_room_rounded,
                        color: AppTheme.purple,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'Add Department',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                _buildField(label: 'Department Name', controller: nameCtrl, hint: 'e.g. Dermatology & Skin Care'),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(child: _buildField(label: 'Department Code', controller: codeCtrl, hint: 'e.g. DERM-01')),
                    const SizedBox(width: 12),
                    Expanded(child: _buildField(label: 'Room Count', controller: roomsCtrl, hint: '4', keyboardType: TextInputType.number)),
                  ],
                ),
                const SizedBox(height: 12),
                _buildField(label: 'Head of Department / Lead Physician', controller: headCtrl, hint: 'e.g. Dr. Fitsum Alemu'),
                const SizedBox(height: 12),
                _buildField(label: 'Description / Scope', controller: descCtrl, hint: 'Specialized clinical services, scope of care...'),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () {
                    if (nameCtrl.text.trim().isEmpty) return;
                    final newDept = ClinicDepartmentItem(
                      id: 'dept-${DateTime.now().millisecondsSinceEpoch}',
                      name: nameCtrl.text.trim(),
                      code: codeCtrl.text.trim().isNotEmpty ? codeCtrl.text.trim() : 'DEPT-NEW',
                      headDoctor: headCtrl.text.trim().isNotEmpty ? headCtrl.text.trim() : 'TBD',
                      roomCount: int.tryParse(roomsCtrl.text.trim()) ?? 3,
                      staffCount: 1,
                      status: 'Active',
                      branchName: 'Main Campus (Bole)',
                      description: descCtrl.text.trim().isNotEmpty ? descCtrl.text.trim() : 'Comprehensive clinical care services.',
                    );
                    ref.read(clinicAdminChangeNotifierProvider.notifier).addDepartment(newDept);
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Department "${newDept.name}" created successfully'),
                        backgroundColor: AppTheme.success,
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.purple,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text(
                    'Save Department',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white),
                  ),
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Modal bottom sheet to add a new Staff Member
  static void showAddStaffModal(BuildContext context, WidgetRef ref) {
    final nameCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final specialtyCtrl = TextEditingController();
    final licenseCtrl = TextEditingController();
    String selectedRole = 'Doctor';
    final existingDepts = ref.read(clinicAdminDepartmentsProvider);
    final deptOptions = existingDepts.isNotEmpty
        ? existingDepts.map((d) => d.name).toList()
        : ['General OPD', 'Emergency', 'Pediatrics', 'Internal Medicine'];
    String selectedDept = deptOptions.first;

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
          child: Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            padding: const EdgeInsets.all(24),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: const Color(0xFFCBD5E1),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppTheme.cyanLight,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(
                          Icons.person_add_alt_1_rounded,
                          color: AppTheme.cyan,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Text(
                        'Add Clinical Staff',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  _buildField(label: 'Full Name', controller: nameCtrl, hint: 'e.g. Dr. Samuel Yohannes'),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Role',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.textSecondary),
                            ),
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              decoration: BoxDecoration(
                                border: Border.all(color: const Color(0xFFCBD5E1)),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: DropdownButtonHideUnderline(
                                child: DropdownButton<String>(
                                  value: selectedRole,
                                  isExpanded: true,
                                  items: ['Doctor', 'Nurse', 'Receptionist', 'Pharmacist', 'Lab Tech', 'Administrator']
                                      .map((r) => DropdownMenuItem(value: r, child: Text(r, style: const TextStyle(fontSize: 13))))
                                      .toList(),
                                  onChanged: (v) {
                                    if (v != null) setModalState(() => selectedRole = v);
                                  },
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
                              'Department',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.textSecondary),
                            ),
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              decoration: BoxDecoration(
                                border: Border.all(color: const Color(0xFFCBD5E1)),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: DropdownButtonHideUnderline(
                                child: DropdownButton<String>(
                                  value: selectedDept,
                                  isExpanded: true,
                                  items: deptOptions
                                      .map((d) => DropdownMenuItem(value: d, child: Text(d, style: const TextStyle(fontSize: 13), overflow: TextOverflow.ellipsis)))
                                      .toList(),
                                  onChanged: (v) {
                                    if (v != null) setModalState(() => selectedDept = v);
                                  },
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _buildField(label: 'Specialty / Focus', controller: specialtyCtrl, hint: 'e.g. Cardiothoracic Surgery'),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: _buildField(label: 'Email', controller: emailCtrl, hint: 'staff@mcms.local')),
                      const SizedBox(width: 12),
                      Expanded(child: _buildField(label: 'Phone', controller: phoneCtrl, hint: '+251 9...')),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _buildField(label: 'License / Registration #', controller: licenseCtrl, hint: 'ETH-MD-XXXX'),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () {
                      if (nameCtrl.text.trim().isEmpty) return;
                      final newStaff = ClinicStaffMember(
                        id: 'staff-${DateTime.now().millisecondsSinceEpoch}',
                        name: nameCtrl.text.trim(),
                        email: emailCtrl.text.trim().isNotEmpty ? emailCtrl.text.trim() : 'staff@mcms.local',
                        phone: phoneCtrl.text.trim().isNotEmpty ? phoneCtrl.text.trim() : '+251 900 000 000',
                        role: selectedRole,
                        department: selectedDept,
                        specialty: specialtyCtrl.text.trim().isNotEmpty ? specialtyCtrl.text.trim() : selectedRole,
                        status: 'Active',
                        licenseNumber: licenseCtrl.text.trim().isNotEmpty ? licenseCtrl.text.trim() : 'ETH-REG-2026',
                        joinedDate: 'Today',
                        shift: 'Morning (08:00 - 16:00)',
                      );
                      ref.read(clinicAdminChangeNotifierProvider.notifier).addStaff(newStaff);
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Staff "${newStaff.name}" added successfully'),
                          backgroundColor: AppTheme.success,
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.cyan,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text(
                      'Add Staff Member',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white),
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// Staff details inspection modal
  static void showStaffDetailModal(BuildContext context, ClinicStaffMember staff, WidgetRef ref) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFCBD5E1),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: AppTheme.primaryLight,
                  child: Text(
                    staff.initials,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
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
                        staff.name,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryLight,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              staff.role,
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.primary,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: staff.status == 'Active' ? AppTheme.successLight : AppTheme.warningLight,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              staff.status,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: staff.status == 'Active' ? AppTheme.success : AppTheme.warning,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            const Divider(),
            const SizedBox(height: 12),
            _buildDetailRow(icon: Icons.local_hospital_outlined, label: 'Department', value: staff.department),
            _buildDetailRow(icon: Icons.psychology_outlined, label: 'Specialty', value: staff.specialty),
            _buildDetailRow(icon: Icons.badge_outlined, label: 'Medical License', value: staff.licenseNumber),
            _buildDetailRow(icon: Icons.schedule_outlined, label: 'Shift Roster', value: staff.shift),
            _buildDetailRow(icon: Icons.email_outlined, label: 'Email', value: staff.email),
            _buildDetailRow(icon: Icons.phone_outlined, label: 'Phone', value: staff.phone),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      ref.read(clinicAdminChangeNotifierProvider.notifier).toggleStaffStatus(staff.id);
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Updated status for ${staff.name}'),
                          backgroundColor: AppTheme.primary,
                        ),
                      );
                    },
                    icon: Icon(
                      staff.status == 'Active' ? Icons.pause_circle_outline_rounded : Icons.play_circle_outline_rounded,
                      size: 18,
                    ),
                    label: Text(staff.status == 'Active' ? 'Mark On Leave' : 'Set Active'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => Navigator.pop(ctx),
                    icon: const Icon(Icons.check_rounded, size: 18, color: Colors.white),
                    label: const Text('Done', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  /// Profile Sheet
  static void showProfileSheet(BuildContext context, ClinicAdminProfile profile) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFCBD5E1),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            CircleAvatar(
              radius: 32,
              backgroundColor: AppTheme.primaryLight,
              child: Text(
                profile.initials,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppTheme.primary),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              profile.name,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
            ),
            Text(
              profile.role,
              style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.background,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.border),
              ),
              child: Column(
                children: [
                  _buildDetailRow(icon: Icons.domain_rounded, label: 'Clinic', value: profile.clinicName),
                  _buildDetailRow(icon: Icons.qr_code_rounded, label: 'Code', value: profile.clinicCode),
                  _buildDetailRow(icon: Icons.pin_drop_outlined, label: 'Current Branch', value: profile.activeBranch),
                  _buildDetailRow(icon: Icons.email_outlined, label: 'Email', value: profile.email),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  /// Notifications Sheet
  static void showNotificationsSheet(BuildContext context, List<ClinicActivityItem> activities) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => Container(
        height: MediaQuery.of(ctx).size.height * 0.65,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFCBD5E1),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Notifications & Audit Log',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryLight,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '${activities.length} new',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.primary),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Expanded(
              child: ListView.separated(
                itemCount: activities.length,
                separatorBuilder: (_, __) => const Divider(height: 1),
                itemBuilder: (ctx, i) {
                  final act = activities[i];
                  IconData icon;
                  Color iconColor;
                  switch (act.type) {
                    case 'patient':
                      icon = Icons.person_rounded;
                      iconColor = AppTheme.primary;
                      break;
                    case 'billing':
                      icon = Icons.payments_rounded;
                      iconColor = AppTheme.success;
                      break;
                    case 'staff':
                      icon = Icons.badge_rounded;
                      iconColor = AppTheme.purple;
                      break;
                    default:
                      icon = Icons.calendar_today_rounded;
                      iconColor = AppTheme.orange;
                  }
                  return ListTile(
                    contentPadding: const EdgeInsets.symmetric(vertical: 6),
                    leading: Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: iconColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(icon, color: iconColor, size: 20),
                    ),
                    title: Text(
                      act.title,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.textPrimary),
                    ),
                    subtitle: Text(
                      act.description,
                      style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                    ),
                    trailing: Text(
                      act.timeAgo,
                      style: const TextStyle(fontSize: 10, color: AppTheme.textMuted),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  static Widget _buildField({
    required String label,
    required TextEditingController controller,
    required String hint,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.textSecondary),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          style: const TextStyle(fontSize: 14, color: AppTheme.textPrimary),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(fontSize: 13, color: AppTheme.textMuted),
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppTheme.primary, width: 1.5),
            ),
          ),
        ),
      ],
    );
  }

  static Widget _buildDetailRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppTheme.textMuted),
          const SizedBox(width: 8),
          Text(
            '$label: ',
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppTheme.textMuted),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.textPrimary),
              textAlign: TextAlign.end,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

