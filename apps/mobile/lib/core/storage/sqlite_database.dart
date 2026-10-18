import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';
import '../models/sync_operation.dart';

/// SQLite database service for mobile local offline persistence.
/// Ensures mobile never connects directly to central PostgreSQL.
class MobileDatabaseService {
  static const String _dbName = 'mcms_mobile_local.db';
  static const int _dbVersion = 1;

  Database? _db;

  Future<Database> get database async {
    if (_db != null) return _db!;
    _db = await _initDatabase();
    return _db!;
  }

  Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, _dbName);

    return openDatabase(
      path,
      version: _dbVersion,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE local_sync_queue (
            operation_id TEXT PRIMARY KEY,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            operation TEXT NOT NULL,
            payload TEXT,
            client_timestamp TEXT NOT NULL,
            base_version INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'PENDING'
          );
        ''');

        await db.execute('''
          CREATE TABLE sync_metadata (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
          );
        ''');
      },
    );
  }

  Future<void> enqueueOperation(SyncOperation op) async {
    final db = await database;
    await db.insert(
      'local_sync_queue',
      {
        'operation_id': op.operationId,
        'entity_type': op.entityType,
        'entity_id': op.entityId,
        'operation': op.operation,
        'payload': op.payload?.toString(),
        'client_timestamp': op.clientTimestamp,
        'base_version': op.baseVersion,
        'status': 'PENDING',
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<int> getPendingQueueCount() async {
    final db = await database;
    final result = await db.rawQuery(
      "SELECT COUNT(*) as count FROM local_sync_queue WHERE status = 'PENDING'",
    );
    return Sqflite.firstIntValue(result) ?? 0;
  }

  Future<String?> getSyncCursor() async {
    final db = await database;
    final results = await db.query(
      'sync_metadata',
      where: 'key = ?',
      whereArgs: ['cursor'],
    );
    if (results.isNotEmpty) {
      return results.first['value'] as String?;
    }
    return null;
  }

  Future<void> setSyncCursor(String cursor) async {
    final db = await database;
    await db.insert(
      'sync_metadata',
      {'key': 'cursor', 'value': cursor},
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }
}
