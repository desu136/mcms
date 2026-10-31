import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/nurse_models.dart';
import '../../data/nurse_repository.dart';
import '../widgets/nurse_modals.dart';

class NurseMedicationsScreen extends ConsumerStatefulWidget {
  const NurseMedicationsScreen({super.key});

  @override
  ConsumerState<NurseMedicationsScreen> createState() =>
      _NurseMedicationsScreenState();
}

class _NurseMedicationsScreenState
    extends ConsumerState<NurseMedicationsScreen> {
  final _searchCtrl = TextEditingController();
  String _selectedTab = 'All';

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final medsList = ref.watch(nurseMedicationsProvider);

    final query = _searchCtrl.text.trim().toLowerCase();
    final filtered = medsList.where((m) {
      final matchQuery = query.isEmpty ||
          m.medicationName.toLowerCase().contains(query) ||
          m.patientName.toLowerCase().contains(query) ||
          m.patientPid.toLowerCase().contains(query) ||
          m.room.toLowerCase().contains(query);

      if (!matchQuery) return false;

      switch (_selectedTab) {
        case 'Due Now':
          return m.status == MedStatus.dueSoon;
        case 'Pending':
          return m.status == MedStatus.pending;
        case 'Administered':
          return m.status == MedStatus.administered;
        default:
          return true;
      }
    }).toList();

    final dueNowCount =
        medsList.where((m) => m.status == MedStatus.dueSoon).length;
    final pendingCount =
        medsList.where((m) => m.status == MedStatus.pending).length;
    final givenCount =
        medsList.where((m) => m.status == MedStatus.administered).length;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text(
          'Medication eMAR',
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
          // Filter Tabs & Search
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              children: [
                TextField(
                  controller: _searchCtrl,
                  onChanged: (_) => setState(() {}),
                  decoration: InputDecoration(
                    hintText: 'Search medication or patient...',
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
                      _tabChip('All', medsList.length),
                      _tabChip('Due Now', dueNowCount, isAlert: true),
                      _tabChip('Pending', pendingCount),
                      _tabChip('Administered', givenCount),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Meds List
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.medication_outlined,
                          size: 48,
                          color: Colors.blueGrey.shade300,
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'No medications found',
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
                      final med = filtered[index];
                      return _buildMedCard(med);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _tabChip(String label, int count, {bool isAlert = false}) {
    final isSelected = _selectedTab == label;
    return GestureDetector(
      onTap: () => setState(() => _selectedTab = label),
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
                    ? const Color(0xFFF59E0B)
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

  Widget _buildMedCard(NurseMedication med) {
    Color badgeColor;
    Color badgeBg;
    String badgeLabel;

    switch (med.status) {
      case MedStatus.administered:
        badgeColor = const Color(0xFF10B981);
        badgeBg = const Color(0xFFECFDF5);
        badgeLabel = 'Administered';
        break;
      case MedStatus.dueSoon:
        badgeColor = const Color(0xFFF59E0B);
        badgeBg = const Color(0xFFFFFBEB);
        badgeLabel = 'Due Now';
        break;
      case MedStatus.pending:
        badgeColor = const Color(0xFF2563EB);
        badgeBg = const Color(0xFFEFF6FF);
        badgeLabel = 'Scheduled';
        break;
      default:
        badgeColor = const Color(0xFF64748B);
        badgeBg = const Color(0xFFF1F5F9);
        badgeLabel = med.status.name;
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
            // Top: Patient Info & Status Badge
            Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundImage: NetworkImage(med.patientAvatar),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        med.patientName,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      Text(
                        '${med.patientPid} • ${med.room}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF2563EB),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: badgeBg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: badgeColor.withValues(alpha: 0.3)),
                  ),
                  child: Text(
                    badgeLabel,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: badgeColor,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Drug Details Box
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFF1F5F9)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          med.medicationName,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFDBEAFE),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          med.dose,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF1E40AF),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      _badgeText('Route', med.route),
                      const SizedBox(width: 8),
                      _badgeText('Schedule', med.schedule),
                      const SizedBox(width: 8),
                      _badgeText('Due', med.nextDue),
                    ],
                  ),
                  if (med.instructions.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text(
                      med.instructions,
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF64748B),
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Footer / Action CTA
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.person_outline_rounded,
                        size: 13, color: Color(0xFF64748B)),
                    const SizedBox(width: 4),
                    Text(
                      med.prescribingDoctor,
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
                if (med.status == MedStatus.administered)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: const Color(0xFFECFDF5),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.check_circle_rounded,
                            size: 14, color: Color(0xFF10B981)),
                        const SizedBox(width: 4),
                        Text(
                          med.lastAdministered ?? 'Given',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF10B981),
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  ElevatedButton.icon(
                    onPressed: () {
                      NurseModals.showAdministerMedication(context, ref, med);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: med.status == MedStatus.dueSoon
                          ? const Color(0xFFF59E0B)
                          : const Color(0xFF2563EB),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 8,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      elevation: 0,
                    ),
                    icon: const Icon(Icons.check_rounded, size: 16),
                    label: const Text(
                      'Administer',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
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

  Widget _badgeText(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Text(
        '$label: $value',
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: Color(0xFF475569),
        ),
      ),
    );
  }
}
