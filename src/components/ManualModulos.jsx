import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ArrowLeftIcon, SparklesIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { modulos } from '../data/modulos';
import ModuloCard from './ModuloCard';
import ChipsPreguntas from './ChipsPreguntas';
import Mensaje from './Mensaje';

let idSeq = 0;
const nuevoId = () => `man-${++idSeq}`;

const normalizar = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

// Pool de poses del sprite del bot para respuestas exitosas (ver RobotAvatar.jsx).
const POSES_RESPUESTA = ['0% 0%', '100% 0%', '0% 50%'];
const poseAleatoria = () => POSES_RESPUESTA[Math.floor(Math.random() * POSES_RESPUESTA.length)];

/**
 * Vista "Consultar por módulo": biblioteca manual. Grilla de módulos y, al entrar
 * a uno, sus preguntas como chips (con buscador). Es el índice de referencia
 * rápida, complementario al chat libre.
 */
export default function ManualModulos() {
  const [modulo, setModulo] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [escribiendo, setEscribiendo] = useState(false);
  const [filtro, setFiltro] = useState('');
  const finRef = useRef(null);

  const irAlFinal = useCallback(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    irAlFinal();
  }, [mensajes, irAlFinal]);

  const preguntasFiltradas = useMemo(() => {
    if (!modulo) return [];
    const q = normalizar(filtro.trim());
    if (!q) return modulo.preguntas;
    return modulo.preguntas.filter(
      (pr) => normalizar(pr.p).includes(q) || normalizar(pr.r).includes(q)
    );
  }, [modulo, filtro]);

  function abrirModulo(m) {
    setModulo(m);
    setFiltro('');
    setEscribiendo(false);
    if (m.estado === 'proximamente') {
      setMensajes([
        {
          id: nuevoId(),
          autor: 'bot',
          texto: `El contenido de "${m.titulo}" se está cargando a partir de las clases. Muy pronto vas a poder consultar este módulo. Mientras tanto, ya está disponible el Módulo I.`,
          tipear: false,
        },
      ]);
      return;
    }
    setMensajes([
      {
        id: nuevoId(),
        autor: 'bot',
        texto: `Estas son las preguntas de "${m.titulo}". Elegí una, o buscá por palabra clave.`,
        tipear: false,
      },
    ]);
  }

  function volver() {
    setModulo(null);
    setMensajes([]);
    setFiltro('');
    setEscribiendo(false);
  }

  function elegirPregunta(preg) {
    if (escribiendo) return;
    setEscribiendo(true);
    setMensajes((prev) => [
      ...prev,
      { id: nuevoId(), autor: 'user', texto: preg.p, tipear: false },
      {
        id: nuevoId(),
        autor: 'bot',
        texto: preg.r,
        tipear: true,
        fuente: preg.fuente,
        primaryQuestion: preg.p,
        avatarPose: poseAleatoria(),
      },
    ]);
  }

  const esProximamente = modulo && modulo.estado === 'proximamente';

  // Grilla de módulos
  if (!modulo) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <p className="mb-4 text-sm text-gray-300">
          Navegá las preguntas ordenadas por módulo de la diplomatura.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {modulos.map((m) => (
            <ModuloCard key={m.id} modulo={m} onSelect={abrirModulo} />
          ))}
        </div>
      </main>
    );
  }

  // Vista de un módulo
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4">
      <div className="flex items-center gap-2 border-b border-white border-opacity-10 py-3">
        <button
          type="button"
          onClick={volver}
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-white transition hover:bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-diplo-celeste"
          aria-label="Volver a los módulos"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-white drop-shadow-sm">
          {modulo.titulo}
        </p>
      </div>

      <div className="one-scroll flex-1 space-y-5 overflow-y-auto py-6">
        {mensajes.map((m) => (
          <Mensaje
            key={m.id}
            autor={m.autor}
            texto={m.texto}
            tipear={m.tipear}
            fuente={m.fuente}
            primaryQuestion={m.primaryQuestion}
            avatarPose={m.avatarPose}
            onListo={() => {
              setEscribiendo(false);
              irAlFinal();
            }}
          />
        ))}
        <div ref={finRef} />
      </div>

      {!esProximamente && (
        <div className="sticky bottom-0 border-t border-white border-opacity-10 bg-diplo-azul bg-opacity-80 backdrop-blur-md py-4">
          <div className="relative mb-3">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar en este módulo (ej: pensión, moratoria, invalidez)…"
              className="w-full rounded-full border border-white border-opacity-20 bg-white bg-opacity-5 py-2 pl-9 pr-4 text-sm text-white placeholder-gray-400 focus:border-diplo-celeste focus:outline-none focus:ring-2 focus:ring-diplo-celeste focus:ring-opacity-30"
            />
          </div>

          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-300">
            <SparklesIcon className="h-4 w-4 text-diplo-celeste" />
            {filtro.trim()
              ? `${preguntasFiltradas.length} ${preguntasFiltradas.length === 1 ? 'resultado' : 'resultados'}`
              : 'Preguntas del módulo'}
          </div>

          {preguntasFiltradas.length > 0 ? (
            <div className="one-scroll max-h-52 overflow-y-auto">
              <ChipsPreguntas
                preguntas={preguntasFiltradas}
                onElegir={elegirPregunta}
                deshabilitado={escribiendo}
              />
            </div>
          ) : (
            <p className="py-2 text-sm text-gray-400">
              No encontré preguntas con esa palabra. Probá con otro término.
            </p>
          )}
        </div>
      )}
    </main>
  );
}
