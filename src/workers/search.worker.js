/**
 * Web Worker de búsqueda difusa (Fuse.js).
 * ========================================
 * Corre en un hilo de fondo para no trabar la UI mientras el alumno tipea,
 * aunque el banco tenga cientos de preguntas. Devuelve una de tres acciones
 * según la confianza del match (regla de los tres umbrales).
 *
 * 100% frontend: importa el índice que se deriva de modulos.js. Sin servidores.
 */
import Fuse from 'fuse.js';
import { trainingData } from '../data/trainingData.js';

// Normaliza para que "jubilacion" matchee "jubilación" (saca tildes, minúsculas).
function normalizar(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Fix the unicode regex for tildes
}

// Jerga de chat/celular: abreviaturas que un alumno tipea apurado. Se
// expanden ANTES del resto, para que las frases de cortesía y sinónimos de
// abajo las reconozcan igual que a la palabra completa.
const JERGA_CHAT = {
  'q': 'que', 'qe': 'que', 'xq': 'porque', 'pq': 'porque', 'porq': 'porque',
  'tmb': 'tambien', 'tmbn': 'tambien', 'tb': 'tambien',
  'dnd': 'donde', 'x': 'por', 'xa': 'para', 'pa': 'para',
  'bb': 'bebe', 'wpp': 'whatsapp', 'grx': 'gracias', 'grax': 'gracias',
  'nose': 'no se', 'sabs': 'sabes',
};

// Limpia saludos y frases de cortesía que ensucian la búsqueda de Fuse
// y aplica normalización semántica (sinónimos básicos).
function limpiarConversacion(str) {
  let limpia = normalizar(str);

  // 0. Expandir jerga de chat (abreviaturas típicas de celular)
  Object.keys(JERGA_CHAT).forEach((key) => {
    const regex = new RegExp(`\\b${key}\\b`, 'g');
    limpia = limpia.replace(regex, JERGA_CHAT[key]);
  });

  // 1. Filtrar frases de cortesía
  const frases = [
    'hola', 'buenas', 'buen dia', 'buenos dias', 'buenas tardes', 'buenas noches',
    'quiero saber', 'quisiera saber', 'necesito saber', 'me gustaria saber',
    'me decis', 'me podes decir', 'podes decirme', 'podrias decirme', 'decime',
    'sabes', 'por favor', 'ayuda', 'tengo una duda', 'duda',
    'que tal', 'como estas', 'te hago una consulta', 'tengo una consulta', 'consulta',
    'cual es', 'cuales son', 'cual es la', 'cual es el', 'cuales son las', 'cuales son los'
  ];
  frases.forEach(frase => {
    const regex = new RegExp(`\\b${normalizar(frase)}\\b`, 'g');
    limpia = limpia.replace(regex, ' ');
  });

  // 2. Diccionario de sinónimos (semántica). Cubre coloquialismos rioplatenses
  // y formas alternativas de nombrar lo mismo que las clases usan en formal.
  const sinonimos = {
    'plata': 'haber',
    'dinero': 'haber',
    'sueldo': 'haber',
    'guita': 'haber',
    'cobro': 'haber',
    'monto': 'haber',
    'anciano': 'adulto mayor',
    'viejo': 'adulto mayor',
    'vieja': 'adulto mayor',
    'abuelo': 'adulto mayor',
    'abuela': 'adulto mayor',
    'chico': 'hijo',
    'chica': 'hija',
    'nene': 'hijo',
    'nena': 'hija',
    'pibe': 'hijo',
    'piba': 'hija',
    'ninos': 'hijos',
    'minusvalia': 'discapacidad',
    'enfermedad': 'invalidez',
    'papel': 'documentacion',
    'papeles': 'documentacion',
    'tramite': 'proceso',
    'gestion': 'proceso',
    'formulario': 'documentacion',
    'muerte': 'fallecimiento',
    'murio': 'fallecio',
    'fallecio': 'fallecimiento',
    'esposo': 'conyuge',
    'esposa': 'conyuge',
    'marido': 'conyuge',
    'mujer': 'conyuge',
    'pareja': 'conyuge',
    'concubino': 'conviviente',
    'concubina': 'conviviente',
    'patron': 'empleador',
    'jefe': 'empleador',
    'trabajo': 'empleo',
    'laburo': 'empleo',
    'laburar': 'trabajar',
  };

  Object.keys(sinonimos).forEach(key => {
    const regex = new RegExp(`\\b${key}\\b`, 'g');
    limpia = limpia.replace(regex, sinonimos[key]);
  });

  return limpia.replace(/\s+/g, ' ').trim();
}

