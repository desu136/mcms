/// Environment and API endpoint configuration for MCMS Mobile.
class AppEnv {
  AppEnv._();

  /// Base API URL pointing to the centralized NestJS API.
  /// On Android emulator, use 'http://10.0.2.2:3001'
  /// On iOS simulator or web, use 'http://localhost:3001'
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3001/api/v1',
  );

  static const String appVersion = '0.0.1';
  static const String appTitle = 'MCMS Mobile Clinical';
}
