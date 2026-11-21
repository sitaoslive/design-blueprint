import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DurationPolicySchema } from "../domain";
export const saveDurationProposal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => DurationPolicySchema.parse(input))
  .handler(async ({ data, context }) => {
    const permission = await context.supabase.rpc("is_director", { _uid: context.userId });
    if (permission.error || permission.data !== true) throw new Error("FORBIDDEN: configuración reservada a Dirección");
    const response = await context.supabase.from("records").insert({
      kind: "dispatch_duration_proposal", scope: "director", status: "draft", title: data.name,
      detail: data.reason, data, created_by: context.userId, owner_id: context.userId,
    }).select("id").single();
    if (response.error || !response.data) throw new Error("No se pudo guardar la propuesta de duración");
    return response.data;
  });