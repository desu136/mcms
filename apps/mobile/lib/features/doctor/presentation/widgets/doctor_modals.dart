import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/doctor_models.dart';
import '../../data/doctor_repository.dart';

// ─── Add Prescription Sheet ──────────────────────────────────────────────────

class AddPrescriptionSheet extends ConsumerStatefulWidget {
  final List<PatientItem> patients;
  final PatientItem? initialPatient;
  final void Function(PrescriptionItem)? onAdd;

  const AddPrescriptionSheet({
    super.key,
    required this.patients,
    this.initialPatient,
    this.onAdd,
  });

  @override
  ConsumerState<AddPrescriptionSheet> createState() =>
      _AddPrescriptionSheetState();
}

class _AddPrescriptionSheetState extends ConsumerState<AddPrescriptionSheet> {
  PatientItem? _selectedPatient;
  final _medicationController = TextEditingController(text: 'Lisinopril 10mg');
  final _dosageController = TextEditingController(text: '10mg Once daily');
  final _durationController = TextEditingController(text: '30 days');
  final _instructionsController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialPatient != null) {
      _selectedPatient = widget.initialPatient;
    } else if (widget.patients.isNotEmpty) {
      _selectedPatient = widget.patients.first;
    }
  }

  @override
  void dispose() {
    _medicationController.dispose();
    _dosageController.dispose();
    _durationController.dispose();
    _instructionsController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (_selectedPatient == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a patient.'),
          backgroundColor: Color(0xFFEF4444),
        ),
      );
      return;
    }

    final med = _medicationController.text.trim();
    if (med.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a medication name.'),
          backgroundColor: Color(0xFFEF4444),
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final client = ref.read(apiClientProvider);
      final rxPayload = <String, dynamic>{
        'patientId': _selectedPatient!.id,
        'medication': med,
        'dosage': _dosageController.text.trim(),
        'duration': _durationController.text.trim(),
        'instructions': _instructionsController.text.trim().isNotEmpty
            ? _instructionsController.text.trim()
            : 'Take as directed',
        'status': 'ACTIVE',
      };

      final success = await ref
          .read(doctorProvider.notifier)
          .createPrescriptionViaApi(client, rxPayload);

      if (mounted) {
        setState(() => _isSubmitting = false);
        if (success) {
          final newItem = PrescriptionItem(
            id: 'rx-${DateTime.now().millisecondsSinceEpoch}',
            prescriptionId: 'RX-${DateTime.now().millisecondsSinceEpoch % 100000}',
            patientName: _selectedPatient!.name,
            patientId: _selectedPatient!.id,
            patientAvatar: _selectedPatient!.avatar,
            medication: med,
            dosage: _dosageController.text.trim(),
            duration: _durationController.text.trim(),
            prescribedDate: 'Today',
            status: 'Active',
            department: 'Cardiology & OPD',
          );
          widget.onAdd?.call(newItem);

          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Prescription issued for ${_selectedPatient!.name}'),
              backgroundColor: const Color(0xFF10B981),
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Failed to save prescription to server.'),
              backgroundColor: Color(0xFFEF4444),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: const Color(0xFFEF4444),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: const Color(0xFFF5F3FF),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.medication_rounded,
                        color: Color(0xFF8B5CF6),
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 10),
                    const Text(
                      'Add Prescription',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close_rounded,
                      color: Color(0xFF94A3B8)),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Select Patient
            const Text(
              'Patient',
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 6),
            if (widget.patients.isEmpty && _selectedPatient == null)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.border),
                ),
                child: const Text(
                  'No registered patients available',
                  style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                ),
              )
            else
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  border: Border.all(color: AppTheme.border),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<PatientItem>(
                    isExpanded: true,
                    value: _selectedPatient,
                    items: widget.patients.map((p) {
                      return DropdownMenuItem(
                        value: p,
                        child: Text('${p.name} (${p.pid})'),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedPatient = val);
                    },
                  ),
                ),
              ),
            const SizedBox(height: 14),

            // Medication Name
            const Text(
              'Medication & Strength',
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _medicationController,
              decoration: InputDecoration(
                hintText: 'e.g. Lisinopril 10mg or Amoxicillin 500mg',
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppTheme.border),
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Dosage & Duration Row
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Dosage Frequency',
                        style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF64748B)),
                      ),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _dosageController,
                        decoration: InputDecoration(
                          hintText: 'e.g. 10mg Once daily',
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide:
                                const BorderSide(color: AppTheme.border),
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
                        'Duration',
                        style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF64748B)),
                      ),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _durationController,
                        decoration: InputDecoration(
                          hintText: 'e.g. 30 days',
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide:
                                const BorderSide(color: AppTheme.border),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Clinical Instructions
            const Text(
              'Instructions & Patient Advice',
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _instructionsController,
              decoration: InputDecoration(
                hintText: 'e.g. Take with or after food. Monitor BP daily.',
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppTheme.border),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E6BFF),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                onPressed: _isSubmitting ? null : _handleSubmit,
                child: _isSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text(
                        'Issue Prescription',
                        style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: Colors.white),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Order Lab Sheet ─────────────────────────────────────────────────────────

class OrderLabSheet extends ConsumerStatefulWidget {
  final List<PatientItem> patients;
  final PatientItem? initialPatient;
  final void Function(LabResultItem)? onAdd;

  const OrderLabSheet({
    super.key,
    required this.patients,
    this.initialPatient,
    this.onAdd,
  });

  @override
  ConsumerState<OrderLabSheet> createState() => _OrderLabSheetState();
}

class _OrderLabSheetState extends ConsumerState<OrderLabSheet> {
  PatientItem? _selectedPatient;
  String _selectedTest = 'Complete Blood Count (CBC)';
  String _department = 'Hematology';
  final _clinicalNotesController = TextEditingController();
  bool _isSubmitting = false;

  final _testOptions = [
    (test: 'Complete Blood Count (CBC)', dept: 'Hematology'),
    (test: 'Lipid Profile Panel', dept: 'Biochemistry'),
    (test: '12-Lead Electrocardiogram', dept: 'Cardiology'),
    (test: 'Echocardiogram 2D', dept: 'Cardiology'),
    (test: 'Renal Function Test (RFT)', dept: 'Biochemistry'),
    (test: 'Chest X-Ray Digital', dept: 'Radiology'),
    (test: 'Liver Function Test (LFT)', dept: 'Biochemistry'),
    (test: 'Fasting Blood Glucose', dept: 'Biochemistry'),
  ];

  @override
  void initState() {
    super.initState();
    if (widget.initialPatient != null) {
      _selectedPatient = widget.initialPatient;
    } else if (widget.patients.isNotEmpty) {
      _selectedPatient = widget.patients.first;
    }
  }

  @override
  void dispose() {
    _clinicalNotesController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (_selectedPatient == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a patient.'),
          backgroundColor: Color(0xFFEF4444),
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final client = ref.read(apiClientProvider);
      final labPayload = <String, dynamic>{
        'patientId': _selectedPatient!.id,
        'testName': _selectedTest,
        'department': _department,
        'notes': _clinicalNotesController.text.trim().isNotEmpty
            ? _clinicalNotesController.text.trim()
            : 'Diagnostic evaluation ordered by attending physician',
        'status': 'PENDING',
      };

      final success = await ref
          .read(doctorProvider.notifier)
          .createLabOrderViaApi(client, labPayload);

      if (mounted) {
        setState(() => _isSubmitting = false);
        if (success) {
          final newItem = LabResultItem(
            id: 'lab-${DateTime.now().millisecondsSinceEpoch}',
            patientName: _selectedPatient!.name,
            patientId: _selectedPatient!.id,
            avatar: _selectedPatient!.avatar,
            testName: _selectedTest,
            department: _department,
            result: 'Pending Specimen Collection',
            referenceRange: 'Standard Clinical Reference',
            status: 'Pending',
            date: 'Today',
          );
          widget.onAdd?.call(newItem);

          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Lab test requested for ${_selectedPatient!.name}'),
              backgroundColor: const Color(0xFF10B981),
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Failed to save lab order to server.'),
              backgroundColor: Color(0xFFEF4444),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: const Color(0xFFEF4444),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF7ED),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.science_rounded,
                        color: Color(0xFFF97316),
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 10),
                    const Text(
                      'Order Lab Test',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close_rounded,
                      color: Color(0xFF94A3B8)),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Select Patient
            const Text(
              'Patient',
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 6),
            if (widget.patients.isEmpty && _selectedPatient == null)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.border),
                ),
                child: const Text(
                  'No registered patients available',
                  style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                ),
              )
            else
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  border: Border.all(color: AppTheme.border),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<PatientItem>(
                    isExpanded: true,
                    value: _selectedPatient,
                    items: widget.patients.map((p) {
                      return DropdownMenuItem(
                        value: p,
                        child: Text('${p.name} (${p.pid})'),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedPatient = val);
                    },
                  ),
                ),
              ),
            const SizedBox(height: 14),

            // Select Test
            const Text(
              'Laboratory Diagnostic Test',
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                border: Border.all(color: AppTheme.border),
                borderRadius: BorderRadius.circular(12),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  isExpanded: true,
                  value: _selectedTest,
                  items: _testOptions.map((opt) {
                    return DropdownMenuItem(
                      value: opt.test,
                      child: Text('${opt.test} • ${opt.dept}'),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) {
                      final found =
                          _testOptions.firstWhere((o) => o.test == val);
                      setState(() {
                        _selectedTest = val;
                        _department = found.dept;
                      });
                    }
                  },
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Clinical Notes / Indication
            const Text(
              'Clinical Indication / Special Notes',
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _clinicalNotesController,
              decoration: InputDecoration(
                hintText: 'e.g. Suspected anemia, urgent pre-op clearance...',
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppTheme.border),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Order Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E6BFF),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                onPressed: _isSubmitting ? null : _handleSubmit,
                child: _isSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text(
                        'Submit Lab Order',
                        style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: Colors.white),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Refer Patient Sheet ─────────────────────────────────────────────────────

class ReferPatientSheet extends ConsumerStatefulWidget {
  final List<PatientItem> patients;
  final PatientItem? initialPatient;
  final String? activeQueueEntryId;

  const ReferPatientSheet({
    super.key,
    required this.patients,
    this.initialPatient,
    this.activeQueueEntryId,
  });

  @override
  ConsumerState<ReferPatientSheet> createState() => _ReferPatientSheetState();
}

class _ReferPatientSheetState extends ConsumerState<ReferPatientSheet> {
  PatientItem? _selectedPatient;
  String _referralType = 'queue_transfer'; // 'queue_transfer' | 'new_appointment'
  String _priority = 'ROUTINE'; // 'ROUTINE' | 'URGENT' | 'EMERGENCY'

  List<dynamic> _departments = [];
  List<dynamic> _rooms = [];
  List<dynamic> _doctors = [];

  String? _selectedDepartmentId;
  String? _selectedRoomId;
  String? _selectedDoctorId;

  final _reasonController = TextEditingController();
  final _notesController = TextEditingController();

  bool _isLoadingMetadata = true;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialPatient != null) {
      _selectedPatient = widget.initialPatient;
    } else if (widget.patients.isNotEmpty) {
      _selectedPatient = widget.patients.first;
    }

    _loadMetadata();
  }

  @override
  void dispose() {
    _reasonController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _loadMetadata() async {
    setState(() => _isLoadingMetadata = true);
    final client = ref.read(apiClientProvider);

    try {
      final deptList = await client.getDepartments();
      final docList = await client.getDoctors();

      if (mounted) {
        setState(() {
          _departments = deptList;
          _doctors = docList;
          if (_departments.isNotEmpty) {
            _selectedDepartmentId = _departments.first['id'] as String?;
          }
        });
        if (_selectedDepartmentId != null) {
          await _loadRoomsForDepartment(_selectedDepartmentId!);
        }
      }
    } catch (_) {
      if (mounted) setState(() => _isLoadingMetadata = false);
    }
  }

  Future<void> _loadRoomsForDepartment(String deptId) async {
    final client = ref.read(apiClientProvider);
    try {
      final roomList = await client.getRooms(departmentId: deptId);
      if (mounted) {
        setState(() {
          _rooms = roomList;
          _selectedRoomId = _rooms.isNotEmpty ? _rooms.first['id'] as String? : null;
          _isLoadingMetadata = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _rooms = [];
          _selectedRoomId = null;
          _isLoadingMetadata = false;
        });
      }
    }
  }

  Future<void> _handleSubmit() async {
    if (_selectedPatient == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a patient to refer.'),
          backgroundColor: Color(0xFFEF4444),
        ),
      );
      return;
    }

    if (_selectedDepartmentId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a receiving department.'),
          backgroundColor: Color(0xFFEF4444),
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final client = ref.read(apiClientProvider);
      final success = await ref.read(doctorProvider.notifier).referPatientViaApi(
            client,
            patientId: _selectedPatient!.id,
            departmentId: _selectedDepartmentId!,
            roomId: _selectedRoomId,
            doctorId: _selectedDoctorId,
            priority: _priority,
            referralType: _referralType,
            reason: _reasonController.text.trim().isNotEmpty
                ? _reasonController.text.trim()
                : 'Referral for specialized evaluation',
            notes: _notesController.text.trim(),
            activeQueueEntryId: widget.activeQueueEntryId,
          );

      if (mounted) {
        setState(() => _isSubmitting = false);
        if (success) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                  'Patient ${_selectedPatient!.name} successfully referred.'),
              backgroundColor: const Color(0xFF10B981),
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Failed to complete referral request.'),
              backgroundColor: Color(0xFFEF4444),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error during referral: $e'),
            backgroundColor: const Color(0xFFEF4444),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.swap_horiz_rounded,
                        color: Color(0xFF1E6BFF),
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 10),
                    const Text(
                      'Refer Patient',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close_rounded,
                      color: Color(0xFF94A3B8)),
                ),
              ],
            ),
            const SizedBox(height: 16),

            if (_isLoadingMetadata)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: CircularProgressIndicator(),
                ),
              )
            else ...[
              // Select Patient
              const Text(
                'Patient',
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 6),
              if (widget.patients.isEmpty && _selectedPatient == null)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.border),
                  ),
                  child: const Text(
                    'No patients registered',
                    style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppTheme.border),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<PatientItem>(
                      isExpanded: true,
                      value: _selectedPatient,
                      items: widget.patients.map((p) {
                        return DropdownMenuItem(
                          value: p,
                          child: Text('${p.name} (${p.pid})'),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _selectedPatient = val);
                      },
                    ),
                  ),
                ),
              const SizedBox(height: 14),

              // Routing Type Selector
              const Text(
                'Referral Routing Mode',
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  Expanded(
                    child: ChoiceChip(
                      label: const Center(child: Text('Queue Transfer')),
                      selected: _referralType == 'queue_transfer',
                      onSelected: (val) {
                        if (val) setState(() => _referralType = 'queue_transfer');
                      },
                      selectedColor: const Color(0xFF1E6BFF),
                      labelStyle: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: _referralType == 'queue_transfer'
                            ? Colors.white
                            : const Color(0xFF475569),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ChoiceChip(
                      label: const Center(child: Text('Specialist Appointment')),
                      selected: _referralType == 'new_appointment',
                      onSelected: (val) {
                        if (val) setState(() => _referralType = 'new_appointment');
                      },
                      selectedColor: const Color(0xFF1E6BFF),
                      labelStyle: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: _referralType == 'new_appointment'
                            ? Colors.white
                            : const Color(0xFF475569),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Receiving Department
              const Text(
                'Receiving Department',
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  border: Border.all(color: AppTheme.border),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: _selectedDepartmentId,
                    hint: const Text('Select Department'),
                    items: _departments.map((dept) {
                      final id = dept['id'] as String;
                      final name = dept['name'] as String? ?? 'Department';
                      return DropdownMenuItem(
                        value: id,
                        child: Text(name),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() {
                          _selectedDepartmentId = val;
                        });
                        _loadRoomsForDepartment(val);
                      }
                    },
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // Receiving Room (Optional)
              if (_rooms.isNotEmpty) ...[
                const Text(
                  'Receiving Room / Counter',
                  style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF64748B)),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppTheme.border),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      isExpanded: true,
                      value: _selectedRoomId,
                      hint: const Text('Select Room (Optional)'),
                      items: _rooms.map((room) {
                        final id = room['id'] as String;
                        final name = room['name'] as String? ?? 'Room';
                        final num = room['roomNumber'] as String? ?? '';
                        return DropdownMenuItem(
                          value: id,
                          child: Text('$name $num'),
                        );
                      }).toList(),
                      onChanged: (val) {
                        setState(() => _selectedRoomId = val);
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 14),
              ],

              // Assigned Specialist / Doctor (Optional)
              if (_doctors.isNotEmpty) ...[
                const Text(
                  'Attending Doctor / Specialist (Optional)',
                  style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF64748B)),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppTheme.border),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      isExpanded: true,
                      value: _selectedDoctorId,
                      hint: const Text('Any available specialist'),
                      items: [
                        const DropdownMenuItem<String>(
                          value: null,
                          child: Text('Any available specialist'),
                        ),
                        ..._doctors.map((doc) {
                          final id = doc['id'] as String;
                          final name = doc['displayName'] as String? ?? 'Doctor';
                          return DropdownMenuItem(
                            value: id,
                            child: Text(name.startsWith('Dr.') ? name : 'Dr. $name'),
                          );
                        }),
                      ],
                      onChanged: (val) {
                        setState(() => _selectedDoctorId = val);
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 14),
              ],

              // Priority
              const Text(
                'Clinical Priority',
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 6),
              Row(
                children: ['ROUTINE', 'URGENT', 'EMERGENCY'].map((pri) {
                  final isSel = _priority == pri;
                  Color col;
                  if (pri == 'EMERGENCY') {
                    col = const Color(0xFFEF4444);
                  } else if (pri == 'URGENT') {
                    col = const Color(0xFFF97316);
                  } else {
                    col = const Color(0xFF1E6BFF);
                  }

                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(pri),
                      selected: isSel,
                      onSelected: (val) {
                        if (val) setState(() => _priority = pri);
                      },
                      selectedColor: col,
                      labelStyle: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: isSel ? Colors.white : const Color(0xFF475569),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 14),

              // Reason
              const Text(
                'Reason for Referral',
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _reasonController,
                decoration: InputDecoration(
                  hintText: 'e.g. Needs cardiac catheterization or ECHO...',
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppTheme.border),
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // Handover Notes
              const Text(
                'Clinical Handover Notes',
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _notesController,
                maxLines: 2,
                decoration: InputDecoration(
                  hintText: 'Relevant vitals, allergies, diagnostic findings...',
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppTheme.border),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1E6BFF),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  onPressed: _isSubmitting ? null : _handleSubmit,
                  child: _isSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text(
                        'Confirm Referral',
                        style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: Colors.white),
                      ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