// getFn: Fuse busca sobre el texto normalizado, pero el item conserva el original.
const defaultGet = Fuse.config.getFn;
function getFn(obj, path) {
  const val = defaultGet(obj, path);
  if (Array.isArray(val)) return val.map((v) => (typeof v === 'string' ? normalizar(v) : v));
  return typeof val === 'string' ? normalizar(val) : val;
}

const fuseOptions = {
  includeScore: true,
  shouldSort: true,
  ignoreLocation: true, // evalúa presencia de palabras sin importar el orden
  threshold: 0.6,
  keys: [
    { name: 'primaryQuestion', weight: 1.0 },
    { name: 'variations', weight: 0.8 },
    { name: 'answer', weight: 0.05 }, // Peso muy bajo para que la respuesta actúe solo como desempate
  ],
  getFn,
};

const fuse = new Fuse(trainingData, fuseOptions);

// Umbrales de confianza (score: 0 = match perfecto, 1 = nada que ver).
const UMBRAL_EXACTO = 0.15;
const UMBRAL_MEDIO = 0.35; // afinado con pruebas reales: >0.35 cae a fallback
const MARGEN_AMBIGUEDAD = 0.05;

// Palabras vacías: no aportan significado, no deben decidir un match.
const STOP = new Set([
  'como', 'que', 'cual', 'cuales', 'para', 'por', 'con', 'los', 'las', 'del',
  'una', 'uno', 'unos', 'unas', 'esta', 'este', 'esto', 'estan', 'ser', 'son',
  'hay', 'tengo', 'tiene', 'tienen', 'puedo', 'hacer', 'hago', 'quiero', 'sobre',
  'cuando', 'donde', 'quien', 'cuanto', 'cuanta', 'cuantos', 'cuantas', 'mas',
  'pero', 'muy', 'sus', 'les', 'mi', 'mis', 'me', 'se', 'de', 'en', 'el', 'la',
  'un', 'al', 'lo', 'su', 'le', 'si', 'no', 'soy', 'ya', 'es', 'anos', 'año',
]);

// Tokens "de contenido" de una consulta (largos y con significado).
function tokensContenido(q) {
  // Lista blanca de acrónimos clave que NO deben descartarse aunque sean cortos.
  const whitelist = new Set([
    'pbu', 'pc', 'pap', 'rti', 'cud', 'ley', 'auh',
    'ips', 'rdi', 'pnc', 'srt', 'dni', 'iva',
  ]);

  return normalizar(q)
    .split(/[^a-z0-9]+/)
    .filter((t) => (t.length >= 4 || whitelist.has(t)) && !STOP.has(t));
}

// Calcula la distancia de Levenshtein entre dos strings
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let j = 1; j <= n; j++) {
    for (let i = 1; i <= m; i++) {
      if (a[i - 1] === b[j - 1]) d[i][j] = d[i - 1][j - 1];
      else d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + 1);
    }
  }
  return d[m][n];
}

// Comparte raíz: "jubilarse" y "jubilacion" no son cercanas en Levenshtein
// (la cola cambia mucho: "-rse" vs "-cion"), pero comparten el mismo lexema.
// Alcanza con exigir un prefijo común largo relativo a la palabra más corta,
// así el chat "entiende" familias de palabras (jubilar/jubilado/jubilación,
// aportar/aportante/aportes) sin necesitar un diccionario de sinónimos enorme.
function comparteRaiz(a, b) {
  const min = Math.min(a.length, b.length);
  if (min < 6) return false; // palabras cortas: muy riesgoso, mejor no forzar
  let comunes = 0;
  while (comunes < min && a[comunes] === b[comunes]) comunes++;
  return comunes >= 5 && comunes / min >= 0.6;
}

function esFuzzyMatch(token, henoTokens) {
  // Tolerancia dinámica: 1 error por cada 4 letras de largo de la palabra
  const tolerancia = Math.max(1, Math.floor(token.length / 4));
  // Si coincide exacto de forma rápida o por substring, ahorramos cálculo pesado
  if (henoTokens.some(ht => ht.includes(token))) return true;
  // Misma familia de palabra (raíz compartida)
  if (henoTokens.some(ht => comparteRaiz(token, ht))) return true;
  // Si no, evaluamos Levenshtein
  return henoTokens.some(ht => levenshtein(token, ht) <= tolerancia);
}

