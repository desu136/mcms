import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/doctor_repository.dart';
import '../widgets/doctor_modals.dart';

class DoctorPrescriptionsScreen extends ConsumerWidget {
  const DoctorPrescriptionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(doctorProvider);
    final prescriptions = state.prescriptions;
    final patients = state.patients;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Prescriptions'),
        elevation: 0,
        backgroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded,
                color: Color(0xFF1E6BFF)),
            onPressed: () {
              showModalBottomSheet<void>(
                context: context,
                isScrollControlled: true,
                backgroundColor: Colors.transparent,
                builder: (_) => AddPrescriptionSheet(
                  patients: patients,
                  onAdd: (item) =>
                      ref.read(doctorProvider.notifier).addPrescription(item),
                ),
              );
            },
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: AppTheme.border, height: 1),
        ),
      ),
      body: prescriptions.isEmpty
          ? const Center(
              child: Text('No prescriptions found',
                  style: TextStyle(color: Color(0xFF94A3B8))),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: prescriptions.length,
              itemBuilder: (context, index) {
                final rx = prescriptions[index];
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
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 34,
                                height: 34,
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF5F3FF),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Icon(
                                  Icons.medication_rounded,
                                  color: Color(0xFF8B5CF6),
                                  size: 18,
                                ),
                              ),
                              const SizedBox(width: 10),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    rx.medication,
                                    style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w700,
                                      color: AppTheme.textPrimary,
                                    ),
                                  ),
                                  Text(
                                    rx.prescriptionId,
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
                              color: rx.status == 'Active'
                                  ? const Color(0xFFECFDF5)
                                  : const Color(0xFFFFFBEB),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: rx.status == 'Active'
                                    ? const Color(0xFFA7F3D0)
                                    : const Color(0xFFFDE68A),
                              ),
                            ),
                            child: Text(
                              rx.status,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: rx.status == 'Active'
                                    ? const Color(0xFF10B981)
                                    : const Color(0xFFD97706),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      const Divider(
                          height: 1, thickness: 0.8, color: Color(0xFFF1F5F9)),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Container(
                            width: 22,
                            height: 22,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              image: DecorationImage(
                                image: NetworkImage(rx.patientAvatar),
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            rx.patientName,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF1E293B),
                            ),
                          ),
                          const Spacer(),
                          Text(
                            '${rx.dosage} • ${rx.duration}',
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
                );
              },
            ),
    );
  }
}
