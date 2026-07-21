/**
 * Apps Script — Log y auditoría de preguntas del chat asistencial.
 * ====================================================================
 * Dos hojas, con nombre fijo (no las renombres a mano — si lo hacés, el
 * script no las va a reconocer y te va a crear una hoja nueva de más):
 *
 *   "Auditoría"              -> log AUTOMÁTICO y silencioso. Cada vez que
 *                                el motor de matching del chat devuelve
 *                                NO_MATCH o SUGGESTIONS (le falló al
 *                                alumno), se guarda fecha + pregunta + tipo
 *                                de fallo + versión de la app. Columnas:
 *                                Fecha, Pregunta, Resultado, Versión app,
 *                                Estado.
 *   "Sugerencias de alumnos" -> log MANUAL. El alumno solo manda el texto
 *                                de la pregunta que quiere sugerir (no hay
 *                                "Resultado" del motor acá, por eso esta
 *                                hoja NO tiene esa columna). Columnas:
 *                                Fecha, Pregunta sugerida, Versión app,
 *                                Estado.
 *
 * Ambas tienen columna "Estado" (Pendiente / Resuelto) con desplegable.
 * No es IA, no llama a ningún modelo: solo guarda texto plano.
 *
 * INSTALACIÓN
 * -----------
 * 1. Creá una Google Sheet nueva (o usá una existente) y anotá su URL.
 * 2. En esa Sheet: Extensiones > Apps Script.
 * 3. Borrá TODO el contenido de Code.gs y pegá este archivo completo.
 *    Guardá (Ctrl+S) y volvé a la pestaña de la planilla, recargá la página.
 * 3.5. Va a aparecer un menú nuevo "Chat Diplo" en la barra de arriba
 *    (al lado de Ayuda). Usalo para probar ANTES de desplegar:
 *      - "Crear/actualizar hojas": crea las que falten y les agrega
 *        cualquier columna que le falte a las que ya existían (no borra
 *        ni duplica nada si ya están bien).
 *      - "Enviar fila de prueba": si ves la fila nueva en "Auditoría", el
 *        script está bien armado.
 * 4. Implementar > Nueva implementación > tipo "Aplicación web".
 *    - Ejecutar como: Yo (tu cuenta).
 *    - Quién tiene acceso: Cualquier usuario.
 * 5. Copiá la URL de la implementación (termina en /exec) — esa es la que
 *    va en VITE_LOG_ENDPOINT del .env del proyecto del chat.
 * 6. Cada vez que cambies este código, tenés que crear una NUEVA versión
 *    de la implementación (Implementar > Administrar implementaciones >
 *    lápiz de editar > Versión: Nueva versión) para que el cambio impacte.
 *
 * IMPORTANTE si probás las funciones desde el editor de Apps Script (botón
 * ▶ Ejecutar) en vez de desde el menú de la planilla: las funciones que
 * muestran cuadros de diálogo necesitan estar abiertas DESDE la hoja para
 * poder mostrar el alert. Si las corrés desde el editor, el resultado
 * queda en "Registros de ejecución" (Ver > Registros) en vez de en un
 * cuadro, y eso es normal, no es un error.
 */

const HOJA_AUDITORIA = 'Auditoría';
const HOJA_SUGERENCIAS = 'Sugerencias de alumnos';

const ENCABEZADOS_AUDITORIA = ['Fecha', 'Pregunta', 'Resultado', 'Versión app', 'Estado'];
const ENCABEZADOS_SUGERENCIAS = ['Fecha', 'Pregunta sugerida', 'Versión app', 'Estado'];

const ESTADOS = ['Pendiente', 'Resuelto'];

// A dónde llega el mail de aviso cuando el chat empieza a mandar logs de
// una versión de la app que nunca habíamos visto (señal de que ya hay
// alumnos usando una actualización nueva). Cambiá el mail si hace falta.
const EMAIL_NOTIFICACION = 'escencialconsult@gmail.com';
const PROP_VERSIONES_VISTAS = 'versiones_vistas';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Chat Diplo')
    .addItem('Crear/actualizar hojas', 'crearHojas')
    .addItem('Enviar fila de prueba', 'enviarFilaDePrueba')
    .addItem('Ver resumen por versión', 'verResumen')
    .addItem('Olvidar versiones ya notificadas', 'olvidarVersionesNotificadas')
    .addSeparator()
    .addItem('Reparar hoja de Sugerencias (borra y recrea limpia)', 'repararHojaSugerencias')
    .addToUi();
}

