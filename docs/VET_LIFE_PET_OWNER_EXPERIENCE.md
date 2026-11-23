# VET LIFE — THE ULTIMATE PET OWNER EXPERIENCE: "MY PET LIFE"
**Portal Oficial:** Portal de Familias y Carné Digital  
**Ruta en la App:** `/cliente`  
**Modalidad:** PWA Móvil Nativa (iOS / Android)  
**Fecha de Publicación:** 2026-11-23  

---

## 1. Visión y Objetivos de Experiencia
"My Pet Life" es la superficie digital para el tutor de mascotas. Diseñada con calidez visual, fotografía empática y navegación fluida con una sola mano, reúne toda la información clínica que la familia tiene derecho a consultar, organizada de forma transparente y sin tecnicismos intimidantes.

---

## 2. Los 16 Módulos de "My Pet Life" (Part 10 § 10)

### Módulo A — Mis Mascotas (My Pets)
- Ficha de perfil con fotografía de alta resolución.
- Nombre, especie (Canino / Felino), raza, fecha de nacimiento, edad calculada, sexo y número de microchip.
- Soporte para múltiples mascotas bajo el mismo tutor y vinculación de co-propietarios autorizados.

### Módulo B — Línea de Tiempo de Salud (Health Timeline)
- Vista cronológica interactiva con marcas de procedencia:
  - 🟢 **Verificado por Médico:** Consultas y procedimientos firmados por el Dr. Luis Ríos.
  - 📄 **Documento Adjunto:** Resultados de laboratorio o ecografías oficiales.
  - 👤 **Reportado por Tutor:** Peso reportado en casa, alergias sospechadas o notas de conducta.

### Módulo C — Centro de Vacunación (Vaccination Center)
- Carné digital de vacunación oficial descargable en PDF con código QR.
- Vacunas aplicadas con número de lote verificado, laboratorio fabricante y fecha de vencimiento.
- Alertas anticipadas de revacunación (30, 15 y 3 días antes de la fecha programada).

### Módulo D — Organizador de Medicamentos y Fórmulas
- Visualización de recetas emitidas en OKVET con posología estructurada (dosis, frecuencia horaria y duración).
- Recordatorios automáticos en el celular para la administración de medicamentos.
- Botón de un toque para reportar: *"Dosis administrada con éxito"* o *"Rechazó la pastilla"*.

### Módulo E — Gestión de Citas a Domicilio
- Agendamiento directo seleccionando zona de cobertura (Medellín Sur / Poblado, Laureles, Envigado, Sabaneta, Belén, Llanogrande, Rionegro, etc.).
- Confirmación transparente: si la cita requiere aprobación en OKVET, se muestra el estado: *"Solicitud recibida — confirmando cupo"*.
- Seguimiento en tiempo real del equipo veterinario cuando inicia el viaje a su domicilio (`/t/:token`).

### Módulo F — Mi Equipo Veterinario
- Perfil del Dr. Luis Eduardo Ríos Ortiz con su número de matrícula profesional COMVEZCOL.
- Canales de contacto directo, teléfono de urgencias y zonas atendidas.

### Módulo G — Comunicación Segura y Conserje WhatsApp
- Historial de mensajes transaccionales y recordatorios.
- Envío seguro de fotografías de evolución (ej. cicatrización de heridas o estado de la piel).
- Protocolo de seguridad: aclaración de que el chat no es un servicio de emergencias médicas de riesgo vital inmediato.

### Módulo H — Bóveda de Documentos Médicos
- Almacenamiento seguro en Supabase Storage de certificados de salud, fórmulas médicas y resultados diagnósticos.
- Descarga segura mediante tokens efímeros firmados con vigencia de 24 horas.

### Módulo I — Cuidado de Mascotas Senior
- Monitoreo periódico de calidad de vida: movilidad articular, apetito, hidratación y nivel de energía.
- Escalas visuales sencillas para que la familia registre cambios sutiles antes de que se conviertan en emergencias.

### Módulo J — Manejo de Enfermedades Crónicas
- Planes de seguimiento para pacientes con insuficiencia renal, cardiopatías, diabetes o dermatitis crónica.
- Check-ins automáticos y alertas de reabastecimiento de medicamentos de uso continuo.

### Módulo K — Hogar Multi-Mascota
- Selector rápido entre mascotas con un toque en la parte superior.
- Calendario familiar unificado para coordinar desparasitaciones y vacunas conjuntas en una sola visita domiciliaria.

### Módulo L — Monitoreo de Recuperación Post-Cirugía
- Checklist interactivo post-operatorio: ingesta de agua, retiro de vendaje, uso de collar isabelino y estado de la sutura.
- Escalamiento inmediato a la clínica si el tutor reporta dolor agudo, sangrado o inflamación anormal.

### Módulo M — Paquete de Viaje y Emergencia (Travel Passport)
- Generación instantánea del Pasaporte Médico Digital para viajes aéreos o terrestres.
- Contiene certificado de vacunación antirrábica vigente, constancia de desparasitación interna/externa y microchip.

### Módulo N — Bienestar y Educación Personalizada
- Artículos clínicos redactados o aprobados por el Dr. Luis específicos para la edad, raza y condición médica de cada mascota.

### Módulo O — Registros de Múltiples Clínicas
- Posibilidad de visualizar atenciones recibidas en diferentes veterinarias aliadas conservando el nombre de la clínica emisora.
- Prohibición estricta de mezclar o alterar los registros originales.

### Módulo P — Privacidad y Permisos de Tutores
- Control total sobre qué miembros del hogar pueden ver las notas médicas o agendar citas.
- Botón de revocación inmediata de accesos y cumplimiento estricto de la política de Habeas Data (Ley 1581 de 2012).
