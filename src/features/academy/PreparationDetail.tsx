import { useState } from "react";
import { Btn } from "@/components/vf/ui";
import {
  pathwayProgress,
  type AcademyDraft,
  type AcademyMember,
  type AcademyLesson,
  type AcademyCompletion,
} from "./domain";

export function PathwayDetail({
  draft,
  courses,
  lessons,
  completions,
  team,
}: {
  draft: AcademyDraft;
  courses: { id: string; title: string; role: string }[];
  lessons: AcademyLesson[];
  completions: AcademyCompletion[];
  team: AcademyMember[];
}) {
  const targets = team.filter((member) => draft.targetUserIds?.includes(member.userId));
  const [selected, setSelected] = useState(targets[0]?.userId ?? "");
  const member = targets.find((item) => item.userId === selected);
  const states = {
    unknown: "Curso no disponible",
    audience_mismatch: "No corresponde a este perfil",
    no_lessons: "Sin lecciones",
    read: "Lecturas registradas",
    pending: "Lecturas pendientes",
    previous_pending: "Paso anterior pendiente",
  };
  return (
    <div className="mt-3 space-y-3">
      <p className="text-sm font-bold">Plan de incorporación · Sin asignación oficial</p>
      {draft.dueOn && <p className="text-sm">Fecha propuesta: {draft.dueOn}</p>}
      {targets.length > 0 && (
        <label className="block text-sm">
          Persona prevista
          <select
            aria-label="Persona prevista"
            className="mt-2 w-full rounded-lg border border-border bg-background p-3"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
          >
            {targets.map((target) => (
              <option key={target.userId} value={target.userId}>
                {target.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {member ? (
        <ol className="space-y-2">
          {pathwayProgress(draft.sourceCourseIds, courses, lessons, completions, member).map(
            (step, index) => (
              <li key={step.id} className="border-b border-border py-2 text-sm">
                <b>
                  {index + 1}. {step.title}
                </b>
                <p>
                  {states[step.state]} · {step.acknowledged}/{step.total} lecturas
                </p>
              </li>
            ),
          )}
        </ol>
      ) : (
        <ol className="space-y-2">
          {draft.sourceCourseIds.map((id, index) => (
            <li key={id} className="text-sm">
              {index + 1}.{" "}
              {courses.find((course) => course.id === id)?.title ?? "Curso no disponible"}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/** Answers live only in the current view. No score, official attempt or answer key. */
export function AssessmentRehearsal({ draft }: { draft: AcademyDraft }) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [finished, setFinished] = useState(false);
  const answered = draft.questions.filter((question) =>
    answers[question.id]?.some((value) => value.trim()),
  ).length;
  return (
    <section
      aria-label="Ensayo de evaluación"
      className="mt-4 space-y-4 border-t border-border pt-4"
    >
      <p className="text-sm font-bold">Ensayo local · Sin nota ni intento oficial</p>
      {draft.questions.map((question, index) => (
        <fieldset key={question.id} className="space-y-2">
          <legend className="text-sm font-bold">
            {index + 1}. {question.prompt}
          </legend>
          {question.type === "reflection" ? (
            <textarea
              aria-label={`Respuesta de reflexión ${index + 1}`}
              className="w-full rounded-lg border border-border bg-background p-3"
              value={answers[question.id]?.[0] ?? ""}
              onChange={(event) => {
                setFinished(false);
                setAnswers({ ...answers, [question.id]: [event.target.value] });
              }}
            />
          ) : (
            question.options.map((option) => (
              <label key={option} className="flex items-start gap-3 text-sm">
                <input
                  type={question.type === "single" ? "radio" : "checkbox"}
                  name={`practice-${draft.requestId}-${question.id}`}
                  checked={answers[question.id]?.includes(option) ?? false}
                  onChange={(event) => {
                    setFinished(false);
                    setAnswers({
                      ...answers,
                      [question.id]:
                        question.type === "single"
                          ? [option]
                          : event.target.checked
                            ? [...(answers[question.id] ?? []), option]
                            : (answers[question.id] ?? []).filter((value) => value !== option),
                    });
                  }}
                />
                {option}
              </label>
            ))
          )}
        </fieldset>
      ))}
      <div className="flex flex-wrap gap-2">
        <Btn variant="outline" onClick={() => setFinished(true)}>
          Revisar ensayo
        </Btn>
        <Btn
          variant="soft"
          onClick={() => {
            setAnswers({});
            setFinished(false);
          }}
        >
          Reiniciar ensayo
        </Btn>
      </div>
      {finished && (
        <p role="status" className="text-sm">
          {answered}/{draft.questions.length} preguntas respondidas. Sin calificación; las
          respuestas no se guardaron.
        </p>
      )}
    </section>
  );
}
