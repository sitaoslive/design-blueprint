import type {
  Complaint,
  Survey,
  SurveyResponse,
  EducationArticle,
  CorrectiveAction,
} from "../domain";
export interface QualityWorkspace {
  complaints: Complaint[];
  surveys: Survey[];
  responses: SurveyResponse[];
  education: EducationArticle[];
  improvements: CorrectiveAction[];
}
export const emptyQualityWorkspace = (): QualityWorkspace => ({
  complaints: [],
  surveys: [],
  responses: [],
  education: [],
  improvements: [],
});
export function demoQualityWorkspace(role: string): QualityWorkspace {
  const now = new Date().toISOString();
  return {
    ...emptyQualityWorkspace(),
    surveys: [
      {
        id: "demo-survey",
        title: "Experiencia después de la visita · ejemplo",
        version: 1,
        state: "PUBLISHED",
        approvedBy: "demo-reviewer",
        questions: [
          {
            id: "q1",
            label: "¿Cómo fue tu experiencia con Vet Life?",
            type: "CSAT",
            required: true,
            options: [],
          },
          { id: "q2", label: "¿Qué podemos mejorar?", type: "TEXT", required: false, options: [] },
        ],
      },
    ],
    complaints:
      role === "cliente"
        ? []
        : [
            {
              id: "demo-complaint",
              customerId: "demo-family",
              petId: "luna",
              visitId: "v1",
              conversationId: "",
              category: "Comunicación",
              description:
                "Ejemplo sintético: la familia solicita aclarar el horario de su visita.",
              assignedTo: "valeria",
              dueAt: new Date(Date.now() + 86400000).toISOString(),
              clinical: false,
              sourceReference: "Caso sintético de demostración",
              state: "NEW",
              version: 1,
              createdAt: now,
              updatedAt: now,
              events: [],
              plan: "Verificar horario y registrar el acuerdo",
              evidence: "",
              customerConfirmation: "UNKNOWN",
              professionalReviewed: false,
              solutionImplemented: false,
            },
          ],
  };
}
