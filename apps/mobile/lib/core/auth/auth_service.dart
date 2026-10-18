import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../api/endpoints.dart';

/// Represents the authenticated user returned by the API.
class AuthUser {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String role;

  const AuthUser({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.role,
  });

  factory AuthUser.fromJson(Map<String, dynamic> json) => AuthUser(
        id: json['id'] as String,
        email: json['email'] as String,
        firstName: json['firstName'] as String? ?? '',
        lastName: json['lastName'] as String? ?? '',
        role: json['role'] as String? ?? 'UNKNOWN',
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'firstName': firstName,
        'lastName': lastName,
        'role': role,
      };

  String get displayName => '$firstName $lastName'.trim();
  String get initials {
    final f = firstName.isNotEmpty ? firstName[0] : '';
    final l = lastName.isNotEmpty ? lastName[0] : '';
    return '$f$l'.toUpperCase();
  }
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const _kUser = 'mcms_mobile_user';
const _kAccess = 'mcms_mobile_access';
const _kRefresh = 'mcms_mobile_refresh';

/// Auth result returned from a successful login.
class AuthResult {
  final AuthUser user;
  final String accessToken;
  final String refreshToken;

  const AuthResult({
    required this.user,
    required this.accessToken,
    required this.refreshToken,
  });
}

/// Service that manages authentication state and token storage.
class AuthService {
  AuthUser? _currentUser;
  String? _accessToken;

  AuthUser? get currentUser => _currentUser;
  String? get accessToken => _accessToken;
  bool get isAuthenticated => _currentUser != null && _accessToken != null;

  /// Restore a previously saved session from SharedPreferences.
  Future<bool> restoreSession() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString(_kUser);
    final access = prefs.getString(_kAccess);

    if (userJson == null || access == null) return false;

    try {
      _currentUser = AuthUser.fromJson(
        jsonDecode(userJson) as Map<String, dynamic>,
      );
      _accessToken = access;
      return true;
    } catch (_) {
      await clearSession();
      return false;
    }
  }

  /// Login against the MCMS API and persist the session.
  Future<AuthResult> login(String email, String password) async {
    final response = await http.post(
      ApiEndpoints.login,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      final body = jsonDecode(response.body) as Map<String, dynamic>?;
      final message =
          body?['message'] as String? ?? 'Login failed (${response.statusCode})';
      throw Exception(message);
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final user = AuthUser.fromJson(data['user'] as Map<String, dynamic>);
    final accessToken = data['accessToken'] as String;
    final refreshToken = data['refreshToken'] as String;

    _currentUser = user;
    _accessToken = accessToken;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kUser, jsonEncode(user.toJson()));
    await prefs.setString(_kAccess, accessToken);
    await prefs.setString(_kRefresh, refreshToken);

    return AuthResult(
      user: user,
      accessToken: accessToken,
      refreshToken: refreshToken,
    );
  }

  /// Clear all stored session data.
  Future<void> clearSession() async {
    _currentUser = null;
    _accessToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kUser);
    await prefs.remove(_kAccess);
    await prefs.remove(_kRefresh);
  }
}
