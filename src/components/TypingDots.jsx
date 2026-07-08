// Tres puntitos rebotando: el "escribiendo..." del asistente.
export default function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1" aria-label="Escribiendo respuesta">
      {[0, 0.2, 0.4].map((delay, i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-diplo-celeste animate-bounce-dot"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </div>
  );
}
