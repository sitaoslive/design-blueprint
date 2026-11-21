import { z } from "zod";
import { canProvideClinicalCare } from "@/lib/vf/roles";

export const AcademyQuestionSchema = z
  .object({
    id: z.string().min(1).max(100),
    type: z.enum(["single", "multiple", "reflection"]),
    prompt: z.string().trim().min(5).max(1000),
    options: z.array(z.string().trim().min(1).max(300)).max(8),
  })
  .strict()
  .superRefine((question, context) => {
    if (
      question.type !== "reflection" &&
      (question.options.length < 2 || new Set(question.options).size !== question.options.length)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Incluye al menos dos opciones distintas",
      });
    }
  });
export const AcademyDraftSchema = z
  .object({
    requestId: z.string().uuid(),
    kind: z.enum(["course", "pathway", "assessment", "procedure"]),
    title: z.string().trim().min(3).max(160),
    purpose: z.string().trim().min(10).max(4000),
    audience: z.enum(["Todos", "Administrador", "Luis", "Auxiliar", "Cliente"]),
    clinical: z.boolean(),
    revision: z.number().int().min(1).max(1000),
    sourceCourseIds: z.array(z.string().min(1).max(150)).max(40),
    outline: z.array(z.string().trim().min(1).max(500)).max(40),
    questions: z.array(AcademyQuestionSchema).max(40),
  })
  .strict()
  .superRefine((draft, context) => {
    if (draft.kind === "pathway" && !draft.sourceCourseIds.length)
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Vincula un curso a la ruta" });
    if (draft.kind === "assessment" && !draft.questions.length)
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Añade al menos una pregunta" });
    if (
      new Set(draft.sourceCourseIds).size !== draft.sourceCourseIds.length ||
      new Set(draft.questions.map((question) => question.id)).size !== draft.questions.length
    )
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Hay referencias duplicadas" });
  });
export type AcademyDraft = z.infer<typeof AcademyDraftSchema>;
export type AcademyLesson = {
  id: string;
  course_id: string;
  title: string;
  body: string;
  position: number;
};
export type AcademyCompletion = { user_id: string; lesson_id: string; completed_at: string };
export function learningProgress(
  lessons: readonly Pick<AcademyLesson, "id">[],
  completions: readonly Pick<AcademyCompletion, "user_id" | "lesson_id">[],
  userId: string,
) {
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const read = new Set(
    completions
      .filter((completion) => completion.user_id === userId && lessonIds.has(completion.lesson_id))
      .map((completion) => completion.lesson_id),
  );
  return {
    total: lessonIds.size,
    acknowledged: read.size,
    percentage: lessonIds.size ? Math.round((read.size * 100) / lessonIds.size) : 0,
    competencyVerified: false as const,
  };
}
export function courseAudienceMatches(audience: string, roles: readonly string[]) {
  const name = audience
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (name === "todos") return true;
  if (name.startsWith("auxiliar")) return roles.includes("auxiliar");
  if (name.startsWith("veterinari") || name === "luis") return canProvideClinicalCare(roles);
  if (name.startsWith("administra"))
    return roles.includes("administrador") || roles.includes("luis");
  if (name.startsWith("coordin"))
    return (
      roles.includes("coordinador") || roles.includes("luis") || roles.includes("administrador")
    );
  return name === "cliente" && roles.includes("cliente");
}
export const ACADEMY_AUTHORITY = {
  publish: { available: false, code: "BACKEND_AUTHORITY_REQUIRED" },
  grade: { available: false, code: "PROTECTED_SCORING_REQUIRED" },
  verifyCompetency: { available: false, code: "PRACTICAL_EVIDENCE_REQUIRED" },
  credential: { available: false, code: "PROFESSIONAL_AUTHORITY_REQUIRED" },
} as const;
