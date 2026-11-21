# Prompt 08 — trazabilidad individual

Estado por etapa: IMPLEMENTADO = interfaz/dominio/persistencia indicada; EXTERNO = contrato sin integración; PARCIAL = faltan controles protegidos. No equivale a aceptación integral.

| ID | Flujo | Pantalla / servicio | Estado | Evidencia / dependencia |
|---|---|---|---|---|
| WF3-021 | Crear remisión | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-022 | Aprobar indicación | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-023 | Seleccionar especialidad | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-024 | Buscar especialista | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-025 | Solicitar horarios | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-026 | Recibir disponibilidad | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-027 | Validar vigencia | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-028 | Registrar cita manual | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-029 | Generar opciones | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-030 | Enviar opciones | ReferralHub / Workflow / Directory / SupportingPages | EXTERNO | Contrato autorizado pendiente |
| WF3-031 | Recibir selección | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-032 | Bloquear espacio | ReferralHub / Workflow / Directory / SupportingPages | EXTERNO | Contrato autorizado pendiente |
| WF3-033 | Confirmar externamente | ReferralHub / Workflow / Directory / SupportingPages | EXTERNO | Contrato autorizado pendiente |
| WF3-034 | Publicar confirmación | ReferralHub / Workflow / Directory / SupportingPages | EXTERNO | Contrato autorizado pendiente |
| WF3-035 | Expirar oferta | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-036 | Seguimiento sin respuesta | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-037 | Reprogramación | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-038 | Cancelación externa | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-039 | Recordatorio previo | ReferralHub / Workflow / Directory / SupportingPages | EXTERNO | Contrato autorizado pendiente |
| WF3-040 | Seguimiento de asistencia | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-041 | Pendiente al cerrar visita | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-042 | Posponer recordatorio | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-043 | Delegar remisión | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-044 | Escalar vencimiento | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-045 | Preparar documentación | ReferralHub / Workflow / Directory / SupportingPages | PARCIAL | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-046 | Aprobar documentación | ReferralHub / Workflow / Directory / SupportingPages | PARCIAL | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-047 | Compartir documento seguro | ReferralHub / Workflow / Directory / SupportingPages | EXTERNO | Contrato autorizado pendiente |
| WF3-048 | Informe pendiente | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-049 | Recibir informe | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-050 | Revisar informe | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-051 | Registrar continuidad | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-052 | Cerrar remisión | ReferralHub / Workflow / Directory / SupportingPages | PARCIAL | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-053 | Detectar estancada | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-054 | Auditar acceso externo | ReferralHub / Workflow / Directory / SupportingPages | EXTERNO | Contrato autorizado pendiente |
| WF3-055 | Resumen para Luis | ReferralHub / Workflow / Directory / SupportingPages | IMPLEMENTADO | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| WF3-056 | Experiencia del cliente | ReferralHub / Workflow / Directory / SupportingPages | PARCIAL | P08_P09_2026-11-21.md; dominio en referrals-advanced.test.ts; no aceptación original certificada |
| AT3-017 | Especialistas y reservas: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-018 | Especialistas y reservas: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-019 | Especialistas y reservas: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-020 | Especialistas y reservas: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-021 | Especialistas y reservas: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-022 | Especialistas y reservas: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-023 | Especialistas y reservas: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-024 | Especialistas y reservas: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-025 | Especialistas y reservas: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-026 | Especialistas y reservas: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-027 | Especialistas y reservas: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-028 | Especialistas y reservas: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-029 | Especialistas y reservas: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-030 | Especialistas y reservas: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-031 | Especialistas y reservas: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-032 | Especialistas y reservas: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-033 | Especialistas y reservas: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-034 | Especialistas y reservas: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-035 | Compromisos y seguimiento: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-036 | Compromisos y seguimiento: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-037 | Compromisos y seguimiento: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-038 | Compromisos y seguimiento: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-039 | Compromisos y seguimiento: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-040 | Compromisos y seguimiento: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-041 | Compromisos y seguimiento: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-042 | Compromisos y seguimiento: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-043 | Compromisos y seguimiento: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-044 | Compromisos y seguimiento: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-045 | Compromisos y seguimiento: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-046 | Usabilidad móvil: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-047 | Usabilidad móvil: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-048 | Usabilidad móvil: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-049 | Usabilidad móvil: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-050 | Usabilidad móvil: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-051 | Usabilidad móvil: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-052 | Usabilidad móvil: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-053 | Seguridad e integridad: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-054 | Seguridad e integridad: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-055 | Seguridad e integridad: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-056 | Seguridad e integridad: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-057 | Seguridad e integridad: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-058 | Seguridad e integridad: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-059 | Seguridad e integridad: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| AT3-060 | Seguridad e integridad: criterio original individual pendiente de validación | Matriz de aceptación original | NO CERTIFICADO | Pruebas del lote no sustituyen el criterio original; contratos y/o datos autorizados pendientes |
| REF-01 | Requisito original REF | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| REF-02 | Requisito original REF | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| REF-03 | Requisito original REF | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| REF-04 | Requisito original REF | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| REF-05 | Requisito original REF | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| REF-06 | Requisito original REF | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| ESP-01 | Requisito original ESP | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| ESP-02 | Requisito original ESP | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| ESP-03 | Requisito original ESP | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| ESP-04 | Requisito original ESP | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| ESP-05 | Requisito original ESP | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| ESPCAL-01 | Requisito original ESPCAL | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| ESPCAL-02 | Requisito original ESPCAL | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| ESPCAL-03 | Requisito original ESPCAL | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| ESPCAL-04 | Requisito original ESPCAL | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| ESPCAL-05 | Requisito original ESPCAL | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| ESPCAL-06 | Requisito original ESPCAL | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| SPBOOK-01 | Requisito original SPBOOK | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| SPBOOK-02 | Requisito original SPBOOK | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| SPBOOK-03 | Requisito original SPBOOK | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| SPBOOK-04 | Requisito original SPBOOK | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| SPBOOK-05 | Requisito original SPBOOK | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| SPBOOK-06 | Requisito original SPBOOK | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| SPBOOK-07 | Requisito original SPBOOK | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| SPBOOK-08 | Requisito original SPBOOK | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| POSTREF-01 | Requisito original POSTREF | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| POSTREF-02 | Requisito original POSTREF | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| POSTREF-03 | Requisito original POSTREF | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| POSTREF-04 | Requisito original POSTREF | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| POSTREF-05 | Requisito original POSTREF | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| POSTREF-06 | Requisito original POSTREF | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| POSTREF-07 | Requisito original POSTREF | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| REF-DOC-01 | Requisito original REF-DOC | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| REF-DOC-02 | Requisito original REF-DOC | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| REF-DOC-03 | Requisito original REF-DOC | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| REF-DOC-04 | Requisito original REF-DOC | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| REF-DOC-05 | Requisito original REF-DOC | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| REF-DOC-06 | Requisito original REF-DOC | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| REF-DOC-07 | Requisito original REF-DOC | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| REF-DOC-08 | Requisito original REF-DOC | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| FOLLOW-01 | Requisito original FOLLOW | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| FOLLOW-02 | Requisito original FOLLOW | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| FOLLOW-03 | Requisito original FOLLOW | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| FOLLOW-04 | Requisito original FOLLOW | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| FOLLOW-05 | Requisito original FOLLOW | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| FOLLOW-06 | Requisito original FOLLOW | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| FOLLOW-07 | Requisito original FOLLOW | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| FOLLOW-08 | Requisito original FOLLOW | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| FOLLOW-09 | Requisito original FOLLOW | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| COLLAB-01 | Requisito original COLLAB | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| COLLAB-02 | Requisito original COLLAB | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| COLLAB-03 | Requisito original COLLAB | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| COLLAB-04 | Requisito original COLLAB | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| COLLAB-05 | Requisito original COLLAB | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| COLLAB-06 | Requisito original COLLAB | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| COLLAB-07 | Requisito original COLLAB | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| COLLAB-08 | Requisito original COLLAB | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| COLLAB-09 | Requisito original COLLAB | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| COLLAB-10 | Requisito original COLLAB | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| EXTRA-01 | Requisito original EXTRA | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| EXTRA-02 | Requisito original EXTRA | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| EXTRA-03 | Requisito original EXTRA | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| EXTRA-04 | Requisito original EXTRA | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| EXTRA-05 | Requisito original EXTRA | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| EXTRA-06 | Requisito original EXTRA | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| EXTRA-07 | Requisito original EXTRA | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| EXTRA-08 | Requisito original EXTRA | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| EXTRA-09 | Requisito original EXTRA | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| EXTRA-10 | Requisito original EXTRA | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| EXTRA-11 | Requisito original EXTRA | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| EXTRA-12 | Requisito original EXTRA | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| EXTRA-13 | Requisito original EXTRA | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| EXTRA-14 | Requisito original EXTRA | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
| EXTRA-15 | Requisito original EXTRA | Módulo referrals reutilizado | PARCIAL | Identificador registrado; cobertura completa no certificada |
