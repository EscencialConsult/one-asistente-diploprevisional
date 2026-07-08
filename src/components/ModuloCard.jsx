import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Icono from './Icono';

// Tarjeta de un módulo en la pantalla de inicio.
export default function ModuloCard({ modulo, onSelect }) {
  const { titulo, descripcion, estado } = modulo;
  const proximamente = estado === 'proximamente';

  return (
    <button
      type="button"
      onClick={() => onSelect(modulo)}
      disabled={proximamente}
      className={`group relative flex w-full flex-col items-start overflow-hidden rounded-2xl border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-diplo-celeste ${
        proximamente
          ? 'cursor-not-allowed border-white border-opacity-5 bg-white bg-opacity-5 opacity-50'
          : 'border-white border-opacity-10 glass-panel hover:border-diplo-celeste'
      }`}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white bg-opacity-5 text-gray-400 transition group-hover:bg-diplo-celeste group-hover:bg-opacity-20 group-hover:text-diplo-celeste">
        <Icono nombre={modulo.icono} className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <h3
          className={`mb-1.5 font-bold leading-tight ${
            proximamente ? 'text-gray-400' : 'text-white group-hover:text-diplo-celeste'
          } transition`}
        >
          {titulo}
        </h3>
        <p className="mb-4 text-xs leading-relaxed text-gray-400 line-clamp-2">{descripcion}</p>
        {proximamente ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-white bg-opacity-5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Próximamente
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-diplo-naranja bg-opacity-20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-diplo-naranja">
            {modulo.preguntas.length} preguntas
            <ArrowRightIcon className="h-4 w-4 transition duration-200 group-hover:translate-x-0.5" />
          </span>
        )}
      </div>
    </button>
  );
}
