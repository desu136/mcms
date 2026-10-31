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
            // Header
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
                            receptionist.department,
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

            // Billing Section
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Billing Overview',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _BillingStatCard(
                          label: 'Collected',
                          value: 'ETB ${(totalCollected / 1000).toStringAsFixed(1)}k',
                          icon: Icons.payments_rounded,
                          color: AppTheme.success,
                          bg: AppTheme.successLight,
                        ),
                        const SizedBox(width: 10),
                        _BillingStatCard(
                          label: 'Pending',
                          value: '$pendingBills invoices',
                          icon: Icons.receipt_outlined,
                          color: AppTheme.warning,
                          bg: AppTheme.warningLight,
                        ),
                        const SizedBox(width: 10),
                        _BillingStatCard(
                          label: 'Overdue',
                          value: '$overdueBills invoices',
                          icon: Icons.warning_amber_rounded,
                          color: AppTheme.danger,
                          bg: AppTheme.dangerLight,
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Bills list
                    ...bills.map((b) => _BillingCard(bill: b)),
                  ],
                ),
              ),
            ),

            // Menu Section
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
                          subtitle: 'Last synced: just now',
                          trailing: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppTheme.successLight,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'Synced',
                              style: TextStyle(
                                fontSize: 11,
                                color: AppTheme.success,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                        const _MenuItem(
                          icon: Icons.notifications_outlined,
                          label: 'Notifications',
                          color: AppTheme.orange,
                          subtitle: '4 unread alerts',
                        ),
                        const _MenuItem(
                          icon: Icons.help_outline_rounded,
                          label: 'Help & Support',
                          color: AppTheme.purple,
                          subtitle: 'FAQs and contact',
                        ),
                        const _MenuItem(
                          icon: Icons.info_outline_rounded,
                          label: 'About MCMS',
                          color: AppTheme.cyan,
                          subtitle: 'Version 1.0.0',
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
            onPressed: () async {
              Navigator.pop(context);
              await ref.read(authProvider.notifier).logout();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.danger,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );
  }
}

// ─── Billing Stat Card ────────────────────────────────────────────────────────

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
          color: bg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 6),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(
                value,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  color: color,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 10,
                color: color.withValues(alpha: 0.8),
                fontWeight: FontWeight.w500,
              ),
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
  const _BillingCard({required this.bill});

  Color get _statusColor {
    switch (bill.status) {
      case BillingStatus.paid:
        return AppTheme.success;
      case BillingStatus.pending:
        return AppTheme.warning;
      case BillingStatus.overdue:
        return AppTheme.danger;
      case BillingStatus.partiallyPaid:
        return AppTheme.orange;
    }
  }

  Color get _statusBg {
    switch (bill.status) {
      case BillingStatus.paid:
        return AppTheme.successLight;
      case BillingStatus.pending:
        return AppTheme.warningLight;
      case BillingStatus.overdue:
        return AppTheme.dangerLight;
      case BillingStatus.partiallyPaid:
        return AppTheme.orangeLight;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppTheme.surfaceMuted,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(
                bill.patientInitials,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textSecondary,
                ),
              ),
            ),
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
                        color: _statusBg,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        bill.statusLabel,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: _statusColor,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  bill.invoiceId,
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppTheme.textMuted,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  bill.description,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.textSecondary,
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
                    if (bill.status == BillingStatus.partiallyPaid) ...[
                      Text(
                        ' · Paid ETB ${bill.amountPaid.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppTheme.success,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
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
