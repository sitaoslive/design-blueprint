DROP POLICY IF EXISTS "rep insert" ON public.specialist_reports;
CREATE POLICY "rep insert" ON public.specialist_reports FOR INSERT TO authenticated
WITH CHECK (
  author = auth.uid() AND (
    public.is_clinical(auth.uid())
    OR (
      public.has_role(auth.uid(), 'especialista')
      AND (
        referral_id IS NULL
        OR EXISTS (SELECT 1 FROM public.referrals r WHERE r.id = referral_id AND r.specialist IS NOT NULL AND r.specialist = public.my_specialist_name())
      )
    )
  )
);

DROP POLICY IF EXISTS "slots own" ON public.specialist_slots;
CREATE POLICY "slots own" ON public.specialist_slots FOR ALL TO authenticated
USING (user_id = auth.uid() OR public.is_staff(auth.uid()))
WITH CHECK (user_id = auth.uid() AND (public.has_role(auth.uid(), 'especialista') OR public.is_staff(auth.uid())));

CREATE OR REPLACE FUNCTION public.offer_is_live(_ref text, _offer text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (public.owns_referral(_ref) OR public.is_staff(auth.uid())) AND EXISTS (SELECT 1 FROM public.referral_cases c, jsonb_array_elements(c.offers) o
    WHERE c.referral_id = _ref AND c.state IN ('AWAITING_CUSTOMER_SELECTION','OPTIONS_SENT_TO_CUSTOMER')
      AND o->>'id' = _offer AND (o->>'expiresAt')::timestamptz > now() AND ((o->>'date') || 'T' || (o->>'time'))::timestamp > now())
$$;
REVOKE EXECUTE ON FUNCTION public.offer_is_live(text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.offer_is_live(text,text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.apply_field_handover() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.escalate_blocked_field_task() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_field_collection_contract() FROM PUBLIC, anon, authenticated;