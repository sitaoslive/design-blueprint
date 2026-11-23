import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface ThemePalette {
  primary: string;
  primary_dark: string;
  primary_foreground: string;
  background: string;
  foreground: string;
  card: string;
  card_foreground: string;
  secondary: string;
  secondary_foreground: string;
  accent: string;
  accent_foreground: string;
  muted: string;
  muted_foreground: string;
  border: string;
  ring: string;
  radius: string;
  font_family?: string;
}

export interface ClinicDNA {
  brand_name: string;
  brand_tagline: string;
  primary_doctor_name: string;
  comvezcol_registration: string;
  contact_whatsapp: string;
  practice_type: string;
  species_served: string[];
  operating_zones: string[];
}

export const THEME_PRESETS: Record<string, { name: string; description: string; palette: ThemePalette }> = {
  EMERALD_BOTANIC: {
    name: "Esmeralda Botánica (Vet Life)",
    description: "Inspirada en el verde bosque, salvia suave y fondo marfil cálido (#FAF7F0). Transmite serenidad y medicina natural.",
    palette: {
      primary: "oklch(0.55 0.11 165)", // #348B72
      primary_dark: "oklch(0.44 0.11 165)",
      primary_foreground: "oklch(0.99 0 0)",
      background: "oklch(0.978 0.012 95)", // #FAF7F0 Warm Ivory
      foreground: "oklch(0.24 0.02 240)", // #252630
      card: "oklch(1 0 0)",
      card_foreground: "oklch(0.24 0.02 240)",
      secondary: "oklch(0.93 0.03 162)", // Soft Sage / Mint
      secondary_foreground: "oklch(0.28 0.07 165)",
      accent: "oklch(0.88 0.05 162)",
      accent_foreground: "oklch(0.25 0.08 165)",
      muted: "oklch(0.95 0.01 95)",
      muted_foreground: "oklch(0.52 0.02 240)",
      border: "oklch(0.90 0.015 165)",
      ring: "oklch(0.55 0.11 165)",
      radius: "1.25rem",
      font_family: "Manrope",
    },
  },
  CARAMEL_PEACH: {
    name: "Caramelo & Durazno (Pawly Style)",
    description: "Paleta cálida, terracota, vainilla y crema marfil. Genera ternura, cercanía y amor familiar por las mascotas.",
    palette: {
      primary: "oklch(0.68 0.13 40)", // Warm Terracotta Coral #E88C74
      primary_dark: "oklch(0.56 0.13 40)",
      primary_foreground: "oklch(0.99 0 0)",
      background: "oklch(0.978 0.012 85)", // Warm Cream #FAF7F0
      foreground: "oklch(0.22 0.02 40)", // Deep espresso
      card: "oklch(1 0 0)",
      card_foreground: "oklch(0.22 0.02 40)",
      secondary: "oklch(0.94 0.04 75)", // Vanilla cream #FFF0DB
      secondary_foreground: "oklch(0.35 0.08 40)",
      accent: "oklch(0.88 0.06 50)", // Soft Peach #F6C7AE
      accent_foreground: "oklch(0.30 0.08 40)",
      muted: "oklch(0.94 0.01 80)",
      muted_foreground: "oklch(0.50 0.02 40)",
      border: "oklch(0.91 0.02 60)",
      ring: "oklch(0.68 0.13 40)",
      radius: "1.5rem",
      font_family: "Manrope",
    },
  },
  PETIDO_GOLD: {
    name: "Champagne Gold & Slate (Petido)",
    description: "Elegancia concierge, tonos dorados champagne (#B4823E) y pizarra moderna. Diseñado para clínicas premium.",
    palette: {
      primary: "oklch(0.62 0.12 75)", // Champagne Gold #B4823E
      primary_dark: "oklch(0.48 0.11 75)",
      primary_foreground: "oklch(0.99 0 0)",
      background: "oklch(0.982 0.008 80)", // Linen #FBF9F5
      foreground: "oklch(0.18 0.01 45)", // Obsidian ink
      card: "oklch(1 0 0)",
      card_foreground: "oklch(0.18 0.01 45)",
      secondary: "oklch(0.94 0.02 75)", // Champagne mist
      secondary_foreground: "oklch(0.35 0.07 75)",
      accent: "oklch(0.86 0.05 75)",
      accent_foreground: "oklch(0.28 0.07 75)",
      muted: "oklch(0.95 0.006 80)",
      muted_foreground: "oklch(0.50 0.01 45)",
      border: "oklch(0.90 0.015 75)",
      ring: "oklch(0.62 0.12 75)",
      radius: "1rem",
      font_family: "Manrope",
    },
  },
  LAVENDER_CALM: {
    name: "Lavanda & Nube Calma",
    description: "Tonos violeta suave y lila relajante. Especial para clínicas de atención felina Fear Free y medicina holística.",
    palette: {
      primary: "oklch(0.58 0.20 280)", // Soft Lavender #7C5CFC
      primary_dark: "oklch(0.46 0.20 280)",
      primary_foreground: "oklch(0.99 0 0)",
      background: "oklch(0.982 0.006 280)",
      foreground: "oklch(0.20 0.03 280)",
      card: "oklch(1 0 0)",
      card_foreground: "oklch(0.20 0.03 280)",
      secondary: "oklch(0.94 0.03 280)",
      secondary_foreground: "oklch(0.35 0.12 280)",
      accent: "oklch(0.89 0.05 280)",
      accent_foreground: "oklch(0.30 0.12 280)",
      muted: "oklch(0.95 0.008 280)",
      muted_foreground: "oklch(0.52 0.02 280)",
      border: "oklch(0.91 0.015 280)",
      ring: "oklch(0.58 0.20 280)",
      radius: "1.25rem",
      font_family: "Manrope",
    },
  },
};

