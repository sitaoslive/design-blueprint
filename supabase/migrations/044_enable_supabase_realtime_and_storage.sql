-- Migration 044: Enable Supabase Realtime publication and Storage access policies for Lovable
-- Date: 2026-11-21
-- Purpose: Provide real-time event streaming and secure medical/referral document access for Lovable frontend.

-- 1. Realtime Publications
ALTER TABLE public.appointments REPLICA IDENTITY FULL;
ALTER TABLE public.appointment_requests REPLICA IDENTITY FULL;
ALTER TABLE public.delay_incidents REPLICA IDENTITY FULL;
ALTER TABLE public.eta_predictions REPLICA IDENTITY FULL;
ALTER TABLE public.operational_tasks REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.visit_timing_records REPLICA IDENTITY FULL;
ALTER TABLE public.tracking_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.integration_incidents REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'appointments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE 
      public.appointments,
      public.appointment_requests,
      public.delay_incidents,
      public.eta_predictions,
      public.operational_tasks,
      public.conversations,
      public.messages,
      public.visit_timing_records,
      public.tracking_sessions,
      public.integration_incidents;
  END IF;
END $$;

-- 2. Storage Policies for Lovable Authenticated Staff
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow authenticated staff to upload medical records'
  ) THEN
    CREATE POLICY "Allow authenticated staff to upload medical records"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id IN ('medical-records', 'referral-documents')
      AND (EXISTS (SELECT 1 FROM public.organization_memberships WHERE user_id = auth.uid()))
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow authenticated staff to read medical records'
  ) THEN
    CREATE POLICY "Allow authenticated staff to read medical records"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id IN ('medical-records', 'referral-documents')
      AND (EXISTS (SELECT 1 FROM public.organization_memberships WHERE user_id = auth.uid()))
    );
  END IF;
END $$;

-- 3. Security Hardening on Anon Execution
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;
GRANT EXECUTE ON FUNCTION public.validate_customer_tracking_view(text) TO anon;
