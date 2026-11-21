import photo from "@/assets/vet-life-companions.png.asset.json";

export function Companions({ compact = false }: { compact?: boolean }) {
  return <div className={compact ? "relative mb-5 mt-4 h-32 overflow-hidden rounded-xl" : "relative -mx-5 mb-6 h-60 overflow-hidden md:h-72"}>
    <img src={photo.url} alt="Un perro golden retriever y un gato juntos en casa" className="h-full w-full object-cover object-right" />
    {!compact && <div className="absolute left-5 top-8 max-w-40 md:left-10 md:top-12 md:max-w-64">
      <p className="text-xs font-bold uppercase text-sage-foreground">Veterinaria a domicilio</p>
      <h1 className="mt-2 text-3xl font-extrabold leading-tight text-primary-dark md:text-4xl">Vet Life</h1>
      <p className="mt-2 text-sm font-semibold text-foreground">Cerca de ti.<br />Siempre con ellos.</p>
    </div>}
  </div>;
}