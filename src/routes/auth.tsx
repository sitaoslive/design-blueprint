import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { meta } from "@/lib/vf/meta";
import { PawIcon, Btn } from "@/components/vf/ui";
import { Eye, EyeOff, Wrench, Crown, ShieldCheck, CheckCircle2, Lock } from "lucide-react";

export const Route = createFileRoute("/auth")({
  validateSearch: (
    s: Record<string, unknown>,
  ): { next: string | undefined; mode?: "up" | "in"; product?: string } => ({
    next:
      typeof s["next"] === "string" && s["next"].startsWith("/") && !s["next"].startsWith("//")
        ? s["next"]
        : undefined,
    ...(s["mode"] === "up" ? { mode: "up" } : {}),
    ...(typeof s["product"] === "string" ? { product: s["product"] } : {}),
  }),
  head: () => meta("Iniciar Sesión · Alpha Vision Platform", "Accede a tu cuenta de Vet Freedom OS, Alpha Service OS o Super Admin."),
  component: AuthPage,
});

function AuthPage() {
  const { next, mode: initialMode, product: initialProduct } = Route.useSearch();
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up" | "reset">(initialMode ?? "in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  // Determine branding based on URL params or next destination
  const isContractor =
    initialProduct === "contractor" ||
    (typeof next === "string" && next.includes("/contractor"));

  const isAdmin =
    initialProduct === "admin" ||
    (typeof next === "string" && next.includes("/admin"));

  const go = () => {
    sessionStorage.removeItem("vf_demo");
    void nav({ to: (next ?? "/") as "/" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
        go();
      } else if (mode === "up") {
        const { error } = await supabase.auth.signUp({
          email,
          password: pw,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Revisa tu correo para confirmar la cuenta.");
        setMode("in");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Te enviamos un enlace para cambiar la contraseña.");
      }
    } catch (err) {
      const error = err as { code?: string; message?: string };
      toast.error(
        error.code === "email_not_confirmed"
          ? "Confirma tu correo desde el enlace recibido antes de entrar."
          : (error.message ?? "No se pudo iniciar sesión."),
      );
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    if (next) sessionStorage.setItem("vf-next", next);
    const r = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (r.error) {
      toast.error("No se pudo entrar con Google");
      return;
    }
    if (r.redirected) return;
    go();
  };

  const field =
    "w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary text-foreground";

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-8">
      {/* Background Decorative Icon */}
      {isContractor ? (
        <Wrench className="pointer-events-none absolute -right-10 top-10 h-64 w-64 rotate-12 text-amber-500/5" />
      ) : isAdmin ? (
        <Crown className="pointer-events-none absolute -right-10 top-10 h-64 w-64 rotate-12 text-amber-400/5" />
      ) : (
        <PawIcon className="pointer-events-none absolute -right-8 top-8 h-56 w-56 rotate-12 text-paw" />
      )}

      <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          {isContractor ? (
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-lg shadow-orange-500/20 mb-3">
              <Wrench className="w-6 h-6 text-white" />
            </div>
          ) : isAdmin ? (
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 mb-3">
              <Crown className="w-6 h-6 text-slate-950" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-primary mb-3">
              <PawIcon className="w-7 h-7 text-primary" />
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black text-foreground">
              {isContractor
                ? "Alpha Service OS"
                : isAdmin
                ? "Alpha Vision Control Plane"
                : "Vet Freedom OS"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isContractor
              ? "Acceso a Operaciones de Contratistas & Campo"
              : isAdmin
              ? "Super Admin Maestro & Gobernanza SaaS"
              : "Software Clínico & Domiciliario"}
          </p>
        </div>

        {/* Title */}
        <div className="mb-5 text-center">
          <h1 className="text-2xl font-black text-foreground">
            {mode === "in" ? "Iniciar Sesión" : mode === "up" ? "Crear Cuenta" : "Recuperar Contraseña"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {mode === "in"
              ? "Ingresa tus credenciales autorizadas"
              : mode === "up"
              ? "Registra tu perfil para comenzar"
              : "Te enviaremos un correo con instrucciones"}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={submit} className="space-y-3.5">
          {mode === "up" && (
            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                Nombre Completo
              </label>
              <input
                required
                placeholder="Ej. Dr. Carlos Mendoza"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={field}
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-muted-foreground block mb-1">
              Correo Electrónico
            </label>
            <input
              required
              type="email"
              placeholder="tu@correo.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
          </div>

          {mode !== "reset" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-muted-foreground">
                  Contraseña
                </label>
                {mode === "in" && (
                  <button
                    type="button"
                    onClick={() => setMode("reset")}
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    ¿Olvidaste tu clave?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete={mode === "in" ? "current-password" : "new-password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className={`${field} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === "up" && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  Usa al menos 8 caracteres para máxima seguridad.
                </p>
              )}
            </div>
          )}

          <Btn
            type="submit"
            disabled={busy}
            className={`w-full py-3.5 text-sm font-extrabold shadow-button ${
              isContractor ? "bg-amber-500 hover:bg-amber-600 text-slate-950" : ""
            }`}
          >
            {busy
              ? "Validando..."
              : mode === "in"
              ? "Entrar al Sistema"
              : mode === "up"
              ? "Registrar Cuenta"
              : "Enviar Enlace de Recuperación"}
          </Btn>
        </form>

        {mode !== "reset" && (
          <>
            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground font-semibold">o continúa con</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <button
              type="button"
              onClick={google}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-accent transition"
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              <span>Continuar con Google</span>
            </button>
          </>
        )}

        <div className="mt-5 space-y-2 text-center text-xs">
          {mode !== "in" && (
            <button
              className="text-primary font-bold hover:underline"
              onClick={() => setMode("in")}
            >
              ¿Ya tienes cuenta? Inicia sesión aquí
            </button>
          )}

          {mode === "in" && (
            <button
              className="block w-full text-primary font-bold hover:underline"
              onClick={() => setMode("up")}
            >
              ¿Aún no tienes cuenta? Regístrate gratis
            </button>
          )}

          <div className="pt-2">
            <Link
              to={isContractor ? "/contractors" : isAdmin ? "/admin" : "/"}
              className="text-xs text-muted-foreground hover:text-foreground transition"
            >
              ← Volver al portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