// Regímenes/instituciones que conviven en el banco y que un alumno suele
// nombrar explícitamente para acotar su pregunta (ANSES vs. IPS, agrario,
// docente, etc.). Si la consulta nombra uno y el item pertenece a otro
// distinto, es una pista fuerte de que NO es el resultado correcto, aunque
// el resto del texto sea parecido (ej: "requisitos" + "jubilación" es común
// a casi todas las preguntas de requisitos de cualquier régimen).
const REGIMEN_MARKERS = [
  'ips', 'agrario', 'agrarios', 'docente', 'docentes', 'discapacidad',
  'minusvalia', 'construccion', 'mineria', 'minero', 'petroleo',
  'domestico', 'domestica', 'rural', 'transporte',
];
const REGIMEN_PHRASES = ['luz y fuerza', 'casas particulares', 'servicio domestico'];

function regimenesDe(texto) {
  const norm = normalizar(texto);
  const found = new Set();
  REGIMEN_MARKERS.forEach((m) => {
    if (new RegExp(`\\b${m}\\b`).test(norm)) found.add(m);
  });
  REGIMEN_PHRASES.forEach((p) => {
    if (norm.includes(p)) found.add(p);
  });
  return found;
}

// Penaliza un item si pertenece a un régimen distinto al que pidió la consulta.
// Cubre dos casos:
// 1) La consulta nombra un régimen específico (ej: "ips") y el item es de OTRO
//    régimen específico distinto (ej: "agrario").
// 2) La consulta nombra "anses" (o no nombra ningún régimen específico) y el
//    item SÍ es de un régimen específico: probablemente el alumno quiere la
//    respuesta general, no la de un régimen particular.
function penalidadDeRegimen(query, item) {
  const queryRegimenes = regimenesDe(query);
  const itemRegimenes = regimenesDe(
    `${item.primaryQuestion} ${(item.variations || []).join(' ')}`
  );
  if (itemRegimenes.size === 0) return 0; // el item es "general", nunca choca

  if (queryRegimenes.size > 0) {
    const hayInterseccion = [...queryRegimenes].some((r) => itemRegimenes.has(r));
    return hayInterseccion ? 0 : 0.45;
  }

  const queryMencionaAnses = /\banses\b/.test(normalizar(query));
  return queryMencionaAnses ? 0.45 : 0;
}

// Calcula cuántos tokens de contenido de la consulta NO están en la pregunta
// ni en sus variaciones. Ignora la respuesta (evitando falsos positivos).
function tokensFaltantesEnPregunta(query, item) {
  const toks = tokensContenido(query);
  if (toks.length === 0) return 0; // Si no hay tokens importantes, no faltan
  
  const heno = normalizar(
    `${item.primaryQuestion} ${(item.variations || []).join(' ')}`
  );
  const henoTokens = heno.split(/\s+/);
  
  // En lugar de recortar a 4 letras (que falla si el error está al inicio),
  // evaluamos similitud real.
  return toks.filter((t) => !esFuzzyMatch(t, henoTokens)).length;
}

/**
 * Resuelve una consulta contra el banco de preguntas.
 * Función pura (sin postMessage) para que la puedan usar tanto el handler
 * del Worker como el script de tests de regresión (src/workers/__tests__).
 * @param {string} query
 * @returns {{action: 'GREETING'|'EXACT_MATCH'|'SUGGESTIONS'|'NO_MATCH', payload?: any}}
 */
