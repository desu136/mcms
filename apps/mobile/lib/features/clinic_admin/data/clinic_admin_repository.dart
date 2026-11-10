import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../../../core/api/endpoints.dart';
import '../../../../core/auth/auth_provider.dart';
import 'clinic_admin_models.dart';

// ─── Repository Implementation ───────────────────────────────────────────────

class ClinicAdminRepository {
  final AuthService _authService;
  final http.Client _client;

  ClinicAdminRepository({
    required AuthService authService,
    http.Client? client,
  })  : _authService = authService,
        _client = client ?? http.Client();

  // Initial Clean State (No fake demo data, identical to desktop and web)
  ClinicDashboardStats _stats = ClinicDashboardStats.empty;
  List<ClinicBranchItem> _branches = [];
  List<ClinicDepartmentItem> _departments = [];
  List<ClinicStaffMember> _staff = [];
  List<ClinicAppointmentItem> _appointments = [];
  List<ClinicActivityItem> _activities = [];
  String _activeBranch = 'Main Facility';
  bool _isLoading = false;
  String? _errorMessage;

  ClinicDashboardStats get stats => _stats;
  List<ClinicBranchItem> get branches => List.unmodifiable(_branches);
  List<ClinicDepartmentItem> get departments => List.unmodifiable(_departments);
  List<ClinicStaffMember> get staff => List.unmodifiable(_staff);
  List<ClinicAppointmentItem> get appointments => List.unmodifiable(_appointments);
  List<ClinicActivityItem> get activities => List.unmodifiable(_activities);
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  ClinicAdminProfile get profile {
    final user = _authService.currentUser;
    return ClinicAdminProfile(
      id: user?.id ?? '',
      name: user?.displayName.isNotEmpty == true ? user!.displayName : 'Clinic Administrator',
      role: 'Clinic Administrator',
      email: user?.email ?? 'clinic.admin@mcms.local',
      phone: '+251 911 000 000',
      clinicName: 'St. Michael Medical Center',
      clinicCode: 'MCMS-FACILITY',
      activeBranch: _activeBranch,
      unreadNotifications: _activities.length,
    );
  }

  Map<String, String> _buildHeaders() {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    final token = _authService.accessToken;
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  // ─── API Fetchers ───────────────────────────────────────────────────────────

  /// Fetch Dashboard Stats from API: GET /api/v1/clinic-admin/dashboard
  Future<void> fetchDashboardStats() async {
    try {
      final response = await _client
          .get(ApiEndpoints.clinicAdminDashboard, headers: _buildHeaders())
          .timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        _stats = ClinicDashboardStats.fromJson(data);

        // Extract recent appointments from dashboard stats if available
        if (data['recentAppointments'] is List) {
          final list = data['recentAppointments'] as List;
          _appointments = list
              .whereType<Map<String, dynamic>>()
              .map((a) => ClinicAppointmentItem.fromJson(a))
              .toList();
        }

        // Extract department breakdown from dashboard stats if available
        if (data['departmentBreakdown'] is List) {
          final list = data['departmentBreakdown'] as List;
          _activities = list.take(5).map((d) {
            final name = d['name'] ?? 'Department';
            final visits = d['patientVisits'] ?? 0;
            return ClinicActivityItem(
              id: 'dept-${DateTime.now().millisecondsSinceEpoch}',
              title: '$name Activity',
              description: '$visits patient visits recorded.',
              timeAgo: 'Live',
              type: 'patient',
            );
          }).toList();
        }
      }
    } catch (e) {
      // In offline mode or server unavailable, maintain empty state gracefully
      _errorMessage = e.toString();
    }
  }

