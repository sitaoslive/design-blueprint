import { Suspense, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/vf/db";
import { useVF, getVF } from "@/lib/vf/store";
import { Btn, Card, Empty, PageTitle, SectionTitle } from "@/components/vf/ui";
import { PermissionDenied } from "@/components/vf/shared";
import { readAcademy, saveAcademyDraft } from "./academy.functions";
import {
  AcademyDraftSchema,
  learningProgress,
  type AcademyDraft,
  type AcademyLesson,
} from "./domain";
import { academyScreen } from "./catalog";

type Snapshot = Awaited<ReturnType<typeof readAcademy>>;
const input = "w-full min-w-0 rounded-lg border border-border bg-background p-3";
const kinds = {
  course: "Curso",
  pathway: "Ruta de aprendizaje",
  assessment: "Evaluación",
  procedure: "Procedimiento",
} as const;
const menu = [
  ["", "Cursos"],
  ["rutas", "Rutas"],
  ["evaluaciones", "Evaluaciones"],
  ["procedimientos", "Procedimientos"],
  ["empleados", "Equipo"],
  ["competencias", "Competencias"],
  ["onboarding", "Incorporación"],
  ["versiones", "Versiones"],
] as const;

async function demoSnapshot(): Promise<Snapshot> {
  const [lessons, completions] = await Promise.all([
    db.from("course_lessons").select("*"),
    db.from("lesson_completions").select("*"),
  ]);
  return {
    courses: getVF().courses,
    lessons: (lessons.data ?? []).map((lesson: AcademyLesson) => ({
      ...lesson,
      position: lesson.position ?? 0,
    })),
    completions: completions.data ?? [],
    drafts: [],
  };
}
export function AcademyPage({ path = "/equipo/academia" }: { path?: string }) {
  const roles = useVF((state) => state.roles);
  const uid = useVF((state) => state.userId);
  if (
    !uid ||
    !roles.some((role) =>
      ["luis", "administrador", "veterinario", "auxiliar", "coordinador", "recepcion"].includes(
        role,
      ),
    )
  )
    return <PermissionDenied hint="La formación interna está reservada al equipo." />;
  if (
    path.startsWith("/admin/") &&
    !roles.some((role) => role === "luis" || role === "administrador")
  )
    return <PermissionDenied />;
  return (
    <Suspense fallback={<p className="py-8 text-muted-foreground">Cargando tu formación…</p>}>
      <AcademyContent key={uid + path} path={path} uid={uid} />
    </Suspense>
  );
}
function AcademyContent({ path, uid }: { path: string; uid: string }) {
  const roles = useVF((state) => state.roles);
  const staff = useVF((state) => state.staff);
  const director = roles.some((role) => role === "luis" || role === "administrador");
  const admin = path.startsWith("/admin/");
  const demo = uid.startsWith("demo-");
  const queryClient = useQueryClient();
  const queryKey = ["academy", uid, [...roles].sort().join("|")];
  const { data } = useSuspenseQuery({
    queryKey,
    queryFn: () => (demo ? demoSnapshot() : readAcademy()),
  });
  const [courseId, setCourseId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<AcademyDraft | null>(null);
  const [find, setFind] = useState("");
  const saveDraft = useServerFn(saveAcademyDraft);
  const part = path.split("/")[3] ?? "";
  const kind: AcademyDraft["kind"] =
    part === "rutas" || part === "onboarding"
      ? "pathway"
      : part === "evaluaciones"
        ? "assessment"
        : part === "procedimientos" || part === "versiones"
          ? "procedure"
          : "course";
  const begin = () =>
    setDraft({
      requestId: crypto.randomUUID(),
      kind,
      title: "",
      purpose: "",
      audience: "Todos",
      clinical: false,
      revision: 1,
      sourceCourseIds: [],
      outline: [],
      questions: [],
    });
  const persist = async () => {
    if (!draft || getVF().userId !== uid) return;
    const parsed = AcademyDraftSchema.safeParse({
      ...draft,
      outline: draft.outline.filter((line) => line.trim()),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revisa la preparación");
      return;
    }
    setBusy(true);
    try {
      if (demo)
        queryClient.setQueryData<Snapshot>(queryKey, (current) =>
          current
            ? {
                ...current,
                drafts: [
                  {
                    id: parsed.data.requestId,
                    draft: parsed.data,
                    createdAt: new Date().toISOString(),
                  },
                  ...current.drafts,
                ],
              }
            : current,
        );
      else {
        await saveDraft({ data: parsed.data });
        await queryClient.invalidateQueries({ queryKey });
      }
      if (getVF().userId === uid) {
        setDraft(null);
        toast.success(
          demo ? "Preparación guardada solo en esta demo" : "Preparación guardada y releída",
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  };
  const acknowledge = async (lesson: AcademyLesson) => {
    if (getVF().userId !== uid) return;
    setBusy(true);
    try {
      if (demo)
        queryClient.setQueryData<Snapshot>(queryKey, (current) =>
          current
            ? {
                ...current,
                completions: [
                  ...current.completions,
                  { user_id: uid, lesson_id: lesson.id, completed_at: new Date().toISOString() },
                ],
              }
            : current,
        );
      else {
        const result = await db
          .from("lesson_completions")
          .upsert(
            { user_id: uid, lesson_id: lesson.id },
            { onConflict: "user_id,lesson_id", ignoreDuplicates: true },
          )
          .select("lesson_id");
        if (result.error || !result.data?.length) {
          await queryClient.invalidateQueries({ queryKey });
          throw new Error("No se pudo confirmar la lectura o ya estaba registrada");
        }
        await queryClient.invalidateQueries({ queryKey });
      }
      toast.success(demo ? "Lectura registrada en esta demo" : "Lectura personal registrada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la lectura");
    } finally {
      setBusy(false);
    }
  };
  const pathCourse = path.split("/")[4];
  const chosen = data.courses.find(
    (course) =>
      course.id === (courseId ?? (part === "cursos" ? pathCourse : admin ? undefined : part)),
  );
  const visible = data.courses.filter((course) =>
    course.title.toLowerCase().includes(find.toLowerCase()),
  );
  const shownDrafts = data.drafts.filter(
    (row) => part === "versiones" || part === "" || row.draft.kind === kind,
  );
  return (
    <>
      <PageTitle
        title={admin ? (academyScreen(path) ?? "Academy") : "Mi formación"}
        subtitle={admin ? "Veterinaria Dr. Luis Ríos" : "Tu aprendizaje, paso a paso"}
      />
      {admin && (
        <nav aria-label="Academy" className="mb-5 flex flex-wrap gap-2">
          {menu.map(([slug, label]) => (
            <Link
              key={slug}
              to={`/admin/academia${slug ? "/" + slug : ""}` as never}
              aria-current={part === slug ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-bold ${part === slug ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
      <div className="mb-5 flex items-start gap-3 border-l-4 border-sage-foreground bg-secondary p-4">
        <GraduationCap className="h-6 w-6 shrink-0 text-sage-foreground" />
        <p className="text-sm">
          La lectura no acredita competencia ni concede permisos clínicos. Publicación, exámenes
          oficiales y acreditaciones requieren revisión autorizada.
        </p>
      </div>
      {draft ? (
        <DraftEditor
          draft={draft}
          onChange={setDraft}
          courses={data.courses}
          busy={busy}
          onSave={() => void persist()}
          onCancel={() => setDraft(null)}
        />
      ) : (
        <>
          {admin && director && (
            <Btn className="mb-5" variant="outline" onClick={begin}>
              <Plus className="h-4 w-4" />
              Preparar {kinds[kind].toLowerCase()}
            </Btn>
          )}
          {chosen ? (
            <>
              <Btn variant="soft" onClick={() => setCourseId("")}>
                Volver a cursos
              </Btn>
              <SectionTitle>{chosen.title}</SectionTitle>
              <CourseLessons
                courseId={chosen.id}
                snapshot={data}
                uid={uid}
                busy={busy}
                acknowledge={acknowledge}
              />
            </>
          ) : part === "competencias" ? (
            <>
              <SectionTitle>Competencias y evidencia</SectionTitle>
              <Empty
                title="Sin competencias oficialmente verificadas"
                hint="Lecturas y preparaciones no sustituyen evidencia práctica, revisión profesional ni credenciales."
              />
              <Btn className="mt-4" disabled>
                Verificar competencia
              </Btn>
            </>
          ) : part === "empleados" ? (
            <>
              <SectionTitle>Formación individual</SectionTitle>
              {staff.map((member) => {
                const linked = member.userId;
                const progress = linked
                  ? learningProgress(data.lessons, data.completions, linked)
                  : null;
                return (
                  <div key={member.id} className="border-b border-border py-4">
                    <b>{member.name}</b>
                    <p className="text-sm text-muted-foreground">
                      {linked
                        ? `${progress?.acknowledged ?? 0} de ${progress?.total ?? 0} lecturas registradas`
                        : "Sin cuenta vinculada: progreso desconocido"}
                    </p>
                    <p className="text-sm">Competencia sin verificar</p>
                  </div>
                );
              })}
            </>
          ) : part === "" || part === "cursos" || part === "lecciones" || !admin ? (
            <>
              <label className="mb-4 block text-sm font-bold">
                Buscar curso
                <input
                  className={`${input} mt-2`}
                  aria-label="Buscar curso"
                  value={find}
                  onChange={(event) => setFind(event.target.value)}
                />
              </label>
              {visible.length ? (
                visible.map((course) => {
                  const progress = learningProgress(
                    data.lessons.filter((lesson) => lesson.course_id === course.id),
                    data.completions,
                    uid,
                  );
                  return (
                    <Card key={course.id} className="mb-3">
                      <div className="flex items-start justify-between gap-3">
                        <BookOpen className="h-6 w-6 shrink-0 text-primary" />
                        <div className="min-w-0 flex-1">
                          <b>{course.title}</b>
                          <p className="text-sm text-muted-foreground">
                            {course.role}
                            {course.required ? " · Obligatorio" : ""}
                          </p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm">
                        {progress.acknowledged}/{progress.total} lecturas personales
                      </p>
                      <progress
                        aria-label={`Lectura de ${course.title}`}
                        className="my-3 h-2 w-full accent-primary"
                        value={progress.acknowledged}
                        max={progress.total || 1}
                      />
                      <Btn variant="soft" onClick={() => setCourseId(course.id)}>
                        Abrir curso
                      </Btn>
                    </Card>
                  );
                })
              ) : (
                <Empty title="No hay cursos para mostrar" />
              )}
            </>
          ) : null}
          {admin && (
            <>
              <SectionTitle>
                {part === "versiones"
                  ? "Historial de preparaciones"
                  : part === "rutas" || part === "onboarding"
                    ? "Rutas preparadas"
                    : "Preparaciones reservadas"}
              </SectionTitle>
              {shownDrafts.length ? (
                shownDrafts.map((row) => (
                  <Card key={row.id} className="mb-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <b>{row.draft.title}</b>
                      <span className="text-xs font-bold text-primary">
                        Borrador · v{row.draft.revision}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {kinds[row.draft.kind]} · {row.draft.audience} ·{" "}
                      {new Date(row.createdAt).toLocaleString("es-CO", {
                        timeZone: "America/Bogota",
                      })}
                    </p>
                    <p className="my-3 text-sm">{row.draft.purpose}</p>
                    <details>
                      <summary className="cursor-pointer text-sm font-bold text-primary">
                        Ver contenido
                      </summary>
                      {row.draft.outline.map((line, index) => (
                        <p key={index} className="mt-2 text-sm">
                          {index + 1}. {line}
                        </p>
                      ))}
                      {row.draft.questions.map((question) => (
                        <fieldset key={question.id} className="mt-3 border-t border-border pt-3">
                          <legend className="text-sm font-bold">{question.prompt}</legend>
                          {question.options.map((option) => (
                            <p key={option} className="py-1 text-sm">
                              ○ {option}
                            </p>
                          ))}
                        </fieldset>
                      ))}
                    </details>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Btn
                        variant="outline"
                        onClick={() =>
                          setDraft({
                            ...row.draft,
                            requestId: crypto.randomUUID(),
                            revision: row.draft.revision + 1,
                          })
                        }
                      >
                        Nueva revisión
                      </Btn>
                      <Btn disabled>Publicar</Btn>
                    </div>
                  </Card>
                ))
              ) : (
                <Empty title="Sin preparaciones en esta sección" />
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
function CourseLessons({
  courseId,
  snapshot,
  uid,
  busy,
  acknowledge,
}: {
  courseId: string;
  snapshot: Snapshot;
  uid: string;
  busy: boolean;
  acknowledge: (lesson: AcademyLesson) => Promise<void>;
}) {
  const lessons = snapshot.lessons
    .filter((lesson) => lesson.course_id === courseId)
    .sort((a, b) => a.position - b.position);
  return lessons.length ? (
    <>
      {lessons.map((lesson) => {
        const read = snapshot.completions.some(
          (completion) => completion.user_id === uid && completion.lesson_id === lesson.id,
        );
        return (
          <Card key={lesson.id} className="mb-4">
            <b>{lesson.title}</b>
            <p className="my-4 whitespace-pre-wrap text-sm leading-relaxed">{lesson.body}</p>
            <Btn variant="outline" disabled={busy || read} onClick={() => void acknowledge(lesson)}>
              <CheckCircle2 className="h-4 w-4" />
              {read ? "Lectura registrada" : "Registrar lectura"}
            </Btn>
          </Card>
        );
      })}
    </>
  ) : (
    <Empty title="Sin lecciones publicadas" />
  );
}
function DraftEditor({
  draft,
  onChange,
  courses,
  busy,
  onSave,
  onCancel,
}: {
  draft: AcademyDraft;
  onChange: (draft: AcademyDraft) => void;
  courses: Snapshot["courses"];
  busy: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [preview, setPreview] = useState(false);
  const [optionText, setOptionText] = useState<Record<string, string>>({});
  const updateQuestion = (index: number, patch: Partial<AcademyDraft["questions"][number]>) =>
    onChange({
      ...draft,
      questions: draft.questions.map((question, i) =>
        i === index ? { ...question, ...patch } : question,
      ),
    });
  const reorder = (index: number, direction: number) => {
    const questions = [...draft.questions];
    const current = questions[index];
    const other = questions[index + direction];
    if (!current || !other) return;
    questions[index] = other;
    questions[index + direction] = current;
    onChange({ ...draft, questions });
  };
  return (
    <section className="space-y-4">
      <SectionTitle>
        {kinds[draft.kind]} · Preparación v{draft.revision}
      </SectionTitle>
      <label className="block text-sm font-bold">
        Título
        <input
          className={`${input} mt-2`}
          aria-label="Título de preparación"
          value={draft.title}
          onChange={(event) => onChange({ ...draft, title: event.target.value })}
        />
      </label>
      <label className="block text-sm font-bold">
        Objetivo
        <textarea
          className={`${input} mt-2`}
          rows={3}
          aria-label="Objetivo de preparación"
          value={draft.purpose}
          onChange={(event) => onChange({ ...draft, purpose: event.target.value })}
        />
      </label>
      <label className="block text-sm font-bold">
        Perfil
        <select
          className={`${input} mt-2`}
          aria-label="Perfil de formación"
          value={draft.audience}
          onChange={(event) => {
            const audience = ["Todos", "Administrador", "Luis", "Auxiliar", "Cliente"].find(
              (value) => value === event.target.value,
            ) as AcademyDraft["audience"] | undefined;
            if (audience) onChange({ ...draft, audience });
          }}
        >
          {["Todos", "Administrador", "Luis", "Auxiliar", "Cliente"].map((audience) => (
            <option key={audience}>{audience}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={draft.clinical}
          onChange={(event) => onChange({ ...draft, clinical: event.target.checked })}
        />
        Contenido clínico: requiere aprobación profesional
      </label>
      <fieldset>
        <legend className="mb-2 text-sm font-bold">Cursos vinculados</legend>
        {courses.map((course) => (
          <label key={course.id} className="mb-2 flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={draft.sourceCourseIds.includes(course.id)}
              onChange={() =>
                onChange({
                  ...draft,
                  sourceCourseIds: draft.sourceCourseIds.includes(course.id)
                    ? draft.sourceCourseIds.filter((id) => id !== course.id)
                    : [...draft.sourceCourseIds, course.id],
                })
              }
            />
            {course.title}
          </label>
        ))}
      </fieldset>
      <label className="block text-sm font-bold">
        Contenido, un apartado por línea
        <textarea
          className={`${input} mt-2`}
          rows={4}
          aria-label="Contenido de preparación"
          value={draft.outline.join("\n")}
          onChange={(event) => onChange({ ...draft, outline: event.target.value.split("\n") })}
        />
      </label>
      {draft.kind === "assessment" && (
        <>
          <SectionTitle>Preguntas</SectionTitle>
          {draft.questions.map((question, index) => (
            <Card key={question.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <b>Pregunta {index + 1}</b>
                <div className="flex gap-1">
                  <Btn
                    className="p-2"
                    variant="soft"
                    title="Subir pregunta"
                    aria-label={`Subir pregunta ${index + 1}`}
                    disabled={index === 0}
                    onClick={() => reorder(index, -1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Btn>
                  <Btn
                    className="p-2"
                    variant="soft"
                    title="Bajar pregunta"
                    aria-label={`Bajar pregunta ${index + 1}`}
                    disabled={index === draft.questions.length - 1}
                    onClick={() => reorder(index, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Btn>
                  <Btn
                    className="p-2"
                    variant="outline"
                    title="Eliminar pregunta"
                    aria-label={`Eliminar pregunta ${index + 1}`}
                    onClick={() =>
                      onChange({
                        ...draft,
                        questions: draft.questions.filter((_, i) => i !== index),
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Btn>
                </div>
              </div>
              <input
                className={input}
                aria-label={`Enunciado ${index + 1}`}
                value={question.prompt}
                onChange={(event) => updateQuestion(index, { prompt: event.target.value })}
              />
              <select
                className={input}
                aria-label={`Tipo de pregunta ${index + 1}`}
                value={question.type}
                onChange={(event) => {
                  const type = event.target.value;
                  if (type === "single" || type === "multiple" || type === "reflection")
                    updateQuestion(index, { type });
                }}
              >
                <option value="reflection">Reflexión · requiere revisión</option>
                <option value="single">Selección única</option>
                <option value="multiple">Selección múltiple</option>
              </select>
              {question.type !== "reflection" && (
                <textarea
                  className={input}
                  aria-label={`Opciones ${index + 1}`}
                  placeholder="Una opción por línea, sin clave de respuestas"
                  value={optionText[question.id] ?? question.options.join("\n")}
                  onChange={(event) => {
                    setOptionText({ ...optionText, [question.id]: event.target.value });
                    updateQuestion(index, {
                      options: event.target.value.split("\n").filter((option) => option.trim()),
                    });
                  }}
                />
              )}
            </Card>
          ))}
          <Btn
            variant="outline"
            onClick={() =>
              onChange({
                ...draft,
                questions: [
                  ...draft.questions,
                  { id: crypto.randomUUID(), type: "reflection", prompt: "", options: [] },
                ],
              })
            }
          >
            <Plus className="h-4 w-4" />
            Añadir pregunta
          </Btn>
          <p className="text-sm text-muted-foreground">
            Las claves de respuesta y la calificación oficial quedan reservadas al servicio de
            evaluación protegido.
          </p>
        </>
      )}
      <div className="flex flex-wrap gap-2">
        <Btn disabled={busy} onClick={onSave}>
          <Save className="h-4 w-4" />
          Guardar preparación
        </Btn>
        <Btn variant="soft" onClick={() => setPreview(!preview)}>
          Previsualizar
        </Btn>
        <Btn variant="outline" onClick={onCancel}>
          Cancelar
        </Btn>
        <Btn disabled>Publicar</Btn>
      </div>
      {preview && (
        <div className="border-t border-border py-5">
          <b>{draft.title}</b>
          <p className="my-3">{draft.purpose}</p>
          {draft.outline.filter(Boolean).map((line, index) => (
            <p key={index}>
              {index + 1}. {line}
            </p>
          ))}
          {draft.questions.map((question) => (
            <fieldset key={question.id} className="mt-4">
              <legend className="font-bold">{question.prompt}</legend>
              {question.options.map((option) => (
                <label key={option} className="mt-2 flex gap-3">
                  <input
                    type={question.type === "single" ? "radio" : "checkbox"}
                    name={question.id}
                  />
                  {option}
                </label>
              ))}
            </fieldset>
          ))}
        </div>
      )}
    </section>
  );
}
