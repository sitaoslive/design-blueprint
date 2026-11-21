import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { validateOfficialCommand } from "./official-schema";
import type { Json } from "@/integrations/supabase/types";

export const readOfficialQuality = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const result = await context.supabase.from("quality_items").select("*").order("updated_at", { ascending: false });
    if (result.error) throw new Error("No se pudo consultar calidad; vuelve a intentarlo");
    const family = await context.supabase.rpc("quality_family_cases");
    if(family.error) throw new Error("No se pudieron consultar tus casos");
    return [...result.data, ...(family.data??[]).filter(i=>!result.data.some(r=>r.id===i.id))];
  });
export const executeOfficialQuality = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validateOfficialCommand)
  .handler(async ({ data, context }) => {
    const command = JSON.parse(JSON.stringify(data)) as Json;
    const result = await context.supabase.rpc("quality_checked_command", { command });
    if (result.error) {
      const codes = ["UNAUTHORIZED","FORBIDDEN","STALE_DATA","DUPLICATE_EVENT","DATA_INCOMPLETE","INVALID_STATE_TRANSITION","NOT_AUTHORIZED","PROFESSIONAL_REVIEW_REQUIRED","INTEGRATION_UNAVAILABLE"];
      throw new Error(codes.find((code) => result.error.message.includes(code)) ?? "No se confirmó la acción; vuelve a consultar");
    }
    return result.data;
  });