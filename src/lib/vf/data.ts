import dog from "@/assets/dog.jpg";
import cat from "@/assets/cat.jpg";
import valeria from "@/assets/vet-valeria.jpg";
import martin from "@/assets/vet-martin.jpg";
import sofia from "@/assets/vet-sofia.jpg";

export type VisitStatus = "confirmada" | "pendiente" | "en_curso" | "por_iniciar" | "revision" | "pendiente_okvet" | "finalizada" | "cancelada";
export type StaffStatus = "disponible" | "en_ruta" | "ausente";
export type VisitStep = "programada" | "en_desplazamiento" | "llegada" | "en_atencion" | "finalizada";

export interface Pet { id: string; name: string; species: "Perro" | "Gato"; breed: string; age: string; photo: string; owner: string; allergies: string; }
export interface Staff { id: string; name: string; short: string; role: "Veterinario" | "Auxiliar"; zone: string; status: StaffStatus; nextVisit?: string; photo: string; skills: string[]; load: number; }
export interface Visit { id: string; petId: string; staffId: string | null; service: string; date: string; time: string; status: VisitStatus; zone: string; address: string; step: VisitStep; prep: string[]; okvetRef?: string | null; }
export interface Request { id: string; client: string; phone: string; pet: string; channel: "WhatsApp" | "Llamada" | "Portal"; message: string; status: "nueva" | "en_gestion" | "resuelta"; at: string; }
export interface Incident { id: string; title: string; detail: string; severity: "alta" | "media" | "baja"; status: "abierta" | "en_gestion" | "cerrada"; owner: string; }
export interface Approval { id: string; title: string; detail: string; kind: "reorganizacion" | "cobro" | "reemplazo" | "ruta"; status: "pendiente" | "aprobada" | "rechazada"; }
export interface Payment { id: string; client: string; concept: string; amount: number; status: "pagado" | "pendiente" | "vencido"; date: string; }
export interface Task { id: string; title: string; done: boolean; staffId: string; }
export interface Item { id: string; name: string; stock: number; min: number; lot: string; expires: string; }
export interface Course { id: string; title: string; role: string; progress: number; required: boolean; reviewed: string; }
export interface Referral { id: string; pet: string; specialty: string; status: "por_resolver" | "agendada" | "cerrada"; specialist?: string; }
export interface Treatment { id: string; pet: string; plan: string; frequency: string; responsible: string; done: number; total: number; }
export interface Notification { id: string; title: string; body: string; read: boolean; }

export const IMG = { dog, cat, valeria, martin, sofia };

export const pets: Pet[] = [
  { id: "luna", name: "Luna", species: "Perro", breed: "Golden Retriever", age: "4 años", photo: dog, owner: "Familia Gómez", allergies: "Ninguna registrada" },
  { id: "bruno", name: "Bruno", species: "Gato", breed: "Atigrado doméstico", age: "2 años", photo: cat, owner: "Familia Gómez", allergies: "Pollo" },
];

export const staff: Staff[] = [
  { id: "valeria", name: "Dra. Valeria Torres", short: "Dra. Valeria", role: "Veterinario", zone: "Zona Norte", status: "disponible", nextVisit: "10:00", photo: valeria, skills: ["Medicina preventiva", "Vacunación", "Felinos"], load: 70 },
  { id: "martin", name: "Dr. Martín Rojas", short: "Dr. Rojas", role: "Veterinario", zone: "Zona Centro", status: "en_ruta", nextVisit: "12:30", photo: martin, skills: ["Medicina interna", "Curaciones"], load: 85 },
  { id: "sofia", name: "Dra. Sofía Méndez", short: "Dra. Sofía", role: "Veterinario", zone: "Zona Sur", status: "ausente", photo: sofia, skills: ["Geriatría", "Tratamientos recurrentes"], load: 0 },
];

export const visits: Visit[] = [
  { id: "v1", petId: "luna", staffId: "valeria", service: "Control preventivo", date: "Mar, 28 de enero", time: "09:00", status: "confirmada", zone: "Zona Norte", address: "Cra 15 #93-40, Bogotá", step: "programada", prep: ["Kit preventivo", "Báscula portátil"] },
  { id: "v2", petId: "bruno", staffId: "martin", service: "Vacunación", date: "Mar, 28 de enero", time: "10:30", status: "confirmada", zone: "Zona Centro", address: "Cl 45 #13-20, Bogotá", step: "programada", prep: ["Vacuna triple felina", "Cadena de frío"] },
  { id: "v3", petId: "luna", staffId: null, service: "Reasignación pendiente", date: "Mar, 28 de enero", time: "12:30", status: "pendiente", zone: "Zona Sur", address: "Cl 9 Sur #24-11, Bogotá", step: "programada", prep: [] },
  { id: "v4", petId: "bruno", staffId: "valeria", service: "Control recurrente", date: "Mar, 28 de enero", time: "15:00", status: "revision", zone: "Zona Norte", address: "Cra 15 #93-40, Bogotá", step: "programada", prep: ["Plan recurrente aprobado"] },
  { id: "v5", petId: "luna", staffId: "valeria", service: "Control preventivo", date: "Mar, 28 de enero", time: "10:00", status: "confirmada", zone: "Zona Norte", address: "Cra 15 #93-40, Bogotá", step: "programada", prep: ["Kit preventivo"] },
  { id: "v6", petId: "bruno", staffId: "martin", service: "Vacunación", date: "Jue, 30 de enero", time: "15:30", status: "pendiente", zone: "Zona Centro", address: "Cl 45 #13-20, Bogotá", step: "programada", prep: ["Vacuna triple felina"] },
];