  /// Fetch Branches from API: GET /api/v1/branches
  Future<void> fetchBranches() async {
    try {
      final response = await _client
          .get(ApiEndpoints.branches, headers: _buildHeaders())
          .timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is List) {
          _branches = data
              .whereType<Map<String, dynamic>>()
              .map((b) => ClinicBranchItem.fromJson(b))
              .toList();
          if (_branches.isNotEmpty && _activeBranch == 'Main Facility') {
            _activeBranch = _branches.first.name;
          }
        }
      }
    } catch (_) {}
  }

  /// Fetch Departments from API: GET /api/v1/clinic-admin/departments
  Future<void> fetchDepartments() async {
    try {
      final response = await _client
          .get(ApiEndpoints.clinicAdminDepartments, headers: _buildHeaders())
          .timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is List) {
          _departments = data
              .whereType<Map<String, dynamic>>()
              .map((d) => ClinicDepartmentItem.fromJson(d))
              .toList();
        }
      }
    } catch (_) {}
  }

  /// Fetch Staff Users from API: GET /api/v1/users
  Future<void> fetchStaff() async {
    try {
      final response = await _client
          .get(ApiEndpoints.users, headers: _buildHeaders())
          .timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is List) {
          _staff = data
              .whereType<Map<String, dynamic>>()
              .map((s) => ClinicStaffMember.fromJson(s))
              .toList();
        }
      }
    } catch (_) {}
  }

  /// Fetch Appointments from API: GET /api/v1/appointments
  Future<void> fetchAppointments() async {
    try {
      final response = await _client
          .get(ApiEndpoints.appointments, headers: _buildHeaders())
          .timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is List) {
          _appointments = data
              .whereType<Map<String, dynamic>>()
              .map((a) => ClinicAppointmentItem.fromJson(a))
              .toList();
        }
      }
    } catch (_) {}
  }

  /// Refresh all data from central API
  Future<void> refreshAll() async {
    _isLoading = true;
    _errorMessage = null;
    await Future.wait([
      fetchDashboardStats(),
      fetchBranches(),
      fetchDepartments(),
      fetchStaff(),
      fetchAppointments(),
    ]);
    _isLoading = false;
  }

  // ─── Mutations ──────────────────────────────────────────────────────────────

  /// Create a new branch via API: POST /api/v1/branches
  Future<void> addBranch(ClinicBranchItem branch) async {
    _branches.insert(0, branch);
    try {
      final payload = {
        'name': branch.name,
        'code': branch.code,
        'address': branch.address,
        'phone': branch.phone,
        'email': branch.email,
        'isMainBranch': branch.isMainBranch,
      };
      await _client
          .post(
            ApiEndpoints.branches,
            headers: _buildHeaders(),
            body: jsonEncode(payload),
          )
          .timeout(const Duration(seconds: 5));
    } catch (_) {}
  }

  /// Create a new department via API: POST /api/v1/clinic-admin/departments
  Future<void> addDepartment(ClinicDepartmentItem department) async {
    _departments.insert(0, department);
    try {
      final payload = {
        'name': department.name,
        'code': department.code,
        'description': department.description,
        'color': '#1E6BFF',
      };
      await _client
          .post(
            ApiEndpoints.clinicAdminDepartments,
            headers: _buildHeaders(),
            body: jsonEncode(payload),
          )
          .timeout(const Duration(seconds: 5));
    } catch (_) {}
  }

  /// Create a new staff member via API: POST /api/v1/users
  Future<void> addStaff(ClinicStaffMember member) async {
    _staff.insert(0, member);
    try {
      final nameParts = member.name.trim().split(' ');
      final firstName = nameParts.isNotEmpty ? nameParts.first : member.name;
      final lastName = nameParts.length > 1 ? nameParts.sublist(1).join(' ') : 'Staff';

      final payload = {
        'email': member.email,
        'displayName': member.name,
        'firstName': firstName,
        'lastName': lastName,
        'phoneNumber': member.phone,
        'role': member.role.toUpperCase(),
      };
      await _client
          .post(
            ApiEndpoints.users,
            headers: _buildHeaders(),
            body: jsonEncode(payload),
          )
          .timeout(const Duration(seconds: 5));
    } catch (_) {}
  }

  void toggleStaffStatus(String staffId) {
    final index = _staff.indexWhere((s) => s.id == staffId);
    if (index != -1) {
      final cur = _staff[index];
      final newStatus = cur.status == 'Active' ? 'On Leave' : 'Active';
      _staff[index] = cur.copyWith(status: newStatus);
    }
  }

  void updateActiveBranch(String branchName) {
    _activeBranch = branchName;
  }
}

// ─── Riverpod Providers ───────────────────────────────────────────────────────

final clinicAdminRepositoryProvider = Provider<ClinicAdminRepository>((ref) {
  final authService = ref.watch(authServiceProvider);
  return ClinicAdminRepository(authService: authService);
});

class ClinicAdminNotifier extends StateNotifier<int> {
  final ClinicAdminRepository repo;
  ClinicAdminNotifier(this.repo) : super(0) {
    // Initial fetch on mount
    loadData();
  }

  Future<void> loadData() async {
    await repo.refreshAll();
    state++;
  }

  Future<void> refresh() async {
    await repo.refreshAll();
    state++;
  }

  Future<void> addBranch(ClinicBranchItem branch) async {
    await repo.addBranch(branch);
    state++;
  }

  Future<void> addDepartment(ClinicDepartmentItem dept) async {
    await repo.addDepartment(dept);
    state++;
  }

  Future<void> addStaff(ClinicStaffMember member) async {
    await repo.addStaff(member);
    state++;
  }

  void toggleStaffStatus(String id) {
    repo.toggleStaffStatus(id);
    state++;
  }

  void setActiveBranch(String branch) {
    repo.updateActiveBranch(branch);
    state++;
  }
}

final clinicAdminChangeNotifierProvider =
    StateNotifierProvider<ClinicAdminNotifier, int>((ref) {
  final repo = ref.watch(clinicAdminRepositoryProvider);
  return ClinicAdminNotifier(repo);
});

final clinicAdminProfileProvider = Provider<ClinicAdminProfile>((ref) {
  ref.watch(clinicAdminChangeNotifierProvider);
  return ref.watch(clinicAdminRepositoryProvider).profile;
});

final clinicAdminStatsProvider = Provider<ClinicDashboardStats>((ref) {
  ref.watch(clinicAdminChangeNotifierProvider);
  return ref.watch(clinicAdminRepositoryProvider).stats;
});

final clinicAdminBranchesProvider = Provider<List<ClinicBranchItem>>((ref) {
  ref.watch(clinicAdminChangeNotifierProvider);
  return ref.watch(clinicAdminRepositoryProvider).branches;
});

final clinicAdminDepartmentsProvider =
    Provider<List<ClinicDepartmentItem>>((ref) {
  ref.watch(clinicAdminChangeNotifierProvider);
  return ref.watch(clinicAdminRepositoryProvider).departments;
});

final clinicAdminStaffProvider = Provider<List<ClinicStaffMember>>((ref) {
  ref.watch(clinicAdminChangeNotifierProvider);
  return ref.watch(clinicAdminRepositoryProvider).staff;
});

final clinicAdminAppointmentsProvider =
    Provider<List<ClinicAppointmentItem>>((ref) {
  ref.watch(clinicAdminChangeNotifierProvider);
  return ref.watch(clinicAdminRepositoryProvider).appointments;
});

final clinicAdminActivitiesProvider =
    Provider<List<ClinicActivityItem>>((ref) {
  ref.watch(clinicAdminChangeNotifierProvider);
  return ref.watch(clinicAdminRepositoryProvider).activities;
});
