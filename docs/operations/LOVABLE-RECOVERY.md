# MANUAL DE RECONSTRUCCIÓN Y RECUPERACIÓN DE LOVABLE (VET-CORE-21)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Frontend:** Lovable Mobile-First Application  
**Destinatarios:** Ingeniero Full Stack Lovable, Dr. Luis Eduardo Ríos  

---

## 1. Arquitectura de la Aplicación Lovable
La interfaz de usuario móvil y centro operativo de Vet Life para el Dr. Luis Eduardo Ríos está desacoplada del backend:
- **Frontend:** Aplicación web mobile-first construida y versionada en GitHub vinculada a Lovable.
- **Backend:** Supabase PostgreSQL 17 (`sznvahhocgnhsqhksygq`) actuando como fuente de verdad única y capa de autorización mediante Row Level Security (RLS).
- **Consumo:** Cliente `@supabase/supabase-js` que invoca vistas relacionales y funciones RPC atómicas (`get_system_health_summary`, `get_conversation_context`, etc.).

---

## 2. Procedimiento de Recuperación ante Caída de Lovable
Si el entorno de Lovable sufre una desincronización, fallo de compilación o pérdida de acceso al proyecto:

### Paso 1: Verificación de Código Fuente en GitHub
1. Clonar el repositorio oficial desde GitHub.
2. Confirmar que la rama principal contenga los componentes, dependencias (`package.json`, `pnpm-lock.yaml`) y configuración de Tailwind/Vite.

### Paso 2: Re-vinculación con el Proyecto Lovable
1. En el panel de Lovable, seleccionar "Import from GitHub Repository".
2. Vincular el repositorio oficial de Vet Freedom OS.
3. Inyectar las variables de entorno públicas requeridas:
   - `VITE_SUPABASE_URL`: `https://sznvahhocgnhsqhksygq.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `sb_publishable_caToaYTxjdravNvXvDuVLg_htNwLZzI`

### Paso 3: Smoke Test de Interfaz
1. Verificar carga de la pantalla de inicio de sesión de personal.
2. Comprobar que la vista de salud del sistema invoque con éxito `public.get_system_health_summary()`.
3. Comprobar la visualización del listado de pacientes y agenda del día sin errores de hidratación ni fallos 401/403.
