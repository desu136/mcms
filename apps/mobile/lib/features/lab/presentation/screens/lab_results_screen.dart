import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/lab_models.dart';
import '../../data/lab_repository.dart';

class LabResultsScreen extends ConsumerStatefulWidget {
  const LabResultsScreen({super.key});

  @override
  ConsumerState<LabResultsScreen> createState() => _LabResultsScreenState();
}

class _LabResultsScreenState extends ConsumerState<LabResultsScreen> {
  String _selectedStatus = 'All';

  @override
  Widget build(BuildContext context) {
    final results = ref.watch(labResultsProvider);
    final technician = ref.watch(labProfileProvider);

    final filteredResults = results.where((r) {
      if (_selectedStatus == 'Verified' && r.status != ResultStatus.verified) {
        return false;
      }
      if (_selectedStatus == 'Critical' && !r.hasCriticalFinding) {
        return false;
      }
      if (_selectedStatus == 'Pending' && r.status == ResultStatus.verified) {
        return false;
      }
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text(
          'Diagnostic Test Results',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: AppTheme.textPrimary,
          ),
        ),
      ),
      body: Column(
        children: [
          // Filter Tabs
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildStatusPill('All'),
                const SizedBox(width: 8),
                _buildStatusPill('Critical'),
                const SizedBox(width: 8),
                _buildStatusPill('Pending'),
                const SizedBox(width: 8),
                _buildStatusPill('Verified'),
              ],
            ),
          ),

          // Results list
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: filteredResults.length,
              itemBuilder: (context, index) {
                final result = filteredResults[index];
                return _buildResultCard(context, result, technician.name);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusPill(String status) {
    final isSelected = _selectedStatus == status;
    return GestureDetector(
      onTap: () => setState(() => _selectedStatus = status),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primary : AppTheme.surfaceMuted,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          status,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
            color: isSelected ? Colors.white : AppTheme.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildResultCard(
      BuildContext context, LabTestResult result, String techName) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: result.hasCriticalFinding
              ? AppTheme.danger.withValues(alpha: 0.4)
              : AppTheme.border,
          width: result.hasCriticalFinding ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                result.resultId,
                style: const TextStyle(
                  fontFamily: 'monospace',
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.primary,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: result.status == ResultStatus.verified
                      ? AppTheme.successLight
                      : result.hasCriticalFinding
                          ? AppTheme.dangerLight
                          : AppTheme.warningLight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  result.status == ResultStatus.verified
                      ? 'Verified'
                      : result.hasCriticalFinding
                          ? 'Critical Panic'
                          : 'Abnormal Flag',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: result.status == ResultStatus.verified
                        ? AppTheme.success
                        : result.hasCriticalFinding
                            ? AppTheme.danger
                            : AppTheme.warning,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),

          Text(
            result.patientName,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: AppTheme.textPrimary,
            ),
          ),
          Text(
            '${result.patientPid} • ${result.testName} (${result.department})',
            style: const TextStyle(
              fontSize: 12,
              color: AppTheme.textSecondary,
            ),
          ),

          const SizedBox(height: 12),
          const Divider(height: 1),
          const SizedBox(height: 10),

          // Parameters list
          Column(
            children: result.parameters.map((param) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 3),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      param.name,
                      style: const TextStyle(
                          fontSize: 12, color: AppTheme.textSecondary),
                    ),
                    Row(
                      children: [
                        Text(
                          '${param.value} ${param.unit}',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: param.isCritical
                                ? AppTheme.danger
                                : param.isAbnormal
                                    ? AppTheme.warning
                                    : AppTheme.textPrimary,
                          ),
                        ),
                        if (param.isCritical) ...[
                          const SizedBox(width: 4),
                          const Icon(Icons.warning_amber_rounded,
                              size: 14, color: AppTheme.danger),
                        ],
                      ],
                    ),
                  ],
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 12),

          // Actions
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                result.completedAt,
                style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
              ),
              if (result.status != ResultStatus.verified)
                ElevatedButton.icon(
                  onPressed: () {
                    ref
                        .read(labResultsProvider.notifier)
                        .verifyAndReleaseResult(result.id, techName);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                            'Result ${result.resultId} verified & released to doctor.'),
                        backgroundColor: AppTheme.success,
                      ),
                    );
                  },
                  icon: const Icon(Icons.check_rounded, size: 14),
                  label: const Text('Verify & Release',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.success,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    minimumSize: const Size(0, 32),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                )
              else
                const Row(
                  children: [
                    Icon(Icons.verified_rounded,
                        size: 14, color: AppTheme.success),
                    SizedBox(width: 4),
                    Text(
                      'Released to Doctor',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.success,
                      ),
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }
}

