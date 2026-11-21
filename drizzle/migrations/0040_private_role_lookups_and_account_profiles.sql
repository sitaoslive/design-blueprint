CREATE OR REPLACE FUNCTION public.is_clinical(_uid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT (_uid=auth.uid() OR auth.role()='service_role' OR public.is_director(auth.uid())) AND EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_uid AND role IN ('veterinario','luis')); $$;
CREATE OR REPLACE FUNCTION public.can_refer(_uid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT (_uid=auth.uid() OR auth.role()='service_role' OR public.is_director(auth.uid())) AND public.has_any_role(_uid,ARRAY['veterinario','coordinador','recepcion','luis','administrador']::public.app_role[]); $$;
CREATE OR REPLACE FUNCTION public.is_aux_only(_uid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT (_uid=auth.uid() OR auth.role()='service_role' OR public.is_director(auth.uid())) AND public.has_role(_uid,'auxiliar') AND NOT public.has_any_role(_uid,ARRAY['veterinario','coordinador','recepcion','finanzas','administrador','luis','soporte','consultor']::public.app_role[]); $$;
REVOKE ALL ON FUNCTION public.is_clinical(uuid),public.can_refer(uuid),public.is_aux_only(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.is_clinical(uuid),public.can_refer(uuid),public.is_aux_only(uuid) TO authenticated,service_role;
CREATE OR REPLACE FUNCTION public.guard_account_profile_assignment() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
IF auth.uid() IS NULL OR auth.role()='service_role' THEN RETURN NEW; END IF;
IF NOT public.is_director(auth.uid()) THEN RAISE EXCEPTION 'Solo Administración asigna perfiles'; END IF;
IF NEW.user_id=auth.uid() THEN RAISE EXCEPTION 'No puedes modificar tu propio perfil'; END IF;
IF NEW.role NOT IN ('cliente','administrador','luis','veterinario','auxiliar') THEN RAISE EXCEPTION 'Perfil fuera del catálogo activo'; END IF;
IF NEW.role IN ('luis','veterinario') AND NOT public.has_role(auth.uid(),'luis') THEN RAISE EXCEPTION 'Solo Luis asigna su perfil de Dueño y Veterinario'; END IF;
IF NEW.role='veterinario' AND NOT public.has_role(NEW.user_id,'luis') THEN RAISE EXCEPTION 'El perfil veterinario activo pertenece a Luis'; END IF;
RETURN NEW; END $$;
CREATE TRIGGER active_account_profile_guard BEFORE INSERT OR UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.guard_account_profile_assignment();
REVOKE ALL ON FUNCTION public.guard_account_profile_assignment() FROM PUBLIC,anon;
CREATE OR REPLACE FUNCTION public.set_account_profile(_user_id uuid,_profile text) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$ DECLARE selected public.app_role[]; BEGIN
IF auth.uid() IS NULL OR NOT public.is_director(auth.uid()) THEN RAISE EXCEPTION 'Acceso no autorizado'; END IF;
IF _user_id=auth.uid() THEN RAISE EXCEPTION 'No puedes modificar tu propio perfil'; END IF;
IF _profile NOT IN ('cliente','administrador','luis','auxiliar') THEN RAISE EXCEPTION 'Perfil fuera del catálogo activo'; END IF;
PERFORM pg_advisory_xact_lock(hashtextextended(_user_id::text,0));
IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=_user_id) THEN RAISE EXCEPTION 'Cuenta no encontrada'; END IF;
IF (_profile='luis' OR public.has_role(_user_id,'luis')) AND NOT public.has_role(auth.uid(),'luis') THEN RAISE EXCEPTION 'Solo Luis modifica perfiles de Dueño y Veterinario'; END IF;
selected:=CASE _profile WHEN 'luis' THEN ARRAY['luis','administrador','veterinario']::public.app_role[] ELSE ARRAY[_profile::public.app_role] END;
DELETE FROM public.user_roles WHERE user_id=_user_id AND role IN ('cliente','administrador','luis','veterinario','auxiliar');
INSERT INTO public.user_roles(user_id,role) SELECT _user_id,role FROM unnest(selected) WITH ORDINALITY AS chosen(role,pos) ORDER BY pos;
RETURN jsonb_build_object('userId',_user_id,'profile',_profile,'roles',(SELECT jsonb_agg(role ORDER BY role) FROM public.user_roles WHERE user_id=_user_id)); END $$;
REVOKE ALL ON FUNCTION public.set_account_profile(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.set_account_profile(uuid,text) TO authenticated,service_role;