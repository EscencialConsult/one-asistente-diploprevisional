/**
 * Versión de la plataforma.
 * =========================
 * Subila a mano en cada commit que suma contenido o cambia el comportamiento
 * del asistente (mantené el mismo número en package.json). La usa:
 *  - GuiaUso.jsx, para mostrarla al pie de la guía.
 *  - UpdateToast.jsx, para detectar que el alumno entró a una versión nueva
 *    (compara este valor contra el que quedó guardado en localStorage la
 *    última vez) y mostrar un aviso sutil una sola vez.
 */
export const APP_VERSION = '1.1.1';
