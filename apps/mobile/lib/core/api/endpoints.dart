import '../../config/env.dart';

/// API endpoints matching NestJS route structure.
class ApiEndpoints {
  ApiEndpoints._();

  static Uri get health => Uri.parse('${AppEnv.apiBaseUrl}/health');
  static Uri get login => Uri.parse('${AppEnv.apiBaseUrl}/auth/login');
  static Uri get refresh => Uri.parse('${AppEnv.apiBaseUrl}/auth/refresh');
  static Uri get syncPush => Uri.parse('${AppEnv.apiBaseUrl}/sync/push');
  static Uri get syncPull => Uri.parse('${AppEnv.apiBaseUrl}/sync/pull');

  // Clinic Admin & Management endpoints
  static Uri get clinicAdminDashboard => Uri.parse('${AppEnv.apiBaseUrl}/clinic-admin/dashboard');
  static Uri get clinicAdminDepartments => Uri.parse('${AppEnv.apiBaseUrl}/clinic-admin/departments');
  static Uri get clinicAdminDoctors => Uri.parse('${AppEnv.apiBaseUrl}/clinic-admin/doctors');
  static Uri get clinicAdminRooms => Uri.parse('${AppEnv.apiBaseUrl}/clinic-admin/rooms');
  static Uri get branches => Uri.parse('${AppEnv.apiBaseUrl}/branches');
  static Uri get users => Uri.parse('${AppEnv.apiBaseUrl}/users');
  static Uri get appointments => Uri.parse('${AppEnv.apiBaseUrl}/appointments');
}
