import { APP_VERSION } from '../version';

// Endpoint opcional (Apps Script Web App) para loggear preguntas del chat en
// una Google Sheet. Ver scripts/apps-script-log-preguntas.gs para el código
// del lado de Google. Si no está configurado, no hace nada: el chat sigue
// funcionando 100% offline/local como siempre.
const ENDPOINT = import.meta.env.VITE_LOG_ENDPOINT;

/**
 * Fire-and-forget: nunca bloquea la UI ni rompe el chat si falla o no está
 * configurado. Usa mode 'no-cors' porque Apps Script Web Apps no siempre
 * responden con headers CORS legibles desde el navegador; no necesitamos
 * leer la respuesta, solo que la fila se guarde del otro lado.
 */
function enviarLog(query, action, origen) {
  if (!ENDPOINT || !query) return;

  try {
    fetch(ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ query, action, origen, appVersion: APP_VERSION }),
    }).catch(() => {});
  } catch {
    // Silencioso a propósito: esto es telemetría opcional, no puede afectar el chat.
  }
}

/** Log automático y silencioso cuando el motor devuelve NO_MATCH o SUGGESTIONS. */
export function logPreguntaSinRespuesta(query, action) {
  enviarLog(query, action, 'automatico');
}

/**
 * El alumno tocó explícitamente "Sugerir esta pregunta para una futura
 * versión". Va a una pestaña aparte de la misma planilla (ver el .gs) para
 * no mezclarse con el log automático de fallos.
 */
export function sugerirPreguntaManual(query) {
  enviarLog(query, 'SUGERENCIA_ALUMNO', 'manual');
}
