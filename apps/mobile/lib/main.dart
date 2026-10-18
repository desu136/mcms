import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/storage/sqlite_database.dart';
import 'core/auth/auth_provider.dart';
import 'features/auth/presentation/screens/login_screen.dart';
import 'features/home/presentation/screens/dashboard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final dbService = MobileDatabaseService();

  runApp(
    ProviderScope(
      child: McmsApp(dbService: dbService),
    ),
  );
}

class McmsApp extends StatelessWidget {
  final MobileDatabaseService dbService;

  const McmsApp({super.key, required this.dbService});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MCMS Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0EA5E9),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        fontFamily: 'Inter',
      ),
      home: _AuthRouter(dbService: dbService),
    );
  }
}

/// Watches auth state and routes to LoginScreen or DashboardScreen.
class _AuthRouter extends ConsumerWidget {
  final MobileDatabaseService dbService;

  const _AuthRouter({required this.dbService});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    if (authState.isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFF0F172A),
        body: Center(
          child: CircularProgressIndicator(
            color: Color(0xFF38BDF8),
            strokeWidth: 2.5,
          ),
        ),
      );
    }

    if (authState.isAuthenticated) {
      return DashboardScreen(dbService: dbService);
    }

    return const LoginScreen();
  }
}
