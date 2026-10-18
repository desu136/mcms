import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'auth_service.dart';
export 'auth_service.dart';

// ─── Auth State ───────────────────────────────────────────────────────────────

enum AuthStatus { loading, unauthenticated, authenticated }

class AuthState {
  final AuthStatus status;
  final AuthUser? user;
  final String? error;

  const AuthState({
    required this.status,
    this.user,
    this.error,
  });

  const AuthState.loading() : this(status: AuthStatus.loading);
  const AuthState.unauthenticated({String? error})
      : this(status: AuthStatus.unauthenticated, error: error);
  const AuthState.authenticated(AuthUser user)
      : this(status: AuthStatus.authenticated, user: user);

  bool get isLoading => status == AuthStatus.loading;
  bool get isAuthenticated => status == AuthStatus.authenticated;
}

// ─── Auth Notifier ────────────────────────────────────────────────────────────

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _service;

  AuthNotifier(this._service) : super(const AuthState.loading()) {
    _restore();
  }

  Future<void> _restore() async {
    try {
      final ok = await _service.restoreSession();
      if (ok && _service.currentUser != null) {
        state = AuthState.authenticated(_service.currentUser!);
      } else {
        state = const AuthState.unauthenticated();
      }
    } catch (_) {
      state = const AuthState.unauthenticated();
    }
  }

  Future<void> login(String email, String password) async {
    state = const AuthState.loading();
    try {
      final result = await _service.login(email, password);
      state = AuthState.authenticated(result.user);
    } catch (e) {
      final msg = e.toString().replaceFirst('Exception: ', '');
      state = AuthState.unauthenticated(error: msg);
      rethrow;
    }
  }

  Future<void> logout() async {
    await _service.clearSession();
    state = const AuthState.unauthenticated();
  }
}

// ─── Providers ────────────────────────────────────────────────────────────────

final authServiceProvider = Provider<AuthService>((ref) => AuthService());

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.watch(authServiceProvider));
});
