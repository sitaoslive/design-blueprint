CREATE TABLE public.visit_participants (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),visit_id text NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,staff_id text NOT NULL REFERENCES public.staff_members(id),active boolean NOT NULL DEFAULT true,support_state text NOT NULL DEFAULT 'ASSIGNED' CHECK(support_state IN ('ASSIGNED','PREPARING','READY','EN_ROUTE','ARRIVED','COMPLETED')),prep_checked text[] NOT NULL DEFAULT '{}',version integer NOT NULL DEFAULT 1,history jsonb NOT NULL DEFAULT '[]',created_by uuid DEFAULT auth.uid(),created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(visit_id,staff_id));
GRANT SELECT,INSERT,UPDATE ON public.visit_participants TO authenticated; GRANT ALL ON public.visit_participants TO service_role; ALTER TABLE public.visit_participants ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.can_access_field_visit(_visit text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT public.is_staff(auth.uid()) AND EXISTS (SELECT 1 FROM public.visits v WHERE v.id=_visit AND (NOT public.is_aux_only(auth.uid()) OR v.staff_id IN (SELECT public.my_staff_ids()) OR EXISTS(SELECT 1 FROM public.visit_participants p WHERE p.visit_id=v.id AND p.staff_id IN(SELECT public.my_staff_ids()) AND p.active))) $$;
REVOKE ALL ON FUNCTION public.can_access_field_visit(text) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.can_access_field_visit(text) TO authenticated,service_role;
CREATE POLICY "participants read" ON public.visit_participants FOR SELECT TO authenticated USING (public.can_access_field_visit(visit_id));
CREATE POLICY "participants assign" ON public.visit_participants FOR INSERT TO authenticated WITH CHECK(public.is_ops(auth.uid()));
CREATE POLICY "participants update" ON public.visit_participants FOR UPDATE TO authenticated USING(public.is_ops(auth.uid()) OR staff_id IN(SELECT public.my_staff_ids())) WITH CHECK(public.is_ops(auth.uid()) OR staff_id IN(SELECT public.my_staff_ids()));
CREATE POLICY "shared visits read" ON public.visits FOR SELECT TO authenticated USING(public.can_access_field_visit(id));
CREATE POLICY "shared execution read" ON public.visit_executions FOR SELECT TO authenticated USING(public.can_access_field_visit(visit_id));
CREATE OR REPLACE FUNCTION public.aux_sees_pet(_pet text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.visits v WHERE v.pet_id=_pet AND public.can_access_field_visit(v.id)) $$;
CREATE OR REPLACE FUNCTION public.guard_support_participant() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ DECLARE nxt text; BEGIN
 IF TG_OP='INSERT' THEN
  IF NOT public.is_ops(auth.uid()) AND auth.uid() IS NOT NULL THEN RAISE EXCEPTION 'Solo Coordinación asigna auxiliares'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.staff_members m WHERE m.id=NEW.staff_id AND m.role='Auxiliar') THEN RAISE EXCEPTION 'Elige un auxiliar'; END IF;
  IF EXISTS(SELECT 1 FROM public.visits v WHERE v.id=NEW.visit_id AND v.status IN('finalizada','cancelada')) THEN RAISE EXCEPTION 'No se cambia una visita resuelta'; END IF;
  NEW.support_state:='ASSIGNED';NEW.version:=1;NEW.history:=jsonb_build_array(jsonb_build_object('state','ASSIGNED','actor',auth.uid(),'at',now()));RETURN NEW;
 END IF;
 IF NEW.visit_id<>OLD.visit_id OR NEW.staff_id<>OLD.staff_id OR NEW.created_by IS DISTINCT FROM OLD.created_by THEN RAISE EXCEPTION 'No puedes cambiar la identidad de la participación'; END IF;
 IF NOT OLD.active OR OLD.support_state='COMPLETED' THEN RAISE EXCEPTION 'Esta participación ya está resuelta'; END IF;
 IF NEW.active<>OLD.active AND NOT public.is_ops(auth.uid()) THEN RAISE EXCEPTION 'Solo Coordinación cambia la asignación'; END IF;
 IF NEW.support_state<>OLD.support_state THEN
  IF NEW.staff_id NOT IN(SELECT public.my_staff_ids()) THEN RAISE EXCEPTION 'Cada auxiliar registra su propio apoyo'; END IF;
  nxt:=CASE OLD.support_state WHEN 'ASSIGNED' THEN 'PREPARING' WHEN 'PREPARING' THEN 'READY' WHEN 'READY' THEN 'EN_ROUTE' WHEN 'EN_ROUTE' THEN 'ARRIVED' WHEN 'ARRIVED' THEN 'COMPLETED' END;
  IF NEW.support_state IS DISTINCT FROM nxt OR NEW.version<>OLD.version+1 THEN RAISE EXCEPTION 'Paso o versión de apoyo inválidos'; END IF;
  IF NEW.support_state='READY' AND NOT (coalesce((SELECT prep FROM public.visits WHERE id=NEW.visit_id),'{}') <@ NEW.prep_checked) THEN RAISE EXCEPTION 'Completa la preparación antes de salir'; END IF;
  NEW.history:=OLD.history||jsonb_build_array(jsonb_build_object('state',NEW.support_state,'actor',auth.uid(),'at',now()));
 ELSE
  IF NEW.version<>OLD.version THEN RAISE EXCEPTION 'La participación cambió'; END IF;
  IF NEW.prep_checked IS DISTINCT FROM OLD.prep_checked AND (NEW.staff_id NOT IN(SELECT public.my_staff_ids()) OR OLD.support_state NOT IN('ASSIGNED','PREPARING')) THEN RAISE EXCEPTION 'Solo puedes preparar tu apoyo antes de salir'; END IF;
  NEW.history:=OLD.history;
 END IF;RETURN NEW;END $$;
