import { useState } from "react";
import {
  Palette,
  Sparkles,
  Smartphone,
  Save,
  RotateCcw,
  CheckCircle2,
  Building2,
  Stethoscope,
  Phone,
  ShieldCheck,
  Calendar,
  Heart,
  PawPrint,
  Clock,
  Layers,
  ArrowRight,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme, THEME_PRESETS, type ThemePalette } from "@/features/theming/themeContext";
import { Card, PageTitle, SectionTitle, Btn } from "@/components/vf/ui";
import { cn } from "@/lib/utils";

export function VisualWhiteLabelStudio() {
  const {
    activePreset,
    palette,
    dna,
    setPreset,
    updatePalette,
    updateDNA,
    saveToSupabase,
    resetToDefault,
  } = useTheme();

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"presets" | "colors" | "identity" | "preview">("presets");
  const [zoneInput, setZoneInput] = useState("");

  const handleSave = async () => {
    setSaving(true);
    const result = await saveToSupabase();
    setSaving(false);
    if (result.success) {
      toast.success("¡Diseño y tokens guardados en Supabase!", {
        description: "Toda la plataforma y el portal de tutores ahora usan la identidad visual de tu clínica.",
      });
    } else {
      toast.error("No se pudo guardar la configuración", {
        description: result.error,
      });
    }
  };

  const handleAddZone = () => {
    if (!zoneInput.trim()) return;
    if (dna.operating_zones.includes(zoneInput.trim())) return;
    updateDNA({ operating_zones: [...dna.operating_zones, zoneInput.trim()] });
    setZoneInput("");
  };

  const handleRemoveZone = (zone: string) => {
    updateDNA({ operating_zones: dna.operating_zones.filter((z) => z !== zone) });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <PageTitle
            title="Estudio de Diseño White-Label & Clinic DNA"
            subtitle="Personaliza la identidad visual, colores y DNA clínico de tu veterinaria en tiempo real sin tocar una línea de código."
          />
        </div>
        <div className="flex items-center gap-2">
          <Btn
            variant="outline"
            onClick={() => {
              resetToDefault();
              toast.info("Tema restablecido a la configuración por defecto.");
            }}
            className="text-xs"
          >
            <RotateCcw className="h-4 w-4" />
            Restablecer
          </Btn>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-gradient-primary text-xs shadow-button"
          >
            {saving ? (
              <Clock className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Guardando..." : "Guardar en Supabase"}
          </Btn>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: "presets", label: "Paletas Predefinidas", icon: Palette },
          { id: "colors", label: "Ajuste Fino de Tokens", icon: Layers },
          { id: "identity", label: "Clinic DNA & Marca", icon: Building2 },
          { id: "preview", label: "Vista Previa Live", icon: Eye },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Presets */}
      {activeTab === "presets" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Elige una de las paletas arquitectónicas inspiradas en el diseño móvil premium. El cambio se aplica de inmediato a todos los botones, tarjetas y navegación.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(THEME_PRESETS)
              .filter(([key]) => !["EMERALD_BOTANIC", "CARAMEL_PEACH", "PETIDO_GOLD", "LAVENDER_CALM"].includes(key))
              .map(([key, item]) => {
              const isSelected = activePreset === key;
              return (
                <div
                  key={key}
                  onClick={() => setPreset(key)}
                  className={cn(
                    "group relative cursor-pointer rounded-2xl border-2 p-5 transition-all active:scale-[0.99]",
                    isSelected
                      ? "border-primary bg-card shadow-lg ring-2 ring-primary/20"
                      : "border-border bg-card/60 hover:border-primary/40"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-foreground">{item.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    {isSelected && (
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  {/* Swatches */}
                  <div className="mt-4 flex items-center gap-2">
                    <div
                      className="h-8 w-12 rounded-lg shadow-inner"
                      style={{ background: item.palette.primary }}
                      title="Primario"
                    />
                    <div
                      className="h-8 w-12 rounded-lg shadow-inner"
                      style={{ background: item.palette.secondary }}
                      title="Secundario"
                    />
                    <div
                      className="h-8 w-12 rounded-lg shadow-inner"
                      style={{ background: item.palette.accent }}
                      title="Acento"
                    />
                    <div
                      className="h-8 w-12 rounded-lg border border-border shadow-inner"
                      style={{ background: item.palette.background }}
                      title="Fondo"
                    />
                    <span className="ml-auto text-xs font-semibold text-muted-foreground">
                      Radio: {item.palette.radius}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Fine Tuning Colors & Tokens */}
      {activeTab === "colors" && (
        <Card className="space-y-6">
          <SectionTitle>Ajuste de Variables CSS & Tailwind</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-foreground">Color Primario (Botones, encabezados activos)</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="text"
                  value={palette.primary}
                  onChange={(e) => updatePalette({ primary: e.target.value, ring: e.target.value })}
                  className="w-full rounded-xl bg-accent px-3 py-2 text-sm font-mono"
                />
                <div
                  className="h-9 w-9 shrink-0 rounded-xl border border-border shadow-inner"
                  style={{ background: palette.primary }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground">Color de Fondo General (Cuerpo de la app)</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="text"
                  value={palette.background}
                  onChange={(e) => updatePalette({ background: e.target.value })}
                  className="w-full rounded-xl bg-accent px-3 py-2 text-sm font-mono"
                />
                <div
                  className="h-9 w-9 shrink-0 rounded-xl border border-border shadow-inner"
                  style={{ background: palette.background }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground">Color Secundario (Fondos suaves, píldoras)</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="text"
                  value={palette.secondary}
                  onChange={(e) => updatePalette({ secondary: e.target.value })}
                  className="w-full rounded-xl bg-accent px-3 py-2 text-sm font-mono"
                />
                <div
                  className="h-9 w-9 shrink-0 rounded-xl border border-border shadow-inner"
                  style={{ background: palette.secondary }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground">Color de Acento (Badges, alertas suaves)</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="text"
                  value={palette.accent}
                  onChange={(e) => updatePalette({ accent: e.target.value })}
                  className="w-full rounded-xl bg-accent px-3 py-2 text-sm font-mono"
                />
                <div
                  className="h-9 w-9 shrink-0 rounded-xl border border-border shadow-inner"
                  style={{ background: palette.accent }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground">Radio de Curvatura (Estilo de Píldoras)</label>
              <div className="mt-2 flex gap-2">
                {[
                  { label: "Píldora Orgánica (1.5rem)", val: "1.5rem" },
                  { label: "Moderna Redondeada (1.25rem)", val: "1.25rem" },
                  { label: "Clásica Suave (0.75rem)", val: "0.75rem" },
                ].map((r) => (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => updatePalette({ radius: r.val })}
                    className={cn(
                      "flex-1 rounded-xl border p-2 text-xs font-bold transition",
                      palette.radius === r.val
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-accent text-foreground hover:border-primary/40"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground">Tipografía Principal</label>
              <select
                value={palette.font_family || "Manrope"}
                onChange={(e) => updatePalette({ font_family: e.target.value })}
                className="mt-2 w-full rounded-xl bg-accent p-2.5 text-sm font-medium"
              >
                <option value="Manrope">Manrope (Moderna, Cálida y Legible)</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans (Geométrica)</option>
                <option value="Inter">Inter (Neutral y Profesional)</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Clinic DNA & Identity */}
      {activeTab === "identity" && (
        <Card className="space-y-4">
          <SectionTitle>Perfil de Identidad Clínica (Clinic DNA)</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-foreground">Nombre Comercial de la Clínica / Práctica</label>
              <input
                type="text"
                value={dna.brand_name}
                onChange={(e) => updateDNA({ brand_name: e.target.value })}
                className="mt-1 w-full rounded-xl bg-accent p-2.5 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground">Eslogan o Promesa de Valor</label>
              <input
                type="text"
                value={dna.brand_tagline}
                onChange={(e) => updateDNA({ brand_tagline: e.target.value })}
                className="mt-1 w-full rounded-xl bg-accent p-2.5 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground">Médico Veterinario Responsable</label>
              <input
                type="text"
                value={dna.primary_doctor_name}
                onChange={(e) => updateDNA({ primary_doctor_name: e.target.value })}
                className="mt-1 w-full rounded-xl bg-accent p-2.5 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground">Matrícula Profesional (COMVEZCOL)</label>
              <input
                type="text"
                value={dna.comvezcol_registration}
                onChange={(e) => updateDNA({ comvezcol_registration: e.target.value })}
                className="mt-1 w-full rounded-xl bg-accent p-2.5 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground">WhatsApp Oficial de Atención / Triaje</label>
              <input
                type="text"
                value={dna.contact_whatsapp}
                onChange={(e) => updateDNA({ contact_whatsapp: e.target.value })}
                className="mt-1 w-full rounded-xl bg-accent p-2.5 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground">Modalidad de Práctica</label>
              <select
                value={dna.practice_type}
                onChange={(e) => updateDNA({ practice_type: e.target.value })}
                className="mt-1 w-full rounded-xl bg-accent p-2.5 text-sm font-medium"
              >
                <option value="DOMICILIARY">Veterinaria 100% a Domicilio</option>
                <option value="CLINIC">Consultorio / Clínica con Sede</option>
                <option value="HOSPITAL">Hospital Veterinario 24 Horas</option>
                <option value="HYBRID">Híbrida (Domicilios + Consultorio)</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-bold text-foreground">Zonas de Cobertura Domiciliaria</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {dna.operating_zones.map((zone) => (
                <span
                  key={zone}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary"
                >
                  {zone}
                  <button
                    type="button"
                    onClick={() => handleRemoveZone(zone)}
                    className="hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Añadir barrio o zona (ej. Chapinero Alto)"
                value={zoneInput}
                onChange={(e) => setZoneInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddZone()}
                className="rounded-xl bg-accent px-3 py-2 text-xs"
              />
              <Btn variant="soft" onClick={handleAddZone} className="px-3 py-1.5 text-xs">
                Añadir
              </Btn>
            </div>
          </div>
        </Card>
      )}

      {/* Live Split-Screen Interactive Preview (Mobile Device Frame) */}
      <div className="mt-8 rounded-3xl border border-border bg-accent/40 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <h3 className="font-extrabold text-foreground">
              Simulador Visual Móvil en Tiempo Real
            </h3>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            Sincronizado con CSS en Vivo
          </span>
        </div>

        {/* Mobile Device Frame */}
        <div className="mx-auto max-w-sm overflow-hidden rounded-[2.5rem] border-[6px] border-foreground/80 bg-background p-4 shadow-2xl">
          {/* Status Bar */}
          <div className="flex items-center justify-between px-2 pb-3 text-xs font-bold text-muted-foreground">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-foreground" />
              <span className="h-2 w-3 rounded-sm bg-foreground" />
            </div>
          </div>

          {/* App Header */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
                <PawPrint className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-foreground">{dna.brand_name}</p>
                <p className="text-[10px] text-muted-foreground">{dna.primary_doctor_name}</p>
              </div>
            </div>
            <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-xs">
              🔔
            </span>
          </div>

          {/* Pet Profile Card (Inspired by Images 1, 5, 6) */}
          <div className="mt-4 rounded-3xl border border-border bg-card p-3 shadow-soft">
            <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-secondary">
              <img
                src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80"
                alt="Maximilian"
                className="h-full w-full object-cover"
              />
              <div className="absolute right-2 top-2 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-bold text-foreground backdrop-blur">
                ★ 4.9 · Saludable
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-extrabold text-foreground">Maximilian</h4>
                <span className="text-xs font-bold text-primary">Tutor: Camila</span>
              </div>
              <p className="text-xs text-muted-foreground">Maine Coon · Domicilio Chapinero</p>

              {/* 3 Pill Stats */}
              <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
                <div className="rounded-xl bg-secondary p-1.5">
                  <p className="text-[9px] font-semibold text-muted-foreground">Sexo</p>
                  <p className="text-xs font-bold text-foreground">Hembra</p>
                </div>
                <div className="rounded-xl bg-secondary p-1.5">
                  <p className="text-[9px] font-semibold text-muted-foreground">Edad</p>
                  <p className="text-xs font-bold text-foreground">1 Año</p>
                </div>
                <div className="rounded-xl bg-secondary p-1.5">
                  <p className="text-[9px] font-semibold text-muted-foreground">Peso</p>
                  <p className="text-xs font-bold text-foreground">4.1 kg</p>
                </div>
              </div>

              {/* Today's Tasks */}
              <div className="mt-3 rounded-xl border border-border bg-accent/40 p-2">
                <p className="text-[10px] font-bold text-muted-foreground">HOY EN CASA</p>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Simparica Trio</span>
                  <span className="rounded-full bg-sage px-2 py-0.5 text-[10px] font-bold text-sage-foreground">
                    ✓ Administrado
                  </span>
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-xl bg-gradient-primary py-2.5 text-xs font-bold text-primary-foreground shadow-button"
                >
                  Agendar Visita
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-bold text-foreground"
                >
                  Pasaporte
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar Simulator */}
          <div className="mt-4 flex justify-around border-t border-border pt-2 text-[10px] text-muted-foreground">
            <span className="font-bold text-primary">Inicio</span>
            <span>Mascotas</span>
            <span>Agenda</span>
            <span>Perfil</span>
          </div>
        </div>
      </div>
    </div>
  );
}
