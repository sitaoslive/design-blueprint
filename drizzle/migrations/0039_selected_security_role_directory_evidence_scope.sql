CREATE OR REPLACE FUNCTION public.is_director(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
 SELECT EXISTS (SELECT 1 FROM public.user_roles target WHERE target.user_id = _uid AND target.role IN ('administrador','luis'))
 AND (_uid = auth.uid() OR auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM public.user_roles caller WHERE caller.user_id = auth.uid() AND caller.role IN ('administrador','luis')));
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles public.app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = ANY(_roles)); $$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role); $$;

CREATE OR REPLACE FUNCTION public.is_ops(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$ SELECT public.has_any_role(_uid, ARRAY['coordinador','recepcion','administrador','luis']::public.app_role[]); $$;

CREATE OR REPLACE FUNCTION public.is_staff(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$ SELECT public.has_any_role(_uid, ARRAY['veterinario','auxiliar','coordinador','recepcion','finanzas','administrador','luis']::public.app_role[]); $$;

REVOKE ALL ON FUNCTION public.has_any_role(uuid,public.app_role[]), public.has_role(uuid,public.app_role), public.is_ops(uuid), public.is_staff(uuid), public.is_director(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid,public.app_role[]), public.has_role(uuid,public.app_role), public.is_ops(uuid), public.is_staff(uuid), public.is_director(uuid) TO authenticated, service_role;

ALTER POLICY "Usuarios ven flags" ON public.feature_flags TO authenticated USING (public.is_staff(auth.uid()) OR public.has_role(auth.uid(),'soporte'));
ALTER POLICY "staff read" ON public.staff_members TO authenticated USING (
 public.is_staff(auth.uid()) OR user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.visits v WHERE v.staff_id = staff_members.id AND (public.owns_pet(v.pet_id) OR public.is_caregiver_of(v.pet_id))
 )
);
ALTER POLICY "spec read" ON public.specialists TO authenticated USING (
 public.is_staff(auth.uid()) OR user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.referrals r WHERE (r.specialist = specialists.name OR r.specialty = specialists.specialty) AND (public.owns_pet(r.pet_id) OR public.is_caregiver_of(r.pet_id))
 )
);

CREATE OR REPLACE FUNCTION public.can_read_field_file(_path text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
 SELECT public.is_staff(auth.uid()) AND EXISTS (
  SELECT 1 FROM public.field_files f WHERE f.path = _path AND (
   public.is_ops(auth.uid()) OR (
    (f.visit_id IS NULL OR EXISTS (
     SELECT 1 FROM public.visits v WHERE v.id = f.visit_id AND (
      v.staff_id IN (SELECT public.my_staff_ids()) OR EXISTS (
       SELECT 1 FROM public.visit_participants p WHERE p.visit_id = v.id AND p.active AND p.staff_id IN (SELECT public.my_staff_ids())
      )
     )
    ))
    AND (f.task_id IS NULL OR EXISTS (
     SELECT 1 FROM public.tasks t WHERE t.id = f.task_id AND t.staff_id IN (SELECT public.my_staff_ids()) AND (
      t.visit_id IS NULL OR EXISTS (
       SELECT 1 FROM public.visits tv WHERE tv.id = t.visit_id AND (
        tv.staff_id IN (SELECT public.my_staff_ids()) OR EXISTS (
         SELECT 1 FROM public.visit_participants tp WHERE tp.visit_id = tv.id AND tp.active AND tp.staff_id IN (SELECT public.my_staff_ids())
        )
       )
      )
     )
    ))
    AND (f.visit_id IS NOT NULL OR f.task_id IS NOT NULL OR f.user_id = auth.uid() OR f.to_staff IN (SELECT public.my_staff_ids()) OR EXISTS (
     SELECT 1 FROM public.staff_messages m WHERE m.attachment_path = f.path AND m.to_staff IS NULL AND m.visit_id IS NULL AND m.task_id IS NULL
    ))
   )
  )
 );
$$;
REVOKE ALL ON FUNCTION public.can_read_field_file(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_read_field_file(text) TO authenticated, service_role;