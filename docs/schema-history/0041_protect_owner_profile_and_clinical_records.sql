CREATE POLICY "owner profile revocation protected" ON public.user_roles AS RESTRICTIVE FOR DELETE TO authenticated USING (role NOT IN ('luis','veterinario') OR public.has_role(auth.uid(),'luis'));
CREATE OR REPLACE FUNCTION public.guard_clinical_record_authority() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
IF auth.uid() IS NULL OR auth.role()='service_role' THEN RETURN NEW; END IF;
IF (NEW.kind IN ('ejecucion_tratamiento','dosis') OR (TG_OP='UPDATE' AND OLD.kind IN ('ejecucion_tratamiento','dosis'))) AND NOT public.is_clinical(auth.uid()) THEN RAISE EXCEPTION 'Solo Luis o un veterinario registra dosis'; END IF;
RETURN NEW; END $$;
CREATE TRIGGER records_clinical_authority_guard BEFORE INSERT OR UPDATE ON public.records FOR EACH ROW EXECUTE FUNCTION public.guard_clinical_record_authority();
REVOKE ALL ON FUNCTION public.guard_clinical_record_authority() FROM PUBLIC,anon;