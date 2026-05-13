/**
 * Database Types — Phase 1 Manual Typings
 *
 * These types mirror the schema that will be created by the Story 1.2
 * migrations (`supabase/migrations/001_*.sql`…`006_*.sql`). They are written
 * by hand here so the rest of the app can be typed during Story 1.1 before
 * migrations are applied.
 *
 * When Story 1.2 completes, replace this file with output from:
 *   npx supabase gen types typescript --project-id qckasnpabjucioiemiot > src/types/database.ts
 *
 * Do NOT hand-edit after that point — re-generate on every schema change.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ---------------------------------------------------------------------------
// Shared column value types
// ---------------------------------------------------------------------------

export type PlanType = 'starter' | 'pro' | 'business' | 'trial'
export type PlanStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete'
export type UserRole = 'owner' | 'admin' | 'employee'
export type ClientStatus = 'active' | 'inactive' | 'blocked'
export type PetSpecies = 'dog' | 'cat' | 'bird' | 'other'
export type PetSize = 'small' | 'medium' | 'large' | 'giant'
export type ServiceCategory = 'grooming' | 'veterinary' | 'daycare' | 'other'
export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'canceled'
  | 'no_show'
export type AppointmentSource = 'manual' | 'whatsapp' | 'public_booking' | 'api'

// ---------------------------------------------------------------------------
// Row / Insert / Update helpers per table
// ---------------------------------------------------------------------------

export interface TenantRow {
  id: string
  name: string
  slug: string
  phone: string | null
  email: string | null
  address: Json | null
  settings: Json | null
  whatsapp_instance_id: string | null
  whatsapp_connected: boolean
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: PlanType
  plan_status: PlanStatus
  trial_ends_at: string | null
  messages_used: number
  messages_limit: number
  public_booking_enabled: boolean
  booking_instructions: string | null
  created_at: string
  updated_at: string
}

export type TenantInsert = Omit<
  TenantRow,
  'id' | 'created_at' | 'updated_at' | 'whatsapp_connected' | 'messages_used' | 'messages_limit'
> & {
  id?: string
  created_at?: string
  updated_at?: string
  whatsapp_connected?: boolean
  messages_used?: number
  messages_limit?: number
}
export type TenantUpdate = Partial<TenantInsert>

export interface UserRow {
  id: string // references auth.users.id
  tenant_id: string
  full_name: string
  role: UserRole
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  permissions: Json | null
  created_at: string
  updated_at: string
}
export type UserInsert = Omit<UserRow, 'created_at' | 'updated_at' | 'is_active'> & {
  created_at?: string
  updated_at?: string
  is_active?: boolean
}
export type UserUpdate = Partial<UserInsert>

export interface ClientRow {
  id: string
  tenant_id: string
  full_name: string
  phone: string
  email: string | null
  cpf: string | null
  address: Json | null
  tags: string[]
  notes: string | null
  total_spent: number
  visit_count: number
  last_visit_at: string | null
  loyalty_points: number
  whatsapp_opt_in: boolean
  status: ClientStatus
  inactive_since: string | null
  created_at: string
  updated_at: string
}
export type ClientInsert = Omit<
  ClientRow,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'tags'
  | 'total_spent'
  | 'visit_count'
  | 'loyalty_points'
  | 'whatsapp_opt_in'
  | 'status'
> & {
  id?: string
  created_at?: string
  updated_at?: string
  tags?: string[]
  total_spent?: number
  visit_count?: number
  loyalty_points?: number
  whatsapp_opt_in?: boolean
  status?: ClientStatus
}
export type ClientUpdate = Partial<ClientInsert>

export interface PetRow {
  id: string
  tenant_id: string
  client_id: string
  name: string
  species: PetSpecies
  breed: string | null
  size: PetSize | null
  weight: number | null
  birth_date: string | null
  gender: 'male' | 'female' | null
  coat_type: string | null
  temperament: string | null
  health_notes: string | null
  photo_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
export type PetInsert = Omit<PetRow, 'id' | 'created_at' | 'updated_at' | 'is_active'> & {
  id?: string
  created_at?: string
  updated_at?: string
  is_active?: boolean
}
export type PetUpdate = Partial<PetInsert>

export interface ServiceRow {
  id: string
  tenant_id: string
  name: string
  description: string | null
  duration_minutes: number
  price: number
  price_by_size: Json | null
  category: ServiceCategory
  color: string | null
  is_active: boolean
  sort_order: number
  max_capacity: number
  created_at: string
  updated_at: string
}
export type ServiceInsert = Omit<
  ServiceRow,
  'id' | 'created_at' | 'updated_at' | 'is_active' | 'sort_order' | 'max_capacity'
> & {
  id?: string
  created_at?: string
  updated_at?: string
  is_active?: boolean
  sort_order?: number
  max_capacity?: number
}
export type ServiceUpdate = Partial<ServiceInsert>

export interface AppointmentRow {
  id: string
  tenant_id: string
  client_id: string
  pet_id: string
  service_id: string
  assigned_to: string | null
  date: string // DATE: 'YYYY-MM-DD'
  start_time: string // TIME: 'HH:MM:SS'
  end_time: string
  status: AppointmentStatus
  price: number
  notes: string | null
  confirmation_sent: boolean
  reminder_sent: boolean
  source: AppointmentSource
  canceled_reason: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}
export type AppointmentInsert = Omit<
  AppointmentRow,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'confirmation_sent'
  | 'reminder_sent'
  | 'status'
> & {
  id?: string
  created_at?: string
  updated_at?: string
  confirmation_sent?: boolean
  reminder_sent?: boolean
  status?: AppointmentStatus
}
export type AppointmentUpdate = Partial<AppointmentInsert>

export interface BusinessHourRow {
  id: string
  tenant_id: string
  day_of_week: number // 0 = Sunday … 6 = Saturday
  is_open: boolean
  open_time: string | null
  close_time: string | null
  break_start: string | null
  break_end: string | null
  created_at: string
  updated_at: string
}
export type BusinessHourInsert = Omit<
  BusinessHourRow,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string
  created_at?: string
  updated_at?: string
}
export type BusinessHourUpdate = Partial<BusinessHourInsert>

export interface BlockedSlotRow {
  id: string
  tenant_id: string
  user_id: string | null // null = applies to all users in tenant
  date: string
  start_time: string
  end_time: string
  reason: string | null
  created_at: string
}
export type BlockedSlotInsert = Omit<BlockedSlotRow, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}
export type BlockedSlotUpdate = Partial<BlockedSlotInsert>

export type MessageTemplateCategory =
  | 'reminder'
  | 'confirmation'
  | 'reactivation'
  | 'post_service'
  | 'promotion'
  | 'loyalty'
  | 'welcome'
  | 'birthday'

export interface MessageTemplateRow {
  id: string
  tenant_id: string | null // null = global template visible to every tenant
  name: string
  category: MessageTemplateCategory
  content: string
  is_default: boolean
  is_active: boolean
  variables: string[]
  created_at: string
}
export type MessageTemplateInsert = Omit<
  MessageTemplateRow,
  'id' | 'created_at' | 'is_default' | 'is_active' | 'variables'
> & {
  id?: string
  created_at?: string
  is_default?: boolean
  is_active?: boolean
  variables?: string[]
}
export type MessageTemplateUpdate = Partial<MessageTemplateInsert>

// ---------------------------------------------------------------------------
// Supabase generic `Database` type
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: TenantRow
        Insert: TenantInsert
        Update: TenantUpdate
        Relationships: []
      }
      users: {
        Row: UserRow
        Insert: UserInsert
        Update: UserUpdate
        Relationships: []
      }
      clients: {
        Row: ClientRow
        Insert: ClientInsert
        Update: ClientUpdate
        Relationships: []
      }
      pets: {
        Row: PetRow
        Insert: PetInsert
        Update: PetUpdate
        Relationships: []
      }
      services: {
        Row: ServiceRow
        Insert: ServiceInsert
        Update: ServiceUpdate
        Relationships: []
      }
      appointments: {
        Row: AppointmentRow
        Insert: AppointmentInsert
        Update: AppointmentUpdate
        Relationships: []
      }
      business_hours: {
        Row: BusinessHourRow
        Insert: BusinessHourInsert
        Update: BusinessHourUpdate
        Relationships: []
      }
      blocked_slots: {
        Row: BlockedSlotRow
        Insert: BlockedSlotInsert
        Update: BlockedSlotUpdate
        Relationships: []
      }
      message_templates: {
        Row: MessageTemplateRow
        Insert: MessageTemplateInsert
        Update: MessageTemplateUpdate
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_my_tenant_id: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
