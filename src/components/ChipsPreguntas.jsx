import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

/**
 * Barra de preguntas sugeridas del módulo activo. Al tocar una se envía.
 * `deshabilitado` bloquea los chips mientras el asistente "escribe".
 */
export default function ChipsPreguntas({ preguntas, onElegir, deshabilitado }) {
  return (
    <div className="flex flex-wrap gap-2">
      {preguntas.map((preg, i) => (
        <button
          key={i}
          type="button"
          disabled={deshabilitado}
          onClick={() => onElegir(preg)}
          className="group inline-flex items-center gap-1.5 rounded-full border border-white border-opacity-20 glass-panel px-3.5 py-2 text-sm text-white shadow-sm transition duration-200 hover:border-diplo-celeste hover:text-diplo-celeste disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-diplo-celeste"
        >
          <QuestionMarkCircleIcon className="h-4 w-4 flex-none text-gray-400 transition group-hover:text-diplo-celeste" aria-hidden="true" />
          <span className="text-left">{preg.p}</span>
        </button>
      ))}
    </div>
  );
}
