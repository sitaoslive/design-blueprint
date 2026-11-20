/** External systems and their delivery status. Real connection happens in later prompts. */
export const INTEGRATIONS = [
  { id: "okvet", name: "OKVET", connected: false },
  { id: "whatsapp", name: "WhatsApp Business", connected: false },
  { id: "n8n", name: "n8n", connected: false },
  { id: "gcal", name: "Google Calendar", connected: false },
  { id: "gmaps", name: "Google Maps", connected: false },
  { id: "ai", name: "Lovable AI (prioridades)", connected: true },
] as const;
