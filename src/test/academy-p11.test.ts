import { describe, it, expect } from "vitest";
import {
  AcademyDraftSchema,
  ACADEMY_AUTHORITY,
  courseAudienceMatches,
  learningProgress,
  memberLearningProgress,
  pathwayProgress,
  validAcademyRevision,
} from "@/features/academy/domain";
const draft = {
  requestId: "8f5fa570-d4d1-45d6-ae07-a8060d2f1701",
  kind: "course",
  title: "Preparación del equipo",
  purpose: "Preparar un kit antes de la visita",
  audience: "Auxiliar",
  clinical: false,
  revision: 1,
  sourceCourseIds: [],
  outline: [],
  questions: [],
};
describe("Academy avanzado sin acreditaciones ficticias", () => {
  it("lectura personal no usa el progreso global ni otra cuenta", () => {
    expect(
      learningProgress(
        [{ id: "a" }, { id: "b" }],
        [
          { user_id: "yo", lesson_id: "a" },
          { user_id: "otro", lesson_id: "b" },
          { user_id: "yo", lesson_id: "desconocida" },
        ],
        "yo",
      ),
    ).toEqual({ total: 2, acknowledged: 1, percentage: 50, competencyVerified: false });
  });
  it("duplicados no aumentan la lectura", () =>
    expect(
      learningProgress(
        [{ id: "a" }],
        [
          { user_id: "yo", lesson_id: "a" },
          { user_id: "yo", lesson_id: "a" },
        ],
        "yo",
      ).acknowledged,
    ).toBe(1));
  it("un curso sin lecciones no se presenta completo", () =>
    expect(learningProgress([], [], "yo").percentage).toBe(0));
  it("Administrador no coincide con formación de veterinarios", () =>
    expect(courseAudienceMatches("Veterinarios", ["administrador"])).toBe(false));
  it("Luis sí coincide con formación de veterinarios", () =>
    expect(courseAudienceMatches("Veterinarios", ["luis"])).toBe(true));
  it("Auxiliar coincide solo con formación propia o Todos", () => {
    expect(courseAudienceMatches("Auxiliares", ["auxiliar"])).toBe(true);
    expect(courseAudienceMatches("Veterinarios", ["auxiliar"])).toBe(false);
    expect(courseAudienceMatches("Todos", ["auxiliar"])).toBe(true);
  });
  it("acepta preparación válida", () =>
    expect(AcademyDraftSchema.safeParse(draft).success).toBe(true));
  it("rechaza claves de respuestas dentro del borrador", () =>
    expect(AcademyDraftSchema.safeParse({ ...draft, correctAnswers: { a: 1 } }).success).toBe(
      false,
    ));
  it("rechaza respuestas correctas en preguntas visibles", () =>
    expect(
      AcademyDraftSchema.safeParse({
        ...draft,
        kind: "assessment",
        questions: [
          {
            id: "a",
            type: "single",
            prompt: "¿Cómo preparar?",
            options: ["A", "B"],
            correctAnswer: "A",
          },
        ],
      }).success,
    ).toBe(false));
  it("ruta requiere al menos un curso vinculado", () =>
    expect(AcademyDraftSchema.safeParse({ ...draft, kind: "pathway" }).success).toBe(false));
  it("evaluación requiere preguntas", () =>
    expect(AcademyDraftSchema.safeParse({ ...draft, kind: "assessment" }).success).toBe(false));
  it("opciones repetidas no forman evaluación válida", () =>
    expect(
      AcademyDraftSchema.safeParse({
        ...draft,
        kind: "assessment",
        questions: [{ id: "a", type: "single", prompt: "¿Cómo preparar?", options: ["A", "A"] }],
      }).success,
    ).toBe(false));
  it("publicación, nota oficial y acreditación siguen bloqueadas", () => {
    expect(ACADEMY_AUTHORITY.publish.available).toBe(false);
    expect(ACADEMY_AUTHORITY.grade.available).toBe(false);
    expect(ACADEMY_AUTHORITY.verifyCompetency.available).toBe(false);
    expect(ACADEMY_AUTHORITY.credential.available).toBe(false);
  });
  it("un miembro no tiene pendientes de formación reservada a otro perfil", () => {
    expect(
      memberLearningProgress(
        [
          { id: "aux", role: "Auxiliar" },
          { id: "vet", role: "Veterinarios" },
        ],
        [
          { id: "a", course_id: "aux", title: "Kit", body: "Preparar", position: 1 },
          { id: "v", course_id: "vet", title: "Dosis", body: "Revisar", position: 1 },
        ],
        [],
        { userId: "yo", name: "Auxiliar", roles: ["auxiliar"] },
      ).total,
    ).toBe(1);
  });
  it("el plan conserva el orden y declara el paso anterior pendiente", () => {
    const courses = [
      { id: "a", title: "A", role: "Todos" },
      { id: "b", title: "B", role: "Todos" },
    ];
    const lessons = courses.map((course) => ({
      id: course.id,
      course_id: course.id,
      title: course.title,
      body: "Contenido",
      position: 1,
    }));
    const result = pathwayProgress(["b", "a"], courses, lessons, [], {
      userId: "yo",
      name: "Yo",
      roles: ["auxiliar"],
    });
    expect(result.map((step) => step.id)).toEqual(["b", "a"]);
    expect(result.map((step) => step.state)).toEqual(["pending", "previous_pending"]);
  });
  it("lectura ajena no desbloquea el siguiente paso previsto", () => {
    const courses = [
      { id: "a", title: "A", role: "Todos" },
      { id: "b", title: "B", role: "Todos" },
    ];
    const lessons = courses.map((course) => ({
      id: course.id,
      course_id: course.id,
      title: course.title,
      body: "Contenido",
      position: 1,
    }));
    const result = pathwayProgress(
      ["a", "b"],
      courses,
      lessons,
      [{ user_id: "otro", lesson_id: "a", completed_at: "2026-11-21" }],
      { userId: "yo", name: "Yo", roles: ["auxiliar"] },
    );
    expect(result[1]?.state).toBe("previous_pending");
  });
  it("curso ausente o vacío no acredita ni completa un plan", () => {
    const result = pathwayProgress(
      ["missing", "empty"],
      [{ id: "empty", title: "Vacío", role: "Todos" }],
      [],
      [],
      { userId: "yo", name: "Yo", roles: ["auxiliar"] },
    );
    expect(result.map((step) => step.state)).toEqual(["unknown", "no_lessons"]);
    expect(result.every((step) => !step.competencyVerified)).toBe(true);
  });
  it("rechaza revisiones que saltan versión o cambian de tipo", () => {
    const parent = AcademyDraftSchema.parse(draft);
    const next = {
      ...parent,
      requestId: "bdb3c29e-4b19-4a33-b4ed-a9c6efac0fe1",
      parentDraftId: parent.requestId,
      revision: 2,
    };
    expect(validAcademyRevision(parent, next)).toBe(true);
    expect(validAcademyRevision(parent, { ...next, revision: 3 })).toBe(false);
    expect(validAcademyRevision(parent, { ...next, kind: "procedure" })).toBe(false);
  });
  it("rechaza una fecha inexistente del plan", () => {
    expect(
      AcademyDraftSchema.safeParse({
        ...draft,
        kind: "pathway",
        sourceCourseIds: ["a"],
        dueOn: "2026-02-30",
      }).success,
    ).toBe(false);
  });
  it("no admite duplicados de personas previstas", () => {
    expect(
      AcademyDraftSchema.safeParse({
        ...draft,
        kind: "pathway",
        sourceCourseIds: ["a"],
        targetUserIds: [draft.requestId, draft.requestId],
      }).success,
    ).toBe(false);
  });
});
