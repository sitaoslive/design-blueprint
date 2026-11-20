import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface TriageItem { key: string; kind: string; text: string }
export interface AiTriage { key: string; priority: "alta" | "media" | "baja"; reason: string; summary: string }

/** AI priority suggestion for new requests/referrals. Suggestion only: a human confirms in Administración. */
export const aiTriage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { items: TriageItem[] }) => ({ items: input.items.slice(0, 30).map((i) => ({ key: String(i.key).slice(0, 80), kind: String(i.kind).slice(0, 20), text: String(i.text).slice(0, 600) })) }))
  .handler(async ({ data, context }) => {
    const { data: allowed } = await context.supabase.rpc("has_any_role", { _user_id: context.userId, _roles: ["luis", "administrador", "coordinador", "recepcion"] });
    if (!allowed) throw new Error("Sin permiso para analizar prioridades");
    if (!data.items.length) return { results: [] as AiTriage[] };
    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: "Eres el asistente de coordinación de Vet Life, servicio veterinario a domicilio en Colombia. Clasifica cada solicitud o remisión por prioridad operativa (alta = posible urgencia clínica o riesgo; media = síntomas o casos que deben gestionarse hoy; baja = trámites, reprogramaciones, controles). No diagnostiques ni recomiendes tratamientos. Responde en español: resumen breve (máx. 12 palabras) y motivo breve (máx. 18 palabras).",
        input: [{ role: "user", content: JSON.stringify(data.items) }],
        text: { format: { type: "json_schema", name: "triage", strict: true, schema: { type: "object", additionalProperties: false, required: ["results"], properties: { results: { type: "array", items: { type: "object", additionalProperties: false, required: ["key", "priority", "reason", "summary"], properties: { key: { type: "string" }, priority: { type: "string", enum: ["alta", "media", "baja"] }, reason: { type: "string" }, summary: { type: "string" } } } } } } } },
      });
      const out = (res as { output_text?: string }).output_text ?? (res as { output?: { content?: { type: string; text?: string }[] }[] }).output?.flatMap((o) => o.content ?? []).find((c) => c.type === "output_text")?.text ?? "{}";
      const parsed = JSON.parse(out) as { results?: AiTriage[] };
      const keys = new Set(data.items.map((i) => i.key));
      return { results: (parsed.results ?? []).filter((r) => keys.has(r.key)) };
    } catch (e) {
      if (e instanceof GatewayError) throw new Error(e.code === "payment_required" ? "Sin créditos de IA disponibles" : "La IA no respondió; se muestran las reglas automáticas");
      throw e;
    }
  });
