import '../api/api_client.dart';
import '../models/sync_operation.dart';
import '../storage/sqlite_database.dart';

/// Repository implementing clean separation of local SQLite storage
/// from remote REST API synchronization.
class SyncRepository {
  final MobileDatabaseService _localDb;
  final MobileApiClient _remoteApi;

  SyncRepository({
    required MobileDatabaseService localDb,
    required MobileApiClient remoteApi,
  })  : _localDb = localDb,
        _remoteApi = remoteApi;

  /// Enqueue an operation into local SQLite storage
  Future<void> recordLocalOperation(SyncOperation op) async {
    await _localDb.enqueueOperation(op);
  }

  /// Get pending queue count from local SQLite storage
  Future<int> getPendingCount() async {
    return _localDb.getPendingQueueCount();
  }

  /// Get active cursor
  Future<String?> getCursor() async {
    return _localDb.getSyncCursor();
  }

  /// Synchronize pending local operations with remote NestJS API
  Future<void> syncWithRemote() async {
    // In Phase 1, repository scaffold checks health and prepares sync batching
    await _remoteApi.checkHealth();
  }
}
