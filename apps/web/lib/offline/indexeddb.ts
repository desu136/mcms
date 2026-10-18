/**
 * Web Offline Storage Layer using IndexedDB
 * Manages local mutation queue, offline caching, and sync cursors.
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { SyncOperation, SyncCursor } from '@mcms/sync-core';

const DB_NAME = 'mcms_web_offline';
const DB_VERSION = 1;

interface McmsDBSchema {
  sync_queue: {
    key: string;
    value: SyncOperation;
  };
  sync_metadata: {
    key: string;
    value: {
      key: string;
      value: string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<McmsDBSchema>> | null = null;

export function getOfflineDB(): Promise<IDBPDatabase<McmsDBSchema>> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB is only accessible in browser environments'));
  }

  if (!dbPromise) {
    dbPromise = openDB<McmsDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sync_queue' as never)) {
          db.createObjectStore('sync_queue' as never, { keyPath: 'operationId' });
        }
        if (!db.objectStoreNames.contains('sync_metadata' as never)) {
          db.createObjectStore('sync_metadata' as never, { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

export async function enqueueSyncOperation(op: SyncOperation): Promise<void> {
  const db = await getOfflineDB();
  await db.put('sync_queue' as never, op as never);
}

export async function getPendingOperations(): Promise<SyncOperation[]> {
  const db = await getOfflineDB();
  return db.getAll('sync_queue' as never) as unknown as Promise<SyncOperation[]>;
}

export async function removePendingOperation(operationId: string): Promise<void> {
  const db = await getOfflineDB();
  await db.delete('sync_queue' as never, operationId as never);
}

export async function getLocalSyncCursor(): Promise<SyncCursor | null> {
  const db = await getOfflineDB();
  const meta = await db.get('sync_metadata' as never, 'cursor' as never);
  return meta ? (meta as { value: string }).value : null;
}

export async function setLocalSyncCursor(cursor: SyncCursor): Promise<void> {
  const db = await getOfflineDB();
  await db.put('sync_metadata' as never, { key: 'cursor', value: cursor } as never);
}

export async function getOfflineStorageStatus(): Promise<{
  initialized: boolean;
  pendingMutations: number;
  cursor: SyncCursor | null;
}> {
  try {
    const db = await getOfflineDB();
    const count = await db.count('sync_queue' as never);
    const cursor = await getLocalSyncCursor();
    return {
      initialized: true,
      pendingMutations: count,
      cursor,
    };
  } catch {
    return {
      initialized: false,
      pendingMutations: 0,
      cursor: null,
    };
  }
}
