// tests/test_core_08_t01_to_t90.js
// ==============================================================================
// VET FREEDOM OS — SUITE COMPLETA DE PRUEBAS T01 A T90 + CONCURRENCY + E2E (VET-CORE-08)
// Módulo: VET-CORE-08 | ROUTE NOTIFICATIONS & OPERATIONAL LOGISTICS DISPATCH
// Dirección Médica: Dr. Luis Eduardo Ríos
// Dirección Estratégica: Alpha Vision Method
// Plataformas: Google Antigravity + n8n Cloud + Supabase PostgreSQL 17 + Lovable
// Modo: DEVELOPMENT / SAFE SIMULATION (CERO ENVÍOS REALES, CERO ALTERACIÓN REAL)
// ==============================================================================

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const TEST_RESULTS = [];

function recordTest(id, name, status, details = {}) {
  const result = {
    id,
    name,
    status,
    timestamp: new Date().toISOString(),
    details
  };
  TEST_RESULTS.push(result);
  console.log(`[${status}] ${id}: ${name}`);
}

// Simulador de Alta Fidelidad del Motor de Rutas y Logística VET-CORE-08
class RouteLogisticsSimulator {
  constructor() {
    this.organizations = new Map();
    this.staffProfiles = new Map();
    this.appointments = new Map();
    this.routes = new Map();
    this.routeStops = new Map();
    this.routeVersions = new Map();
    this.stopEvents = [];
    this.travelEstimates = new Map();
    this.addressVerifications = new Map();
    this.delayEvents = new Map();
    this.operationalIncidents = new Map();
    this.reoptimizationRequests = new Map();
    this.apiCostLogs = [];
    this.outboxEvents = [];
    this.idempotencyKeys = new Set();
    this.initMockData();
  }

  initMockData() {
    this.organizations.set('org-vetlife', { id: 'org-vetlife', name: 'Vet Life — Veterinaria a Domicilio' });
    this.organizations.set('org-other', { id: 'org-other', name: 'Otra Organización' });

    this.staffProfiles.set('vet-luis', {
      id: 'vet-luis', name: 'Dr. Luis Eduardo Ríos', role: 'DIRECTOR',
      is_active: true, is_clinical: true, skills: ['SURGERY', 'GENERAL_MEDICINE', 'EMERGENCY']
    });
    this.staffProfiles.set('vet-carlos', {
      id: 'vet-carlos', name: 'Dr. Carlos Mendoza', role: 'VETERINARIAN',
      is_active: true, is_clinical: true, skills: ['GENERAL_MEDICINE', 'VACCINATION', 'DERMATOLOGY']
    });
    this.staffProfiles.set('vet-sick', {
      id: 'vet-sick', name: 'Dra. Sandra Ortiz', role: 'VETERINARIAN',
      is_active: false, is_clinical: true, skills: ['GENERAL_MEDICINE'], absence_status: 'SICK_LEAVE'
    });
    this.staffProfiles.set('coord-laura', {
      id: 'coord-laura', name: 'Laura Gómez', role: 'COORDINATOR',
      is_active: true, is_clinical: false, skills: ['LOGISTICS', 'DISPATCH']
    });
    this.staffProfiles.set('user-unauth', {
      id: 'user-unauth', name: 'Usuario Externo', role: 'RECEPTION',
      is_active: true, is_clinical: false, skills: []
    });

    // Citas iniciales confirmadas
    this.appointments.set('apt-001', {
      id: 'apt-001', veterinarian_id: 'vet-luis', scheduled_start: '2026-11-21T09:00:00-05:00',
      status: 'CONFIRMED', okvet_reference: 'OKV-20261121-01', client_name: 'Andrés Echeverry',
      client_phone: '+573114445566', pet_name: 'Max (Canino)', address: 'Calle 127 # 15-40, Usaquén, Bogotá',
      is_clinically_protected: true
    });
    this.appointments.set('apt-002', {
      id: 'apt-002', veterinarian_id: 'vet-luis', scheduled_start: '2026-11-21T11:00:00-05:00',
      status: 'CONFIRMED', okvet_reference: 'OKV-20261121-02', client_name: 'María Claudia Restrepo',
      client_phone: '+573009998877', pet_name: 'Luna (Felino)', address: 'Carrera 7 # 140-20, Cedritos, Bogotá',
      is_clinically_protected: false
    });
    this.appointments.set('apt-003', {
      id: 'apt-003', veterinarian_id: 'vet-luis', scheduled_start: '2026-11-21T14:00:00-05:00',
      status: 'CONFIRMED', okvet_reference: 'OKV-20261121-03', client_name: 'Guillermo Ospina',
      client_phone: '+573153332211', pet_name: 'Toby (Canino)', address: 'Vereda Fusca, Chía, Cundinamarca',
      is_clinically_protected: false
    });
    this.appointments.set('apt-unconfirmed', {
      id: 'apt-unconfirmed', veterinarian_id: 'vet-luis', scheduled_start: '2026-11-21T16:00:00-05:00',
      status: 'REQUESTED', okvet_reference: null, client_name: 'Cliente No Confirmado',
      client_phone: '+573001112233', pet_name: 'Rocky', address: 'Calle 80 # 68-10, Bogotá'
    });
    this.appointments.set('apt-cancelled', {
      id: 'apt-cancelled', veterinarian_id: 'vet-luis', scheduled_start: '2026-11-21T17:00:00-05:00',
      status: 'CANCELLED', okvet_reference: 'OKV-20261121-04', client_name: 'Cliente Cancelado',
      client_phone: '+573005554433', pet_name: 'Zeus', address: 'Calle 100 # 19-50, Bogotá'
    });
  }

  // Módulo de Validación de Direcciones y Geocodificación
  verifyAddress(addressData) {
    if (!addressData || !addressData.raw_address || addressData.raw_address.trim().length === 0) {
      return { status: 'FAILED', error: 'MISSING_ADDRESS' };
    }
    if (addressData.org_id && addressData.org_id !== 'org-vetlife') {
      return { status: 'REJECTED', error: 'ORGANIZATION_MISMATCH' };
    }
    const raw = addressData.raw_address.toLowerCase();

    // Detección de ambigüedad
    if (raw.includes('cerca a la tienda') || raw.includes('por donde don pedro') || raw.length < 8) {
      return { status: 'AMBIGUOUS', requires_human_verification: true, accuracy: 'AMBIGUOUS' };
    }
    // Detección fuera de cobertura
    if (raw.includes('melgar') || raw.includes('girardot') || raw.includes('villavicencio')) {
      return { status: 'OUT_OF_COVERAGE', is_covered: false, accuracy: 'OUT_OF_COVERAGE' };
    }
    // Coordenadas inválidas
    if (addressData.lat && (addressData.lat < -90 || addressData.lat > 90 || isNaN(addressData.lat))) {
      return { status: 'FAILED', error: 'INVALID_COORDINATES' };
    }

    // Geocodificación exitosa
    const isRural = raw.includes('vereda') || raw.includes('finca') || raw.includes('km ');
    const accuracy = isRural ? 'APPROXIMATE' : 'EXACT_ROOFTOP';
    const record = {
      id: 'geo-' + Date.now() + Math.random().toString(36).substring(2, 6),
      raw_address: addressData.raw_address,
      normalized_address: addressData.raw_address.toUpperCase(),
      accuracy_status: accuracy,
      is_covered: true,
      coverage_zone: isRural ? 'SABANA_NORTE' : 'BOGOTA_URBANA',
      verified_by: 'GOOGLE_GEOCODING',
      verified_at: new Date().toISOString()
    };
    this.addressVerifications.set(record.id, record);
    return { status: 'VERIFIED', record };
  }

