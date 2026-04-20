CREATE TABLE IF NOT EXISTS public.employee_services (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID  NOT NULL REFERENCES public.tenants(id)   ON DELETE CASCADE,
  user_id     UUID  NOT NULL REFERENCES public.users(id)     ON DELETE CASCADE,
  service_id  UUID  NOT NULL REFERENCES public.services(id)  ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, service_id)
);
ALTER TABLE public.employee_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_read_employee_services"    ON public.employee_services FOR SELECT USING (tenant_id = public.get_my_tenant_id());
CREATE POLICY "tenant_insert_employee_services"  ON public.employee_services FOR INSERT WITH CHECK (tenant_id = public.get_my_tenant_id());
CREATE POLICY "tenant_delete_employee_services"  ON public.employee_services FOR DELETE USING (tenant_id = public.get_my_tenant_id());
CREATE POLICY "service_role_bypass_emp_services" ON public.employee_services FOR ALL TO service_role USING (true);
CREATE INDEX IF NOT EXISTS idx_employee_services_user ON public.employee_services (user_id);
