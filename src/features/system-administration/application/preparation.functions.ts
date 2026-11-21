import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { validatePreparation } from "./preparation";

export const saveImportPreparation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => validatePreparation(input))
  .handler(async ({ data, context }) => {
    const permission = await context.supabase.rpc("is_director", { _uid: context.userId });
    if (permission.error || permission.data !== true) throw new Error("FORBIDDEN: solo Dirección o Administración preparan importaciones");
    validatePreparation(data);
    const response = await context.supabase.from("records").insert({
      id: data.requestId, kind: "administrative_import_preparation", scope: "director",
      owner_id: context.userId, created_by: context.userId, title: data.source,
      detail: "Preparación administrativa declarada; sin archivo ni autorización oficial",
      status: "PREPARED_DRAFT", data,
    }).select("id,status").single();
    if (response.error?.code === "23505") {
      const prior = await context.supabase.from("records").select("id,status,data,created_by,kind")
        .eq("id", data.requestId).single();
      const canonical = (value: unknown): string => {
        if (value && typeof value === "object" && !Array.isArray(value)) return JSON.stringify(Object.keys(value).sort().map((key) => [key, canonical((value as Record<string, unknown>)[key])]));
        return JSON.stringify(value);
      };
      if (prior.error || !prior.data || prior.data.created_by !== context.userId || prior.data.kind !== "administrative_import_preparation" || canonical(prior.data.data) !== canonical(data)) throw new Error("CONFLICT: la solicitud ya existe con otros datos");
      return { id: prior.data.id, status: prior.data.status };
    }
    if (response.error || !response.data) throw new Error("No se pudo guardar la preparación reservada");
    return response.data;
  });