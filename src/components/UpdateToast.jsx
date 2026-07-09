import { useEffect, useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { APP_VERSION } from '../version';

const KEY = 'app_version_seen';

/**
 * Aviso chiquito y discreto que aparece SOLO la primera vez que el alumno
 * entra a una versión nueva de la app (compara contra la última versión
 * guardada en localStorage). Si es la primera visita de siempre (no hay
 * nada guardado todavía), no muestra nada — no hay "actualización" de la
 * cual avisar. Se autodestruye a los pocos segundos.
 *
 * Esto es independiente del service worker: el service worker (ver
 * vite.config.js, registerType: 'autoUpdate') es lo que garantiza que la
 * app siempre termine cargando el código más nuevo, incluso en un acceso
 * directo instalado en el celular. Este componente solo avisa que eso pasó.
 */
export default function UpdateToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const visto = localStorage.getItem(KEY);
    localStorage.setItem(KEY, APP_VERSION);
    if (visto && visto !== APP_VERSION) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 4500);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-3 left-1/2 z-40 -translate-x-1/2 animate-fade-up"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-1.5 rounded-full border border-white border-opacity-10 glass-panel px-3 py-1.5 text-[11px] text-gray-300 shadow-sm">
        <SparklesIcon className="h-3.5 w-3.5 flex-none text-diplo-celeste" />
        Se actualizó a la versión {APP_VERSION}
      </div>
    </div>
  );
}
