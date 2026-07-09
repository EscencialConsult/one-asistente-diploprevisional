import { ChevronDownIcon } from '@heroicons/react/24/outline';

/**
 * Lista tipo acordeón de preguntas de un módulo. Cada fila se expande in
 * situ para mostrar la respuesta (sin simular un chat aparte): es más
 * cómoda de recorrer con muchas preguntas, sobre todo en pantallas chicas,
 * porque no depende de un cajón de altura fija.
 */
export default function ChipsPreguntas({ preguntas, abiertaId, onToggle }) {
  return (
    <div className="divide-y divide-white divide-opacity-10 rounded-2xl border border-white border-opacity-10 glass-panel">
      {preguntas.map((preg, i) => {
        const abierta = abiertaId === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => onToggle(abierta ? null : i)}
              aria-expanded={abierta}
              className="flex w-full items-start gap-2.5 px-4 py-3 text-left text-sm text-white transition hover:bg-white hover:bg-opacity-5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-diplo-celeste"
            >
              <span className="min-w-0 flex-1 leading-snug">{preg.p}</span>
              <ChevronDownIcon
                className={`mt-0.5 h-4 w-4 flex-none text-gray-400 transition-transform duration-200 ${
                  abierta ? 'rotate-180 text-diplo-celeste' : ''
                }`}
                aria-hidden="true"
              />
            </button>
            {abierta && (
              <div className="animate-fade-up border-t border-white border-opacity-10 bg-black bg-opacity-20 px-4 py-3 text-sm leading-relaxed text-gray-200">
                <p className="whitespace-pre-line">{preg.r}</p>
                {preg.fuente && (
                  <p className="mt-2 text-xs italic text-gray-500">{preg.fuente}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
