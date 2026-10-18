/**
 * @mcms/domain — Business constants shared across all applications
 */

/** API versioning */
export const API_VERSION = 'v1' as const;
export const API_PREFIX = `/api/${API_VERSION}` as const;

/** Pagination defaults */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** Authentication */
export const ACCESS_TOKEN_COOKIE = 'mcms_access';
export const REFRESH_TOKEN_COOKIE = 'mcms_refresh';
export const AUTH_HEADER = 'Authorization' as const;

/** Sync protocol */
export const SYNC_BATCH_SIZE = 50;
export const SYNC_RETRY_LIMIT = 3;
export const SYNC_RETRY_BACKOFF_MS = 1000;
export const SYNC_CURSOR_HEADER = 'X-MCMS-Sync-Cursor' as const;

/** Health check */
export const HEALTH_CHECK_PATH = '/health' as const;
