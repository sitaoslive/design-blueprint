ALTER POLICY "pay read" ON public.payments USING (public.has_any_role(auth.uid(),ARRAY['finanzas','administrador','luis']::public.app_role[]) OR client_id=auth.uid());
ALTER POLICY "pay staff insert" ON public.payments WITH CHECK (false);
CREATE OR REPLACE FUNCTION public.guard_financial_authority() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
IF auth.uid() IS NULL THEN RETURN NEW; END IF;
IF TG_OP='INSERT' AND NEW.status<>'pendiente' THEN RAISE EXCEPTION 'Solo se preparan cargos pendientes; autoridad de pago oficial no conectada'; END IF;
IF TG_OP='UPDATE' AND (OLD.status<>'pendiente' OR NEW.status<>OLD.status OR NEW.client_id IS DISTINCT FROM OLD.client_id) THEN RAISE EXCEPTION 'Modificar un cargo oficial requiere autoridad financiera verificada'; END IF;
IF NEW.amount<=0 THEN RAISE EXCEPTION 'Importe positivo requerido'; END IF; RETURN NEW; END $$;
CREATE TRIGGER payments_authority_guard BEFORE INSERT OR UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.guard_financial_authority();
REVOKE ALL ON FUNCTION public.guard_financial_authority() FROM PUBLIC,anon,authenticated;
CREATE POLICY "reserved financial reads" ON public.records AS RESTRICTIVE FOR SELECT TO authenticated USING (CASE WHEN kind LIKE 'finance_%' OR kind='administrative_import_preparation' THEN scope='director' AND public.is_director(auth.uid()) WHEN kind='cobro_campo' THEN public.has_any_role(auth.uid(),ARRAY['finanzas','luis','administrador','coordinador','recepcion']::public.app_role[]) OR created_by=auth.uid() ELSE true END);
CREATE POLICY "reserved financial inserts" ON public.records AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (CASE WHEN kind LIKE 'finance_%' OR kind='administrative_import_preparation' THEN scope='director' AND public.is_director(auth.uid()) ELSE true END);
CREATE POLICY "reserved financial updates" ON public.records AS RESTRICTIVE FOR UPDATE TO authenticated USING (CASE WHEN kind LIKE 'finance_%' OR kind='administrative_import_preparation' THEN false ELSE true END) WITH CHECK (CASE WHEN kind LIKE 'finance_%' OR kind='administrative_import_preparation' THEN false ELSE true END);
CREATE OR REPLACE FUNCTION public.guard_reserved_preparation() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
IF auth.uid() IS NULL THEN RETURN NEW; END IF;
IF TG_OP='UPDATE' AND (OLD.kind LIKE 'finance_%' OR OLD.kind='administrative_import_preparation') THEN RAISE EXCEPTION 'Preparación inmutable: registra otra revisión'; END IF;
IF NEW.kind LIKE 'finance_%' OR NEW.kind='administrative_import_preparation' THEN
IF NOT public.is_director(auth.uid()) OR NEW.scope<>'director' OR NEW.created_by IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'Preparación reservada a Dirección'; END IF;
IF NEW.kind='administrative_import_preparation' THEN
IF TG_OP<>'INSERT' OR NEW.status<>'PREPARED_DRAFT' OR NEW.owner_id IS DISTINCT FROM auth.uid() OR NEW.id::text IS DISTINCT FROM NEW.data->>'requestId' OR jsonb_typeof(NEW.data) IS DISTINCT FROM 'object' OR NEW.data ?| ARRAY['rows','csv','file','token'] OR NOT (NEW.data->>'authorizedFile'='true' AND NEW.data->>'mappingReviewed'='true') THEN RAISE EXCEPTION 'Solo metadatos de preparación; sin autorización oficial'; END IF;
ELSE IF NEW.status<>'requested' THEN RAISE EXCEPTION 'Borrador financiero no equivale a pago verificado'; END IF; END IF; END IF; RETURN NEW; END $$;
CREATE TRIGGER records_reserved_guard BEFORE INSERT OR UPDATE ON public.records FOR EACH ROW EXECUTE FUNCTION public.guard_reserved_preparation();
REVOKE ALL ON FUNCTION public.guard_reserved_preparation() FROM PUBLIC,anon,authenticated;