// Fondo Neon-Glass de marca ONE: manchas fucsia/cian difuminadas y en
// movimiento lento. Decorativo, no interfiere con el contenido.
//
// zIndex:-1 y el blur van inline a propósito: Tailwind 2.2.1 no genera
// z-index negativo ni tiene el plugin de filtros activo por defecto, así que
// forzarlos acá garantiza que el fondo quede DETRÁS y bien difuminado.
const blur = { filter: 'blur(60px)' };

export default function BackgroundBlobs() {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    >
      <div
        className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-one-fucsia opacity-30 animate-blob"
        style={blur}
      />
      <div
        className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-one-cian opacity-30 animate-blob"
        style={{ ...blur, animationDelay: '4s' }}
      />
      <div
        className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-one-dorado opacity-20 animate-blob"
        style={{ ...blur, animationDelay: '8s' }}
      />
    </div>
  );
}
