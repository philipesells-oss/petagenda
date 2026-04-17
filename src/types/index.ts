/**
 * App-Level Type Definitions
 *
 * Re-exports the most commonly used database types and defines UI/domain
 * types that aren't present in the raw schema (e.g. AuthUser — a joined
 * view of `auth.users` + `public.users` + `public.tenants`).
 */

export type {
  Database,
  Json,
  PlanType,
  PlanStatus,
  UserRole,
  ClientStatus,
  PetSpecies,
  PetSize,
  ServiceCategory,
  AppointmentStatus,
  AppointmentSource,
  TenantRow,
  TenantInsert,
  TenantUpdate,
  UserRow,
  UserInsert,
  UserUpdate,
  ClientRow,
  ClientInsert,
  ClientUpdate,
  PetRow,
  PetInsert,
  PetUpdate,
  ServiceRow,
  ServiceInsert,
  ServiceUpdate,
  AppointmentRow,
  AppointmentInsert,
  AppointmentUpdate,
  BusinessHourRow,
  BusinessHourInsert,
  BusinessHourUpdate,
  BlockedSlotRow,
  BlockedSlotInsert,
  BlockedSlotUpdate,
} from './database'

import type {
  UserRole,
  PlanType,
  PlanStatus,
  TenantRow,
  UserRow,
} from './database'

// ---------------------------------------------------------------------------
// Auth / Session
// ---------------------------------------------------------------------------

/**
 * Shape returned when joining the authenticated user with their tenant row.
 * Produced by server-side loaders (e.g. `getCurrentUser()`).
 */
export interface AuthUser {
  // Identity (from auth.users)
  id: string
  email: string | null

  // Profile (from public.users)
  tenantId: string
  fullName: string
  role: UserRole
  phone: string | null
  avatarUrl: string | null
  isActive: boolean

  // Tenant summary (from public.tenants)
  tenant: {
    id: string
    name: string
    slug: string
    plan: PlanType
    planStatus: PlanStatus
    trialEndsAt: string | null
    messagesUsed: number
    messagesLimit: number
    whatsappConnected: boolean
  }
}

/**
 * Utility: projection from raw rows into `AuthUser`. Kept as a type-only
 * contract so loaders can import it without a runtime dependency.
 */
export type AuthUserFromRows = (args: {
  authId: string
  authEmail: string | null
  user: UserRow
  tenant: TenantRow
}) => AuthUser

// ---------------------------------------------------------------------------
// UI helper types
// ---------------------------------------------------------------------------

export interface SelectOption<T extends string = string> {
  value: T
  label: string
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

/**
 * Generic ActionResult for Server Actions. Either success with data, or
 * error with a user-displayable message plus optional field-level errors
 * (for form validation flows).
 */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