export const DEFAULT_CLINIC_DNA: ClinicDNA = {
  brand_name: "Vet Life — Veterinaria a Domicilio",
  brand_tagline: "Cuidado profesional, cálido y personalizado en tu hogar",
  primary_doctor_name: "Dr. Luis Eduardo Ríos",
  comvezcol_registration: "COMVEZCOL-28491",
  contact_whatsapp: "+573001234567",
  practice_type: "DOMICILIARY",
  species_served: ["Caninos", "Felinos"],
  operating_zones: ["Chicó", "Rosales", "Usaquén", "Cedritos", "Santa Bárbara", "Salitre"],
};

interface ThemeContextType {
  activePreset: string;
  palette: ThemePalette;
  dna: ClinicDNA;
  setPreset: (presetKey: string) => void;
  updatePalette: (partial: Partial<ThemePalette>) => void;
  updateDNA: (partial: Partial<ClinicDNA>) => void;
  saveToSupabase: () => Promise<{ success: boolean; error?: string }>;
  resetToDefault: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function applyPaletteToCSS(palette: ThemePalette) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--primary", palette.primary);
  root.style.setProperty("--primary-dark", palette.primary_dark);
  root.style.setProperty("--primary-foreground", palette.primary_foreground);
  root.style.setProperty("--background", palette.background);
  root.style.setProperty("--foreground", palette.foreground);
  root.style.setProperty("--card", palette.card);
  root.style.setProperty("--card-foreground", palette.card_foreground);
  root.style.setProperty("--secondary", palette.secondary);
  root.style.setProperty("--secondary-foreground", palette.secondary_foreground);
  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--accent-foreground", palette.accent_foreground);
  root.style.setProperty("--muted", palette.muted);
  root.style.setProperty("--muted-foreground", palette.muted_foreground);
  root.style.setProperty("--border", palette.border);
  root.style.setProperty("--ring", palette.ring);
  root.style.setProperty("--radius", palette.radius);
  if (palette.font_family) {
    root.style.setProperty("--font-sans", `"${palette.font_family}", ui-sans-serif, system-ui, sans-serif`);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [activePreset, setActivePreset] = useState<string>("EMERALD_BOTANIC");
  const [palette, setPalette] = useState<ThemePalette>(THEME_PRESETS["EMERALD_BOTANIC"]!.palette);
  const [dna, setDNA] = useState<ClinicDNA>(DEFAULT_CLINIC_DNA);

  // Load active theme from Supabase or localStorage on mount
  useEffect(() => {
    async function loadTheme() {
      // 1. Check local storage cache for immediate paint
      try {
        const cached = localStorage.getItem("vf_theme_override");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.palette) {
            setPalette(parsed.palette);
            applyPaletteToCSS(parsed.palette);
          }
          if (parsed.activePreset) setActivePreset(parsed.activePreset);
          if (parsed.dna) setDNA(parsed.dna);
        }
      } catch {
        // fallback
      }

      // 2. Remote theme tables (`organization_theme_tokens`, `clinic_dna_profiles`) are not
      //    part of the database yet, so the active theme comes from the local cache and the
      //    built-in presets. Re-enable a remote read once those tables exist and are readable.
    }

    void loadTheme();
  }, []);

  const setPreset = (presetKey: string) => {
    const preset = THEME_PRESETS[presetKey];
    if (!preset) return;
    setActivePreset(presetKey);
    setPalette(preset.palette);
    applyPaletteToCSS(preset.palette);
    try {
      localStorage.setItem("vf_theme_override", JSON.stringify({ activePreset: presetKey, palette: preset.palette, dna }));
    } catch {
      // ignore
    }
  };

  const updatePalette = (partial: Partial<ThemePalette>) => {
    setPalette((prev) => {
      const next = { ...prev, ...partial };
      applyPaletteToCSS(next);
      try {
        localStorage.setItem("vf_theme_override", JSON.stringify({ activePreset, palette: next, dna }));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const updateDNA = (partial: Partial<ClinicDNA>) => {
    setDNA((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem("vf_theme_override", JSON.stringify({ activePreset, palette, dna: next }));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const resetToDefault = () => {
    const def = THEME_PRESETS["EMERALD_BOTANIC"]!;
    setActivePreset("EMERALD_BOTANIC");
    setPalette(def.palette);
    setDNA(DEFAULT_CLINIC_DNA);
    applyPaletteToCSS(def.palette);
    try {
      localStorage.removeItem("vf_theme_override");
    } catch {
      // ignore
    }
  };

  const saveToSupabase = async () => {
    // Remote theme tables (`organization_theme_tokens`, `clinic_dna_profiles`) do not exist
    // in the database yet, so the design is only cached on this device and is never shared
    // with the rest of the clinic.
    try {
      localStorage.setItem(
        "vf_theme_override",
        JSON.stringify({ palette, activePreset, dna })
      );
    } catch {
      // ignore
    }
    return {
      success: false,
      error: "El diseño quedó guardado en este dispositivo. Todavía no se puede compartir con toda la clínica.",
    };
  };

  return (
    <ThemeContext.Provider
      value={{
        activePreset,
        palette,
        dna,
        setPreset,
        updatePalette,
        updateDNA,
        saveToSupabase,
        resetToDefault,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }
  return ctx;
}
