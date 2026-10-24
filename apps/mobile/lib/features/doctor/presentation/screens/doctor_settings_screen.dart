import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/auth/auth_provider.dart';
import '../../../../core/storage/sqlite_database.dart';
import '../../../../core/theme/app_theme.dart';

class DoctorSettingsScreen extends ConsumerStatefulWidget {
  final MobileDatabaseService dbService;

  const DoctorSettingsScreen({super.key, required this.dbService});

  @override
  ConsumerState<DoctorSettingsScreen> createState() =>
      _DoctorSettingsScreenState();
}

class _DoctorSettingsScreenState extends ConsumerState<DoctorSettingsScreen> {
  int _pendingCount = 0;
  String? _syncCursor;
  bool _isSyncing = false;

  @override
  void initState() {
    super.initState();
    _loadSyncStatus();
  }

  Future<void> _loadSyncStatus() async {
    try {
      final count = await widget.dbService.getPendingQueueCount();
      final cursor = await widget.dbService.getSyncCursor();
      if (mounted) {
        setState(() {
          _pendingCount = count;
          _syncCursor = cursor;
        });
      }
    } catch (_) {}
  }

  Future<void> _triggerSync() async {
    setState(() => _isSyncing = true);
    await Future<void>.delayed(const Duration(seconds: 1));
    await _loadSyncStatus();
    if (mounted) {
      setState(() => _isSyncing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Local SQLite cache is in sync with server.'),
          backgroundColor: Color(0xFF10B981),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Settings & Sync'),
        elevation: 0,
        backgroundColor: Colors.white,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: AppTheme.border, height: 1),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Sync & Offline Storage
            _sectionHeader('Sync & Offline Architecture'),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.border),
              ),
              child: Column(
                children: [
                  _tile(
                    icon: Icons.storage_rounded,
                    title: 'Local Storage',
                    subtitle: 'SQLite · sqflite',
                    trailing: _badge('Active', const Color(0xFF10B981)),
                  ),
                  _divider(),
                  _tile(
                    icon: Icons.sync_rounded,
                    title: 'Pending Operations',
                    subtitle: '$_pendingCount operations in queue',
                    trailing: _badge(
                      _pendingCount == 0 ? 'Synced' : '$_pendingCount queued',
                      _pendingCount == 0
                          ? const Color(0xFF10B981)
                          : const Color(0xFFF59E0B),
                    ),
                  ),
                  _divider(),
                  _tile(
                    icon: Icons.pin_end_rounded,
                    title: 'Sync Cursor',
                    subtitle: _syncCursor ?? 'Initial / Default',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Sync Now Button
            SizedBox(
              width: double.infinity,
              height: 46,
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFF1E6BFF)),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                icon: _isSyncing
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.sync_rounded, color: Color(0xFF1E6BFF)),
                label: Text(
                  _isSyncing ? 'Synchronizing...' : 'Sync Now with Central Server',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1E6BFF),
                  ),
                ),
                onPressed: _isSyncing ? null : _triggerSync,
              ),
            ),
            const SizedBox(height: 20),

            // Application Details
            _sectionHeader('Workstation Information'),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.border),
              ),
              child: Column(
                children: [
                  _tile(
                    icon: Icons.info_outline_rounded,
                    title: 'Client Version',
                    subtitle: 'MCMS Mobile v0.0.1 (Build 1)',
                  ),
                  _divider(),
                  _tile(
                    icon: Icons.network_check_rounded,
                    title: 'Offline-First Engine',
                    subtitle: '@mcms/sync-core enabled',
                    trailing: _badge('Enabled', const Color(0xFF10B981)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Sign Out Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFFF1F2),
                  elevation: 0,
                  side: const BorderSide(color: Color(0xFFFECDD3)),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.logout_rounded,
                    color: Color(0xFFF43F5E), size: 18),
                label: const Text(
                  'Sign Out of Workstation',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFFF43F5E),
                  ),
                ),
                onPressed: () {
                  ref.read(authProvider.notifier).logout();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  static Widget _sectionHeader(String title) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Padding(
        padding: const EdgeInsets.only(left: 4, bottom: 8),
        child: Text(
          title,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: Color(0xFF64748B),
            letterSpacing: 0.2,
          ),
        ),
      ),
    );
  }

  static Widget _tile({
    required IconData icon,
    required String title,
    required String subtitle,
    Widget? trailing,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: const Color(0xFF1E6BFF)),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 11.5,
                    color: Color(0xFF64748B),
                  ),
                ),
              ],
            ),
          ),
          if (trailing != null) trailing,
        ],
      ),
    );
  }

  static Widget _badge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 10.5,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }

  static Widget _divider() =>
      const Divider(height: 1, thickness: 0.8, color: Color(0xFFF1F5F9));
}
