import { useEffect, useRef, useMemo } from 'react';

/**
 * ============================================================================
 * ONE Avatar — Máquina de estados para Sprite Sheet 3x3
 * ============================================================================
 * 
 * COORDENADAS APROBADAS (background-position):
 *   [50% 0%]    -> SALUDO (Waving)
 *   [0% 100%]   -> APAGADO / INACTIVO
 *   [100% 100%] -> ERROR / EXCEPCIÓN
 *   [50% 100%]  -> CARGANDO / PENSANDO
 *   [100% 50%]  -> IDLE / DEFAULT (Manos juntas, escuchando)
 *   [0% 0%]     -> RESPUESTA_A (Apuntando)
 *   [100% 0%]   -> RESPUESTA_B (Sosteniendo orbe)
 *   [0% 50%]    -> RESPUESTA_C (Pantalla holográfica)
 * 
 * ⚠ [50% 50%] DEPRECADO — No usar.
 * 
 * ANTI-PATRÓN: No animar background-position con transition, 
 * causa deslizamiento. El cambio debe ser instantáneo (steps).
 * Usamos micro-animación de escala + flotación para dar vida.
 */

// Mapa de estados a coordenadas del sprite
const STATES = {
  idle:     '100% 50%',  // Default — manos juntas, escuchando
  greeting: '50% 0%',    // Saludo — waving
  off:      '0% 100%',   // Apagado — dark mode
  error:    '100% 100%', // Error — indicador rojo
  loading:  '50% 100%',  // Cargando / pensando — holograma base
};

// Pool de respuestas dinámicas (aleatoriedad sin repetición consecutiva)
const RESPONSE_POOL = [
  '0% 0%',    // RESPUESTA_A — Apuntando
  '100% 0%',  // RESPUESTA_B — Sosteniendo orbe
  '0% 50%',   // RESPUESTA_C — Pantalla holográfica
];

/**
 * Selecciona una coordenada aleatoria del pool, evitando repetición consecutiva.
 * @param {React.MutableRefObject<number>} lastIndexRef
 * @returns {string} coordenada CSS
 */
function getRandomResponse(lastIndexRef) {
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * RESPONSE_POOL.length);
  } while (newIndex === lastIndexRef.current && RESPONSE_POOL.length > 1);
  lastIndexRef.current = newIndex;
  return RESPONSE_POOL[newIndex];
}

/**
 * @param {'idle'|'greeting'|'off'|'error'|'loading'|'responding'} estado
 * @param {string} className — clases externas de dimensión (ej: 'h-10 w-10')
 * @param {number} size — tamaño en px (alternativa a className para dimensión)
 */
export default function RobotAvatar({ estado = 'idle', coord, className = '', size }) {
  const lastResponseRef = useRef(-1);
  const avatarRef = useRef(null);

  // Calcular la coordenada según estado o prop forzada
  const backgroundPosition = useMemo(() => {
    if (coord) return coord;
    if (estado === 'responding') {
      return getRandomResponse(lastResponseRef);
    }
    return STATES[estado] || STATES.idle;
  }, [estado, coord]);

  // Micro-animación pop al cambiar de estado
  useEffect(() => {
    const el = avatarRef.current;
    if (!el) return;

    el.classList.add('avatar-pop');
    const timer = setTimeout(() => {
      el.classList.remove('avatar-pop');
    }, 250);

    return () => clearTimeout(timer);
  }, [backgroundPosition]);

  // Determinar clase CSS de estado
  let stateClass = 'one-avatar-idle';
  if (estado === 'loading') stateClass = 'one-avatar-loading';
  if (estado === 'off') stateClass = 'one-avatar-off';

  const sizeStyle = size ? { width: size, height: size } : undefined;

  return (
    <div
      ref={avatarRef}
      className={`one-avatar-container ${stateClass} ${className}`}
      style={{
        backgroundPosition,
        ...sizeStyle,
      }}
      role="img"
      aria-label={`Bot ONE — estado: ${estado}`}
    />
  );
}