export const requests: Request[] = [
  { id: "r1", client: "Andrea Gómez", phone: "300 555 1201", pet: "Luna", channel: "WhatsApp", message: "¿Pueden venir mañana a vacunar?", status: "nueva", at: "08:12" },
  { id: "r2", client: "Carlos Pérez", phone: "310 555 8844", pet: "Toby", channel: "Llamada", message: "Mi perro no quiere comer desde ayer.", status: "nueva", at: "08:40" },
  { id: "r3", client: "Marta Ruiz", phone: "315 555 0021", pet: "Mia", channel: "WhatsApp", message: "Necesito reprogramar la cita del jueves.", status: "nueva", at: "09:02" },
  { id: "r4", client: "Jorge Díaz", phone: "320 555 7732", pet: "Rocky", channel: "Portal", message: "Solicito control geriátrico.", status: "nueva", at: "09:15" },
  { id: "r5", client: "Lucía Herrera", phone: "301 555 4410", pet: "Nala", channel: "WhatsApp", message: "¿Tienen cupo para esterilización?", status: "nueva", at: "09:30" },
  { id: "r6", client: "Pedro Castro", phone: "312 555 9090", pet: "Max", channel: "Llamada", message: "Quiero cotizar paquete de vacunas.", status: "nueva", at: "09:48" },
];

export const incidents: Incident[] = [
  { id: "i1", title: "Visita con retraso", detail: "Luna · Hoy, 10:00 · +20 min", severity: "media", status: "abierta", owner: "Coordinación" },
  { id: "i2", title: "Tráfico en Av. Boyacá", detail: "Ruta Norte afectada", severity: "baja", status: "abierta", owner: "Coordinación" },
];

export const approvals: Approval[] = [
  { id: "a1", title: "Aprobar reorganización", detail: "Mover visita de 12:30 a Dra. Valeria por ausencia de Dra. Sofía.", kind: "reorganizacion", status: "pendiente" },
  { id: "a2", title: "Cobro alto pendiente", detail: "Cirugía menor · Familia Ruiz · $ 1.850.000 COP", kind: "cobro", status: "pendiente" },
  { id: "a3", title: "Solicitud de reemplazo", detail: "Dra. Torres · 28 de enero, turno tarde", kind: "reemplazo", status: "pendiente" },
];

export const payments: Payment[] = [
  { id: "p1", client: "Familia Gómez", concept: "Control preventivo · Luna", amount: 180000, status: "pagado", date: "Hoy" },
  { id: "p2", client: "Familia Ruiz", concept: "Cirugía menor · Mia", amount: 1850000, status: "pendiente", date: "Hoy" },
  { id: "p3", client: "Familia Díaz", concept: "Vacunación · Rocky", amount: 150000, status: "pagado", date: "Hoy" },
  { id: "p4", client: "Familia Castro", concept: "Consulta general · Max", amount: 220000, status: "vencido", date: "15 ene" },
];

export const tasks: Task[] = [
  { id: "t1", title: "Revisar kit de vacunas", done: false, staffId: "valeria" },
  { id: "t2", title: "Confirmar dirección de Luna", done: true, staffId: "valeria" },
  { id: "t3", title: "Cierre de jornada", done: false, staffId: "valeria" },
];

export const items: Item[] = [
  { id: "in1", name: "Vacuna triple felina", stock: 4, min: 5, lot: "TF-2291", expires: "2026-03-10" },
  { id: "in2", name: "Jeringas 3 ml", stock: 120, min: 50, lot: "J3-110", expires: "2028-01-01" },
  { id: "in3", name: "Gasas estériles", stock: 35, min: 40, lot: "GS-778", expires: "2027-06-01" },
];

export const courses: Course[] = [
  { id: "c1", title: "Protocolo de visita domiciliaria", role: "Veterinario", progress: 100, required: true, reviewed: "Ene 2026" },
  { id: "c2", title: "Bioseguridad y manejo de residuos", role: "Todos", progress: 60, required: true, reviewed: "Dic 2025" },
  { id: "c3", title: "Comunicación empática en duelo", role: "Todos", progress: 0, required: false, reviewed: "Nov 2025" },
];

export const referrals: Referral[] = [
  { id: "rf1", pet: "Luna", specialty: "Dermatología", status: "por_resolver" },
  { id: "rf2", pet: "Bruno", specialty: "Cardiología", status: "agendada", specialist: "Dr. Andrés Vela" },
];

export const specialists = [
  { id: "s1", name: "Dr. Andrés Vela", specialty: "Cardiología", city: "Bogotá" },
  { id: "s2", name: "Dra. Paula Ríos", specialty: "Dermatología", city: "Bogotá" },
  { id: "s3", name: "Dr. Felipe Mora", specialty: "Oftalmología", city: "Chía" },
];

export const treatments: Treatment[] = [
  { id: "tr1", pet: "Bruno", plan: "Control renal", frequency: "Cada 15 días", responsible: "Dra. Valeria Torres", done: 3, total: 8 },
  { id: "tr2", pet: "Luna", plan: "Fisioterapia articular", frequency: "Semanal", responsible: "Dr. Martín Rojas", done: 5, total: 12 },
];

export const notifications: Notification[] = [
  { id: "n1", title: "Cita confirmada", body: "Luna · Mar 28 de enero, 10:00", read: false },
  { id: "n2", title: "Recordatorio de vacuna", body: "Bruno tiene vacunación el jueves", read: false },
  { id: "n3", title: "Pago recibido", body: "$ 180.000 COP · Control preventivo", read: true },
];

export const services = ["Consulta general", "Control preventivo", "Vacunación", "Control recurrente", "Curación", "Toma de muestras"];
export const zones = ["Zona Norte", "Zona Centro", "Zona Sur"];
