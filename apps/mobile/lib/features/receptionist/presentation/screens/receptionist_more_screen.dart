import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/storage/sqlite_database.dart';
import '../../../../core/auth/auth_provider.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/receptionist_repository.dart';
import '../../data/receptionist_models.dart';

class ReceptionistMoreScreen extends ConsumerWidget {
  final MobileDatabaseService dbService;

  const ReceptionistMoreScreen({super.key, required this.dbService});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final receptionist = ref.watch(receptionistProfileProvider);
    final bills = ref.watch(receptionistBillsProvider);

    final pendingBills =
        bills.where((b) => b.status == BillingStatus.pending).length;
    final overdueBills =
        bills.where((b) => b.status == BillingStatus.overdue).length;
    final totalCollected = bills
        .where((b) => b.status == BillingStatus.paid)
        .fold(0.0, (sum, b) => sum + b.amountPaid);

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // Header Profile Card
            SliverToBoxAdapter(
              child: Container(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  border:
                      Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF1E6BFF), Color(0xFF0D52D6)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Center(
                        child: Text(
                          receptionist.name
                              .trim()
                              .split(' ')
                              .where((p) => p.isNotEmpty)
                              .take(2)
                              .map((p) => p[0].toUpperCase())
                              .join(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            receptionist.name,
                            style: const TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          Text(
                            receptionist.role,
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppTheme.textSecondary,
                            ),
                          ),
                          Text(
                            receptionist.hospital,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppTheme.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Billing Section Header & Action
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Expanded(
                          child: Text(
                            'Billing & Fee Collection',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                        ),
                        ElevatedButton.icon(
                          onPressed: () => _showNewInvoiceSheet(context, ref),
                          icon: const Icon(Icons.add_rounded, size: 16),
                          label: const Text('New Invoice'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 8),
                            textStyle: const TextStyle(
                                fontSize: 12, fontWeight: FontWeight.w700),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _BillingStatCard(
                          label: 'Collected',
                          value: 'ETB ${totalCollected.toStringAsFixed(0)}',
                          icon: Icons.payments_rounded,
                          color: AppTheme.success,
                          bg: AppTheme.successLight,
                        ),
                        const SizedBox(width: 10),
                        _BillingStatCard(
                          label: 'Pending',
                          value: '$pendingBills',
                          icon: Icons.receipt_outlined,
                          color: AppTheme.warning,
                          bg: AppTheme.warningLight,
                        ),
                        const SizedBox(width: 10),
                        _BillingStatCard(
                          label: 'Overdue',
                          value: '$overdueBills',
                          icon: Icons.warning_amber_rounded,
                          color: AppTheme.danger,
                          bg: AppTheme.dangerLight,
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Bills list or empty placeholder
                    if (bills.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.receipt_long_outlined,
                                color: AppTheme.textMuted, size: 28),
                            SizedBox(width: 14),
                            Expanded(
                              child: Text(
                                'No invoices recorded yet. Tap "+ New Invoice" to issue a patient receipt.',
                                style: TextStyle(
                                    color: AppTheme.textMuted, fontSize: 13),
                              ),
                            ),
                          ],
                        ),
                      )
                    else
                      ...bills.map((b) => _BillingCard(
                            bill: b,
                            onTap: () => _showBillDetail(context, ref, b),
                          )),
                  ],
                ),
              ),
            ),

            // Settings & Tools Menu Section
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Settings & Tools',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _MenuCard(
                      children: [
                        _MenuItem(
                          icon: Icons.sync_rounded,
                          label: 'Sync Status',
                          color: AppTheme.primary,
                          subtitle: 'Connected with central server',
                          trailing: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppTheme.successLight,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'Online',
                              style: TextStyle(
                                fontSize: 11,
                                color: AppTheme.success,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          onTap: () async {
                            await ReceptionistRepository.loadFromApi(ref);
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Synchronized with central server'),
                                  backgroundColor: AppTheme.success,
                                ),
                              );
                            }
                          },
                        ),
                        const _MenuItem(
                          icon: Icons.info_outline_rounded,
                          label: 'About MCMS',
                          color: AppTheme.cyan,
                          subtitle: 'Version 1.0.0 (Receptionist Workstation)',
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    _MenuCard(
                      children: [
                        _MenuItem(
                          icon: Icons.logout_rounded,
                          label: 'Sign Out',
                          color: AppTheme.danger,
                          onTap: () => _confirmLogout(context, ref),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),
                    const Center(
                      child: Text(
                        'MCMS Mobile v1.0.0 · Reception Module',
                        style: TextStyle(
                          fontSize: 11,
                          color: AppTheme.textMuted,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showNewInvoiceSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _NewInvoiceSheet(),
    );
  }

  void _showBillDetail(BuildContext context, WidgetRef ref, BillingItem bill) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _BillDetailSheet(bill: bill),
    );
  }

  void _confirmLogout(BuildContext context, WidgetRef ref) {
    showDialog<void>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Sign Out',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ref.read(authProvider.notifier).logout();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.danger,
              foregroundColor: Colors.white,
            ),
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );
  }
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

