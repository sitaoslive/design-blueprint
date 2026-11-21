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
    parentDraftId: z.string().uuid().optional(),
    targetUserIds: z.array(z.string().uuid()).max(40).optional(),
    dueOn: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((value) => {
        const date = new Date(value + "T00:00:00Z");
        return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
      }, "Fecha inválida")
      .optional(),
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
    if (new Set(draft.targetUserIds ?? []).size !== (draft.targetUserIds ?? []).length)
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Hay personas duplicadas" });
    if (draft.parentDraftId === draft.requestId)
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Una revisión no puede referirse a sí misma",
      });
    if ((draft.targetUserIds?.length || draft.dueOn) && draft.kind !== "pathway")
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La planificación de personas corresponde a una ruta",
      });
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
export type AcademyMember = { userId: string; name: string; roles: string[] };
export function validAcademyRevision(parent: AcademyDraft, next: AcademyDraft) {
  return (
    next.parentDraftId === parent.requestId &&
    next.requestId !== parent.requestId &&
    next.kind === parent.kind &&
    next.revision === parent.revision + 1
  );
}
/** Ordered preparation, not an official assignment or permission gate. */
export function pathwayProgress(
  ids: readonly string[],
  courses: readonly { id: string; title: string; role: string }[],
  lessons: readonly AcademyLesson[],
  completions: readonly AcademyCompletion[],
  member: AcademyMember,
) {
  let previousRead = true;
  return ids.map((id) => {
    const course = courses.find((item) => item.id === id);
    const progress = learningProgress(
      lessons.filter((lesson) => lesson.course_id === id),
      completions,
      member.userId,
    );
    const compatible = !!course && courseAudienceMatches(course.role, member.roles);
    const state:
      "unknown" | "audience_mismatch" | "no_lessons" | "read" | "pending" | "previous_pending" =
      !course
        ? "unknown"
        : !compatible
          ? "audience_mismatch"
          : !progress.total
            ? "no_lessons"
            : progress.acknowledged === progress.total
              ? "read"
              : previousRead
                ? "pending"
                : "previous_pending";
    previousRead = previousRead && state === "read";
    return { id, title: course?.title ?? "Curso no disponible", state, ...progress };
  });
}
export function memberLearningProgress(
  courses: readonly { id: string; role: string }[],
  lessons: readonly AcademyLesson[],
  completions: readonly AcademyCompletion[],
  member: AcademyMember,
) {
  const ids = new Set(
    courses
      .filter((course) => courseAudienceMatches(course.role, member.roles))
      .map((course) => course.id),
  );
  return learningProgress(
    lessons.filter((lesson) => ids.has(lesson.course_id)),
    completions,
    member.userId,
  );
}
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
