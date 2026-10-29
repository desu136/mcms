import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/nurse_models.dart';
import '../../data/nurse_repository.dart';
import '../widgets/nurse_modals.dart';

class NurseLabSamplesScreen extends ConsumerStatefulWidget {
  const NurseLabSamplesScreen({super.key});

  @override
  ConsumerState<NurseLabSamplesScreen> createState() =>
      _NurseLabSamplesScreenState();
}

class _NurseLabSamplesScreenState
    extends ConsumerState<NurseLabSamplesScreen> {
  final _searchCtrl = TextEditingController();
  String _selectedFilter = 'All';

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final samples = ref.watch(nurseLabSamplesProvider);

    final query = _searchCtrl.text.trim().toLowerCase();
    final filtered = samples.where((s) {
      final matchQuery = query.isEmpty ||
          s.testName.toLowerCase().contains(query) ||
          s.patientName.toLowerCase().contains(query) ||
          s.sampleId.toLowerCase().contains(query) ||
          s.room.toLowerCase().contains(query);

      if (!matchQuery) return false;

      switch (_selectedFilter) {
        case 'Pending':
          return s.status == SampleStatus.pending;
        case 'Collected':
          return s.status == SampleStatus.collected;
        case 'In Lab':
          return s.status == SampleStatus.inLab;
        case 'Urgent':
          return s.priority == SamplePriority.urgent;
        default:
          return true;
      }
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text(
          'Lab Specimen Collection',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Color(0xFF0F172A),
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: const Color(0xFFE2E8F0), height: 1),
        ),
      ),
      body: Column(
        children: [
          // Search & Filter
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              children: [
                TextField(
                  controller: _searchCtrl,
                  onChanged: (_) => setState(() {}),
                  decoration: InputDecoration(
                    hintText: 'Search sample ID, test name, or patient...',
                    hintStyle: const TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 13,
                    ),
                    prefixIcon: const Icon(
                      Icons.search_rounded,
                      color: Color(0xFF64748B),
                      size: 20,
                    ),
                    filled: true,
                    fillColor: const Color(0xFFF8FAFC),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 10,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _filterTab('All', samples.length),
                      _filterTab(
                        'Pending',
                        samples
                            .where((s) => s.status == SampleStatus.pending)
                            .length,
                        isAlert: true,
                      ),
                      _filterTab(
                        'Collected',
                        samples
                            .where((s) => s.status == SampleStatus.collected)
                            .length,
                      ),
                      _filterTab(
                        'In Lab',
                        samples
                            .where((s) => s.status == SampleStatus.inLab)
                            .length,
                      ),
                      _filterTab(
                        'Urgent',
                        samples
                            .where((s) => s.priority == SamplePriority.urgent)
                            .length,
                        isAlert: true,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Samples List
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.science_outlined,
                          size: 48,
                          color: Colors.blueGrey.shade300,
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'No lab samples found',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final item = filtered[index];
                      return _buildSampleCard(item);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _filterTab(String label, int count, {bool isAlert = false}) {
    final isSelected = _selectedFilter == label;
    return GestureDetector(
      onTap: () => setState(() => _selectedFilter = label),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF2563EB) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? Colors.white : const Color(0xFF475569),
              ),
            ),
            const SizedBox(width: 5),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
              decoration: BoxDecoration(
                color: isAlert && !isSelected
                    ? const Color(0xFFEF4444)
                    : isSelected
                        ? Colors.white.withValues(alpha: 0.25)
                        : const Color(0xFFE2E8F0),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                '$count',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: isAlert && !isSelected
                      ? Colors.white
                      : isSelected
                          ? Colors.white
                          : const Color(0xFF475569),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSampleCard(NurseLabSample sample) {
    Color priorityColor = const Color(0xFF4338CA);
    Color priorityBg = const Color(0xFFEEF2FF);
    if (sample.priority == SamplePriority.urgent) {
      priorityColor = const Color(0xFFDC2626);
      priorityBg = const Color(0xFFFEF2F2);
    } else if (sample.priority == SamplePriority.high) {
      priorityColor = const Color(0xFFD97706);
      priorityBg = const Color(0xFFFFFBEB);
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header: Sample ID, Tube, Priority
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.qr_code_2_rounded,
                      size: 16,
                      color: Color(0xFF2563EB),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      sample.sampleId,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF2563EB),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        sample.sampleType,
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF475569),
                        ),
                      ),
                    ),
                  ],
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: priorityBg,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    sample.priority.name.toUpperCase(),
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: priorityColor,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Test Name
            Text(
              sample.testName,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 6),

            // Patient
            Text(
              'Patient: ${sample.patientName} (${sample.patientPid} • ${sample.room})',
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF475569),
                fontWeight: FontWeight.w500,
              ),
            ),
            Text(
              'Ordered by: ${sample.doctor} • Due: ${sample.collectionTime}',
              style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
            ),

            if (sample.instructions != null) ...[
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFFFAF5FF),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFF3E8FF)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.info_outline_rounded,
                      size: 14,
                      color: Color(0xFF9333EA),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        sample.instructions!,
                        style: const TextStyle(
                          fontSize: 11,
                          color: Color(0xFF7E22CE),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 12),

            // Status & Actions
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _statusTag(sample.status),
                if (sample.status == SampleStatus.pending)
                  ElevatedButton.icon(
                    onPressed: () {
                      NurseModals.showCollectLabSample(context, ref, sample);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF9333EA),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 6,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      elevation: 0,
                    ),
                    icon: const Icon(Icons.colorize_rounded, size: 14),
                    label: const Text(
                      'Collect Sample',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  )
                else if (sample.status == SampleStatus.collected)
                  ElevatedButton.icon(
                    onPressed: () {
                      ref.read(nurseLabSamplesProvider.notifier).update((list) {
                        return list.map((s) {
                          if (s.id == sample.id) {
                            return s.copyWith(
                              status: SampleStatus.inLab,
                              deliveredAt:
                                  'Today, ${TimeOfDay.now().format(context)}',
                            );
                          }
                          return s;
                        }).toList();
                      });
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            'Sample ${sample.sampleId} dispatched to central lab',
                          ),
                          backgroundColor: const Color(0xFF2563EB),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 6,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      elevation: 0,
                    ),
                    icon: const Icon(Icons.send_rounded, size: 14),
                    label: const Text(
                      'Dispatch to Lab',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  )
                else
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 5,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFECFDF5),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      'At Central Lab',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF10B981),
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _statusTag(SampleStatus status) {
    String text;
    Color color;
    switch (status) {
      case SampleStatus.pending:
        text = 'Pending Collection';
        color = const Color(0xFFF59E0B);
        break;
      case SampleStatus.collected:
        text = 'Sample Collected';
        color = const Color(0xFF9333EA);
        break;
      case SampleStatus.inLab:
        text = 'In Lab Processing';
        color = const Color(0xFF2563EB);
        break;
      case SampleStatus.completed:
        text = 'Results Available';
        color = const Color(0xFF10B981);
        break;
    }
    return Row(
      children: [
        Container(
          width: 7,
          height: 7,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(
          text,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: color,
          ),
        ),
      ],
    );
  }
}
