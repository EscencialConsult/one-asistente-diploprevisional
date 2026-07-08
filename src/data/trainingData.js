/**
 * Índice de búsqueda PLANO para el chat libre.
 * ============================================
 * No es una fuente de datos aparte: se DERIVA de `modulos.js`, así el banco de
 * preguntas vive en un solo lugar y alimenta las dos vistas (chat + manual).
 *
 * Cada registro:
 *  - id:              único, estable (moduloId + índice)
 *  - primaryQuestion: la pregunta "ideal" (la del banco)
 *  - variations:      frases coloquiales / sinónimos para mejorar el match difuso
 *                     (opcional; si el banco no las trae, queda [])
 *  - answer:          la respuesta anclada al txt
 *  - moduloTitulo:    de qué módulo salió (para contexto)
 *  - fuente:          clase de origen (trazabilidad)
 *
 * Solo se indexan los módulos con estado 'activo'.
 */
import { modulos } from './modulos';

export const trainingData = modulos
  .filter((m) => m.estado === 'activo')
  .flatMap((m) =>
    m.preguntas.map((preg, i) => ({
      id: `${m.id}_${i}`,
      primaryQuestion: preg.p,
      variations: preg.variaciones || [],
      answer: preg.r,
      moduloTitulo: m.titulo,
      fuente: preg.fuente || '',
    }))
  );
