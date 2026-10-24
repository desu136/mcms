import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/doctor_models.dart';
import '../../data/doctor_repository.dart';
import '../widgets/schedule_item_card.dart';
import '../widgets/patient_detail_sheet.dart';

class DoctorAppointmentsScreen extends ConsumerStatefulWidget {
  final void Function(int)? onNavigateTab;

  const DoctorAppointmentsScreen({super.key, this.onNavigateTab});

  @override
  ConsumerState<DoctorAppointmentsScreen> createState() =>
      _DoctorAppointmentsScreenState();
}

class _DoctorAppointmentsScreenState
    extends ConsumerState<DoctorAppointmentsScreen> {
  String _selectedFilter = 'All';
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(doctorProvider);
    final appointments = state.appointments;
    final patients = state.patients;

    final filtered = appointments.where((apt) {
      if (_selectedFilter == 'Completed' &&
          apt.status != AppointmentStatus.completed) {
        return false;
      }
      if (_selectedFilter == 'In Progress' &&
          apt.status != AppointmentStatus.inProgress) {
        return false;
      }
      if (_selectedFilter == 'Upcoming' &&
          apt.status != AppointmentStatus.upcoming) {
        return false;
      }
      if (_searchController.text.isNotEmpty) {
        final query = _searchController.text.toLowerCase();
        return apt.patientName.toLowerCase().contains(query) ||
            apt.patientId.toLowerCase().contains(query) ||
            apt.reason.toLowerCase().contains(query);
      }
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('My Appointments'),
        elevation: 0,
        backgroundColor: Colors.white,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: AppTheme.border, height: 1),
        ),
      ),
      body: Column(
        children: [
          // Search & Filter Header
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            child: Column(
              children: [
                // Search Bar
                TextField(
                  controller: _searchController,
                  onChanged: (_) => setState(() {}),
                  decoration: InputDecoration(
                    hintText: 'Search patient, PID, or reason...',
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
                const SizedBox(height: 10),

                // Filter Chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      'All',
                      'Completed',
                      'In Progress',
                      'Upcoming',
                    ].map((filter) {
                      final isSelected = _selectedFilter == filter;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(filter),
                          selected: isSelected,
                          onSelected: (val) {
                            if (val) setState(() => _selectedFilter = filter);
                          },
                          labelStyle: TextStyle(
                            fontSize: 12,
                            fontWeight: isSelected
                                ? FontWeight.w700
                                : FontWeight.w500,
                            color: isSelected
                                ? Colors.white
                                : const Color(0xFF475569),
                          ),
                          selectedColor: const Color(0xFF1E6BFF),
                          backgroundColor: Colors.white,
                          side: BorderSide(
                            color: isSelected
                                ? const Color(0xFF1E6BFF)
                                : AppTheme.border,
                          ),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20)),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),

          // Appointments List
          Expanded(
            child: filtered.isEmpty
                ? const Center(
                    child: Text(
                      'No appointments found',
                      style: TextStyle(fontSize: 14, color: Color(0xFF94A3B8)),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final apt = filtered[index];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppTheme.border),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.02),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: ScheduleItemRow(
                          appointment: apt,
                          showDivider: false,
                          onTap: () {
                            final p = patients.firstWhere(
                              (item) => item.pid == apt.patientId,
                              orElse: () => patients.first,
                            );
                            showModalBottomSheet<void>(
                              context: context,
                              isScrollControlled: true,
                              backgroundColor: Colors.transparent,
                              builder: (_) => PatientDetailSheet(
                                patient: p,
                                onViewRecords: () {
                                  widget.onNavigateTab?.call(3); // More -> Records
                                },
                              ),
                            );
                          },
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
