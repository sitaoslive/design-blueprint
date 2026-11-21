import photo from "@/assets/vet-life-companions.png.asset.json";

export function Companions({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "cinema-banner relative -mx-5 mb-6 mt-4 h-40 overflow-hidden md:h-48"
          : "cinema-banner relative -mx-5 mb-6 h-80 overflow-hidden md:h-96"
      }
    >
      <img
        src={photo.url}
        alt="Un perro golden retriever y un gato juntos en casa"
        className="h-full w-full object-cover object-right-top"
        fetchPriority={compact ? "auto" : "high"}
      />
      <div className="cinema-scrim absolute inset-0" />
      <div
        className={
          compact
            ? "absolute bottom-5 left-5 max-w-44 md:left-8 md:max-w-60"
            : "absolute bottom-7 left-5 max-w-52 md:bottom-10 md:left-10 md:max-w-80"
        }
      >
        <p className="text-xs font-bold uppercase text-cinema-foreground/80">
          Veterinaria a domicilio
        </p>
        {compact ? (
          <p className="mt-2 text-xl font-extrabold leading-tight text-cinema-foreground">
            Cerca de ti.
            <br />
            Siempre con ellos.
          </p>
        ) : (
          <>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-cinema-foreground md:text-4xl">
              Veterinaria
              <br />
              Dr. Luis Ríos
            </h1>
            <p className="mt-4 text-sm font-semibold text-cinema-foreground/85">
              Cerca de ti. Siempre con ellos.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
