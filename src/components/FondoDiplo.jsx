export default function FondoDiplo() {
  return (
    <div className="fondo-base pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Brillo sutil celeste arriba a la derecha */}
      <div className="brillo-celeste absolute -right-64 -top-64 rounded-full" />

      {/* Brillo sutil naranja abajo a la izquierda */}
      <div className="brillo-naranja absolute -bottom-64 -left-64 rounded-full" />

      {/* Líneas abstractas muy sutiles y elegantes */}
      <svg
        className="absolute inset-0 h-full w-full opacity-10"
        preserveAspectRatio="none"
      >
        <path d="M-100,50 Q400,300 1000,-100" fill="none" stroke="#fefeff" strokeWidth="1" />
        <path d="M-100,100 Q400,350 1000,-50" fill="none" stroke="#fefeff" strokeWidth="1" />
        
        <path d="M-100,80% Q400,100% 1000,60%" fill="none" stroke="#f08b3a" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
