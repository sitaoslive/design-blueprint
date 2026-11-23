import { usePets } from "@/lib/vf/store";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { actions } from "@/lib/vf/store";
import { Btn, Card } from "@/components/vf/ui";
import { meta } from "@/lib/vf/meta";
import { PageTitle } from "@/components/vf/ui";


export const Route = createFileRoute("/cliente/mascotas/")({
  head: () => meta("Mis mascotas", "Perfiles de tus mascotas y gestión de expedientes."),
  component: Pets,
});

function Pets() {
  const pets = usePets();

  return (
    <>
      <PageTitle title="Mis mascotas" />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link to="/cliente/bienvenida" className="flex-1 min-w-[200px]">
          <Btn variant="primary" className="w-full text-xs">
            ✨ Registrar Nueva Mascota
          </Btn>
        </Link>
      </div>

      <AddPet />
      <div className="grid grid-cols-2 gap-3">
        {pets.map((p) => (
          <Link key={p.id} to="/cliente/mascotas/$id" params={{ id: p.id }} className="rounded-3xl bg-secondary p-2 shadow-soft transition hover:scale-[1.01]">
            <img src={p.photo} alt={p.name} className="aspect-square w-full rounded-2xl object-cover" />
            <b className="mt-2 block px-1 text-xl">{p.name}</b><span className="px-1 text-muted-foreground">{p.species} · {p.age}</span>
          </Link>
        ))}
      </div>
    </>
  );
}

function AddPet() {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", species: "Perro" as "Perro" | "Gato", breed: "", age: "", allergies: "" });
  const field = "w-full rounded-2xl bg-card px-4 py-3";
  if (!open) {
    return (
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <Link to="/cliente/bienvenida" className="flex-1">
          <Btn variant="primary" className="w-full">
            ✨ Registrar Mascota (Paso a Paso Inteligente)
          </Btn>
        </Link>
        <Btn variant="soft" onClick={() => setOpen(true)} className="sm:w-auto">
          + Registro Rápido
        </Btn>
      </div>
    );
  }
  return (
    <Card className="mb-4 space-y-2">
      <input placeholder="Nombre" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={field} />
      <select value={f.species} onChange={(e) => setF({ ...f, species: e.target.value as "Perro" | "Gato" })} className={field}><option>Perro</option><option>Gato</option></select>
      <input placeholder="Raza" value={f.breed} onChange={(e) => setF({ ...f, breed: e.target.value })} className={field} />
      <input placeholder="Edad (ej. 3 años)" value={f.age} onChange={(e) => setF({ ...f, age: e.target.value })} className={field} />
      <input placeholder="Alergias" value={f.allergies} onChange={(e) => setF({ ...f, allergies: e.target.value })} className={field} />
      <div className="grid grid-cols-2 gap-2">
        <Btn disabled={!f.name.trim()} onClick={() => { actions.addPet({ ...f, name: f.name.trim(), allergies: f.allergies || "Ninguna registrada" }); toast.success("Mascota registrada"); setOpen(false); setF({ name: "", species: "Perro", breed: "", age: "", allergies: "" }); }}>Guardar</Btn>
        <Btn variant="outline" onClick={() => setOpen(false)}>Cancelar</Btn>
      </div>
    </Card>
  );
}
