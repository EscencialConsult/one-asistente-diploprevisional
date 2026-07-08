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

// Limpia saludos y frases de cortesía que ensucian la búsqueda de Fuse
// y aplica normalización semántica (sinónimos básicos).
function limpiarConversacion(str) {
  let limpia = normalizar(str);
  
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

  // 2. Diccionario de sinónimos (semántica)
  const sinonimos = {
    'plata': 'haber',
    'dinero': 'haber',
    'sueldo': 'haber',
    'anciano': 'adulto mayor',
    'viejo': 'adulto mayor',
    'abuelo': 'adulto mayor',
    'chico': 'hijo',
    'nene': 'hijo',
    'ninos': 'hijos',
    'minusvalia': 'discapacidad',
    'enfermedad': 'invalidez'
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
  // Lista blanca de acrónimos clave que NO deben descartarse aunque sean cortos
  const whitelist = new Set(['pbu', 'pc', 'pap', 'rti', 'cud', 'ley', 'auh']);
  
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

function esFuzzyMatch(token, henoTokens) {
  // Tolerancia dinámica: 1 error por cada 4 letras de largo de la palabra
  const tolerancia = Math.max(1, Math.floor(token.length / 4));
  // Si coincide exacto de forma rápida o por substring, ahorramos cálculo pesado
  if (henoTokens.some(ht => ht.includes(token))) return true;
  // Si no, evaluamos Levenshtein
  return henoTokens.some(ht => levenshtein(token, ht) <= tolerancia);
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

self.addEventListener('message', (event) => {
  const { query, timestamp } = event.data;

  if (!query || !query.trim()) {
    self.postMessage({ timestamp, action: 'NO_MATCH', payload: null });
    return;
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
    self.postMessage({ action: 'GREETING' });
    return;
  }

  // 2. Si limpiamos la conversación y quedó vacía, pero no era un saludo puro,
  // probablemente era una muletilla sola (ej: "quiero saber"). Falla.
  if (!queryLimpia) {
    self.postMessage({ action: 'NO_MATCH' });
    return;
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
      self.postMessage({ action: 'EXACT_MATCH', payload: { ...matchExacto, score: 0 } });
      return;
    }
  }

  const results = fuse.search(queryLimpia);

  const UMBRAL_EXACTO = 0.15;
  const UMBRAL_MEDIO = 0.35;
  const MARGEN_AMBIGUEDAD = 0.05;

  if (results.length === 0) {
    self.postMessage({ action: 'NO_MATCH' });
    return;
  }

  // Recalcular el score para los mejores 5 resultados sumando la penalidad
  const topResults = results.slice(0, 5).map((res) => {
    const faltantes = tokensFaltantesEnPregunta(query, res.item);
    // Bajamos la penalidad a 0.15 porque ahora Levenshtein es más permisivo
    return {
      ...res,
      score: res.score + (faltantes * 0.15)
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
      self.postMessage({
        action: 'SUGGESTIONS',
        payload: topResults.slice(0, 3).map((r, i) => ({
          id: `ambig-${i}`,
          primaryQuestion: r.item.primaryQuestion
        })),
      });
      return;
    }

    self.postMessage({
      action: 'EXACT_MATCH',
      payload: { ...best.item, score: best.score },
    });
  } else if (best.score <= UMBRAL_MEDIO) {
    // Mostrar hasta 3 sugerencias si el score es aceptable pero no exacto
    const options = topResults
      .slice(0, 3)
      .map((r, i) => ({
        id: `sugg-${i}`,
        primaryQuestion: r.item.primaryQuestion
      }));
    self.postMessage({
      action: 'SUGGESTIONS',
      payload: options,
    });
  } else {
    // Muy mal score, no hay match
    self.postMessage({ action: 'NO_MATCH' });
  }
});
