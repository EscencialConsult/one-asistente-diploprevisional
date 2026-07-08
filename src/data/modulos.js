/**
 * BANCO DE PREGUNTAS — Diplomatura Procesos Administrativos Previsional
 * ====================================================================
 * Única fuente de datos del chat. No hay IA ni backend: todo lo que el asistente
 * "responde" sale de acá.
 *
 * El contenido se genera con la skill `banco-qa-clases`: las respuestas salen
 * EXCLUSIVAMENTE de las transcripciones reales de las clases. Cada pregunta lleva
 * su `fuente` (clase de origen). Si una respuesta tiene " ⚠️ revisar:" es porque el
 * dato estaba ambiguo en la transcripción y conviene confirmarlo antes de publicar.
 *
 * Las preguntas de cada módulo viven en un JSON aparte (src/data/preguntas/<id>.json)
 * para mantener el metadato separado del contenido. Para editar un banco, se toca su
 * JSON; para agregar/quitar un módulo, se toca este archivo.
 *
 * Estructura de cada pregunta: { p, variaciones[], r, fuente }
 * Íconos: nombres de Heroicons (ver ICONOS abajo y el mapa en components/Icono.jsx).
 */
import modulo1 from './preguntas/modulo-1.json';
import modulo2 from './preguntas/modulo-2.json';
import modulo3 from './preguntas/modulo-3.json';
import modulo4 from './preguntas/modulo-4.json';
import modulo5 from './preguntas/modulo-5.json';
import modulo6 from './preguntas/modulo-6.json';
import modulo7 from './preguntas/modulo-7.json';
import bonus1 from './preguntas/bonus-1.json';
import bonus2 from './preguntas/bonus-2.json';
import bonus3 from './preguntas/bonus-3.json';

export const modulos = [
  {
    id: 'modulo-1',
    titulo: 'Módulo I — Prestaciones del SIPA e inicio de procesos ante ANSES',
    descripcion: 'Jubilación ordinaria, pensión por fallecimiento y retiro por invalidez: requisitos y trámite.',
    icono: 'BuildingLibrary',
    estado: 'activo',
    preguntas: modulo1,
  },
  {
    id: 'modulo-2',
    titulo: 'Módulo II — Regímenes previsionales especiales',
    descripcion: 'Regímenes especiales: normativa, edad jubilatoria, prorrateo e incompatibilidades.',
    icono: 'ShieldCheck',
    estado: 'activo',
    preguntas: modulo2,
  },
  {
    id: 'modulo-3',
    titulo: 'Módulo III — SICAM',
    descripcion: 'Uso avanzado de SICAM: número de cuenta, servicio doméstico, moratorias y UCAP.',
    icono: 'Calculator',
    estado: 'activo',
    preguntas: modulo3,
  },
  {
    id: 'modulo-4',
    titulo: 'Módulo IV — Reconocimiento de servicios y gestión administrativa',
    descripcion: 'Reconocimiento de servicios, Res. 524/555, recursos administrativos, CARSS y amparo por mora.',
    icono: 'ClipboardDocumentList',
    estado: 'activo',
    preguntas: modulo4,
  },
  {
    id: 'modulo-5',
    titulo: 'Módulo V — Prestaciones previsionales y sistema fiscal',
    descripcion: 'Impuesto a las Ganancias, retención, formulario 572, pluriempleo y Bienes Personales.',
    icono: 'CurrencyDollar',
    estado: 'activo',
    preguntas: modulo5,
  },
  {
    id: 'modulo-6',
    titulo: 'Módulo VI — Ajuste y revisión de haberes previsionales',
    descripcion: 'Reajuste de haber inicial y movilidad, fallos (Badaro, Caliva, Navarro) y estrategia legal.',
    icono: 'Scale',
    estado: 'activo',
    preguntas: modulo6,
  },
  {
    id: 'modulo-7',
    titulo: 'Módulo VII — Resolución de conflictos previsionales',
    descripcion: 'Incompatibilidades, amparos por mora, servicios no declarados y acumulación de beneficios.',
    icono: 'Briefcase',
    estado: 'activo',
    preguntas: modulo7,
  },
  {
    id: 'bonus-1',
    titulo: 'Bonus I — Casas particulares',
    descripcion: 'Régimen de casas particulares (ley 26.844): requisitos, aportes por horas, SICAM y expediente.',
    icono: 'Users',
    estado: 'activo',
    preguntas: bonus1,
  },
  {
    id: 'bonus-2',
    titulo: 'Bonus II — Régimen IPS',
    descripcion: 'IPS (decreto ley 9650/80): reciprocidad, haber, prorrateo, invalidez y pensiones.',
    icono: 'DocumentText',
    estado: 'activo',
    preguntas: bonus2,
  },
  {
    id: 'bonus-3',
    titulo: 'Bonus III — Veraz',
    descripcion: 'Perfil crediticio: situaciones 1 a 6, rectificación de datos, derecho al olvido y reclamo.',
    icono: 'AcademicCap',
    estado: 'activo',
    preguntas: bonus3,
  },
];

/**
 * Íconos disponibles (Heroicons outline). Usá exactamente estos nombres en el
 * campo `icono`. Para agregar otro, sumalo al mapa en src/components/Icono.jsx.
 */
export const ICONOS = [
  'AcademicCap',
  'Calculator',
  'DocumentText',
  'BuildingLibrary',
  'CurrencyDollar',
  'Scale',
  'Users',
  'ClipboardDocumentList',
  'Briefcase',
  'ShieldCheck',
];
