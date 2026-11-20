import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { meta } from "@/lib/vf/meta";
import { PawIcon, Btn } from "@/components/vf/ui";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ next: typeof s["next"] === "string" && s["next"].startsWith("/") ? (s["next"] as string) : undefined }),
  head: () => meta("Entrar", "Inicia sesión en Vet Freedom OS."),
  component: AuthPage,
});

function AuthPage() {
  const { next } = Route.useSearch(); const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [name, setName] = useState(""); const [busy, setBusy] = useState(false);
  const go = () => nav({ to: (next ?? "/") as "/" });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (error) throw error; go();
      } else if (mode === "up") {
        const { error } = await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: window.location.origin, data: { full_name: name } } });
        if (error) throw error; toast.success("Revisa tu correo para confirmar la cuenta."); setMode("in");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error; toast.success("Te enviamos un enlace para cambiar la contraseña.");
      }
    } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
  };
  const google = async () => {
    if (next) sessionStorage.setItem("vf-next", next);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) { toast.error("No se pudo entrar con Google"); return; }
    if (r.redirected) return; go();
  };
  const field = "w-full rounded-2xl border border-border bg-card px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-ring";
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-5">
      <PawIcon className="pointer-events-none absolute -right-8 top-8 h-48 w-48 rotate-12 text-paw" />
      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2"><PawIcon className="h-9 w-9 text-primary" /><span className="text-2xl font-extrabold">Vet Freedom OS</span></div>
        <h1 className="mb-4 text-3xl font-extrabold">{mode === "in" ? "Entrar" : mode === "up" ? "Crear cuenta" : "Recuperar contraseña"}</h1>
        <form onSubmit={submit} className="space-y-3">
          {mode === "up" && <input required placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} className={field} />}
          <input required type="email" placeholder="Correo" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
          {mode !== "reset" && <input required type="password" minLength={8} placeholder="Contraseña" autoComplete={mode === "in" ? "current-password" : "new-password"} value={pw} onChange={(e) => setPw(e.target.value)} className={field} />}
          <Btn type="submit" disabled={busy} className="w-full py-4 text-lg">{mode === "in" ? "Entrar" : mode === "up" ? "Crear cuenta" : "Enviar enlace"}</Btn>
        </form>
        {mode !== "reset" && (<>
          <div className="my-4 text-center text-sm text-muted-foreground">o</div>
          <button type="button" onClick={google} className="flex w-full items-center justify-center gap-[10px] rounded-full border border-[#747775] bg-[#FFFFFF] px-3 py-3 text-[14px] font-medium leading-5 text-[#1F1F1F]">
            <svg aria-hidden="true" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
            Continuar con Google
          </button>
        </>)}
        <div className="mt-5 space-y-1 text-center">
          {mode !== "in" && <button className="text-primary" onClick={() => setMode("in")}>Ya tengo cuenta</button>}
          {mode === "in" && <><button className="block w-full text-primary" onClick={() => setMode("up")}>Crear una cuenta</button><button className="block w-full text-sm text-muted-foreground" onClick={() => setMode("reset")}>Olvidé mi contraseña</button></>}
          <Link to="/" className="block pt-2 text-sm text-muted-foreground">Volver</Link>
        </div>
      </div>
    </div>
  );
}