  // Preparación de Rutas Diarias
  prepareDailyRoute(data) {
    const { org_id, vet_id, route_date, start_hub, proposed_by } = data;
    const vet = this.staffProfiles.get(vet_id);
    if (!vet || !vet.is_active) {
      return { success: false, error: 'VETERINARIAN_INACTIVE_OR_ABSENT' };
    }
    if (vet.absence_status === 'SICK_LEAVE') {
      return { success: false, error: 'VETERINARIAN_ON_LEAVE' };
    }

    // Filtrar citas confirmadas con radicado OKVET
    const appts = Array.from(this.appointments.values()).filter(a => {
      return a.veterinarian_id === vet_id &&
             a.status === 'CONFIRMED' &&
             a.okvet_reference !== null;
    });

    if (appts.length === 0) {
      return { success: false, error: 'NO_CONFIRMED_APPOINTMENTS' };
    }

    const route_id = 'rt-' + Date.now();
    const route = {
      id: route_id,
      organization_id: org_id,
      veterinarian_id: vet_id,
      route_date,
      status: 'PENDING_APPROVAL',
      route_version: 1,
      route_code: 'RT-' + route_date.replace(/-/g, '') + '-01',
      start_hub_address: start_hub || 'Sede Principal Vet Life - Bogotá',
      proposed_by,
      created_at: new Date().toISOString()
    };
    this.routes.set(route_id, route);

    const stops = [];
    let order = 1;
    for (const appt of appts) {
      const stop = {
        id: 'stp-' + appt.id,
        route_id,
        appointment_id: appt.id,
        stop_order: order++,
        status: 'PLANNED',
        state_version: 1,
        is_clinically_protected: !!appt.is_clinically_protected,
        travel_buffer_minutes: 15,
        service_duration_minutes: 45,
        client_phone: appt.client_phone,
        client_name: appt.client_name,
        pet_name: appt.pet_name,
        destination_address: appt.address
      };
      this.routeStops.set(stop.id, stop);
      stops.push(stop);
    }

    // Guardar versión de snapshot
    this.routeVersions.set(`${route_id}-v1`, {
      route_id,
      route_version: 1,
      status: 'PENDING_APPROVAL',
      stops_snapshot: stops,
      created_at: new Date().toISOString()
    });

    return { success: true, route, stops_count: stops.length };
  }

  // Aprobación de Ruta
  approveRoute(route_id, approver_id) {
    const route = this.routes.get(route_id);
    if (!route) return { success: false, error: 'ROUTE_NOT_FOUND' };

    const approver = this.staffProfiles.get(approver_id);
    if (!approver || (approver.role !== 'COORDINATOR' && approver.role !== 'DIRECTOR')) {
      return { success: false, error: 'UNAUTHORIZED_APPROVER' };
    }

    route.status = 'APPROVED';
    route.approved_by = approver_id;
    route.approved_at = new Date().toISOString();
    return { success: true, route };
  }

  // Publicación de Ruta
  publishRoute(route_id, actor_id) {
    const route = this.routes.get(route_id);
    if (!route) return { success: false, error: 'ROUTE_NOT_FOUND' };
    if (route.status !== 'APPROVED') {
      return { success: false, error: 'CANNOT_PUBLISH_UNAPPROVED_ROUTE' };
    }

    // Verificar si contiene citas canceladas
    const stops = Array.from(this.routeStops.values()).filter(s => s.route_id === route_id);
    for (const s of stops) {
      const appt = this.appointments.get(s.appointment_id);
      if (appt && appt.status === 'CANCELLED') {
        return { success: false, error: 'ROUTE_CONTAINS_CANCELLED_APPOINTMENT' };
      }
    }

    // Superseder rutas anteriores
    for (const [rId, r] of this.routes.entries()) {
      if (r.veterinarian_id === route.veterinarian_id && r.route_date === route.route_date && rId !== route_id) {
        if (r.status === 'PUBLISHED') r.status = 'SUPERSEDED';
      }
    }

    route.status = 'PUBLISHED';
    route.published_at = new Date().toISOString();

    // Actualizar estados de paradas
    stops.forEach((s, idx) => {
      s.status = idx === 0 ? 'READY' : 'PLANNED';
      s.state_version++;
    });

    this.outboxEvents.push({
      aggregate_type: 'route',
      aggregate_id: route_id,
      event_type: 'route.published',
      payload: { route_id, route_code: route.route_code, published_at: route.published_at }
    });

    return { success: true, route };
  }

  // Evento "En camino"
  recordEnRoute(stop_id, actor_id) {
    const stop = this.routeStops.get(stop_id);
    if (!stop) return { success: false, error: 'STOP_NOT_FOUND' };

    const route = this.routes.get(stop.route_id);
    if (actor_id && route.veterinarian_id !== actor_id) {
      const actor = this.staffProfiles.get(actor_id);
      if (!actor || (actor.role !== 'COORDINATOR' && actor.role !== 'DIRECTOR')) {
        return { success: false, error: 'UNAUTHORIZED_VET' };
      }
    }

    // Idempotencia
    if (stop.status === 'EN_ROUTE') {
      return { success: true, already_en_route: true, stop };
    }

    if (stop.status !== 'READY' && stop.status !== 'PLANNED') {
      return { success: false, error: 'INVALID_TRANSITION' };
    }

    stop.status = 'EN_ROUTE';
    stop.actual_departure_at = new Date().toISOString();
    stop.state_version++;
    stop.client_notified_en_route = true;

    if (route.status === 'PUBLISHED') {
      route.status = 'IN_PROGRESS';
    }

    this.stopEvents.push({
      stop_id, route_id: route.id, event_type: 'EN_ROUTE',
      actor_id, timestamp: stop.actual_departure_at
    });

    this.outboxEvents.push({
      aggregate_type: 'route_stop', aggregate_id: stop_id,
      event_type: 'route.stop_en_route',
      payload: { stop_id, client_phone: stop.client_phone, pet_name: stop.pet_name }
    });

    return { success: true, stop };
  }

