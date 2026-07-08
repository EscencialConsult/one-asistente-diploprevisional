import { useEffect, useMemo } from 'react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useTyping } from '../hooks/useTyping';
import TypingDots from './TypingDots';
import RobotAvatar from './RobotAvatar';

// Renderiza un texto con saltos de línea dobles como párrafos separados.
function Parrafos({ texto, tipear, terminado }) {
  const bloques = texto.split(/\n{2,}/);
  const isTyping = tipear && !terminado;

  return (
    <>
      {bloques.map((bloque, i) => (
        <p key={i} className={i > 0 ? 'mt-3' : ''}>
          {bloque.split('\n').map((linea, j) => {
            const isLastLine = i === bloques.length - 1 && j === bloque.split('\n').length - 1;
            return (
              <span key={j}>
                {j > 0 && <br />}
                {linea}
                {isTyping && isLastLine && (
                  <span className="inline-block w-1.5 h-4 ml-0.5 bg-diplo-naranja animate-pulse align-middle" />
                )}
              </span>
            );
          })}
        </p>
      ))}
    </>
  );
}

/**
 * Una burbuja del chat.
 * @param {'user'|'bot'} autor
 * @param {string} texto
 * @param {boolean} tipear    Si es bot y true, revela el texto de a poco.
 * @param {string}  fuente    (opcional) clase de origen, se muestra debajo.
 * @param {Array}   options   (opcional) botones de desambiguación {id, primaryQuestion}.
 * @param {Function} onElegirOpcion  (opcional) callback al tocar un botón.
 * @param {Function} onListo  Se llama cuando terminó de tipear (para autoscroll).
 */
export default function Mensaje({
  autor,
  texto,
  tipear = false,
  fuente,
  primaryQuestion,
  options,
  avatarPose,
  onElegirOpcion,
  onListo,
}) {
  const esBot = autor === 'bot';
  const { mostrado, terminado } = useTyping(texto, esBot && tipear);
  const contenido = esBot && tipear ? mostrado : texto;
  const mostrandoDots = esBot && tipear && mostrado.length === 0;

  useEffect(() => {
    if (!tipear || terminado) onListo && onListo();
  }, [contenido, terminado, tipear, onListo]);



  if (esBot) {
    return (
      <div className="flex items-start justify-end gap-3 animate-fade-up">
        <div className="max-w-bubble rounded-2xl rounded-tr-none border border-white border-opacity-10 glass-panel px-4 py-3 text-message leading-relaxed text-white shadow-sm">
          {primaryQuestion && (
            <div className="mb-2 flex items-start gap-1.5 border-b border-white border-opacity-10 pb-2 text-sm">
              <QuestionMarkCircleIcon className="mt-0.5 h-4 w-4 flex-none text-diplo-celeste" aria-hidden="true" />
              <span className="text-gray-300 italic">
                Respondiendo a la pregunta del módulo: <span className="font-semibold text-white not-italic">{primaryQuestion}</span>
              </span>
            </div>
          )}
          {mostrandoDots ? <TypingDots /> : <Parrafos texto={contenido} tipear={esBot && tipear} terminado={terminado} />}

          {/* Botones de desambiguación (umbral medio) */}
          {options && options.length > 0 && (
            <div className="mt-3 space-y-2">
              {options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onElegirOpcion && onElegirOpcion(opt.primaryQuestion)}
                  className="group flex w-full items-start gap-2 rounded-xl border border-white border-opacity-20 bg-white bg-opacity-5 px-3 py-2 text-left text-sm text-white shadow-sm transition hover:border-diplo-celeste hover:text-diplo-celeste focus:outline-none focus:ring-2 focus:ring-diplo-celeste"
                >
                  <QuestionMarkCircleIcon className="mt-0.5 h-4 w-4 flex-none text-gray-400 group-hover:text-diplo-celeste transition" aria-hidden="true" />
                  <span>{opt.primaryQuestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <RobotAvatar 
          estado={tipear && !terminado ? 'loading' : 'idle'}
          coord={tipear && !terminado ? undefined : avatarPose}
          className="one-avatar-bubble flex-none" 
        />
      </div>
    );
  }

  return (
    <div className="flex justify-start animate-fade-up">
      <div className="max-w-bubble rounded-2xl rounded-tl-sm bg-one-oscuro border border-one-fucsia border-opacity-40 px-4 py-3 text-message leading-relaxed text-white shadow-[0_0_10px_rgba(225,123,215,0.1)]">
        <Parrafos texto={texto} />
      </div>
    </div>
  );
}
