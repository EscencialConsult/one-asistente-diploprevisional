import { useState, useEffect, useRef, useCallback } from 'react';

let seq = 0;
const nuevoId = () => `chat-${++seq}`;

const FALLBACK =
  'No tengo registro sobre ese tema en el contenido cargado de la diplomatura. ' +
  'Probá reformular la pregunta con otras palabras, o revisá el listado por módulo ' +
  'en la pestaña "Consultar por módulo".';

/**
 * Motor del chat libre.
 * - Manda la consulta al Web Worker (Fuse.js) y no traba la UI.
 * - Aplica un retraso "orgánico" de pensamiento antes de responder.
 * - Devuelve mensajes compatibles con el componente <Mensaje/> (autor/texto/tipear)
 *   más el tipo 'options' para la desambiguación con botones.
 */
export function useChatEngine() {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('diplo_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Si recuperamos del historial, apagamos la animación de tipeo
        // para que no vuelva a escribir todo lentamente al recargar la página.
        return parsed.map(m => ({ ...m, tipear: false }));
      }
    } catch (error) {
      console.warn('Error leyendo historial del chat', error);
    }
    return [];
  });
  
  const [isBotTyping, setIsBotTyping] = useState(false);
  const workerRef = useRef(null);

  // Guardar en localStorage cada vez que hay mensajes nuevos
  useEffect(() => {
    localStorage.setItem('diplo_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    // Sintaxis estándar de Worker para Vite (bundle del worker + sus imports).
    workerRef.current = new Worker(new URL('../workers/search.worker.js', import.meta.url), {
      type: 'module',
    });

    workerRef.current.onmessage = (event) => {
      const { action, payload } = event.data;
      
      if (action === 'SUGGESTIONS') {
        // Las opciones de desambiguación aparecen al instante
        setIsBotTyping(false);
        procesarRespuesta(action, payload);
      } else {
        // Añadimos la demora de 1.5s pedida para que se luzca la animación de "pensando" del robot
        setTimeout(() => {
          setIsBotTyping(false);
          procesarRespuesta(action, payload);
        }, 1500);
      }
    };

    return () => workerRef.current && workerRef.current.terminate();
  }, []);

  const getRandomAvatarPose = () => {
    const poses = ['0% 0%', '100% 0%', '0% 50%'];
    return poses[Math.floor(Math.random() * poses.length)];
  };

  function procesarRespuesta(action, payload) {
    if (action === 'EXACT_MATCH') {
      setMessages((prev) => [
        ...prev,
        {
          id: nuevoId(),
          autor: 'bot',
          texto: payload.answer,
          primaryQuestion: payload.primaryQuestion,
          tipear: true,
          type: 'text',
          fuente: payload.fuente,
          avatarPose: getRandomAvatarPose(),
        },
      ]);
    } else if (action === 'SUGGESTIONS') {
      setMessages((prev) => [
        ...prev,
        {
          id: nuevoId(),
          autor: 'bot',
          texto: 'No estoy seguro de tu consulta. ¿Te referías a alguna de estas?',
          tipear: false,
          type: 'options',
          options: payload,
          avatarPose: '100% 50%', // IDLE (manos juntas, preguntando)
        },
      ]);
    } else if (action === 'GREETING') {
      const saludos = [
        '¡Hola! Soy ONE, tu asistente previsional. ¿En qué te puedo ayudar hoy?',
        '¡Hola! ¿Cómo estás? Contame, ¿qué duda previsional tenés?',
        '¡Buenas! Acá estoy para ayudarte con cualquier consulta de la diplomatura. ¿Qué necesitás saber?'
      ];
      const aleatorio = saludos[Math.floor(Math.random() * saludos.length)];
      setMessages((prev) => [
        ...prev,
        { id: nuevoId(), autor: 'bot', texto: aleatorio, tipear: true, type: 'text', avatarPose: '50% 0%' }, // GREETING
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        { id: nuevoId(), autor: 'bot', texto: FALLBACK, tipear: true, type: 'text', avatarPose: '100% 100%' }, // ERROR/FALLBACK
      ]);
    }
  }

  const sendMessage = useCallback((text) => {
    if (!text || !text.trim()) return;
    
    const t = text.trim().toLowerCase();
    
    // Comandos ocultos para borrar historial con regex flexible
    // Detecta combinaciones de (borrar|eliminar|limpiar|borrame) + (historial|chat|cache|caché|memoria)
    const regexBorrado = /(borr|elimin|limpi).*(historial|chat|cach|memoria)/i;
    
    if (regexBorrado.test(t)) {
      clearHistory();
      return;
    }

    setMessages((prev) => [
      ...prev,
      { id: nuevoId(), autor: 'user', texto: text.trim(), tipear: false, type: 'text' },
    ]);
    setIsBotTyping(true);
    workerRef.current?.postMessage({ query: text.trim(), timestamp: Date.now() });
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem('diplo_chat_history');
  }, []);

  return { messages, isBotTyping, sendMessage, clearHistory };
}
