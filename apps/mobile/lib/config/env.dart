/// Environment and API endpoint configuration for MCMS Mobile.
class AppEnv {
  AppEnv._();

  /// Base API URL pointing to the centralized NestJS API.
  /// When debugging on a mobile phone on the same Wi-Fi / hotspot, use host IP:
  /// 'http://192.168.137.51:3001/api/v1'
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://192.168.137.51:3001/api/v1',
  );

  static const String appVersion = '0.0.1';
  static const String appTitle = 'MCMS Mobile Clinical';
}
