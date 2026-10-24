import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/doctor_models.dart';

class AddPrescriptionSheet extends StatefulWidget {
  final List<PatientItem> patients;
  final void Function(PrescriptionItem) onAdd;

  const AddPrescriptionSheet({
    super.key,
    required this.patients,
    required this.onAdd,
  });

  @override
  State<AddPrescriptionSheet> createState() => _AddPrescriptionSheetState();
}

class _AddPrescriptionSheetState extends State<AddPrescriptionSheet> {
  late PatientItem _selectedPatient;
  final _medicationController = TextEditingController(text: 'Lisinopril 10mg');
  final _dosageController = TextEditingController(text: '10mg Once daily');
  final _durationController = TextEditingController(text: '30 days');
  final String _department = 'Cardiology';

  @override
  void initState() {
    super.initState();
    _selectedPatient = widget.patients.first;
  }

  @override
  void dispose() {
    _medicationController.dispose();
    _dosageController.dispose();
    _durationController.dispose();
    super.dispose();
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
                  icon: const Icon(Icons.close_rounded, color: Color(0xFF94A3B8)),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Select Patient
            const Text(
              'Patient',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 6),
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

            // Medication
            const Text(
              'Medication & Strength',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _medicationController,
              decoration: InputDecoration(
                hintText: 'e.g. Amoxicillin 500mg',
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppTheme.border),
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Dosage & Duration
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Dosage Frequency',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
                      ),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _dosageController,
                        decoration: InputDecoration(
                          hintText: 'e.g. 500mg TID',
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: AppTheme.border),
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
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
                      ),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _durationController,
                        decoration: InputDecoration(
                          hintText: 'e.g. 7 days',
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: AppTheme.border),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 46,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E6BFF),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                onPressed: () {
                  final item = PrescriptionItem(
                    id: 'rx-${DateTime.now().millisecondsSinceEpoch}',
                    prescriptionId: 'RX-2026-0${widget.patients.length + 50}',
                    patientName: _selectedPatient.name,
                    patientId: _selectedPatient.pid,
                    patientAvatar: _selectedPatient.avatar,
                    medication: _medicationController.text.trim(),
                    dosage: _dosageController.text.trim(),
                    duration: _durationController.text.trim(),
                    prescribedDate: 'Oct 19, 2026 10:15 AM',
                    status: 'Active',
                    department: _department,
                  );
                  widget.onAdd(item);
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Prescription added for ${_selectedPatient.name}'),
                      backgroundColor: const Color(0xFF10B981),
                    ),
                  );
                },
                child: const Text(
                  'Issue Prescription',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class OrderLabSheet extends StatefulWidget {
  final List<PatientItem> patients;
  final void Function(LabResultItem) onAdd;

  const OrderLabSheet({
    super.key,
    required this.patients,
    required this.onAdd,
  });

  @override
  State<OrderLabSheet> createState() => _OrderLabSheetState();
}

class _OrderLabSheetState extends State<OrderLabSheet> {
  late PatientItem _selectedPatient;
  String _selectedTest = 'Complete Blood Count (CBC)';
  String _department = 'Hematology';

  final _testOptions = [
    (test: 'Complete Blood Count (CBC)', dept: 'Hematology'),
    (test: 'Lipid Profile Panel', dept: 'Biochemistry'),
    (test: '12-Lead Electrocardiogram', dept: 'Cardiology'),
    (test: 'Echocardiogram 2D', dept: 'Cardiology'),
    (test: 'Renal Function Test (RFT)', dept: 'Biochemistry'),
    (test: 'Chest X-Ray Digital', dept: 'Radiology'),
  ];

  @override
  void initState() {
    super.initState();
    _selectedPatient = widget.patients.first;
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
                icon: const Icon(Icons.close_rounded, color: Color(0xFF94A3B8)),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Select Patient
          const Text(
            'Patient',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 6),
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
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
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
                    final found = _testOptions.firstWhere((o) => o.test == val);
                    setState(() {
                      _selectedTest = val;
                      _department = found.dept;
                    });
                  }
                },
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Order Button
          SizedBox(
            width: double.infinity,
            height: 46,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1E6BFF),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
              onPressed: () {
                final item = LabResultItem(
                  id: 'lab-${DateTime.now().millisecondsSinceEpoch}',
                  patientName: _selectedPatient.name,
                  patientId: _selectedPatient.pid,
                  avatar: _selectedPatient.avatar,
                  testName: _selectedTest,
                  department: _department,
                  result: 'Pending Specimen Collection',
                  referenceRange: 'Standard Diagnostic Reference',
                  status: 'Pending',
                  date: 'Oct 19, 2026',
                );
                widget.onAdd(item);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Lab test requested for ${_selectedPatient.name}'),
                    backgroundColor: const Color(0xFF10B981),
                  ),
                );
              },
              child: const Text(
                'Submit Lab Order',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