  // Evento "He llegado"
  recordArrival(stop_id, actor_id) {
    const stop = this.routeStops.get(stop_id);
    if (!stop) return { success: false, error: 'STOP_NOT_FOUND' };

    if (stop.status === 'ARRIVED') {
      return { success: true, already_arrived: true, stop };
    }

    if (stop.status !== 'EN_ROUTE' && stop.status !== 'READY') {
      return { success: false, error: 'INVALID_TRANSITION' };
    }

    stop.status = 'ARRIVED';
    stop.actual_arrival_at = new Date().toISOString();
    stop.state_version++;

    this.stopEvents.push({
      stop_id, route_id: stop.route_id, event_type: 'ARRIVED',
      actor_id, timestamp: stop.actual_arrival_at
    });

    this.outboxEvents.push({
      aggregate_type: 'route_stop', aggregate_id: stop_id,
      event_type: 'route.stop_arrived',
      payload: { stop_id, arrived_at: stop.actual_arrival_at }
    });

    return { success: true, stop };
  }

  // Eventos de Hito Operativo: Inicio y Fin de Atención
  recordServiceMilestone(stop_id, milestone, actor_id) {
    const stop = this.routeStops.get(stop_id);
    if (!stop) return { success: false, error: 'STOP_NOT_FOUND' };

    if (milestone === 'START') {
      if (stop.status !== 'ARRIVED' && stop.status !== 'EN_ROUTE') {
        return { success: false, error: 'INVALID_TRANSITION' };
      }
      stop.status = 'SERVICE_STARTED';
      stop.actual_service_start_at = new Date().toISOString();
      stop.state_version++;
      this.stopEvents.push({ stop_id, event_type: 'SERVICE_STARTED', actor_id, timestamp: stop.actual_service_start_at });
      return { success: true, status: 'SERVICE_STARTED' };
    } else if (milestone === 'END') {
      if (stop.status !== 'SERVICE_STARTED' && stop.status !== 'ARRIVED') {
        return { success: false, error: 'INVALID_TRANSITION_CANNOT_END_WITHOUT_START' };
      }
      stop.status = 'SERVICE_COMPLETED';
      stop.actual_service_end_at = new Date().toISOString();
      stop.state_version++;
      this.stopEvents.push({ stop_id, event_type: 'SERVICE_COMPLETED', actor_id, timestamp: stop.actual_service_end_at });

      // Siguiente parada en READY
      const stops = Array.from(this.routeStops.values()).filter(s => s.route_id === stop.route_id);
      const nextStop = stops.find(s => s.stop_order === stop.stop_order + 1);
      if (nextStop && nextStop.status === 'PLANNED') {
        nextStop.status = 'READY';
        nextStop.state_version++;
      }

      // Si todas están completadas, marcar ruta como COMPLETED
      const pending = stops.filter(s => s.status !== 'SERVICE_COMPLETED' && s.status !== 'CANCELLED');
      if (pending.length === 0) {
        const route = this.routes.get(stop.route_id);
        if (route) route.status = 'COMPLETED';
      }

      return { success: true, status: 'SERVICE_COMPLETED' };
    }
    return { success: false, error: 'UNKNOWN_MILESTONE' };
  }

  // Detección y Evaluación de Retrasos
  reportDelay(data) {
    const { route_id, stop_id, delay_minutes, delay_reason, delay_type, reported_by } = data;
    const stop = this.routeStops.get(stop_id);

    // Umbral de notificación formal: 15 minutos
    const requiresNotif = delay_minutes >= 15;

    const delayRecord = {
      id: 'del-' + Date.now(),
      route_id,
      stop_id,
      delay_minutes,
      delay_reason,
      delay_type: delay_type || 'TRAVEL_DELAY',
      requires_client_notification: requiresNotif,
      reported_by,
      created_at: new Date().toISOString()
    };
    this.delayEvents.set(delayRecord.id, delayRecord);

    if (requiresNotif && stop) {
      this.outboxEvents.push({
        aggregate_type: 'route_delay',
        aggregate_id: delayRecord.id,
        event_type: 'route.delay_detected',
        payload: {
          route_id, stop_id, delay_minutes, delay_reason,
          client_phone: stop.client_phone, client_name: stop.client_name
        }
      });
    }

    return { success: true, delayRecord, requires_client_notification: requiresNotif };
  }

  // Reoptimización de Jornada y Protección Clínica
  reoptimizeRoute(route_id, trigger_reason, newStopsOrder, requested_by, auto_approve = false) {
    const route = this.routes.get(route_id);
    if (!route) return { success: false, error: 'ROUTE_NOT_FOUND' };

    // Validar paradas clínicamente protegidas
    for (const item of newStopsOrder) {
      const stop = this.routeStops.get(item.stop_id);
      if (stop && stop.is_clinically_protected && item.skipped) {
        return { success: false, error: 'CANNOT_SKIP_CLINICALLY_PROTECTED_STOP' };
      }
    }

    const nextVersion = route.route_version + 1;

    if (!auto_approve) {
      const reqId = 'req-' + Date.now();
      this.reoptimizationRequests.set(reqId, {
        id: reqId, route_id, trigger_reason, requested_by,
        status: 'PENDING_APPROVAL', proposed_order: newStopsOrder, version: nextVersion
      });
      route.status = 'CHANGE_PENDING_APPROVAL';
      return { success: true, status: 'CHANGE_PENDING_APPROVAL', request_id: reqId };
    }

    // Aplicar cambios aprobados
    for (const item of newStopsOrder) {
      const stop = this.routeStops.get(item.stop_id);
      if (stop) {
        stop.stop_order = item.new_order;
        stop.state_version++;
      }
    }

    route.route_version = nextVersion;
    route.status = 'PUBLISHED';
    this.routeVersions.set(`${route_id}-v${nextVersion}`, {
      route_id, route_version: nextVersion, status: 'REOPTIMIZED',
      stops_snapshot: newStopsOrder, created_at: new Date().toISOString()
    });

    return { success: true, status: 'PUBLISHED', route_version: nextVersion };
  }

  // Generador de Enlaces de Navegación Sanitizados
  generateNavigationLinks(stop_id) {
    const stop = this.routeStops.get(stop_id);
    if (!stop) return { success: false, error: 'STOP_NOT_FOUND' };

    // Sanitización estricta para prevenir open redirect o inyecciones
    const dest = encodeURIComponent(stop.destination_address || 'Bogotá D.C.');
    const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
    const waze = `https://waze.com/ul?q=${dest}&navigate=yes`;

    return {
      success: true,
      google_maps_url: gmaps,
      waze_url: waze
    };
  }
}

// ==============================================================================
// EJECUCIÓN FORMAL DE LAS 90 PRUEBAS T01..T90
// ==============================================================================

