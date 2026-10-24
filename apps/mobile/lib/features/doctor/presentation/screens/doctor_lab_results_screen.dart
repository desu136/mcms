import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/doctor_repository.dart';
import '../widgets/doctor_modals.dart';

class DoctorLabResultsScreen extends ConsumerWidget {
  const DoctorLabResultsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(doctorProvider);
    final labResults = state.labResults;
    final patients = state.patients;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Lab Results'),
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
                builder: (_) => OrderLabSheet(
                  patients: patients,
                  onAdd: (item) =>
                      ref.read(doctorProvider.notifier).addLabOrder(item),
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
      body: labResults.isEmpty
          ? const Center(
              child: Text('No lab results found',
                  style: TextStyle(color: Color(0xFF94A3B8))),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: labResults.length,
              itemBuilder: (context, index) {
                final lab = labResults[index];
                Color badgeBg, badgeFg, badgeBorder;
                if (lab.status == 'Completed') {
                  badgeBg = const Color(0xFFECFDF5);
                  badgeFg = const Color(0xFF10B981);
                  badgeBorder = const Color(0xFFA7F3D0);
                } else if (lab.status == 'Abnormal') {
                  badgeBg = const Color(0xFFFFF1F2);
                  badgeFg = const Color(0xFFF43F5E);
                  badgeBorder = const Color(0xFFFECDD3);
                } else {
                  badgeBg = const Color(0xFFFFFBEB);
                  badgeFg = const Color(0xFFD97706);
                  badgeBorder = const Color(0xFFFDE68A);
                }

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
                                  color: const Color(0xFFFFF7ED),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Icon(
                                  Icons.science_rounded,
                                  color: Color(0xFFF97316),
                                  size: 18,
                                ),
                              ),
                              const SizedBox(width: 10),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    lab.testName,
                                    style: const TextStyle(
                                      fontSize: 13.5,
                                      fontWeight: FontWeight.w700,
                                      color: AppTheme.textPrimary,
                                    ),
                                  ),
                                  Text(
                                    '${lab.department} • ${lab.date}',
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
                              color: badgeBg,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: badgeBorder),
                            ),
                            child: Text(
                              lab.status,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: badgeFg,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      const Divider(
                          height: 1, thickness: 0.8, color: Color(0xFFF1F5F9)),
                      const SizedBox(height: 8),
                      Text(
                        'Result: ${lab.result}',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF1E293B),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Reference: ${lab.referenceRange}',
                        style: const TextStyle(
                          fontSize: 11,
                          color: Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
