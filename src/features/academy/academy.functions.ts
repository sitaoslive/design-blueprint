import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { AcademyDraftSchema, courseAudienceMatches, validAcademyRevision } from "./domain";

export const readAcademy = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const staff = await context.supabase.rpc("is_staff", { _uid: context.userId });
    if (staff.error || !staff.data) throw new Error("Formación: acceso no autorizado");
    const rolesResult = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (rolesResult.error) throw new Error("No se pudieron verificar tus permisos");
    const roles = (rolesResult.data ?? []).map((row) => row.role);
    const director = roles.some((role) => role === "luis" || role === "administrador");
    const catalog = await context.supabase
      .from("courses")
      .select("id,title,role,required,reviewed")
      .order("title");
    if (catalog.error) throw new Error("No se pudieron cargar los cursos");
    const courses = (catalog.data ?? []).filter(
      (course) => director || courseAudienceMatches(course.role, roles),
    );
    const courseIds = courses.map((course) => course.id);
    const [lessons, completions, drafts, members, teamRoles] = await Promise.all([
      context.supabase
        .from("course_lessons")
        .select("id,course_id,title,body,position")
        .in("course_id", courseIds)
        .order("position"),
      director
        ? context.supabase.from("lesson_completions").select("user_id,lesson_id,completed_at")
        : context.supabase
            .from("lesson_completions")
            .select("user_id,lesson_id,completed_at")
            .eq("user_id", context.userId),
      director
        ? context.supabase
            .from("records")
            .select("id,data,created_at")
            .eq("kind", "academy_preparation")
            .eq("scope", "director")
            .eq("status", "DRAFT_ONLY")
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      director
        ? context.supabase.from("staff_members").select("name,user_id").not("user_id", "is", null)
        : Promise.resolve({ data: [], error: null }),
      director
        ? context.supabase.from("user_roles").select("user_id,role")
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (lessons.error || completions.error || drafts.error || members.error || teamRoles.error)
      throw new Error("No se pudo cargar tu formación completa");
    return {
      courses,
      lessons: lessons.data ?? [],
      completions: completions.data ?? [],
      team: (members.data ?? []).flatMap((member) =>
        member.user_id
          ? [
              {
                userId: member.user_id,
                name: member.name,
                roles: (teamRoles.data ?? [])
                  .filter((row) => row.user_id === member.user_id)
                  .map((row) => String(row.role)),
              },
            ]
          : [],
      ),
      drafts: (drafts.data ?? []).flatMap((row) => {
        const parsed = AcademyDraftSchema.safeParse(row.data);
        return parsed.success
          ? [{ id: row.id, draft: parsed.data, createdAt: row.created_at }]
          : [];
      }),
    };
  });

/** Reserved preparations only: never publish, score, assign competency or grant a role. */
export const saveAcademyDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AcademyDraftSchema.parse(input))
  .handler(async ({ data, context }) => {
    const permission = await context.supabase.rpc("is_director", { _uid: context.userId });
    if (permission.error || permission.data !== true)
      throw new Error("Solo Administración prepara formación");
    if (data.parentDraftId) {
      const parent = await context.supabase
        .from("records")
        .select("data")
        .eq("id", data.parentDraftId)
        .eq("kind", "academy_preparation")
        .eq("scope", "director")
        .eq("status", "DRAFT_ONLY")
        .single();
      const parsed = AcademyDraftSchema.safeParse(parent.data?.data);
      if (parent.error || !parsed.success || !validAcademyRevision(parsed.data, data))
        throw new Error("La revisión debe continuar una preparación existente del mismo tipo");
    } else if (data.revision !== 1)
      throw new Error("Vincula la preparación anterior para crear otra revisión");
    if (data.targetUserIds?.length) {
      const targets = await context.supabase
        .from("staff_members")
        .select("user_id")
        .in("user_id", data.targetUserIds);
      const ids = new Set((targets.data ?? []).map((row) => row.user_id));
      if (targets.error || data.targetUserIds.some((id) => !ids.has(id)))
        throw new Error("Una persona no tiene un perfil del equipo vinculado");
    }
    if (data.sourceCourseIds.length) {
      const linked = await context.supabase
        .from("courses")
        .select("id")
        .in("id", data.sourceCourseIds);
      if (linked.error || linked.data?.length !== data.sourceCourseIds.length)
        throw new Error("Un curso vinculado no existe o ya no está disponible");
    }
    const reply = await context.supabase
      .from("records")
      .insert({
        id: data.requestId,
        kind: "academy_preparation",
        scope: "director",
        owner_id: context.userId,
        created_by: context.userId,
        title: data.title,
        detail: "Preparación de Academy, sin publicación ni acreditación",
        status: "DRAFT_ONLY",
        data,
      })
      .select("id,status")
      .single();
    if (reply.error?.code === "23505") {
      const prior = await context.supabase
        .from("records")
        .select("id,data,created_by,status")
        .eq("id", data.requestId)
        .eq("kind", "academy_preparation")
        .single();
      const parsed = AcademyDraftSchema.safeParse(prior.data?.data);
      if (
        prior.error ||
        !parsed.success ||
        prior.data?.created_by !== context.userId ||
        prior.data.status !== "DRAFT_ONLY" ||
        JSON.stringify(parsed.data) !== JSON.stringify(data)
      )
        throw new Error("Esta preparación ya existe con otro contenido");
      return { id: prior.data.id, status: prior.data.status };
    }
    if (reply.error || !reply.data) throw new Error("No se pudo guardar la preparación");
    return reply.data;
  });