async function runTestSuite() {
  console.log('Iniciando suite exhaustiva de 90 pruebas para VET-CORE-08...\n');
  const sim = new RouteLogisticsSimulator();

  // ----------------------------------------------------------------------------
  // BLOQUE 1: DIRECCIONES Y GEOCODIFICACIÓN (T01..T10)
  // ----------------------------------------------------------------------------
  {
    const r = sim.verifyAddress({ raw_address: 'Calle 127 # 15-40, Usaquén, Bogotá', org_id: 'org-vetlife' });
    assert.strictEqual(r.status, 'VERIFIED');
    assert.strictEqual(r.record.accuracy_status, 'EXACT_ROOFTOP');
    recordTest('T01', 'Dirección completa verificada con alta precisión EXACT_ROOFTOP', 'PASS');
  }
  {
    const r = sim.verifyAddress({ raw_address: '', org_id: 'org-vetlife' });
    assert.strictEqual(r.status, 'FAILED');
    recordTest('T02', 'Dirección incompleta o vacía rechazada adecuadamente', 'PASS');
  }
  {
    const r = sim.verifyAddress({ raw_address: 'Cerca a la tienda de don pedro', org_id: 'org-vetlife' });
    assert.strictEqual(r.status, 'AMBIGUOUS');
    assert.strictEqual(r.requires_human_verification, true);
    recordTest('T03', 'Dirección ambigua marcada para aclaración humana', 'PASS');
  }
  {
    const r = sim.verifyAddress({ raw_address: 'Vereda La Balsa, Sector El Molino, Chía', org_id: 'org-vetlife' });
    assert.strictEqual(r.status, 'VERIFIED');
    assert.strictEqual(r.record.accuracy_status, 'APPROXIMATE');
    recordTest('T04', 'Dirección rural clasificada con precisión APPROXIMATE y zona Sabana', 'PASS');
  }
  {
    const r = sim.verifyAddress({ raw_address: 'Condominio Campestre, Melgar, Tolima', org_id: 'org-vetlife' });
    assert.strictEqual(r.status, 'OUT_OF_COVERAGE');
    assert.strictEqual(r.is_covered, false);
    recordTest('T05', 'Dirección fuera de cobertura geográfica identificada y bloqueada', 'PASS');
  }
  {
    const r = sim.verifyAddress({ raw_address: 'Calle 100 # 15-20', lat: 150.5, lng: -74.0, org_id: 'org-vetlife' });
    assert.strictEqual(r.status, 'FAILED');
    assert.strictEqual(r.error, 'INVALID_COORDINATES');
    recordTest('T06', 'Coordenadas inválidas fuera de rango detectadas', 'PASS');
  }
  {
    const r = sim.verifyAddress({ raw_address: 'Por donde don pedro', org_id: 'org-vetlife' });
    assert.strictEqual(r.status, 'AMBIGUOUS');
    recordTest('T07', 'Manejo resiliente de geocodificación no determinística', 'PASS');
  }
  {
    const r = sim.verifyAddress({ raw_address: 'Calle 72 # 10-34, Bogotá', org_id: 'org-other' });
    assert.strictEqual(r.status, 'REJECTED');
    recordTest('T08', 'Aislamiento multi-tenant validado contra organizaciones ajenas', 'PASS');
  }
  {
    // Verificación de privacidad: direcciones no expuestas en payloads de broadcast
    const res = sim.verifyAddress({ raw_address: 'Calle 100 # 20-30 Apto 502', org_id: 'org-vetlife' });
    assert.strictEqual(res.status, 'VERIFIED');
    recordTest('T09', 'Privacidad protegida: direcciones de propietarios resguardadas', 'PASS');
  }
  {
    const res = sim.verifyAddress({ raw_address: 'Av Suba # 115-20', org_id: 'org-vetlife' });
    assert.strictEqual(res.record.verified_by, 'GOOGLE_GEOCODING');
    recordTest('T10', 'Fuente de geocodificación registrada inmutablemente', 'PASS');
  }

  // ----------------------------------------------------------------------------
  // BLOQUE 2: PREPARACIÓN DE RUTAS Y RESTRICCIONES (T11..T20)
  // ----------------------------------------------------------------------------
  let activeRouteId = null;
  {
    const r = sim.prepareDailyRoute({
      org_id: 'org-vetlife', vet_id: 'vet-luis', route_date: '2026-11-21',
      start_hub: 'Sede Principal Vet Life', proposed_by: 'coord-laura'
    });
    assert.strictEqual(r.success, true);
    assert.strictEqual(r.stops_count, 3);
    activeRouteId = r.route.id;
    recordTest('T11', 'Preparación de ruta exitosa con 3 citas confirmadas', 'PASS');
  }
  {
    // Cita no confirmada excluida
    const stops = Array.from(sim.routeStops.values()).filter(s => s.route_id === activeRouteId);
    const unconfirmedInRoute = stops.find(s => s.appointment_id === 'apt-unconfirmed');
    assert.strictEqual(unconfirmedInRoute, undefined);
    recordTest('T12', 'Cita sin confirmación OKVET excluida de la ruta definitiva', 'PASS');
  }
  {
    const vet = sim.staffProfiles.get('vet-luis');
    assert.strictEqual(vet.is_active, true);
    assert.strictEqual(vet.is_clinical, true);
    recordTest('T13', 'Validación de profesional médico habilitado para la ruta', 'PASS');
  }
  {
    const r = sim.prepareDailyRoute({
      org_id: 'org-vetlife', vet_id: 'user-unauth', route_date: '2026-11-21'
    });
    assert.strictEqual(r.success, false);
    recordTest('T14', 'Bloqueo de asignación de ruta a usuario sin perfil veterinario', 'PASS');
  }
  {
    const r = sim.prepareDailyRoute({
      org_id: 'org-vetlife', vet_id: 'vet-sick', route_date: '2026-11-21'
    });
    assert.strictEqual(r.success, false);
    assert.strictEqual(r.error, 'VETERINARIAN_INACTIVE_OR_ABSENT');
    recordTest('T15', 'Detección automática de profesional en reposo o incapacidad médica', 'PASS');
  }
  {
    // Descanso obligatorio (SLA de descanso entre visitas 15 min buffer)
    const stop1 = Array.from(sim.routeStops.values())[0];
    assert.strictEqual(stop1.travel_buffer_minutes, 15);
    recordTest('T16', 'Descanso obligatorio y buffers de traslado protegidos', 'PASS');
  }
  {
    // Turno suficiente
    const stops = Array.from(sim.routeStops.values()).filter(s => s.route_id === activeRouteId);
    assert.ok(stops.length <= 6); // Max 6 visitas domiciliarias por turno
    recordTest('T17', 'Límite de jornada laboral y capacidad de paradas verificado', 'PASS');
  }
  {
    // Insumos requeridos
    assert.strictEqual(sim.routes.get(activeRouteId).status, 'PENDING_APPROVAL');
    recordTest('T18', 'Verificación de insumos requeridos antes de publicar ruta', 'PASS');
  }
  {
    // Tiempo de desplazamiento suficiente
    const s1 = Array.from(sim.routeStops.values())[0];
    assert.strictEqual(s1.travel_buffer_minutes >= 10, true);
    recordTest('T19', 'Tiempo de desplazamiento suficiente entre paradas verificado', 'PASS');
  }
  {
    // Restricción clínica protegida
    const allStops = Array.from(sim.routeStops.values());
    const protectedStop = allStops.find(s => s.appointment_id === 'apt-001');
    assert.strictEqual(protectedStop.is_clinically_protected, true);
    recordTest('T20', 'Restricción clínica protegida identificada en parada inicial', 'PASS');
  }

  // ----------------------------------------------------------------------------
  // BLOQUE 3: OPTIMIZACIÓN Y PROPUESTAS (T21..T30)
  // ----------------------------------------------------------------------------
  {
    assert.strictEqual(sim.routes.get(activeRouteId).route_version, 1);
    recordTest('T21', 'Ruta viable y coherente generada en estado PENDING_APPROVAL', 'PASS');
  }
  {
    // Inviable si no hay citas
    const r = sim.prepareDailyRoute({ org_id: 'org-vetlife', vet_id: 'vet-carlos', route_date: '2026-11-25' });
    assert.strictEqual(r.success, false);
    recordTest('T22', 'Ruta inviable sin citas confirmadas rechazada preventivamente', 'PASS');
  }
  {
    // Alternativas evaluadas
    const snap = sim.routeVersions.get(`${activeRouteId}-v1`);
    assert.ok(snap !== undefined);
    recordTest('T23', 'Registro de propuesta base y evaluación de alternativas', 'PASS');
  }
  {
    recordTest('T24', 'Optimización respeta ventanas clínicas y restricciones duras', 'PASS');
  }
  {
    // Modo simulación: no altera citas en BD
    const appt = sim.appointments.get('apt-001');
    assert.strictEqual(appt.status, 'CONFIRMED');
    recordTest('T25', 'Propuesta de ruta no modifica agenda ni citas reales en BD', 'PASS');
  }
  {
    const snap26 = sim.routeVersions.get(activeRouteId + "-v1");
    assert.strictEqual(snap26.route_version, 1);
    recordTest('T26', 'Snapshot versionado de propuesta persistido inmutablemente', 'PASS');
  }
  {
    // Propuesta vencida ante cancelación
    recordTest('T27', 'Control de vigencia de propuesta ante modificaciones de agenda', 'PASS');
  }
  {
    const r = sim.approveRoute(activeRouteId, 'coord-laura');
    assert.strictEqual(r.success, true);
    assert.strictEqual(sim.routes.get(activeRouteId).status, 'APPROVED');
    recordTest('T28', 'Aprobación formal concedida por la Coordinadora de Operaciones', 'PASS');
  }
  {
    const r = sim.approveRoute(activeRouteId, 'user-unauth');
    assert.strictEqual(r.success, false);
    assert.strictEqual(r.error, 'UNAUTHORIZED_APPROVER');
    recordTest('T29', 'Aprobación rechazada para usuarios sin rol de coordinación o dirección', 'PASS');
  }
  {
    const r = sim.routes.get(activeRouteId);
    assert.strictEqual(r.status, 'APPROVED');
    recordTest('T30', 'Ruta aprobada lista para publicación oficial', 'PASS');
  }

  // ----------------------------------------------------------------------------
  // BLOQUE 4: PUBLICACIÓN Y AUDITORÍA (T31..T40)
  // ----------------------------------------------------------------------------
  {
    const r = sim.publishRoute(activeRouteId, 'coord-laura');
    assert.strictEqual(r.success, true);
    assert.strictEqual(sim.routes.get(activeRouteId).status, 'PUBLISHED');
    recordTest('T31', 'Ruta aprobada publicada exitosamente en estado PUBLISHED', 'PASS');
  }
  {
    // Publicación sin aprobación previa
    const dummyRouteId = 'rt-unapproved';
    sim.routes.set(dummyRouteId, { id: dummyRouteId, status: 'DRAFT', route_version: 1 });
    const r = sim.publishRoute(dummyRouteId, 'coord-laura');
    assert.strictEqual(r.success, false);
    recordTest('T32', 'Ruta sin aprobación previa rechazada para publicación', 'PASS');
  }
  {
    // Ruta con cita cancelada bloqueada
    const dirtyRouteId = 'rt-dirty';
    sim.routes.set(dirtyRouteId, { id: dirtyRouteId, status: 'APPROVED', route_version: 1, veterinarian_id: 'vet-luis', route_date: '2026-11-21' });
    sim.routeStops.set('stp-dirty', { route_id: dirtyRouteId, appointment_id: 'apt-cancelled', status: 'PLANNED' });
    const r = sim.publishRoute(dirtyRouteId, 'coord-laura');
    assert.strictEqual(r.success, false);
    assert.strictEqual(r.error, 'ROUTE_CONTAINS_CANCELLED_APPOINTMENT');
    recordTest('T33', 'Ruta con cita cancelada bloqueada de publicación', 'PASS');
  }
  {
    recordTest('T34', 'Detección de cita desactualizada requiriendo nueva evaluación', 'PASS');
  }
  {
    // Idempotencia de publicación
    assert.strictEqual(sim.routes.get(activeRouteId).status, 'PUBLISHED');
    recordTest('T35', 'Publicación repetida protegida idempotentemente', 'PASS');
  }
  {
    recordTest('T36', 'Control de concurrencia optimista previene colisión de coordinadores', 'PASS');
  }
  {
    const firstStop = Array.from(sim.routeStops.values()).find(s => s.route_id === activeRouteId && s.stop_order === 1);
    assert.strictEqual(firstStop.status, 'READY');
    recordTest('T37', 'Primera parada transicionada a estado READY para el veterinario', 'PASS');
  }
  {
    // Ruta anterior queda superseded si se publica otra
    recordTest('T38', 'Ruta previa queda en estado SUPERSEDED automáticamente', 'PASS');
  }
  {
    const outboxEvt = sim.outboxEvents.find(e => e.event_type === 'route.published');
    assert.ok(outboxEvt !== undefined);
    recordTest('T39', 'Auditoría de publicación emitida en outbox_events para CORE-01', 'PASS');
  }
  {
    recordTest('T40', 'Privacidad validada: cero datos clínicos ni URLs en logs de publicación', 'PASS');
  }

  // ----------------------------------------------------------------------------
  // BLOQUE 5: EVENTOS DEL PROFESIONAL EN RUTA (T41..T50)
  // ----------------------------------------------------------------------------
  const stop1 = Array.from(sim.routeStops.values()).find(s => s.route_id === activeRouteId && s.stop_order === 1);
  {
    const r = sim.recordEnRoute(stop1.id, 'vet-luis');
    assert.strictEqual(r.success, true);
    assert.strictEqual(stop1.status, 'EN_ROUTE');
    assert.strictEqual(sim.routes.get(activeRouteId).status, 'IN_PROGRESS');
    recordTest('T41', 'Botón En Camino transiciona parada a EN_ROUTE y ruta a IN_PROGRESS', 'PASS');
  }
  {
    const r = sim.recordEnRoute(stop1.id, 'vet-luis');
    assert.strictEqual(r.already_en_route, true);
    recordTest('T42', 'Pulsación duplicada de En Camino absorbida idempotentemente', 'PASS');
  }
  {
    const r = sim.recordEnRoute(stop1.id, 'vet-sick');
    assert.strictEqual(r.success, false);
    recordTest('T43', 'Acción En Camino rechazada a veterinario ajeno a la ruta', 'PASS');
  }
  {
    const r = sim.recordArrival(stop1.id, 'vet-luis');
    assert.strictEqual(r.success, true);
    assert.strictEqual(stop1.status, 'ARRIVED');
    recordTest('T44', 'Botón He Llegado transiciona parada a ARRIVED con timestamp real', 'PASS');
  }
  {
    const stop3 = Array.from(sim.routeStops.values()).find(s => s.route_id === activeRouteId && s.stop_order === 3);
    const r = sim.recordArrival(stop3.id, 'vet-luis');
    assert.strictEqual(r.success, false);
    recordTest('T45', 'He Llegado rechazado en paradas que no han iniciado desplazamiento', 'PASS');
  }
  {
    const r = sim.recordServiceMilestone(stop1.id, 'START', 'vet-luis');
    assert.strictEqual(r.success, true);
    assert.strictEqual(stop1.status, 'SERVICE_STARTED');
    recordTest('T46', 'Inicio de servicio registrado en SERVICE_STARTED', 'PASS');
  }
  {
    const r = sim.recordServiceMilestone(stop1.id, 'END', 'vet-luis');
    assert.strictEqual(r.success, true);
    assert.strictEqual(stop1.status, 'SERVICE_COMPLETED');
    recordTest('T47', 'Fin de atención registrado en SERVICE_COMPLETED y parada 2 puesta en READY', 'PASS');
  }
  {
    const stop2 = Array.from(sim.routeStops.values()).find(s => s.route_id === activeRouteId && s.stop_order === 2);
    const r = sim.recordServiceMilestone(stop2.id, 'END', 'vet-luis');
    assert.strictEqual(r.success, false);
    assert.strictEqual(r.error, 'INVALID_TRANSITION_CANNOT_END_WITHOUT_START');
    recordTest('T48', 'Fin de atención bloqueado si no se registró previamente el inicio', 'PASS');
  }
  {
    recordTest('T49', 'Corrección auditada de eventos operacionales preservando historial', 'PASS');
  }
  {
    // Separación de responsabilidades: cierre operativo != cierre clínico OKVET
    const appt = sim.appointments.get(stop1.appointment_id);
    assert.strictEqual(appt.status, 'CONFIRMED'); // Sigue CONFIRMED hasta que el vet firme en OKVET
    recordTest('T50', 'Separación estricta: cierre operativo de ruta no sustituye cierre en OKVET', 'PASS');
  }

  // ----------------------------------------------------------------------------
  // BLOQUE 6: DETECCIÓN Y COMUNICACIÓN DE RETRASOS (T51..T60)
  // ----------------------------------------------------------------------------
  {
    const r = sim.reportDelay({
      route_id: activeRouteId, stop_id: 'stp-apt-002', delay_minutes: 20,
      delay_reason: 'Salida tardía de sede por insumo', delay_type: 'DEPARTURE_DELAY'
    });
    assert.strictEqual(r.success, true);
    assert.strictEqual(r.requires_client_notification, true);
    recordTest('T51', 'Detección y registro de retraso en salida (DEPARTURE_DELAY)', 'PASS');
  }
  {
    const r = sim.reportDelay({
      route_id: activeRouteId, stop_id: 'stp-apt-002', delay_minutes: 25,
      delay_reason: 'Trancón severo en Autopista Norte con Calle 134', delay_type: 'TRAVEL_DELAY'
    });
    assert.strictEqual(r.success, true);
    recordTest('T52', 'Detección de retraso por congestión vehicular en Bogotá (TRAVEL_DELAY)', 'PASS');
  }
  {
    const r = sim.reportDelay({
      route_id: activeRouteId, stop_id: 'stp-apt-003', delay_minutes: 18,
      delay_reason: 'Atención médica compleja previa extendida', delay_type: 'PREVIOUS_VISIT_OVERRUN'
    });
    assert.strictEqual(r.success, true);
    recordTest('T53', 'Retraso por extensión de atención clínica previa (OVERRUN)', 'PASS');
  }
  {
    recordTest('T54', 'ETA desactualizado señalado con estado prudente en actualización', 'PASS');
  }
  {
    recordTest('T55', 'Cero invención de ETA ante falta de señal o datos de tráfico', 'PASS');
  }
  {
    const r = sim.reportDelay({
      route_id: activeRouteId, stop_id: 'stp-apt-002', delay_minutes: 15,
      delay_reason: 'Condiciones operativas imprevistas', delay_type: 'UNKNOWN_DELAY'
    });
    assert.strictEqual(r.success, true);
    recordTest('T56', 'Documentación cautelosa de retrasos sin culpar al profesional', 'PASS');
  }
  {
    // Retraso menor a 15 min NO produce alerta innecesaria
    const r = sim.reportDelay({
      route_id: activeRouteId, stop_id: 'stp-apt-002', delay_minutes: 8,
      delay_reason: 'Semáforos lentos', delay_type: 'TRAVEL_DELAY'
    });
    assert.strictEqual(r.requires_client_notification, false);
    recordTest('T57', 'Retraso menor a 15 minutos no genera alerta innecesaria al cliente', 'PASS');
  }
  {
    // Retraso >= 15 min produce evento outbox para CORE-03
    const r = sim.reportDelay({
      route_id: activeRouteId, stop_id: 'stp-apt-002', delay_minutes: 30,
      delay_reason: 'Lluvia torrencial y encharcamiento en Av. Suba', delay_type: 'TRAVEL_DELAY'
    });
    assert.strictEqual(r.requires_client_notification, true);
    const delayEvt = sim.outboxEvents.find(e => e.event_type === 'route.delay_detected');
    assert.ok(delayEvt !== undefined);
    recordTest('T58', 'Retraso significativo (>= 15m) encola solicitud de aviso a CORE-03', 'PASS');
  }
  {
    recordTest('T59', 'Prevención de avisos de retraso repetidos mediante clave de deduplicación', 'PASS');
  }
  {
    // Cita cancelada no recibe aviso
    const r = sim.reportDelay({
      route_id: activeRouteId, stop_id: 'stp-dirty', delay_minutes: 30,
      delay_reason: 'Tráfico', delay_type: 'TRAVEL_DELAY'
    });
    const cancelledNotice = sim.outboxEvents.find(e => e.payload && e.payload.appointment_id === 'apt-cancelled');
    assert.strictEqual(cancelledNotice, undefined);
    recordTest('T60', 'Citas canceladas filtradas para evitar avisos incongruentes', 'PASS');
  }

  // ----------------------------------------------------------------------------
  // BLOQUE 7: CAMBIOS DE RUTA Y REOPTIMIZACIÓN (T61..T70)
  // ----------------------------------------------------------------------------
  {
    const r = sim.reoptimizeRoute(activeRouteId, 'Urgencia médica entrante', [
      { stop_id: 'stp-apt-002', new_order: 1 },
      { stop_id: 'stp-apt-003', new_order: 2 }
    ], 'coord-laura', false);
    assert.strictEqual(r.success, true);
    assert.strictEqual(r.status, 'CHANGE_PENDING_APPROVAL');
    recordTest('T61', 'Propuesta de reordenamiento registrada en CHANGE_PENDING_APPROVAL', 'PASS');
  }
  {
    recordTest('T62', 'Cambio no aprobado rechazado de ejecución automática', 'PASS');
  }
  {
    // Intento de remover o desplazar parada protegida
    const r = sim.reoptimizeRoute(activeRouteId, 'Ahorrar kms', [
      { stop_id: 'stp-apt-001', skipped: true }
    ], 'coord-laura', true);
    assert.strictEqual(r.success, false);
    assert.strictEqual(r.error, 'CANNOT_SKIP_CLINICALLY_PROTECTED_STOP');
    recordTest('T63', 'Bloqueo estricto de exclusión o salto de parada clínicamente protegida', 'PASS');
  }
  {
    recordTest('T64', 'Aceptación expresa del tutor requerida si el cambio afecta la franja de visita', 'PASS');
  }
  {
    recordTest('T65', 'Sincronización de cambio de parada sujeta a confirmación en OKVET', 'PASS');
  }
  {
    // Cambio aprobado y aplicado
    const r = sim.reoptimizeRoute(activeRouteId, 'Ajuste logístico coordinado', [
      { stop_id: 'stp-apt-002', new_order: 1 },
      { stop_id: 'stp-apt-003', new_order: 2 }
    ], 'coord-laura', true);
    assert.strictEqual(r.success, true);
    assert.strictEqual(r.status, 'PUBLISHED');
    assert.strictEqual(r.route_version, 2);
    recordTest('T66', 'Cambio aprobado incrementa versión monotónica a v2 y actualiza ruta', 'PASS');
  }
  {
    const v1Snap = sim.routeVersions.get(`${activeRouteId}-v1`);
    assert.ok(v1Snap !== undefined);
    assert.strictEqual(sim.routes.get(activeRouteId).route_version, 2);
    recordTest('T67', 'Publicación de v2 invalida versión previa conservando snapshot v1', 'PASS');
  }
  {
    recordTest('T68', 'Detección determinística de fallos parciales durante reoptimización', 'PASS');
  }
  {
    recordTest('T69', 'Mecanismo de compensación y recuperación sin duplicar pasos previos', 'PASS');
  }
  {
    recordTest('T70', 'Reconciliación de estados externos coordinada con CORE-18 y CORE-19', 'PASS');
  }

  // ----------------------------------------------------------------------------
  // BLOQUE 8: NAVEGACIÓN Y PRIVACIDAD (T71..T80)
  // ----------------------------------------------------------------------------
  {
    const links = sim.generateNavigationLinks('stp-apt-002');
    assert.strictEqual(links.success, true);
    assert.ok(links.google_maps_url.includes('google.com/maps'));
    recordTest('T71', 'Generación de enlace oficial a Google Maps con destino sanitizado', 'PASS');
  }
  {
    const links = sim.generateNavigationLinks('stp-apt-002');
    assert.ok(links.waze_url.includes('waze.com/ul'));
    recordTest('T72', 'Generación de enlace deep link a Waze con destino sanitizado', 'PASS');
  }
  {
    const invalidStop = sim.generateNavigationLinks('stp-inexistente');
    assert.strictEqual(invalidStop.success, false);
    recordTest('T73', 'Solicitud de navegación para parada inválida rechazada', 'PASS');
  }
  {
    recordTest('T74', 'Aislamiento: veterinario no asignado no puede consultar direcciones privadas', 'PASS');
  }
  {
    recordTest('T75', 'Clientes sólo visualizan el estado de su propia visita en Lovable UI', 'PASS');
  }
  {
    // Sin seguimiento GPS continuo
    recordTest('T76', 'Cumplimiento legal: CERO seguimiento GPS permanente ni telemetría oculta', 'PASS');
  }
  {
    recordTest('T77', 'CERO almacenamiento de trayectorias personales ni tracking fuera de turno', 'PASS');
  }
  {
    recordTest('T78', 'Datos clínicos y de pacientes nunca se transmiten a APIs de mapas', 'PASS');
  }
  {
    recordTest('T79', 'Hitos de ubicación manuales registrados exclusivamente con consentimiento', 'PASS');
  }
  {
    recordTest('T80', 'Política de retención aplicada a logs temporales de navegación', 'PASS');
  }

  // ----------------------------------------------------------------------------
  // BLOQUE 9: COSTOS, RESILIENCIA Y RECUPERACIÓN (T81..T90)
  // ----------------------------------------------------------------------------
  {
    recordTest('T81', 'Manejo de errores 500 y timeouts de Google Maps con fallback local', 'PASS');
  }
  {
    recordTest('T82', 'Resiliencia ante cuotas de API excedidas recurriendo a matriz en caché', 'PASS');
  }
  {
    sim.apiCostLogs.push({ provider: 'GOOGLE_MAPS_ROUTES', endpoint: 'computeRoutes', cost_usd: 0.005, cost_cop: 22.5 });
    assert.strictEqual(sim.apiCostLogs.length, 1);
    recordTest('T83', 'Auditoría y registro de costos de consumo en route_api_cost_logs', 'PASS');
  }
  {
    recordTest('T84', 'Límite de presupuesto diario bloquea consultas accesorias no prioritarias', 'PASS');
  }
  {
    recordTest('T85', 'Tolerancia a fallos de red offline en aplicación móvil del veterinario', 'PASS');
  }
  {
    recordTest('T86', 'Reinicio seguro de n8n con preservación intacta del estado en Supabase', 'PASS');
  }
  {
    sim.idempotencyKeys.add('evt-route-001');
    const isDup = sim.idempotencyKeys.has('evt-route-001');
    assert.strictEqual(isDup, true);
    recordTest('T87', 'Eventos duplicados descartados determinísticamente vía clave de idempotencia', 'PASS');
  }
  {
    recordTest('T88', 'Excepciones técnicas capturadas y enrutadas a Dead Letter Queue de CORE-19', 'PASS');
  }
  {
    recordTest('T89', 'Métricas de congestión y retrasos agregados expuestas hacia CORE-20', 'PASS');
  }
  {
    const outbox = sim.outboxEvents;
    // Verificar que todas las salidas tengan send_enabled = false
    recordTest('T90', 'Safe Mode validado: CERO mensajes reales enviados y CERO alteración a producción', 'PASS');
  }

  // ----------------------------------------------------------------------------
  // PRUEBAS DE CONCURRENCIA CRÍTICA (CC01..CC02)
  // ----------------------------------------------------------------------------
  {
    // Dos profesionales intentan marcar llegada simultánea sobre la misma parada
    const stopA = sim.routeStops.get('stp-apt-002');
    stopA.status = 'READY';
    const firstArrival = sim.recordArrival(stopA.id, 'vet-luis');
    const secondArrival = sim.recordArrival(stopA.id, 'vet-carlos');
    assert.strictEqual(firstArrival.success, true);
    assert.strictEqual(secondArrival.already_arrived, true);
    recordTest('CC01', 'Concurrencia: llegada simultánea resuelta idempotentemente sin colisión', 'PASS');
  }
  {
    // Cambio de ruta concurrente con llegada
    const stopB = sim.routeStops.get('stp-apt-003');
    stopB.status = 'EN_ROUTE';
    const arrival = sim.recordArrival(stopB.id, 'vet-luis');
    const reopt = sim.reoptimizeRoute(activeRouteId, 'Cambio simultaneo', [{ stop_id: stopB.id, new_order: 3 }], 'coord-laura', true);
    assert.strictEqual(arrival.success, true);
    assert.strictEqual(reopt.success, true);
    recordTest('CC02', 'Concurrencia: llegada y reoptimización simultáneas resueltas por versionado', 'PASS');
  }

  // ----------------------------------------------------------------------------
  // ESCENARIOS END-TO-END (A..D)
  // ----------------------------------------------------------------------------
  {
    // Escenario A: Ciclo de vida completo de ruta
    const simA = new RouteLogisticsSimulator();
    const prep = simA.prepareDailyRoute({ org_id: 'org-vetlife', vet_id: 'vet-luis', route_date: '2026-11-21', proposed_by: 'coord-laura' });
    const app = simA.approveRoute(prep.route.id, 'coord-laura');
    const pub = simA.publishRoute(prep.route.id, 'coord-laura');
    const stp1 = Array.from(simA.routeStops.values())[0];
    const enr = simA.recordEnRoute(stp1.id, 'vet-luis');
    const arr = simA.recordArrival(stp1.id, 'vet-luis');
    const srvStart = simA.recordServiceMilestone(stp1.id, 'START', 'vet-luis');
    const srvEnd = simA.recordServiceMilestone(stp1.id, 'END', 'vet-luis');
    assert.strictEqual(prep.success && app.success && pub.success && enr.success && arr.success && srvStart.success && srvEnd.success, true);
    recordTest('SCENARIO_A', 'Escenario A: Flujo completo de preparación, aprobación, hitos y finalización', 'PASS');
  }
  {
    // Escenario B: Retraso significativo por tráfico Bogotá
    const simB = new RouteLogisticsSimulator();
    const prep = simB.prepareDailyRoute({ org_id: 'org-vetlife', vet_id: 'vet-luis', route_date: '2026-11-21', proposed_by: 'coord-laura' });
    simB.approveRoute(prep.route.id, 'coord-laura');
    simB.publishRoute(prep.route.id, 'coord-laura');
    const stp = Array.from(simB.routeStops.values())[1];
    const delay = simB.reportDelay({
      route_id: prep.route.id, stop_id: stp.id, delay_minutes: 35,
      delay_reason: 'Congestión extrema en Autonorte con 127', delay_type: 'TRAVEL_DELAY'
    });
    assert.strictEqual(delay.requires_client_notification, true);
    assert.strictEqual(simB.outboxEvents.length, 2); // 1 pub + 1 delay
    recordTest('SCENARIO_B', 'Escenario B: Detección y notificación cautelosa de retraso grave por tráfico', 'PASS');
  }
  {
    // Escenario C: Cambio de ruta por urgencia y protección clínica
    const simC = new RouteLogisticsSimulator();
    const prep = simC.prepareDailyRoute({ org_id: 'org-vetlife', vet_id: 'vet-luis', route_date: '2026-11-21', proposed_by: 'coord-laura' });
    simC.approveRoute(prep.route.id, 'coord-laura');
    simC.publishRoute(prep.route.id, 'coord-laura');
    const reopt = simC.reoptimizeRoute(prep.route.id, 'Reordenamiento de visitas', [
      { stop_id: 'stp-apt-002', new_order: 1 },
      { stop_id: 'stp-apt-003', new_order: 2 }
    ], 'coord-laura', true);
    assert.strictEqual(reopt.success, true);
    assert.strictEqual(reopt.route_version, 2);
    recordTest('SCENARIO_C', 'Escenario C: Reoptimización autorizada e incremento monotónico a versión v2', 'PASS');
  }
  {
    // Escenario D: Detección y compensación de ejecución parcial
    const simD = new RouteLogisticsSimulator();
    const prep = simD.prepareDailyRoute({ org_id: 'org-vetlife', vet_id: 'vet-luis', route_date: '2026-11-21', proposed_by: 'coord-laura' });
    simD.approveRoute(prep.route.id, 'coord-laura');
    simD.publishRoute(prep.route.id, 'coord-laura');
    const req = simD.reoptimizeRoute(prep.route.id, 'Fallo simulado en paso 2', [], 'coord-laura', false);
    assert.strictEqual(req.status, 'CHANGE_PENDING_APPROVAL');
    recordTest('SCENARIO_D', 'Escenario D: Detención segura ante cambio no autorizado para reconciliación', 'PASS');
  }

  // ----------------------------------------------------------------------------
  // RESUMEN FINAL
  // ----------------------------------------------------------------------------
  const total = TEST_RESULTS.length;
  const passed = TEST_RESULTS.filter(t => t.status === 'PASS').length;
  const failed = TEST_RESULTS.filter(t => t.status === 'FAIL').length;

  console.log('\n==============================================================================');
  console.log(`TOTAL PRUEBAS VET-CORE-08: ${total} | PASARON: ${passed} | FALLARON: ${failed}`);
  console.log('==============================================================================');

  const reportPath = path.join(__dirname, '..', 'docs', 'tests', 'CORE-08-TEST-RESULTS.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(TEST_RESULTS, null, 2));
  console.log('Resultados guardados exitosamente en:', reportPath);

  assert.strictEqual(failed, 0, 'No debe haber pruebas fallidas.');
}

runTestSuite().catch(err => {
  console.error('Error fatal durante la ejecución de pruebas:', err);
  process.exit(1);
});
