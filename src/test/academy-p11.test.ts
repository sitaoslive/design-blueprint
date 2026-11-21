import { describe, it, expect } from "vitest";
import {
  AcademyDraftSchema,
  ACADEMY_AUTHORITY,
  courseAudienceMatches,
  learningProgress,
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
});
