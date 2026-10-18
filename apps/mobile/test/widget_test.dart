import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mcms_mobile/core/storage/sqlite_database.dart';
import 'package:mcms_mobile/features/home/presentation/screens/home_screen.dart';

class FakeDatabaseService extends MobileDatabaseService {
  @override
  Future<int> getPendingQueueCount() async => 0;

  @override
  Future<String?> getSyncCursor() async => null;
}

void main() {
  testWidgets('MCMS Mobile loads home screen and displays offline status card',
      (WidgetTester tester) async {
    final fakeDb = FakeDatabaseService();

    await tester.pumpWidget(
      MaterialApp(
        home: HomeScreen(dbService: fakeDb),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('MCMS Mobile Clinical'), findsOneWidget);
    expect(find.text('Offline-First Local Storage'), findsOneWidget);
    expect(find.text('Pending Offline Operations: 0'), findsOneWidget);
  });
}