// Crea las hojas que falten y AGREGA columnas faltantes a las que ya
// existían, sin tocar los datos que ya tenía cargados. No crea hojas
// duplicadas: si "Auditoría" o "Sugerencias de alumnos" ya existen (con
// ese nombre exacto), las usa tal cual están.
function crearHojas() {
  obtenerOCrearHoja(HOJA_AUDITORIA, ENCABEZADOS_AUDITORIA);
  obtenerOCrearHoja(HOJA_SUGERENCIAS, ENCABEZADOS_SUGERENCIAS);
  mostrarMensaje('Listo: "' + HOJA_AUDITORIA + '" y "' + HOJA_SUGERENCIAS + '" están creadas y actualizadas.');
}

function enviarFilaDePrueba() {
  agregarFilaAuditoria('Pregunta de prueba', 'TEST', 'manual');
  mostrarMensaje('Fila de prueba agregada en "' + HOJA_AUDITORIA + '". Si la ves en la planilla, el script está bien armado (falta solo desplegarlo y conectar la URL desde el chat).');
}

// Borra y vuelve a crear "Sugerencias de alumnos" desde cero, con
// exactamente las columnas que le corresponden (Fecha, Pregunta sugerida,
// Versión app, Estado) — nada de columnas viejas pegadas al lado. Usala
// una sola vez para limpiar una hoja que quedó con columnas mezcladas de
// una versión anterior del script. Borra cualquier dato que ya tuviera
// cargado esa hoja puntual (no toca "Auditoría").
function repararHojaSugerencias() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  const existente = libro.getSheetByName(HOJA_SUGERENCIAS);
  if (existente) libro.deleteSheet(existente);

  obtenerOCrearHoja(HOJA_SUGERENCIAS, ENCABEZADOS_SUGERENCIAS);
  mostrarMensaje('Listo: "' + HOJA_SUGERENCIAS + '" quedó recreada, limpia, con las columnas correctas.');
}

// Cuenta filas por versión de la app y cuántas siguen "Pendiente", en
// ambas hojas (la columna "Versión app" y "Estado" están en distinta
// posición en cada una, por eso se pasa el índice de cada columna).
function verResumen() {
  const partes = [];
  const config = [
    { nombre: HOJA_AUDITORIA, encabezados: ENCABEZADOS_AUDITORIA },
    { nombre: HOJA_SUGERENCIAS, encabezados: ENCABEZADOS_SUGERENCIAS },
  ];

  config.forEach(({ nombre, encabezados }) => {
    const hoja = obtenerOCrearHoja(nombre, encabezados);
    const idxVersion = encabezados.indexOf('Versión app');
    const idxEstado = encabezados.indexOf('Estado');
    const filas = hoja.getDataRange().getValues().slice(1); // sin encabezado
    const porVersion = {};
    let pendientes = 0;

    filas.forEach((fila) => {
      const version = fila[idxVersion] || '(sin version)';
      const estado = fila[idxEstado] || 'Pendiente';
      porVersion[version] = (porVersion[version] || 0) + 1;
      if (estado === 'Pendiente') pendientes++;
    });

    partes.push('— ' + nombre + ' —');
    partes.push('Total: ' + filas.length + ' | Pendientes: ' + pendientes);
    Object.keys(porVersion)
      .sort()
      .forEach((v) => partes.push('  v' + v + ': ' + porVersion[v]));
    partes.push('');
  });

  mostrarMensaje(partes.join('\n'));
}

function doPost(e) {
  try {
    const datos = JSON.parse(e.postData.contents);
    const esManual = datos.origen === 'manual';

    if (esManual) {
      agregarFilaSugerencia(datos.query || '', datos.appVersion || '');
    } else {
      agregarFilaAuditoria(datos.query || '', datos.action || '', datos.appVersion || '');
    }

    return respuestaJson({ ok: true });
  } catch (error) {
    return respuestaJson({ ok: false, error: String(error) });
  }
}

function agregarFilaAuditoria(pregunta, resultado, version) {
  const hoja = obtenerOCrearHoja(HOJA_AUDITORIA, ENCABEZADOS_AUDITORIA);
  hoja.appendRow([new Date(), pregunta, resultado, version, 'Pendiente']);
  aplicarDesplegableEstado(hoja, ENCABEZADOS_AUDITORIA);
  notificarSiVersionNueva(version);
}

