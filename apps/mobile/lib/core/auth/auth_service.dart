import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../api/endpoints.dart';

/// Represents the authenticated user returned by the API or offline session.
class AuthUser {
  final String id;
  final String email;
  final String displayName;
  final String firstName;
  final String lastName;
  final String role;
  final List<String> roles;

  const AuthUser({
    required this.id,
    required this.email,
    required this.displayName,
    this.firstName = '',
    this.lastName = '',
    required this.role,
    this.roles = const [],
  });

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    final dName = json['displayName'] as String? ?? '';
    final fName = json['firstName'] as String? ??
        (dName.split(' ').isNotEmpty ? dName.split(' ').first : '');
    final lName = json['lastName'] as String? ??
        (dName.split(' ').length > 1
            ? dName.split(' ').sublist(1).join(' ')
            : '');
    final rawRoles = json['roles'] as List<dynamic>? ?? [];
    final rolesList = rawRoles.map((r) => r.toString()).toList();
    final roleStr = json['role'] as String? ??
        (rolesList.isNotEmpty ? rolesList.first : 'UNKNOWN');

    return AuthUser(
      id: json['id'] as String? ?? '',
      email: json['email'] as String? ?? '',
      displayName: dName.isNotEmpty ? dName : '$fName $lName'.trim(),
      firstName: fName,
      lastName: lName,
      role: roleStr,
      roles: rolesList,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'displayName': displayName,
        'firstName': firstName,
        'lastName': lastName,
        'role': role,
        'roles': roles,
      };

  String get initials {
    if (displayName.isNotEmpty) {
      final parts =
          displayName.trim().split(' ').where((p) => p.isNotEmpty).toList();
      if (parts.length >= 2) {
        return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
      }
      if (parts.isNotEmpty) return parts.first[0].toUpperCase();
    }
    final f = firstName.isNotEmpty ? firstName[0] : '';
    final l = lastName.isNotEmpty ? lastName[0] : '';
    return '$f$l'.isNotEmpty ? '$f$l'.toUpperCase() : '?';
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

/// Service that manages authentication state, network login, and offline fallback.
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

  /// Login against the MCMS API with offline fallback for seed accounts.
  Future<AuthResult> login(String email, String password) async {
    final cleanEmail = email.trim().toLowerCase();

    // 1. Try real API authentication first
    try {
      final response = await http
          .post(
            ApiEndpoints.login,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'email': email.trim(), 'password': password}),
          )
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        final user = AuthUser.fromJson(data['user'] as Map<String, dynamic>);
        final accessToken = data['accessToken'] as String? ?? 'token_online';
        final refreshToken = data['refreshToken'] as String? ?? 'refresh_online';

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
      } else {
        final body = jsonDecode(response.body) as Map<String, dynamic>?;
        final message = body?['message'] as String? ??
            'Login failed (${response.statusCode})';
        throw Exception(message);
      }
    } on SocketException catch (_) {
      // Network unreachable — fall through to offline check
    } on TimeoutException catch (_) {
      // Network timeout — fall through to offline check
    } on http.ClientException catch (_) {
      // HTTP client failure — fall through to offline check
    }

    // 2. Offline fallback for seed accounts
    if (cleanEmail == 'receptionist@mcms.local' &&
        password == 'Reception@123456') {
      const offlineUser = AuthUser(
        id: '442f480e-6dcb-4ded-83ba-304480b07a37',
        email: 'receptionist@mcms.local',
        displayName: 'Sarah Receptionist',
        firstName: 'Sarah',
        lastName: 'Receptionist',
        role: 'RECEPTIONIST',
        roles: ['RECEPTIONIST'],
      );

      _currentUser = offlineUser;
      _accessToken = 'offline_token_receptionist';

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_kUser, jsonEncode(offlineUser.toJson()));
      await prefs.setString(_kAccess, _accessToken!);
      await prefs.setString(_kRefresh, 'offline_refresh_receptionist');

      return AuthResult(
        user: offlineUser,
        accessToken: _accessToken!,
        refreshToken: 'offline_refresh_receptionist',
      );
    }

    if (cleanEmail == 'doctor@mcms.local' && password == 'Doctor@123456') {
      const offlineUser = AuthUser(
        id: 'user-doc-001',
        email: 'doctor@mcms.local',
        displayName: 'Dr. Fitsum Alemu',
        firstName: 'Fitsum',
        lastName: 'Alemu',
        role: 'DOCTOR',
        roles: ['DOCTOR'],
      );

      _currentUser = offlineUser;
      _accessToken = 'offline_token_doctor';

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_kUser, jsonEncode(offlineUser.toJson()));
      await prefs.setString(_kAccess, _accessToken!);
      await prefs.setString(_kRefresh, 'offline_refresh_doctor');

      return AuthResult(
        user: offlineUser,
        accessToken: _accessToken!,
        refreshToken: 'offline_refresh_doctor',
      );
    }

    if (cleanEmail == 'nurse@mcms.local' && password == 'Nurse@123456') {
      const offlineUser = AuthUser(
        id: 'user-nurse-001',
        email: 'nurse@mcms.local',
        displayName: 'Sister Aster Mulu',
        firstName: 'Aster',
        lastName: 'Mulu',
        role: 'NURSE',
        roles: ['NURSE'],
      );

      _currentUser = offlineUser;
      _accessToken = 'offline_token_nurse';

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_kUser, jsonEncode(offlineUser.toJson()));
      await prefs.setString(_kAccess, _accessToken!);
      await prefs.setString(_kRefresh, 'offline_refresh_nurse');

      return AuthResult(
        user: offlineUser,
        accessToken: _accessToken!,
        refreshToken: 'offline_refresh_nurse',
      );
    }

    throw Exception(
      'Unable to connect to server. Check Wi-Fi connection or verify credentials.',
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