export function resolverConsulta(query) {
  if (!query || !query.trim()) {
    return { action: 'NO_MATCH', payload: null };
  }

  const queryLimpia = limpiarConversacion(query);
  const rawNormalized = normalizar(query).trim();

  // 1. Interceptar si es un saludo puro (chitchat)
  const saludosPuros = [
    'hola', 'holis', 'holitas', 'holaa', 'holaaa', 'hello', 'hi',
    'buenas', 'buen dia', 'buenos dias', 'buenas tardes', 'buenas noches',
    'que tal', 'como estas', 'todo bien'
  ];
  if (saludosPuros.includes(rawNormalized)) {
    return { action: 'GREETING' };
  }

  // 2. Si limpiamos la conversación y quedó vacía, pero no era un saludo puro,
  // probablemente era una muletilla sola (ej: "quiero saber"). Falla.
  if (!queryLimpia) {
    return { action: 'NO_MATCH' };
  }

  // Atajo de igualdad exacta: si la consulta (normalizada) coincide letra por
  // letra con una pregunta o variación ya cargada, respondé directo sin pasar
  // por Fuse ni por el chequeo de ambigüedad. Sin esto, una pregunta que ya
  // está textual en el banco podía caer en SUGGESTIONS si otra pregunta
  // parecida quedaba con un score muy cercano (bug reportado: "no lo toma
  // aunque la pregunta ya estaba").
  const queryExacta = rawNormalized.replace(/[¿?¡!.,]/g, '').trim();
  if (queryExacta) {
    const matchExacto = trainingData.find((item) => {
      const pNorm = normalizar(item.primaryQuestion).replace(/[¿?¡!.,]/g, '').trim();
      if (pNorm === queryExacta) return true;
      return (item.variations || []).some(
        (v) => normalizar(v).replace(/[¿?¡!.,]/g, '').trim() === queryExacta
      );
    });
    if (matchExacto) {
      return { action: 'EXACT_MATCH', payload: { ...matchExacto, score: 0 } };
    }
  }

  // Guardián contra falsos positivos "vacíos": si después de sacar muletillas
  // no queda NINGÚN token de contenido real (solo números, stopwords o
  // palabras sueltas de 1-3 letras no listadas), no dejamos que Fuse decida
  // solo. Sin este freno, algo como "cuanto es 2 mas 2" podía dar un score
  // bajo por pura coincidencia de palabras cortas ("cuanto", "es") con una
  // pregunta real del banco y devolver una respuesta con total confianza.
  if (tokensContenido(query).length === 0) {
    return { action: 'NO_MATCH' };
  }

  const results = fuse.search(queryLimpia);

  if (results.length === 0) {
    return { action: 'NO_MATCH' };
  }

  // Recalcular el score para los mejores 5 resultados sumando la penalidad
  const topResults = results.slice(0, 5).map((res) => {
    const faltantes = tokensFaltantesEnPregunta(query, res.item);
    // Bajamos la penalidad a 0.15 porque ahora Levenshtein es más permisivo
    const penalRegimen = penalidadDeRegimen(query, res.item);
    return {
      ...res,
      score: res.score + (faltantes * 0.15) + penalRegimen
    };
  });

  // Re-ordenar luego de las penalidades
  topResults.sort((a, b) => a.score - b.score);

  const best = topResults[0];

  if (best.score <= UMBRAL_EXACTO) {
    // Loop 3: Lógica de desambiguación (Delta de Confianza).
    // Solo es ambiguo si el SEGUNDO candidato también es de calidad "exacta"
    // (no alcanza con estar cerca del primero en términos relativos: si el
    // mejor match es prácticamente perfecto, ~0, hay que exigir que el
    // segundo lo sea también, si no cualquier score bajo dispara SUGGESTIONS
    // de forma injusta con preguntas que ya están textuales en el banco).
    const second = topResults[1];
    const empatados =
      second &&
      second.score <= UMBRAL_EXACTO &&
      (second.score - best.score) < MARGEN_AMBIGUEDAD;
    if (empatados) {
      // Los dos primeros resultados son estadísticamente idénticos. Es ambiguo.
      return {
        action: 'SUGGESTIONS',
        payload: topResults.slice(0, 3).map((r, i) => ({
          id: `ambig-${i}`,
          primaryQuestion: r.item.primaryQuestion
        })),
      };
    }

    return {
      action: 'EXACT_MATCH',
      payload: { ...best.item, score: best.score },
    };
  } else if (best.score <= UMBRAL_MEDIO) {
    // Mostrar hasta 3 sugerencias si el score es aceptable pero no exacto
    const options = topResults
      .slice(0, 3)
      .map((r, i) => ({
        id: `sugg-${i}`,
        primaryQuestion: r.item.primaryQuestion
      }));
    return { action: 'SUGGESTIONS', payload: options };
  }

  // Muy mal score, no hay match
  return { action: 'NO_MATCH' };
}

// El listener del Worker solo existe en contexto de Worker real (no cuando
// este archivo se importa desde Node para correr los tests de regresión).
if (typeof self !== 'undefined' && typeof self.addEventListener === 'function' && typeof WorkerGlobalScope !== 'undefined') {
  self.addEventListener('message', (event) => {
    const { query, timestamp } = event.data;
    const resultado = resolverConsulta(query);
    self.postMessage({ timestamp, ...resultado });
  });
}
