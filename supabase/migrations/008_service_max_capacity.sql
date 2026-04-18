-- =============================================================================
-- Migration: 008_service_max_capacity.sql
-- Description: Adds max_capacity to services — how many simultaneous pets
--              can be served at the same time slot (e.g. 2 groomers available).
-- =============================================================================

BEGIN;

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS max_capacity integer NOT NULL DEFAULT 1
  CONSTRAINT services_max_capacity_check CHECK (max_capacity >= 1);

COMMIT;
