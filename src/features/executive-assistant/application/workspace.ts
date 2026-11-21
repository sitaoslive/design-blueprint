import { useEffect, useState, useCallback } from "react";
import { z } from "zod";
import { useVF, getVF } from "@/lib/vf/store";
import { db } from "@/lib/vf/db";
import { checkedWrite } from "@/features/referrals/application/gateway";
import { DraftSchema, canUseExecutive, type ExecutiveDraft } from "../domain";
import { ToolOutputSchema } from "./registry";
export const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  text: z.string(),
  createdAt: z.string(),
  results: z.array(ToolOutputSchema),
  status: z.string(),
});
const ConversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  archived: z.boolean(),
  updatedAt: z.string(),
  messages: z.array(MessageSchema),
});
const WorkspaceSchema = z.object({
  conversations: z.array(ConversationSchema),
  activeId: z.string(),
  drafts: z.array(
    DraftSchema.extend({ id: z.string(), status: z.literal("DRAFT"), source: z.string() }),
  ),
});
export type ExecutiveMessage = z.infer<typeof MessageSchema>;
export type ExecutiveConversation = z.infer<typeof ConversationSchema>;
export type Workspace = z.infer<typeof WorkspaceSchema>;
function emptyWorkspace(): Workspace {
  const id = crypto.randomUUID();
  return {
    activeId: id,
    conversations: [
      { id, title: "Mi día", archived: false, updatedAt: new Date().toISOString(), messages: [] },
    ],
    drafts: [],
  };
}
export function useExecutiveWorkspace() {
  const owner = useVF((s) => s.userId);
  const [state, setState] = useState<{ owner: string | null; workspace: Workspace }>({
    owner: null,
    workspace: emptyWorkspace(),
  });
  useEffect(() => {
    if (!owner) return;
    let next = emptyWorkspace();
    try {
      const saved = sessionStorage.getItem(`vf-executive:${owner}`);
      if (saved) {
        const envelope = JSON.parse(saved) as { expiresAt?: number; workspace?: unknown };
        if (typeof envelope.expiresAt === "number" && envelope.expiresAt > Date.now()) {
          const parsed = WorkspaceSchema.safeParse(envelope.workspace);
          if (parsed.success) next = parsed.data;
        } else sessionStorage.removeItem(`vf-executive:${owner}`);
      }
    } catch {
      sessionStorage.removeItem(`vf-executive:${owner}`);
    }
    setState({ owner, workspace: next });
  }, [owner]);
  const update = useCallback(
    (fn: (s: Workspace) => Workspace) => {
      setState((current) => {
        if (current.owner !== owner || !owner) return current;
        const workspace = fn(current.workspace);
        sessionStorage.setItem(
          `vf-executive:${owner}`,
          JSON.stringify({ workspace, expiresAt: Date.now() + 86400000 }),
        );
        return { owner, workspace };
      });
    },
    [owner],
  );
  return { workspace: state.owner === owner ? state.workspace : null, update };
}
export async function saveExecutiveDraft(draft: ExecutiveDraft) {
  const parsed = DraftSchema.parse(draft);
  const viewer = getVF();
  if (!canUseExecutive(viewer.roles, viewer.userId)) throw new Error("FORBIDDEN");
  if (viewer.userId?.startsWith("demo-"))
    return { id: parsed.idempotencyKey, source: "DEMO sintético" };
  if (!z.string().uuid().safeParse(parsed.idempotencyKey).success)
    throw new Error("Clave de borrador inválida");
  const existing = await db
    .from("records")
    .select("id,data,created_by")
    .eq("id", parsed.idempotencyKey)
    .maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) {
    if (
      existing.data.created_by !== viewer.userId ||
      JSON.stringify(DraftSchema.parse(existing.data.data?.draft)) !== JSON.stringify(parsed)
    )
      throw new Error("EXECUTION_CONFLICT: clave reutilizada con datos diferentes");
    return { id: parsed.idempotencyKey, source: "Lovable Cloud · borrador reservado" };
  }
  await checkedWrite(
    db
      .from("records")
      .insert({
        id: parsed.idempotencyKey,
        kind: `executive_${parsed.kind}_draft`,
        scope: "director",
        title: parsed.title,
        detail: parsed.objective,
        status: "draft",
        ref_id: parsed.responsible,
        created_by: viewer.userId,
        data: { module: "executive-p12", draft: parsed, currency: "COP", official: false },
      })
      .select("id"),
  );
  return { id: parsed.idempotencyKey, source: "Lovable Cloud · borrador reservado" };
}
