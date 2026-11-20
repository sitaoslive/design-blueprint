CREATE TABLE public.client_settings (
  user_id uuid PRIMARY KEY DEFAULT auth.uid(),
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  consents jsonb NOT NULL DEFAULT '{}'::jsonb,
  addresses jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.client_settings TO authenticated;
GRANT ALL ON public.client_settings TO service_role;
ALTER TABLE public.client_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own settings" ON public.client_settings FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid())) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.org_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.org_settings TO authenticated;
GRANT ALL ON public.org_settings TO service_role;
ALTER TABLE public.org_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org read" ON public.org_settings FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "org insert" ON public.org_settings FOR INSERT TO authenticated WITH CHECK (public.is_director(auth.uid()));
CREATE POLICY "org update" ON public.org_settings FOR UPDATE TO authenticated USING (public.is_director(auth.uid()));

INSERT INTO public.org_settings (key, value) VALUES
 ('organizacion', '{"Nombre comercial":"Vet Life","Ciudad":"Bogotá","NIT":"Pendiente","Teléfono":"Pendiente"}'),
 ('identidad', '{"Color principal":"Terracota #BF5738","Logo":"Provisional (huella)","Tono":"Cercano y profesional"}'),
 ('zonas', '{"Zona Norte":"Activa","Zona Centro":"Activa","Zona Sur":"Activa"}'),
 ('horarios', '{"Lunes a viernes":"07:00 - 19:00","Sábado":"08:00 - 14:00","Domingo":"Solo urgencias coordinadas"}'),
 ('servicios', '{"Consulta general":"60 min","Control preventivo":"45 min","Vacunación":"30 min","Control recurrente":"45 min","Curación":"40 min","Toma de muestras":"30 min"}'),
 ('tarifas', '{"Consulta general":"180000","Control preventivo":"150000","Vacunación":"95000","Recargo zona lejana":"25000"}'),
 ('politicas', '{"Cancelación":"Sin costo hasta 12 horas antes","Reprogramación":"Hasta 2 veces por cita","Pagos":"Antes o al finalizar la visita"}'),
 ('privacidad', '{"Responsable de datos":"Administración Vet Life","Retención historial":"10 años","Ley aplicable":"Ley 1581 de 2012 (Colombia)"}'),
 ('seguridad', '{"Contraseña mínima":"8 caracteres","Cierre de sesión por inactividad":"Pendiente","Doble factor":"Pendiente"}');