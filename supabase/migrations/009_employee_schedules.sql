-- Employee-level working schedule
-- Allows each employee to have their own days/hours independent of shop hours.
-- When no record exists for an employee, the shop's business_hours are used as fallback.

CREATE TABLE IF NOT EXISTS public.employee_schedules (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID        NOT NULL REFERENCES public.tenants(id)  ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES public.users(id)    ON DELETE CASCADE,
  day_of_week   INTEGER     NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_working    BOOLEAN     NOT NULL DEFAULT true,
  start_time    TIME,
  end_time      TIME,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, day_of_week)
);

ALTER TABLE public.employee_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_read_employee_schedules"   ON public.employee_schedules FOR SELECT USING (tenant_id = public.get_my_tenant_id());
CREATE POLICY "tenant_insert_employee_schedules" ON public.employee_schedules FOR INSERT WITH CHECK (tenant_id = public.get_my_tenant_id());
CREATE POLICY "tenant_update_employee_schedules" ON public.employee_schedules FOR UPDATE USING (tenant_id = public.get_my_tenant_id());
CREATE POLICY "tenant_delete_employee_schedules" ON public.employee_schedules FOR DELETE USING (tenant_id = public.get_my_tenant_id());
CREATE POLICY "service_role_bypass_emp_schedules" ON public.employee_schedules FOR ALL TO service_role USING (true);

CREATE INDEX IF NOT EXISTS idx_employee_schedules_user ON public.employee_schedules (user_id, day_of_week);
