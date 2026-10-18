import type { SyncStatus } from '@mcms/domain';

// ─── Core synchronization protocol types ─────────────────────────────────────

/**
 * A unique, globally-unique identifier for every sync operation.
 * Format: `{clientId}:{entityType}:{entityId}:{sequenceNumber}`
 */
export type SyncOperationId = string;

/**
 * Cursor representing the last successfully synced point in time.
 * Clients store this locally and send it on the next sync request.
 */
export type SyncCursor = string;

/**
 * Possible outcomes when the server processes a sync operation.
 */
export type SyncAcknowledgementStatus =
  | 'ACCEPTED' // Operation accepted and applied
  | 'REJECTED' // Operation rejected (e.g., validation failure)
  | 'CONFLICT' // Version conflict detected — server version returned
  | 'DUPLICATE'; // Operation already processed (idempotent safe)

/**
 * A single atomic change operation to be synchronized.
 */
export interface SyncOperation<TPayload = unknown> {
  /** Globally unique ID for this operation */
  operationId: SyncOperationId;
  /** Type of entity being modified */
  entityType: string;
  /** ID of the entity being modified */
  entityId: string;
  /** Operation type */
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  /** The data payload (null for DELETE) */
  payload: TPayload | null;
  /** Client-side timestamp (ISO 8601) */
  clientTimestamp: string;
  /** Version of the entity the client last saw */
  baseVersion: number;
}

/**
 * Server acknowledgement for a single sync operation.
 */
export interface SyncAcknowledgement {
  operationId: SyncOperationId;
  status: SyncAcknowledgementStatus;
  /** New cursor after this operation was applied */
  newCursor?: SyncCursor;
  /** Server version (present for CONFLICT responses) */
  serverVersion?: number;
  /** Error details (present for REJECTED responses) */
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Request sent by a client to push local changes to the server.
 */
export interface SyncPushRequest {
  /** The client's current sync cursor */
  cursor: SyncCursor | null;
  operations: SyncOperation[];
}

/**
 * Response from the server after processing a push.
 */
export interface SyncPushResponse {
  acknowledgements: SyncAcknowledgement[];
  /** New cursor for the client to store */
  newCursor: SyncCursor;
}

/**
 * Request sent by a client to pull changes from the server.
 */
export interface SyncPullRequest {
  /** The client's current sync cursor — server returns changes after this point */
  cursor: SyncCursor | null;
  /** Entity types the client is interested in */
  entityTypes: string[];
  /** Maximum number of operations to return */
  limit?: number;
}

/**
 * A server-side change event sent to clients during pull.
 */
export interface SyncServerEvent<TPayload = unknown> {
  operationId: SyncOperationId;
  entityType: string;
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: TPayload | null;
  serverTimestamp: string;
  cursor: SyncCursor;
}

/**
 * Response from the server for a pull request.
 */
export interface SyncPullResponse {
  events: SyncServerEvent[];
  newCursor: SyncCursor;
  hasMore: boolean;
}

/**
 * Metadata stored locally alongside each entity for sync tracking.
 */
export interface SyncMetadata {
  operationId: SyncOperationId | null;
  syncStatus: SyncStatus;
  localVersion: number;
  serverVersion: number | null;
  lastSyncedAt: string | null;
  retryCount: number;
}
