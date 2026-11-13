import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/doctor_repository.dart';

class DoctorMedicalRecordsScreen extends ConsumerStatefulWidget {
  final String? initialPatientId;

  const DoctorMedicalRecordsScreen({super.key, this.initialPatientId});

  @override
  ConsumerState<DoctorMedicalRecordsScreen> createState() =>
      _DoctorMedicalRecordsScreenState();
}

class _DoctorMedicalRecordsScreenState
    extends ConsumerState<DoctorMedicalRecordsScreen> {
  String? _selectedPatientId;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _selectedPatientId = widget.initialPatientId;
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(doctorProvider);
    final records = state.medicalRecords;
    final patients = state.patients;

    final filtered = records.where((rec) {
      if (_selectedPatientId != null && _selectedPatientId!.isNotEmpty) {
        if (rec.patientId != _selectedPatientId) return false;
      }
      if (_searchController.text.isNotEmpty) {
        final query = _searchController.text.toLowerCase();
        final matchDiag = rec.diagnosisSummary.toLowerCase().contains(query);
        final matchType = rec.visitType.toLowerCase().contains(query);
        final matchDept = rec.department.toLowerCase().contains(query);
        final matchPat = (rec.patientName ?? '').toLowerCase().contains(query);
        return matchDiag || matchType || matchDept || matchPat;
      }
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Clinical History & Records'),
        elevation: 0,
        backgroundColor: Colors.white,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: AppTheme.border, height: 1),
        ),
      ),
      body: Column(
        children: [
          // Filter & Search bar
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  onChanged: (_) => setState(() {}),
                  decoration: InputDecoration(
                    hintText: 'Search records, diagnosis, patient...',
                    hintStyle: const TextStyle(
                        fontSize: 13, color: Color(0xFF94A3B8)),
                    prefixIcon: const Icon(Icons.search_rounded,
                        color: Color(0xFF64748B), size: 20),
                    contentPadding: const EdgeInsets.symmetric(vertical: 10),
                    filled: true,
                    fillColor: const Color(0xFFF8FAFC),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppTheme.border),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppTheme.border),
                    ),
                  ),
                ),
                if (patients.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: ChoiceChip(
                            label: const Text('All Patients'),
                            selected: _selectedPatientId == null,
                            onSelected: (val) {
                              if (val) setState(() => _selectedPatientId = null);
                            },
                            selectedColor: const Color(0xFF1E6BFF),
                            labelStyle: TextStyle(
                              fontSize: 11,
                              fontWeight: _selectedPatientId == null
                                  ? FontWeight.w700
                                  : FontWeight.w500,
                              color: _selectedPatientId == null
                                  ? Colors.white
                                  : const Color(0xFF475569),
                            ),
                          ),
                        ),
                        ...patients.map((p) {
                          final isSel = _selectedPatientId == p.id;
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: ChoiceChip(
                              label: Text(p.name),
                              selected: isSel,
                              onSelected: (val) {
                                setState(() {
                                  _selectedPatientId = val ? p.id : null;
                                });
                              },
                              selectedColor: const Color(0xFF1E6BFF),
                              labelStyle: TextStyle(
                                fontSize: 11,
                                fontWeight: isSel
                                    ? FontWeight.w700
                                    : FontWeight.w500,
                                color: isSel
                                    ? Colors.white
                                    : const Color(0xFF475569),
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),

          // Records List
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async {
                await ref
                    .read(doctorProvider.notifier)
                    .loadFromApi(ref.read(apiClientProvider));
              },
              child: filtered.isEmpty
                  ? const Center(
                      child: Text(
                        'No medical records found',
                        style: TextStyle(color: Color(0xFF94A3B8)),
                      ),
                    )
                  : ListView.builder(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(16),
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        final rec = filtered[index];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppTheme.border),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.02),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        width: 34,
                                        height: 34,
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFEFF6FF),
                                          borderRadius:
                                              BorderRadius.circular(8),
                                        ),
                                        child: const Icon(
                                          Icons.description_outlined,
                                          color: Color(0xFF1E6BFF),
                                          size: 18,
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            rec.visitType,
                                            style: const TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.w700,
                                              color: AppTheme.textPrimary,
                                            ),
                                          ),
                                          Text(
                                            '${rec.visitDate} • ${rec.visitTime}',
                                            style: const TextStyle(
                                              fontSize: 11,
                                              color: Color(0xFF94A3B8),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFECFDF5),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                          color: const Color(0xFFA7F3D0)),
                                    ),
                                    child: Text(
                                      rec.status,
                                      style: const TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700,
                                        color: Color(0xFF10B981),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              if (rec.patientName != null &&
                                  rec.patientName!.isNotEmpty) ...[
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF1F5F9),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    'Patient: ${rec.patientName}',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFF475569),
                                    ),
                                  ),
                                ),
                              ],
                              const SizedBox(height: 10),
                              const Divider(
                                  height: 1,
                                  thickness: 0.8,
                                  color: Color(0xFFF1F5F9)),
                              const SizedBox(height: 8),
                              Text(
                                rec.diagnosisSummary,
                                style: const TextStyle(
                                  fontSize: 12.5,
                                  height: 1.4,
                                  color: Color(0xFF334155),
                                ),
                              ),
                              const SizedBox(height: 10),
                              Row(
                                children: [
                                  Container(
                                    width: 22,
                                    height: 22,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      image: DecorationImage(
                                        image: NetworkImage(rec.doctorAvatar),
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    '${rec.doctorName} • ${rec.department}',
                                    style: const TextStyle(
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFF64748B),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
          ),
        ],
      ),
    );
  }
}
