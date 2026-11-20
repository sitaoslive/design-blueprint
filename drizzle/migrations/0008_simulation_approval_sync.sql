CREATE OR REPLACE FUNCTION public.guard_simulation() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('simulado','propuesto','aprobado','ejecutado','rechazado') THEN RAISE EXCEPTION 'Estado inválido'; END IF;
  IF NEW.status = 'aprobado' AND OLD.status <> 'aprobado' AND NOT public.is_director(auth.uid())
     AND NOT EXISTS (SELECT 1 FROM public.approvals a WHERE a.id = NEW.approval_id AND a.status = 'aprobada') THEN
    RAISE EXCEPTION 'Solo dirección aprueba escenarios';
  END IF;
  IF NEW.status = 'ejecutado' AND OLD.status NOT IN ('aprobado','ejecutado') THEN RAISE EXCEPTION 'Solo se ejecuta un escenario aprobado'; END IF;
  RETURN NEW;
END $$;