REVOKE ALL ON FUNCTION public.guard_support_participant() FROM PUBLIC,anon;
CREATE TRIGGER support_participant_guard BEFORE INSERT OR UPDATE ON public.visit_participants FOR EACH ROW EXECUTE FUNCTION public.guard_support_participant();
ALTER TABLE public.tasks ADD COLUMN stage text CHECK(stage IN('assigned','accepted','in_progress','blocked','completed','cancelled')),ADD COLUMN visit_id text REFERENCES public.visits(id),ADD COLUMN due_at timestamptz,ADD COLUMN critical boolean NOT NULL DEFAULT false,ADD COLUMN reason text NOT NULL DEFAULT '',ADD COLUMN version integer NOT NULL DEFAULT 1,ADD COLUMN history jsonb NOT NULL DEFAULT '[]';
CREATE OR REPLACE FUNCTION public.guard_advanced_task() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ DECLARE prev text;nxt text; BEGIN
 IF TG_OP='INSERT' THEN
  IF auth.uid() IS NOT NULL AND NOT public.is_ops(auth.uid()) THEN RAISE EXCEPTION 'Solo Coordinación asigna tareas'; END IF;
  NEW.stage:=CASE WHEN NEW.done THEN 'completed' ELSE 'assigned' END;NEW.version:=1;NEW.history:=jsonb_build_array(jsonb_build_object('state',NEW.stage,'actor',auth.uid(),'at',now()));RETURN NEW;
 END IF;
 prev:=coalesce(OLD.stage,CASE WHEN OLD.done THEN 'completed' ELSE 'assigned' END);
 IF prev IN('completed','cancelled') THEN RAISE EXCEPTION 'Una tarea resuelta no se modifica'; END IF;
 IF NOT public.is_ops(auth.uid()) AND (NEW.staff_id IS DISTINCT FROM OLD.staff_id OR NEW.title<>OLD.title OR NEW.visit_id IS DISTINCT FROM OLD.visit_id OR NEW.due_at IS DISTINCT FROM OLD.due_at OR NEW.critical<>OLD.critical) THEN RAISE EXCEPTION 'Solo Coordinación cambia la asignación'; END IF;
 nxt:=coalesce(NEW.stage,CASE WHEN NEW.done THEN 'completed' ELSE 'assigned' END);
 IF NEW.done<>OLD.done AND nxt=prev THEN nxt:=CASE WHEN NEW.done THEN 'completed' ELSE 'assigned' END; END IF;
 IF nxt<>prev THEN
  IF NEW.version<>OLD.version+1 THEN RAISE EXCEPTION 'La tarea cambió; recarga'; END IF;
  IF NOT ((prev='assigned' AND nxt='accepted') OR (prev='accepted' AND nxt IN('in_progress','blocked')) OR (prev='in_progress' AND nxt IN('completed','blocked')) OR (prev='blocked' AND nxt='in_progress') OR (nxt='cancelled' AND public.is_ops(auth.uid()))) THEN RAISE EXCEPTION 'Paso de tarea no permitido'; END IF;
  IF nxt IN('blocked','cancelled') AND btrim(NEW.reason)='' THEN RAISE EXCEPTION 'Indica el motivo'; END IF;
  NEW.history:=OLD.history||jsonb_build_array(jsonb_build_object('from',prev,'state',nxt,'reason',NEW.reason,'actor',auth.uid(),'at',now()));
 ELSE NEW.history:=OLD.history;NEW.version:=OLD.version; END IF;
 NEW.stage:=nxt;NEW.done:=nxt='completed';RETURN NEW;END $$;
REVOKE ALL ON FUNCTION public.guard_advanced_task() FROM PUBLIC,anon;
CREATE TRIGGER advanced_task_guard BEFORE INSERT OR UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.guard_advanced_task();
CREATE OR REPLACE FUNCTION public.field_task_transition(_id text,_stage text,_version integer,_reason text DEFAULT '') RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF NOT public.is_staff(auth.uid()) OR NOT EXISTS(SELECT 1 FROM public.tasks t WHERE t.id=_id AND (public.is_ops(auth.uid()) OR t.staff_id IN(SELECT public.my_staff_ids()))) THEN RAISE EXCEPTION 'No tienes acceso a esta tarea'; END IF;
 UPDATE public.tasks SET stage=_stage,version=version+1,reason=coalesce(_reason,'') WHERE id=_id AND version=_version;
 IF NOT FOUND THEN RAISE EXCEPTION 'La tarea cambió; recarga'; END IF;END $$;
REVOKE ALL ON FUNCTION public.field_task_transition(text,text,integer,text) FROM PUBLIC,anon;GRANT EXECUTE ON FUNCTION public.field_task_transition(text,text,integer,text) TO authenticated;
COMMENT ON COLUMN public.tasks.done IS 'Compatibility projection: true only when advanced stage is completed; existing resolved rows retained';