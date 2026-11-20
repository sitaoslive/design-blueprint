CREATE TABLE public.simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sim_type text NOT NULL,
  title text NOT NULL,
  params jsonb NOT NULL DEFAULT '{}'::jsonb,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'simulado',
  approval_id text,
  errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  executed_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.simulations TO authenticated;
GRANT ALL ON public.simulations TO service_role;
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sim read" ON public.simulations FOR SELECT TO authenticated USING (public.is_ops(auth.uid()));
CREATE POLICY "sim insert" ON public.simulations FOR INSERT TO authenticated WITH CHECK (public.is_ops(auth.uid()) AND status = 'simulado');
CREATE POLICY "sim update" ON public.simulations FOR UPDATE TO authenticated USING (public.is_ops(auth.uid())) WITH CHECK (public.is_ops(auth.uid()));

CREATE OR REPLACE FUNCTION public.guard_simulation() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('simulado','propuesto','aprobado','ejecutado','rechazado') THEN RAISE EXCEPTION 'Estado inválido'; END IF;
  IF NEW.status = 'aprobado' AND OLD.status <> 'aprobado' AND NOT public.is_director(auth.uid()) THEN RAISE EXCEPTION 'Solo dirección aprueba escenarios'; END IF;
  IF NEW.status = 'ejecutado' AND OLD.status <> 'aprobado' AND OLD.status <> 'ejecutado' THEN RAISE EXCEPTION 'Solo se ejecuta un escenario aprobado'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER simulations_guard BEFORE UPDATE ON public.simulations FOR EACH ROW EXECUTE FUNCTION public.guard_simulation();

CREATE POLICY "inc support read" ON public.incidents FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'soporte'));
CREATE POLICY "integ support read" ON public.integrations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'soporte'));

CREATE OR REPLACE FUNCTION public.consultant_metrics() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select case when public.has_any_role(auth.uid(), array['consultor','luis','administrador']::public.app_role[]) then jsonb_build_object(
    'visitas', (select count(*) from visits),
    'visitas_finalizadas', (select count(*) from visits where status = 'finalizada'),
    'visitas_pendientes', (select count(*) from visits where status in ('pendiente','pendiente_okvet')),
    'solicitudes', (select count(*) from service_requests),
    'solicitudes_nuevas', (select count(*) from service_requests where status = 'nueva'),
    'incidencias_abiertas', (select count(*) from incidents where status <> 'cerrada'),
    'incidencias_total', (select count(*) from incidents),
    'aprobaciones_pendientes', (select count(*) from approvals where status = 'pendiente'),
    'aprobaciones_total', (select count(*) from approvals),
    'remisiones_abiertas', (select count(*) from referrals where status <> 'cerrada'),
    'equipo', (select count(*) from staff_members),
    'carga_promedio', (select coalesce(round(avg(load)),0) from staff_members),
    'por_zona', (select coalesce(jsonb_object_agg(zone, n), '{}'::jsonb) from (select zone, count(*) n from visits group by zone) z)
  ) else null end
$$;
REVOKE EXECUTE ON FUNCTION public.consultant_metrics() FROM anon;
GRANT EXECUTE ON FUNCTION public.consultant_metrics() TO authenticated;