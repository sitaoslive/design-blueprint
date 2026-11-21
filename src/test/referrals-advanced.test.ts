import { describe, it, expect } from "vitest";
import {
  credentialStatus,
  emptyProfile,
  connectionPolicy,
  validateWindow,
  windowState,
  compareSpecialists,
  validateConfirmation,
  parseConfirmation,
  confirmationNote,
  canCloseReferral,
  sharingEligibility,
  draftKey,
  colombiaInstant,
  type ReportedWindow,
  type BookingConfirmation,
} from "@/features/referrals/domain/advanced";
import { buildOffer, validOffers } from "@/features/referrals/domain";
import { unavailableReferralGateway } from "@/features/referrals/application/contracts";
const now = new Date("2026-11-21T13:54:00Z");
const window: ReportedWindow = {
  specialistId: "s1",
  date: "2026-11-24",
  start: "09:00",
  end: "12:00",
  duration: 30,
  capacity: 1,
  expiresAt: "2026-11-23T12:00:00-05:00",
  source: "Contacto del especialista, llamada registrada",
  location: "Centro autorizado",
  fee: null,
  timezone: "America/Bogota",
};
const confirmed: BookingConfirmation = {
  specialistId: "s1",
  date: "2026-11-24",
  time: "09:00",
  location: "Centro autorizado",
  duration: 30,
  fee: null,
  confirmedBy: "Coordinadora del centro",
  channel: "Llamada",
  confirmedAt: "2026-11-21T08:00:00-05:00",
  reference: "REF-QA-01",
  evidence: "Confirmación administrativa registrada",
  instructions: "",
  assignee: "Coordinación",
  timezone: "America/Bogota",
};
describe("Prompt 08 — reglas avanzadas", () => {
  it("REF8-T07 no verifica por tener nombre o perfil", () =>
    expect(credentialStatus(emptyProfile().credential, now)).toBe("NOT_SUBMITTED"));
  it("REF8-T07 verificación exige referencia y revisor", () =>
    expect(
      credentialStatus(
        { ...emptyProfile().credential, state: "VERIFIED", expiresAt: "2026-12-01T00:00:00Z" },
        now,
      ),
    ).toBe("UNDER_REVIEW"));
  it("ESP: verificación vigente se conserva con evidencia", () =>
    expect(
      credentialStatus(
        {
          state: "VERIFIED",
          reference: "cred-1",
          reviewedAt: "2026-11-20T12:00:00Z",
          reviewedBy: "director",
          expiresAt: "2026-12-01T00:00:00Z",
        },
        now,
      ),
    ).toBe("VERIFIED"));
  it("ESP: documentación vencida nunca queda verificada", () =>
    expect(
      credentialStatus(
        {
          state: "VERIFIED",
          reference: "cred-1",
          reviewedAt: "2026-11-20T12:00:00Z",
          reviewedBy: "director",
          expiresAt: "2026-11-21T12:00:00Z",
        },
        now,
      ),
    ).toBe("EXPIRED"));
  it("REF8-T08 no recomienda suspendidos como elegibles", () => {
    const p = {
      ...emptyProfile(),
      credential: { ...emptyProfile().credential, state: "SUSPENDED" as const },
    };
    expect(
      compareSpecialists(
        [{ id: "s1", specialty: "Cardiología", city: "Bogotá" }],
        { s1: p },
        [window],
        "Cardiología",
        "Bogotá",
        now,
      )[0]?.eligible,
    ).toBe(false);
  });
  it.each([
    "INTERNAL",
    "AUTHORIZED_CALENDAR",
    "REPORTED_WINDOWS",
    "PER_REQUEST",
    "CLINIC_SYSTEM",
  ] as const)("ESPCAL modalidad %s no garantiza una reserva desde navegador", (mode) =>
    expect(connectionPolicy(mode).canHoldLocally).toBe(false),
  );
  it("REF8-T09 registra ventana manual con fuente", () =>
    expect(validateWindow(window, now)).toBeNull());
  it("REF8-T09 no admite fuente vacía", () =>
    expect(validateWindow({ ...window, source: "" }, now)).not.toBeNull());
  it("REF8-T10 fecha Colombia no depende de la zona del dispositivo", () =>
    expect(colombiaInstant("2026-11-24", "09:00").toISOString()).toBe("2026-11-24T14:00:00.000Z"));
  it("REF8-T10 rechaza fechas inexistentes", () =>
    expect(
      validateWindow({ ...window, date: "2027-02-30", expiresAt: "2027-02-28T12:00:00Z" }, now),
    ).not.toBeNull());
  it("ESPCAL hora inicial debe preceder a la final", () =>
    expect(validateWindow({ ...window, start: "12:00", end: "09:00" }, now)).not.toBeNull());
  it("ESPCAL duración debe caber en la ventana", () =>
    expect(validateWindow({ ...window, duration: 181 }, now)).not.toBeNull());
  it("ESPCAL capacidad no negativa", () =>
    expect(validateWindow({ ...window, capacity: -1 }, now)).not.toBeNull());
  it("REF8-T15 cupo cero es no disponible", () =>
    expect(windowState({ ...window, capacity: 0 }, now)).toBe("UNAVAILABLE"));
  it("REF8-T11 horario expirado no se ofrece", () =>
    expect(windowState({ ...window, expiresAt: "2026-11-20T12:00:00Z" }, now)).toBe("EXPIRED"));
  it("REF8-T17 confirmación con evidencia y estado correcto válida", () =>
    expect(validateConfirmation(confirmed, "PENDING_EXTERNAL_CONFIRMATION", now)).toBeNull());
  it("REF8-T17 falta evidencia impide confirmar", () =>
    expect(
      validateConfirmation({ ...confirmed, evidence: "" }, "PENDING_EXTERNAL_CONFIRMATION", now),
    ).not.toBeNull());
  it("REF8-T16 selección no equivale a cita confirmada", () =>
    expect(validateConfirmation(confirmed, "SLOT_SELECTED", now)).not.toBeNull());
  it("REF8-T18 detecta confirmación duplicada", () =>
    expect(
      validateConfirmation(confirmed, "PENDING_EXTERNAL_CONFIRMATION", now, [confirmed]),
    ).toContain("Ya existe"));
  it("SPBOOK no acepta evidencia fechada en el futuro", () =>
    expect(
      validateConfirmation(
        { ...confirmed, confirmedAt: "2026-11-22T12:00:00Z" },
        "PENDING_EXTERNAL_CONFIRMATION",
        now,
      ),
    ).not.toBeNull());
  it("SPBOOK evidencia estructurada se recupera del historial", () =>
    expect(parseConfirmation(confirmationNote(confirmed))).toEqual(confirmed));
  it("REF8-T25 cierre no procede con compromisos pendientes", () =>
    expect(canCloseReferral("FOLLOW_UP_SCHEDULED", 1)).toBe(false));
  it("DOC8-T02 compartir requiere consentimiento", () =>
    expect(
      sharingEligibility(
        {
          consent: false,
          approved: true,
          expiresAt: "2026-11-24T12:00:00Z",
          revoked: false,
          sameReferral: true,
        },
        now,
      ),
    ).toBe(false));
  it("DOC8-T04 documento de otra remisión no es compartible", () =>
    expect(
      sharingEligibility(
        {
          consent: true,
          approved: true,
          expiresAt: "2026-11-24T12:00:00Z",
          revoked: false,
          sameReferral: false,
        },
        now,
      ),
    ).toBe(false));
  it("DOC8-T06 enlace vencido no es compartible", () =>
    expect(
      sharingEligibility(
        {
          consent: true,
          approved: true,
          expiresAt: "2026-11-20T12:00:00Z",
          revoked: false,
          sameReferral: true,
        },
        now,
      ),
    ).toBe(false));
  it("DOC8-T09 acceso revocado no es compartible", () =>
    expect(
      sharingEligibility(
        {
          consent: true,
          approved: true,
          expiresAt: "2026-11-24T12:00:00Z",
          revoked: true,
          sameReferral: true,
        },
        now,
      ),
    ).toBe(false));
  it("POST8: clave evita doble toque para misma visita y especialidad", () => {
    const draft = {
      petId: "luna",
      visitId: "v1",
      specialty: "Cardiología",
      okvetRef: "",
      modality: "Externo" as const,
      preferredSpecialist: "",
      preferences: "",
      documents: "",
      assignee: "Coordinación",
      dueAt: "2026-11-24T12:00:00Z",
      nextAction: "Pedir aprobación",
    };
    expect(draftKey(draft)).toBe(draftKey({ ...draft, specialty: " cardiología " }));
    expect(draftKey(draft)).not.toBe(draftKey({ ...draft, visitId: "v2" }));
  });
  it("contrato externo no devuelve un envío ficticio", () =>
    expect(
      unavailableReferralGateway.sendOptions({
        organizationId: "vetlife",
        referralId: "rf1",
        expectedVersion: 1,
        idempotencyKey: "qa1",
        correlationId: "b2418086-a0d5-446f-b729-994441cfe0c1",
      }),
    ).rejects.toThrow("INTEGRATION_UNAVAILABLE"));
  it("REF8-T14 fecha de expiración inválida se rechaza", () =>
    expect(
      buildOffer(
        {
          date: "2026-11-24",
          time: "09:00",
          location: "Centro",
          expiresAt: "inválida",
          subjectToConfirmation: true,
        },
        now,
        true,
      ),
    ).toBeTypeOf("string"));
  it("REF8-T10 ofertas a las 09:00 Colombia siguen vigentes a las 13:54 UTC", () =>
    expect(
      validOffers(
        [
          {
            id: "today",
            date: "2026-11-21",
            time: "09:00",
            location: "Centro",
            expiresAt: "2026-11-21T13:59:00Z",
            subjectToConfirmation: true,
          },
        ],
        now,
      ).length,
    ).toBe(1));
});
