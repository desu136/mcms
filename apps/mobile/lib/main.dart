import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/storage/sqlite_database.dart';
import 'features/home/presentation/screens/home_screen.dart';

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
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: HomeScreen(dbService: dbService),
    );
  }
}
