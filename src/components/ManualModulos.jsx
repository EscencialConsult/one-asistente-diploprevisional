import { useMemo, useState } from 'react';
import { ArrowLeftIcon, SparklesIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { modulos } from '../data/modulos';
import ModuloCard from './ModuloCard';
import ChipsPreguntas from './ChipsPreguntas';

const normalizar = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/**
 * Vista "Consultar por módulo": biblioteca manual. Grilla de módulos y, al
 * entrar a uno, sus preguntas como acordeón FAQ (con buscador fijo arriba).
 * Es el índice de referencia rápida, complementario al chat libre.
 *
 * No simula un hilo de chat a propósito: con módulos de hasta 30+ preguntas,
 * clickear y ver la respuesta desplegarse en el lugar es más cómodo (sobre
 * todo en pantallas chicas) que ir agregando burbujas a una lista que crece
 * sin límite dentro de un cajón de altura fija.
 */
export default function ManualModulos() {
  const [modulo, setModulo] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [abiertaId, setAbiertaId] = useState(null);

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
    setAbiertaId(null);
  }

  function volver() {
    setModulo(null);
    setFiltro('');
    setAbiertaId(null);
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
    <main className="mx-auto flex w-full min-w-0 max-w-3xl flex-1 flex-col px-4">
      <div className="sticky top-0 z-10 bg-diplo-azul bg-opacity-95 backdrop-blur-md pb-3 pt-3">
        <div className="mb-3 flex items-center gap-2">
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

        {!esProximamente && (
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filtro}
              onChange={(e) => {
                setFiltro(e.target.value);
                setAbiertaId(null);
              }}
              placeholder="Buscar en este módulo (ej: pensión, moratoria, invalidez)…"
              className="w-full rounded-full border border-white border-opacity-20 bg-white bg-opacity-5 py-2.5 pl-9 pr-4 text-sm text-white placeholder-gray-400 focus:border-diplo-celeste focus:outline-none focus:ring-2 focus:ring-diplo-celeste focus:ring-opacity-30"
            />
          </div>
        )}
      </div>

      <div className="one-scroll min-w-0 flex-1 overflow-y-auto pb-8">
        {esProximamente ? (
          <p className="mt-6 rounded-2xl border border-white border-opacity-10 glass-panel p-4 text-sm text-gray-300">
            El contenido de "{modulo.titulo}" se está cargando a partir de las clases. Muy
            pronto vas a poder consultar este módulo. Mientras tanto, ya están disponibles los
            demás módulos activos.
          </p>
        ) : (
          <>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-300">
              <SparklesIcon className="h-4 w-4 text-diplo-celeste" />
              {filtro.trim()
                ? `${preguntasFiltradas.length} ${preguntasFiltradas.length === 1 ? 'resultado' : 'resultados'}`
                : `${preguntasFiltradas.length} preguntas`}
            </div>

            {preguntasFiltradas.length > 0 ? (
              <ChipsPreguntas
                preguntas={preguntasFiltradas}
                abiertaId={abiertaId}
                onToggle={setAbiertaId}
              />
            ) : (
              <p className="py-2 text-sm text-gray-400">
                No encontré preguntas con esa palabra. Probá con otro término.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
