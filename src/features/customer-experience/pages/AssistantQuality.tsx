import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { db } from "@/lib/vf/db";
import { useVF } from "@/lib/vf/store";
import { PageTitle, Card, Empty } from "@/components/vf/ui";
import { QualityNav, SourceDate, UnavailableAction, inputClass } from "../components/shared";
type Message = {
  id: string;
  conversation_id: string;
  sender: string;
  body: string;
  created_at: string;
};
export function AssistantQuality() {
  const uid = useVF((s) => s.userId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => {
    let active = true;
    void db
      .from("conversation_messages")
      .select("id,conversation_id,sender,body,created_at")
      .order("created_at", { ascending: false })
      .limit(200)
      .then((r: { data: Message[] | null; error: { message: string } | null }) => {
        if (!active) return;
        if (r.error) setError(r.error.message);
        else setMessages(r.data ?? []);
      });
    return () => {
      active = false;
    };
  }, [uid]);
  const ai = messages.filter(
    (m) => m.sender === "ia" && m.body.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageTitle title="Revisión del asistente" />
      <QualityNav />
      <label className="block">
        Buscar respuesta
        <input className={inputClass} value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      {error && <p role="alert">{error}</p>}
      {ai.map((m) => {
        const question = messages
          .filter(
            (x) =>
              x.conversation_id === m.conversation_id &&
              x.sender === "cliente" &&
              x.created_at <= m.created_at,
          )
          .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
        return (
          <Card key={m.id} className="my-3">
            <b>Revisión humana pendiente</b>
            <p className="my-2 text-sm">
              Pregunta: {question?.body ?? "No disponible en el conjunto consultado"}
            </p>
            <p className="whitespace-pre-wrap">{m.body}</p>
            <p className="my-2 text-xs text-muted-foreground">
              Fuente aprobada de esta respuesta: no vinculada por el contrato actual. No se infiere
              exactitud clínica ni revisión completada.
            </p>
            <SourceDate source={`conversation_messages/${m.id}`} at={m.created_at} />
            <Link
              to="/operaciones/$"
              params={{ _splat: `whatsapp/${m.conversation_id}` }}
              className="my-3 block font-bold text-primary"
            >
              Abrir contexto autorizado
            </Link>
            <UnavailableAction label="Registrar revisión autorizada" />
          </Card>
        );
      })}
      {!ai.length && <Empty title="Sin respuestas del asistente disponibles para revisar" />}
      <p className="my-3 text-sm text-muted-foreground">
        No se envía el contenido privado a modelos externos. Exactitud, conocimiento, privacidad,
        claridad y escalamiento requieren revisión autorizada.
      </p>
    </>
  );
}
