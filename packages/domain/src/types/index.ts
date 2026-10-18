/**
 * @mcms/domain — Branded ID types for type-safe entity references
 */

declare const __brand: unique symbol;
type Brand<B> = { readonly [__brand]: B };
export type Branded<T, B> = T & Brand<B>;

export type UserId = Branded<string, 'UserId'>;
export type ClinicId = Branded<string, 'ClinicId'>;
export type AppointmentId = Branded<string, 'AppointmentId'>;

export function asUserId(id: string): UserId {
  return id as UserId;
}

export function asClinicId(id: string): ClinicId {
  return id as ClinicId;
}

export function asAppointmentId(id: string): AppointmentId {
  return id as AppointmentId;
}

/**
 * Audit fields present on all persisted entities
 */
export interface AuditFields {
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Paginated response envelope
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