class _BillingStatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final Color bg;

  const _BillingStatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
    required this.bg,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: bg,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 16),
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                color: AppTheme.textPrimary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            Text(
              label,
              style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Billing Card ─────────────────────────────────────────────────────────────

class _BillingCard extends StatelessWidget {
  final BillingItem bill;
  final VoidCallback onTap;

  const _BillingCard({required this.bill, required this.onTap});

  @override
  Widget build(BuildContext context) {
    Color statusColor;
    Color statusBg;

    switch (bill.status) {
      case BillingStatus.paid:
        statusColor = AppTheme.success;
        statusBg = AppTheme.successLight;
        break;
      case BillingStatus.pending:
        statusColor = AppTheme.warning;
        statusBg = AppTheme.warningLight;
        break;
      case BillingStatus.overdue:
        statusColor = AppTheme.danger;
        statusBg = AppTheme.dangerLight;
        break;
      case BillingStatus.partiallyPaid:
        statusColor = AppTheme.primary;
        statusBg = AppTheme.primaryLight;
        break;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(Icons.receipt_rounded, color: statusColor, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            bill.patientName,
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                              color: AppTheme.textPrimary,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: statusBg,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            bill.statusLabel,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: statusColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${bill.invoiceId} · ${bill.description}',
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppTheme.textMuted,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Text(
                          'ETB ${bill.amount.toStringAsFixed(0)}',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        const Spacer(),
                        Text(
                          bill.paymentMethod,
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppTheme.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Bill Detail Sheet ────────────────────────────────────────────────────────

class _BillDetailSheet extends ConsumerWidget {
  final BillingItem bill;
  const _BillDetailSheet({required this.bill});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isPaid = bill.status == BillingStatus.paid;

    return DraggableScrollableSheet(
      initialChildSize: 0.65,
      maxChildSize: 0.85,
      minChildSize: 0.4,
      builder: (_, controller) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFFE2E8F0),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView(
                controller: controller,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryLight,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          bill.invoiceId,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.primary,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              bill.patientName,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            Text(
                              bill.pid,
                              style: const TextStyle(
                                  fontSize: 12, color: AppTheme.textMuted),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  _DetailLine('Description', bill.description),
                  _DetailLine('Date Issued', bill.date),
                  _DetailLine('Status', bill.statusLabel),
                  _DetailLine('Payment Method', bill.paymentMethod),
                  const Divider(height: 28),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Total Amount',
                        style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.textPrimary),
                      ),
                      Text(
                        'ETB ${bill.amount.toStringAsFixed(0)}',
                        style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: AppTheme.primary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  if (!isPaid) ...[
                    const Text(
                      'Collect Payment Method:',
                      style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textSecondary),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: ['Cash', 'Telebirr', 'Card'].map((m) {
                        return Expanded(
                          child: Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: ElevatedButton(
                              onPressed: () {
                                Navigator.pop(context);
                                ReceptionistRepository.payBill(ref, bill.id, m);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('Payment of ETB ${bill.amount.toStringAsFixed(0)} collected via $m'),
                                    backgroundColor: AppTheme.success,
                                  ),
                                );
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primary,
                                foregroundColor: Colors.white,
                                padding:
                                    const EdgeInsets.symmetric(vertical: 12),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                              child: Text(m,
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w700)),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DetailLine extends StatelessWidget {
  final String label;
  final String value;
  const _DetailLine(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(fontSize: 13, color: AppTheme.textMuted)),
          Text(value,
              style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textPrimary)),
        ],
      ),
    );
  }
}

// ─── New Invoice Sheet ────────────────────────────────────────────────────────

class _NewInvoiceSheet extends ConsumerStatefulWidget {
  const _NewInvoiceSheet();

  @override
  ConsumerState<_NewInvoiceSheet> createState() => _NewInvoiceSheetState();
}

class _NewInvoiceSheetState extends ConsumerState<_NewInvoiceSheet> {
  RegistrationPatient? _selectedPatient;
  final List<PresetBillingService> _selectedServices = [];
  String _paymentMethod = 'Cash';

  double get _totalAmount =>
      _selectedServices.fold(0.0, (sum, s) => sum + s.price);

  @override
  Widget build(BuildContext context) {
    final patients = ref.watch(receptionistPatientsProvider);

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      maxChildSize: 0.95,
      minChildSize: 0.5,
      builder: (_, controller) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFFE2E8F0),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 16),
            const Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Issue New Invoice',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.textPrimary,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView(
                controller: controller,
                children: [
                  const Text(
                    'Select Patient *',
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textSecondary),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceMuted,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<RegistrationPatient>(
                        hint: const Text('Select patient'),
                        value: _selectedPatient,
                        isExpanded: true,
                        items: patients
                            .map((p) => DropdownMenuItem(
                                  value: p,
                                  child: Text('${p.name} (${p.pid})'),
                                ))
                            .toList(),
                        onChanged: (p) => setState(() => _selectedPatient = p),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  const Text(
                    'Select Services *',
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textSecondary),
                  ),
                  const SizedBox(height: 8),
                  ...presetServices.map((service) {
                    final isChecked = _selectedServices.contains(service);
                    return CheckboxListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      title: Text(service.name,
                          style: const TextStyle(
                              fontSize: 13, fontWeight: FontWeight.w600)),
                      subtitle: Text(service.category,
                          style: const TextStyle(
                              fontSize: 11, color: AppTheme.textMuted)),
                      secondary: Text(
                        'ETB ${service.price.toStringAsFixed(0)}',
                        style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            color: AppTheme.primary),
                      ),
                      value: isChecked,
                      onChanged: (val) {
                        setState(() {
                          if (val == true) {
                            _selectedServices.add(service);
                          } else {
                            _selectedServices.remove(service);
                          }
                        });
                      },
                    );
                  }),
                  const SizedBox(height: 16),

                  const Text(
                    'Payment Method',
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textSecondary),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: ['Cash', 'Telebirr', 'Card', 'Pending'].map((m) {
                      final isSelected = m == _paymentMethod;
                      return Expanded(
                        child: Padding(
                          padding: const EdgeInsets.only(right: 6),
                          child: GestureDetector(
                            onTap: () => setState(() => _paymentMethod = m),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? AppTheme.primaryLight
                                    : AppTheme.surfaceMuted,
                                borderRadius: BorderRadius.circular(10),
                                border: isSelected
                                    ? Border.all(color: AppTheme.primary)
                                    : null,
                              ),
                              child: Center(
                                child: Text(
                                  m,
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: isSelected
                                        ? AppTheme.primary
                                        : AppTheme.textSecondary,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 24),

                  // Total line
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceMuted,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Total Invoice Amount:',
                          style: TextStyle(
                              fontSize: 14, fontWeight: FontWeight.w700),
                        ),
                        Text(
                          'ETB ${_totalAmount.toStringAsFixed(0)}',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: AppTheme.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  ElevatedButton(
                    onPressed: _submitInvoice,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Text(
                      _paymentMethod == 'Pending'
                          ? 'Issue Invoice (Pending Payment)'
                          : 'Collect ETB ${_totalAmount.toStringAsFixed(0)} & Issue Receipt',
                      style: const TextStyle(
                          fontWeight: FontWeight.w700, fontSize: 14),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _submitInvoice() {
    if (_selectedPatient == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a patient')),
      );
      return;
    }
    if (_selectedServices.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select at least one service')),
      );
      return;
    }

    final isPaid = _paymentMethod != 'Pending';
    final desc = _selectedServices.map((s) => s.name).join(', ');
    final invId = 'INV-${DateTime.now().millisecondsSinceEpoch % 100000}';

    final bill = BillingItem(
      id: 'bill-${DateTime.now().millisecondsSinceEpoch}',
      invoiceId: invId,
      patientName: _selectedPatient!.name,
      patientId: _selectedPatient!.id,
      pid: _selectedPatient!.pid,
      description: desc,
      amount: _totalAmount,
      amountPaid: isPaid ? _totalAmount : 0.0,
      status: isPaid ? BillingStatus.paid : BillingStatus.pending,
      date: DateTime.now().toIso8601String().substring(0, 10),
      dueDate: DateTime.now().add(const Duration(days: 30)).toIso8601String().substring(0, 10),
      paymentMethod: _paymentMethod,
    );

    ReceptionistRepository.addBill(ref, bill);
    Navigator.pop(context);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Invoice $invId created for ${_selectedPatient!.name}'),
        backgroundColor: AppTheme.success,
      ),
    );
  }
}

// ─── Menu Widgets ─────────────────────────────────────────────────────────────

class _MenuCard extends StatelessWidget {
  final List<Widget> children;
  const _MenuCard({required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: List.generate(children.length * 2 - 1, (i) {
          if (i.isOdd) {
            return const Divider(height: 1, indent: 60);
          }
          return children[i ~/ 2];
        }),
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;

  const _MenuItem({
    required this.icon,
    required this.label,
    required this.color,
    this.subtitle,
    this.trailing,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      leading: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: color, size: 18),
      ),
      title: Text(
        label,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: label == 'Sign Out' ? AppTheme.danger : AppTheme.textPrimary,
        ),
      ),
      subtitle: subtitle != null
          ? Text(
              subtitle!,
              style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
            )
          : null,
      trailing: trailing ??
          const Icon(Icons.chevron_right_rounded,
              color: AppTheme.textMuted, size: 18),
    );
  }
}