function agregarFilaSugerencia(pregunta, version) {
  const hoja = obtenerOCrearHoja(HOJA_SUGERENCIAS, ENCABEZADOS_SUGERENCIAS);
  hoja.appendRow([new Date(), pregunta, version, 'Pendiente']);
  aplicarDesplegableEstado(hoja, ENCABEZADOS_SUGERENCIAS);
  notificarSiVersionNueva(version);
}

// Manda un mail UNA SOLA VEZ por cada versión de la app que aparezca por
// primera vez en los logs (guarda la lista de versiones ya notificadas en
// las Propiedades del script, así sobrevive a cada ejecución). No manda
// nada en cada fila nueva, solo la primera vez que ve una versión.
function notificarSiVersionNueva(version) {
  if (!version) return;

  const props = PropertiesService.getScriptProperties();
  const vistasRaw = props.getProperty(PROP_VERSIONES_VISTAS);
  const vistas = vistasRaw ? JSON.parse(vistasRaw) : [];

  if (vistas.indexOf(version) !== -1) return; // ya la habíamos visto, no molesta de nuevo

  vistas.push(version);
  props.setProperty(PROP_VERSIONES_VISTAS, JSON.stringify(vistas));

  try {
    MailApp.sendEmail(
      EMAIL_NOTIFICACION,
      'Chat Diplo: nueva versión detectada (' + version + ')',
      'Empezaron a llegar logs del chat marcados con la versión ' + version + '.\n\n' +
        'Esto suele significar que ya hay alumnos usando esa actualización de la ' +
        'plataforma. Revisá las hojas "Auditoría" y "Sugerencias de alumnos" para ' +
        'ver cómo viene funcionando.'
    );
  } catch (error) {
    Logger.log('No se pudo enviar el mail de notificación: ' + error);
  }
}

// Por si alguna vez querés resetear el aviso (por ejemplo, para que te
// vuelva a avisar de una versión que ya se había notificado): corré esta
// función a mano desde el editor.
function olvidarVersionesNotificadas() {
  PropertiesService.getScriptProperties().deleteProperty(PROP_VERSIONES_VISTAS);
  mostrarMensaje('Listo, la próxima versión nueva que aparezca en los logs te va a volver a notificar.');
}

function aplicarDesplegableEstado(hoja, encabezados) {
  const fila = hoja.getLastRow();
  const columnaEstado = encabezados.indexOf('Estado') + 1; // 1-indexado
  const regla = SpreadsheetApp.newDataValidation().requireValueInList(ESTADOS, true).build();
  hoja.getRange(fila, columnaEstado).setDataValidation(regla);
}

// Busca la hoja por nombre EXACTO. Si no existe, la crea con los
// encabezados que le corresponden. Si ya existe pero le faltan columnas
// (por ejemplo, quedó de una versión vieja del script), agrega las que
// falten al final sin tocar lo que ya tenía cargado.
function obtenerOCrearHoja(nombre, encabezados) {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(nombre);

  if (!hoja) {
    hoja = libro.insertSheet(nombre);
    hoja.appendRow(encabezados);
    hoja.setFrozenRows(1);
    return hoja;
  }

  actualizarEncabezados(hoja, encabezados);
  return hoja;
}

function actualizarEncabezados(hoja, encabezados) {
  const ultimaColumna = Math.max(hoja.getLastColumn(), 1);
  const actuales = hoja.getRange(1, 1, 1, ultimaColumna).getValues()[0];

  encabezados.forEach((nombreColumna) => {
    if (actuales.indexOf(nombreColumna) === -1) {
      hoja.getRange(1, hoja.getLastColumn() + 1).setValue(nombreColumna);
    }
  });

  if (hoja.getFrozenRows() < 1) hoja.setFrozenRows(1);
}

// Muestra un alert si el script corre con contexto de UI (abierto desde el
// menú de la planilla); si no (por ejemplo, ejecutado a mano desde el
// editor de Apps Script con el botón ▶), lo manda al log en vez de tirar
// un error de "Cannot call SpreadsheetApp.getUi()".
function mostrarMensaje(texto) {
  try {
    SpreadsheetApp.getUi().alert(texto);
  } catch (error) {
    Logger.log(texto);
  }
}

function respuestaJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
