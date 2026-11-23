import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Sparkles, ShieldCheck, Calendar, FileText, ChevronRight, Activity, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PetCardData {
  id: string;
  name: string;
  species: "CANINE" | "FELINE" | string;
  breed: string;
  sex?: "MALE" | "FEMALE" | string;
  age: string;
  weight_kg?: number | string;
  photo_url?: string;
  status?: string;
  temperament?: string;
  rating?: number;
  passport_id?: string;
}

const DEFAULT_AVATARS: Record<string, string> = {
  CANINE: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80", // Golden
  FELINE: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80", // Cat
};

export function PetProfileHeroCard({
  pet,
  compact = false,
  onBookVisit,
}: {
  pet: PetCardData;
  compact?: boolean;
  onBookVisit?: () => void;
}) {
  const [loved, setLoved] = useState(false);
  const photo = pet.photo_url || DEFAULT_AVATARS[pet.species] || DEFAULT_AVATARS["CANINE"];

  const sexLabel = pet.sex === "MALE" ? "Macho" : pet.sex === "FEMALE" ? "Hembra" : "Sin dato";
  const speciesLabel = pet.species === "CANINE" ? "Perro" : pet.species === "FELINE" ? "Gato" : pet.species;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:shadow-md">
      {/* Soft pastel backdrop shape behind image */}
      <div className="relative flex flex-col items-center">
        <div className="relative h-64 w-full overflow-hidden rounded-[1.75rem] bg-secondary/80">
          <img
            src={photo}
            alt={pet.name}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />

          {/* Top badges */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 text-xs font-extrabold text-foreground backdrop-blur-md shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Saludable</span>
          </div>

          <button
            type="button"
            onClick={() => setLoved(!loved)}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/90 text-foreground backdrop-blur-md shadow-sm transition active:scale-90"
            aria-label="Guardar mascota favorita"
          >
            <Heart className={cn("h-5 w-5", loved ? "fill-danger text-danger" : "text-muted-foreground")} />
          </button>

          {/* Rating / Care score badge */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 text-xs font-black text-foreground backdrop-blur shadow-sm">
            <span className="text-amber-500">★</span>
            <span>{pet.rating || 4.9}</span>
          </div>
        </div>

        {/* Pet Name & Breed Info */}
        <div className="mt-4 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-foreground">{pet.name}</h2>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">
              {speciesLabel}
            </span>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {pet.breed} {pet.temperament ? `· ${pet.temperament}` : "· Dócil y cariñoso"}
          </p>

          {/* 3 Metric Pills (Images 1, 5, 6 inspired) */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-secondary/80 p-2.5 transition">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sexo</p>
              <p className="mt-0.5 text-sm font-extrabold text-foreground">{sexLabel}</p>
            </div>
            <div className="rounded-2xl bg-secondary/80 p-2.5 transition">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Edad</p>
              <p className="mt-0.5 text-sm font-extrabold text-foreground">{pet.age || "1 Año"}</p>
            </div>
            <div className="rounded-2xl bg-secondary/80 p-2.5 transition">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Peso</p>
              <p className="mt-0.5 text-sm font-extrabold text-foreground">
                {pet.weight_kg ? `${pet.weight_kg} kg` : "Peso sin registrar"}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-5 flex gap-2.5">
            {onBookVisit ? (
              <button
                type="button"
                onClick={onBookVisit}
                className="flex-1 rounded-2xl bg-gradient-primary py-3.5 text-sm font-bold text-primary-foreground shadow-button transition active:scale-[0.98]"
              >
                Agendar Visita Domicilio
              </button>
            ) : (
              <Link
                to="/cliente/agenda"
                className="flex-1 text-center rounded-2xl bg-gradient-primary py-3.5 text-sm font-bold text-primary-foreground shadow-button transition active:scale-[0.98]"
              >
                Agendar Visita Domicilio
              </Link>
            )}

            <Link
              to="/cliente/pasaporte/$id"
              params={{ id: pet.id || "1" }}
              className="grid place-items-center rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-bold text-foreground transition hover:bg-secondary active:scale-[0.98]"
              title="Pasaporte Sanitario Digital"
            >
              <Award className="h-5 w-5 text-primary" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
