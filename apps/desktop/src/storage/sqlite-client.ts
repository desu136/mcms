/**
 * Desktop Offline Storage Layer using SQLite (better-sqlite3)
 * Provides local workstation data caching and outbound sync queue.
 */

import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import type { SyncOperation, SyncCursor } from '@mcms/sync-core';

export class LocalSqliteStorage {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const finalPath = dbPath || path.join(process.cwd(), 'mcms_desktop_local.sqlite');
    const dir = path.dirname(finalPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(finalPath);
    this.initializeTables();
  }

  private initializeTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS local_sync_queue (
        operation_id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        payload TEXT,
        client_timestamp TEXT NOT NULL,
        base_version INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING'
      );

      CREATE TABLE IF NOT EXISTS local_sync_metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  }

  public enqueueOperation(op: SyncOperation): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO local_sync_queue
      (operation_id, entity_type, entity_id, operation, payload, client_timestamp, base_version, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')
    `);

    stmt.run(
      op.operationId,
      op.entityType,
      op.entityId,
      op.operation,
      op.payload ? JSON.stringify(op.payload) : null,
      op.clientTimestamp,
      op.baseVersion,
    );
  }

  public getPendingOperations(): SyncOperation[] {
    const rows = this.db
      .prepare("SELECT * FROM local_sync_queue WHERE status = 'PENDING' ORDER BY rowid ASC")
      .all() as Array<{
      operation_id: string;
      entity_type: string;
      entity_id: string;
      operation: 'CREATE' | 'UPDATE' | 'DELETE';
      payload: string | null;
      client_timestamp: string;
      base_version: number;
    }>;

    return rows.map((r) => ({
      operationId: r.operation_id,
      entityType: r.entity_type,
      entityId: r.entity_id,
      operation: r.operation,
      payload: r.payload ? JSON.parse(r.payload) : null,
      clientTimestamp: r.client_timestamp,
      baseVersion: r.base_version,
    }));
  }

  public acknowledgeOperation(operationId: string): void {
    this.db.prepare('DELETE FROM local_sync_queue WHERE operation_id = ?').run(operationId);
  }

  public getCursor(): SyncCursor | null {
    const row = this.db
      .prepare("SELECT value FROM local_sync_metadata WHERE key = 'cursor'")
      .get() as { value: string } | undefined;
    return row ? row.value : null;
  }

  public setCursor(cursor: SyncCursor): void {
    this.db
      .prepare("INSERT OR REPLACE INTO local_sync_metadata (key, value) VALUES ('cursor', ?)")
      .run(cursor);
  }

  public getPendingCount(): number {
    const row = this.db
      .prepare("SELECT COUNT(*) as count FROM local_sync_queue WHERE status = 'PENDING'")
      .get() as { count: number };
    return row ? row.count : 0;
  }

  public close(): void {
    this.db.close();
  }
}
