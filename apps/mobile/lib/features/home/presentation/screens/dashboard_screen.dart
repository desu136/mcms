import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/auth/auth_provider.dart';
import '../../../../core/storage/sqlite_database.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  final MobileDatabaseService dbService;

  const DashboardScreen({super.key, required this.dbService});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  int _selectedIndex = 0;
  int _pendingCount = 0;
  String? _syncCursor;

  @override
  void initState() {
    super.initState();
    _loadSyncState();
  }

  Future<void> _loadSyncState() async {
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

  static const _navItems = [
    (icon: Icons.dashboard_outlined, activeIcon: Icons.dashboard, label: 'Dashboard'),
    (icon: Icons.people_outline, activeIcon: Icons.people, label: 'Patients'),
    (icon: Icons.calendar_today_outlined, activeIcon: Icons.calendar_today, label: 'Schedule'),
    (icon: Icons.medical_services_outlined, activeIcon: Icons.medical_services, label: 'Records'),
  ];

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.user;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: _buildAppBar(user),
      body: _selectedIndex == 0
          ? _buildDashboardBody(user)
          : _buildComingSoon(_navItems[_selectedIndex].label),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  PreferredSizeWidget _buildAppBar(AuthUser? authUser) {
    return AppBar(
      backgroundColor: const Color(0xFF0F172A),
      elevation: 0,
      centerTitle: false,
      title: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0EA5E9), Color(0xFF38BDF8)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Center(
              child: Text('🏥', style: TextStyle(fontSize: 16)),
            ),
          ),
          const SizedBox(width: 10),
          const Text(
            'MCMS',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: Color(0xFFF8FAFC),
            ),
          ),
        ],
      ),
      actions: [
        // Sync indicator
        Container(
          margin: const EdgeInsets.only(right: 8),
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: const Color(0xFF4ADE80).withValues(alpha: 0.1),
            border: Border.all(
              color: const Color(0xFF4ADE80).withValues(alpha: 0.25),
            ),
            borderRadius: BorderRadius.circular(999),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: const BoxDecoration(
                  color: Color(0xFF4ADE80),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              const Text(
                'Online',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF4ADE80),
                ),
              ),
            ],
          ),
        ),
        // Avatar menu
        PopupMenuButton<String>(
          offset: const Offset(0, 48),
          color: const Color(0xFF1E293B),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
            side: const BorderSide(color: Color(0xFF334155)),
          ),
          child: Container(
            margin: const EdgeInsets.only(right: 16),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: const Color(0xFF0EA5E9),
              child: Text(
                authUser?.initials ?? '?',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF0F172A),
                ),
              ),
            ),
          ),
          itemBuilder: (_) => [
            PopupMenuItem(
              enabled: false,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    authUser?.displayName ?? 'User',
                    style: const TextStyle(
                      color: Color(0xFFF8FAFC),
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    authUser?.email ?? '',
                    style: const TextStyle(
                      color: Color(0xFF64748B),
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
            const PopupMenuDivider(),
            const PopupMenuItem<String>(
              value: 'logout',
              child: Row(
                children: [
                  Icon(Icons.logout, color: Color(0xFFEF4444), size: 16),
                  SizedBox(width: 10),
                  Text(
                    'Sign out',
                    style: TextStyle(color: Color(0xFFEF4444), fontSize: 13),
                  ),
                ],
              ),
            ),
          ],
          onSelected: (value) {
            if (value == 'logout') {
              ref.read(authProvider.notifier).logout();
            }
          },
        ),
      ],
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child: Container(height: 1, color: const Color(0xFF1E293B)),
      ),
    );
  }

  Widget _buildDashboardBody(AuthUser? authUser) {
    return RefreshIndicator(
      color: const Color(0xFF38BDF8),
      backgroundColor: const Color(0xFF1E293B),
      onRefresh: _loadSyncState,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Greeting
          Text(
            'Good ${_greeting()}, ${authUser?.firstName ?? 'Doctor'} 👋',
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: Color(0xFFF8FAFC),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            _formattedDate(),
            style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
          ),

          const SizedBox(height: 24),

          // Stats row
          Row(
            children: [
              Expanded(
                child: _statCard(
                  icon: '👥',
                  label: 'Patients',
                  value: '—',
                  sub: 'Next phase',
                  color: const Color(0xFF38BDF8),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _statCard(
                  icon: '📅',
                  label: 'Today',
                  value: '—',
                  sub: 'Appointments',
                  color: const Color(0xFF818CF8),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _statCard(
                  icon: '🔄',
                  label: 'Pending',
                  value: '$_pendingCount',
                  sub: 'Sync ops',
                  color: _pendingCount > 0
                      ? const Color(0xFFFBBF24)
                      : const Color(0xFF4ADE80),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _statCard(
                  icon: '💾',
                  label: 'SQLite',
                  value: 'Active',
                  sub: 'Local cache',
                  color: const Color(0xFF4ADE80),
                ),
              ),
            ],
          ),

          const SizedBox(height: 28),

          // Sync status panel
          _sectionTitle('Sync & Storage'),
          _infoPanel([
            _infoRow('Sync Cursor', _syncCursor ?? 'Initial (none)', mono: true),
            _infoRow('Pending Operations', '$_pendingCount', badge: _pendingCount == 0 ? 'ok' : 'warn'),
            _infoRow('Local Database', 'SQLite · sqflite', badge: 'ok'),
            _infoRow('Sync Protocol', '@mcms/sync-core · cursor-based'),
          ]),

          const SizedBox(height: 20),

          // Session panel
          _sectionTitle('Active Session'),
          _infoPanel([
            _infoRow('User', authUser?.displayName ?? '—'),
            _infoRow('Email', authUser?.email ?? '—', mono: true),
            _infoRow('Role', authUser?.role ?? '—', badge: 'role'),
          ]),

          const SizedBox(height: 20),

          // Quick actions
          _sectionTitle('Quick Actions'),
          _actionCard(
            icon: Icons.people_outline,
            title: 'Patient Records',
            subtitle: 'Browse and search patients',
            onTap: () => setState(() => _selectedIndex = 1),
          ),
          const SizedBox(height: 10),
          _actionCard(
            icon: Icons.calendar_today_outlined,
            title: 'Today\'s Schedule',
            subtitle: 'View appointments and tasks',
            onTap: () => setState(() => _selectedIndex = 2),
          ),
          const SizedBox(height: 10),
          _actionCard(
            icon: Icons.sync_outlined,
            title: 'Sync Now',
            subtitle: 'Push offline changes to server',
            onTap: _loadSyncState,
          ),
        ],
      ),
    );
  }

  Widget _buildComingSoon(String feature) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text('🚧', style: TextStyle(fontSize: 48)),
          const SizedBox(height: 16),
          Text(
            feature,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: Color(0xFFF8FAFC),
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Coming in the next development phase',
            style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
          ),
        ],
      ),
    );
  }

  BottomNavigationBar _buildBottomNav() {
    return BottomNavigationBar(
      currentIndex: _selectedIndex,
      onTap: (i) => setState(() => _selectedIndex = i),
      backgroundColor: const Color(0xFF0F172A),
      selectedItemColor: const Color(0xFF38BDF8),
      unselectedItemColor: const Color(0xFF475569),
      type: BottomNavigationBarType.fixed,
      selectedLabelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
      unselectedLabelStyle: const TextStyle(fontSize: 11),
      items: _navItems.map((item) {
        return BottomNavigationBarItem(
          icon: Icon(item.icon),
          activeIcon: Icon(item.activeIcon),
          label: item.label,
        );
      }).toList(),
    );
  }

  // ─── Helper widgets ──────────────────────────────────────────────────────────

  Widget _statCard({
    required String icon,
    required String label,
    required String value,
    required String sub,
    required Color color,
  }) =>
      Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          border: Border.all(color: const Color(0xFF1E293B)),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(label,
                    style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: Colors.blueGrey.shade500,
                        letterSpacing: 0.5)),
                Text(icon, style: const TextStyle(fontSize: 18)),
              ],
            ),
            const SizedBox(height: 8),
            Text(value,
                style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    color: color)),
            const SizedBox(height: 2),
            Text(sub,
                style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
          ],
        ),
      );

  Widget _sectionTitle(String title) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Text(
          title.toUpperCase(),
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.8,
            color: Color(0xFF64748B),
          ),
        ),
      );

  Widget _infoPanel(List<Widget> children) => Container(
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          border: Border.all(color: const Color(0xFF1E293B)),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(children: children),
      );

  Widget _infoRow(String label, String value, {bool mono = false, String? badge}) {
    Widget valueWidget;

    if (badge != null) {
      Color bg, fg, border;
      String text;
      if (badge == 'ok') {
        bg = const Color(0xFF4ADE80).withValues(alpha: 0.1);
        fg = const Color(0xFF4ADE80);
        border = const Color(0xFF4ADE80).withValues(alpha: 0.25);
        text = '● $value';
      } else if (badge == 'warn') {
        bg = const Color(0xFFFBBF24).withValues(alpha: 0.1);
        fg = const Color(0xFFFBBF24);
        border = const Color(0xFFFBBF24).withValues(alpha: 0.25);
        text = '● $value';
      } else {
        // role badge
        bg = const Color(0xFF38BDF8).withValues(alpha: 0.1);
        fg = const Color(0xFF38BDF8);
        border = const Color(0xFF38BDF8).withValues(alpha: 0.25);
        text = value;
      }
      valueWidget = Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
        decoration: BoxDecoration(
          color: bg,
          border: Border.all(color: border),
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(text, style: TextStyle(fontSize: 11, color: fg, fontWeight: FontWeight.w500)),
      );
    } else {
      valueWidget = Text(
        value,
        style: TextStyle(
          fontSize: 12,
          color: const Color(0xFFE2E8F0),
          fontFamily: mono ? 'monospace' : null,
          fontWeight: FontWeight.w500,
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFF0F172A), width: 1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
          valueWidget,
        ],
      ),
    );
  }

  Widget _actionCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) =>
      GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            border: Border.all(color: const Color(0xFF1E293B)),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFF38BDF8).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: const Color(0xFF38BDF8), size: 20),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title,
                        style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFFF8FAFC))),
                    const SizedBox(height: 2),
                    Text(subtitle,
                        style: const TextStyle(
                            fontSize: 12, color: Color(0xFF64748B))),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right,
                  color: Color(0xFF475569), size: 20),
            ],
          ),
        ),
      );

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  String _greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  String _formattedDate() {
    final now = DateTime.now();
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return '${days[now.weekday - 1]}, ${months[now.month - 1]} ${now.day}, ${now.year}';
  }
}
