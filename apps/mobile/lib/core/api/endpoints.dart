import '../../config/env.dart';

/// API endpoints matching NestJS route structure.
class ApiEndpoints {
  ApiEndpoints._();

  static Uri get health => Uri.parse('${AppEnv.apiBaseUrl}/health');
  static Uri get login => Uri.parse('${AppEnv.apiBaseUrl}/auth/login');
  static Uri get refresh => Uri.parse('${AppEnv.apiBaseUrl}/auth/refresh');
  static Uri get syncPush => Uri.parse('${AppEnv.apiBaseUrl}/sync/push');
  static Uri get syncPull => Uri.parse('${AppEnv.apiBaseUrl}/sync/pull');
}
