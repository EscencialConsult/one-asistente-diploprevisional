/**
 * Test de regresión del motor de búsqueda del chat.
 * =====================================================
 * Corre casos fijos contra la función REAL (`resolverConsulta`, exportada
 * desde src/workers/search.worker.js) para detectar si un ajuste de umbral
 * o de heurística rompe algo que ya funcionaba. No es un mock aparte: usa
 * el mismo código que corre en el navegador, así nunca se desincroniza.
 *
 * Uso: node scripts/test-matching.mjs   (o "npm run test:matching")
 * Sale con código 1 si algún caso falla, para poder engancharlo a CI.
 */
import { resolverConsulta } from '../src/workers/search.worker.js';

const casos = [
  // --- Off-topic: no debe responder nada del banco ---
  { q: 'como esta el clima hoy', esperado: 'NO_MATCH' },
  { q: 'receta de milanesas', esperado: 'NO_MATCH' },
  { q: 'partido de futbol de hoy', esperado: 'NO_MATCH' },
  { q: 'me recomendas una pelicula', esperado: 'NO_MATCH' },

  // --- Consultas "vacías" (sin token de contenido real) ---
  { q: 'cuanto es 2 mas 2', esperado: 'NO_MATCH' },
  { q: 'que tal como estas', esperado: /GREETING|NO_MATCH/ },

  // --- Casos de estudio (la guía pide que el bot no los procese) ---
  {
    q: 'tengo un cliente que se jubilo hace 5 años y le descontaron mal la obra social que hago',
    esperado: 'NO_MATCH',
  },

  // --- Preguntas exactas del banco: deben responder directo (EXACT_MATCH) ---
  { q: '¿Qué es el SICAM y cuándo tengo que liquidarlo?', esperado: 'EXACT_MATCH' },
  { q: '¿Qué es el PUAM y qué requisitos tiene?', esperado: 'EXACT_MATCH' },
  { q: 'que es el puam', esperado: 'EXACT_MATCH' },
  { q: 'fallo gemelli', esperado: 'EXACT_MATCH' },
  { q: 'requisitos para jubilarme', esperado: 'EXACT_MATCH' },
  { q: 'deducir seguro de vida', esperado: 'EXACT_MATCH' },

  // --- Saludos puros ---
  { q: 'hola', esperado: 'GREETING' },
  { q: 'buenas tardes', esperado: 'GREETING' },
];

let fallos = 0;

for (const { q, esperado } of casos) {
  const r = resolverConsulta(q);
  const ok =
    esperado instanceof RegExp ? esperado.test(r.action) : r.action === esperado;
  const estado = ok ? 'OK  ' : 'FAIL';
  if (!ok) fallos++;
  console.log(
    `${estado} "${q}" -> ${r.action}` +
      (esperado instanceof RegExp ? ` (esperaba ${esperado})` : ok ? '' : ` (esperaba ${esperado})`)
  );
}

console.log(`\n${casos.length - fallos}/${casos.length} casos OK`);
if (fallos > 0) {
  console.error(`\n${fallos} caso(s) fallaron. Revisá search.worker.js antes de subir.`);
  process.exit(1);
}
