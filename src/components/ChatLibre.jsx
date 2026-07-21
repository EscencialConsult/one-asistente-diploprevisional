import { useEffect, useRef, useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useChatEngine } from '../hooks/useChatEngine';
import { trainingData } from '../data/trainingData';
import Mensaje from './Mensaje';
import TypingDots from './TypingDots';
import RobotAvatar from './RobotAvatar';

export default function ChatLibre() {
  const { messages, isBotTyping, sendMessage, sugerirPregunta } = useChatEngine();
  const [input, setInput] = useState('');
  const [heroState, setHeroState] = useState('greeting');
  const finRef = useRef(null);

  // Hero avatar: saluda al montar, luego pasa a idle
  useEffect(() => {
    const timer = setTimeout(() => setHeroState('idle'), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isBotTyping]);

  function onSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  }

  const vacio = messages.length === 0;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4">
      <div className="one-scroll flex-1 space-y-5 overflow-y-auto py-6">
        {vacio ? (
          <div className="flex h-full flex-col justify-center pb-12 animate-fade-up">
            <div className="mx-auto max-w-sm text-center">
              {/* Avatar hero grande — saluda y luego se queda en idle */}
              <div className="mx-auto mb-6 flex items-center justify-center">
                <RobotAvatar estado={heroState} className="one-avatar-hero" />
              </div>
              <h2 className="text-2xl font-bold text-white drop-shadow-sm">
                Hola, ¿en qué te ayudo?
              </h2>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <Mensaje
              key={m.id}
              autor={m.autor}
              texto={m.texto}
              tipear={m.tipear}
              fuente={m.fuente}
              primaryQuestion={m.primaryQuestion}
              avatarPose={m.avatarPose}
              options={m.options}
              onElegirOpcion={sendMessage}
              consultaOriginal={m.consultaOriginal}
              sugerida={m.sugerida}
              onSugerirPregunta={() => sugerirPregunta(m.id)}
              onListo={() =>
                finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
              }
            />
          ))
        )}

        {/* Indicador de "pensando" con avatar en estado loading */}
        {isBotTyping && (
          <div className="flex items-start justify-end gap-3">
            <div className="rounded-2xl rounded-tr-sm border border-white border-opacity-10 glass-panel px-4 py-3 shadow-sm">
              <TypingDots />
            </div>
            <RobotAvatar estado="loading" className="one-avatar-bubble flex-none" />
          </div>
        )}

        <div ref={finRef} />
      </div>

      {/* Barra de entrada */}
      <div className="sticky bottom-0 pb-6 pt-2 bg-gradient-to-t from-[#0c3554] to-transparent">
        <form onSubmit={onSubmit} className="mx-auto max-w-3xl">
          <div className="relative flex items-center rounded-full border border-one-fucsia bg-one-oscuro px-2 shadow-[0_0_15px_rgba(225,123,215,0.15)]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoComplete="off"
              placeholder="Escribí tu pregunta…"
              className="flex-1 bg-transparent px-4 py-4 text-sm text-white placeholder-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-one-fucsia text-one-negro shadow-[0_0_10px_rgba(225,123,215,0.4)] transition hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              aria-label="Enviar pregunta"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
