import { useState, useEffect } from 'react';

/**
 * Simula el "tipeo" del asistente revelando el texto de a poco.
 * Respeta prefers-reduced-motion: si el usuario lo pide, muestra todo de una.
 *
 * @param {string} texto  Texto completo a revelar.
 * @param {boolean} activo  Arranca el efecto cuando pasa a true.
 * @returns {{ mostrado: string, terminado: boolean }}
 */
export function useTyping(texto, activo) {
  const [mostrado, setMostrado] = useState('');
  const [terminado, setTerminado] = useState(false);

  useEffect(() => {
    if (!activo) return;

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      setMostrado(texto);
      setTerminado(true);
      return;
    }

    setMostrado('');
    setTerminado(false);

    let isCancelled = false;

    async function typeEffect(textoCompleto, speed = 25) {
      let currentText = "";
      for (let i = 0; i < textoCompleto.length; i++) {
        if (isCancelled) return;
        
        currentText += textoCompleto.charAt(i);
        setMostrado(currentText); 
        
        // Pausa dinámica: las comas o puntos tardan un poco más para mayor realismo
        const char = textoCompleto.charAt(i);
        const delay = (char === '.' || char === ',') ? speed * 15 : speed;
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      if (!isCancelled) {
        setTerminado(true);
      }
    }

    typeEffect(texto, 10); // Usamos velocidad 10ms base para que no sea excesivamente lento

    return () => {
      isCancelled = true;
    };
  }, [texto, activo]);

  return { mostrado, terminado };
}
