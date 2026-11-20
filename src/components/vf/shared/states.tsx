import { createPortal } from "react-dom";
import { useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, Lock, WifiOff, CloudOff, Clock, X, Paintbrush } from "lucide-react";
import { Card, Btn } from "../ui";

const Box = ({ icon: I, title, hint, action }: { icon: typeof Lock; title: string; hint?: string; action?: ReactNode }) => (
  <Card className="text-center"><I className="mx-auto h-9 w-9 text-primary" aria-hidden /><p className="mt-2 text-lg font-bold">{title}</p>{hint && <p className="text-sm text-muted-foreground">{hint}</p>}{action && <div className="mt-3">{action}</div>}</Card>);

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return <div role="status" aria-label="Cargando" className="space-y-2">{Array.from({ length: rows }, (_, i) => <div key={i} className="h-16 animate-pulse rounded-3xl bg-secondary" />)}</div>;
}
export const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => <Box icon={AlertTriangle} title="No se pudo cargar" hint={message} action={onRetry && <Btn variant="soft" onClick={onRetry}>Reintentar</Btn>} />;
export const PermissionDenied = ({ hint = "Tu perfil no tiene acceso a esta información." }: { hint?: string }) => <Box icon={Lock} title="Sin permiso" hint={hint} />;
export const UnsyncedState = ({ hint = "Hay cambios que aún no se guardaron." }: { hint?: string }) => <Box icon={CloudOff} title="Sin sincronizar" hint={hint} />;
export const ExpiredOfferState = ({ hint = "Este horario ya no está disponible. Pide nuevas opciones." }: { hint?: string }) => <Box icon={Clock} title="Oferta vencida" hint={hint} />;

/** Shows a banner when the browser goes offline. */
export function OfflineState() {
  const [off, setOff] = useState(false);
  useEffect(() => { const u = () => setOff(!navigator.onLine); u(); addEventListener("online", u); addEventListener("offline", u); return () => { removeEventListener("online", u); removeEventListener("offline", u); }; }, []);
  return off ? <div role="alert" className="mb-3 flex items-center gap-2 rounded-2xl bg-accent p-3 text-sm font-bold"><WifiOff className="h-5 w-5" />Sin conexión: los cambios se guardarán al volver.</div> : null;
}

/** Marks screens or flows that are design/demo only and do not perform real actions. */
export function DesignModeIndicator({ label = "Demostración: no realiza acciones reales" }: { label?: string }) {
  return <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-primary px-3 py-1 text-xs font-bold text-primary"><Paintbrush className="h-3 w-3" />{label}</span>;
}

export function ConfirmationModal({ open, title, body, confirmLabel = "Confirmar", onConfirm, onClose }: { open: boolean; title: string; body?: ReactNode; confirmLabel?: string; onConfirm: () => void; onClose: () => void }) {
  if (!open) return null;
  return (<div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={onClose}>
    <div className="w-full max-w-md rounded-3xl bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}><p className="text-lg font-bold">{title}</p>{body && <div className="mt-2 text-muted-foreground">{body}</div>}
      <div className="mt-4 flex gap-2"><Btn className="flex-1" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Btn><Btn variant="soft" className="flex-1" onClick={onClose}>Cancelar</Btn></div></div></div>);
}
export function BottomSheet({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  if (!open || typeof document === "undefined") return null;
  return createPortal(<div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[60] flex items-end bg-foreground/40" onClick={onClose}>
    <div className="max-h-[80vh] w-full overflow-y-auto rounded-t-3xl bg-card p-5" onClick={(e) => e.stopPropagation()}><div className="mb-3 flex items-center justify-between"><b className="text-lg">{title}</b><button aria-label="Cerrar" onClick={onClose}><X className="h-5 w-5" /></button></div>{children}</div></div>, document.body);
}
