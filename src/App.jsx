import { useState, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, Squares2X2Icon, BookOpenIcon } from '@heroicons/react/24/outline';
import ChatLibre from './components/ChatLibre';
import ManualModulos from './components/ManualModulos';
import GuiaUso from './components/GuiaUso';
import FondoDiplo from './components/FondoDiplo';
import RobotAvatar from './components/RobotAvatar';
import PwaPrompt from './components/PwaPrompt';
import UpdateToast from './components/UpdateToast';

export default function App() {
  const [tab, setTab] = useState('chat'); // 'chat' | 'modulos' | 'guia'
  
  // Leemos localStorage solo en el cliente
  const [hasReadGuide, setHasReadGuide] = useState(true); // default true para SSR, luego useEffect
  
  useEffect(() => {
    const value = localStorage.getItem('diplo_has_read_guide');
    setHasReadGuide(value === 'true');
  }, []);

  const handleMarkAsRead = () => {
    localStorage.setItem('diplo_has_read_guide', 'true');
    setHasReadGuide(true);
    setTab('chat'); // Vuelve al chat automáticamente
  };

  return (
    <div className="relative flex min-h-full min-w-0 flex-col bg-diplo-azul text-white">
      <PwaPrompt />
      <UpdateToast />
      <FondoDiplo />

      {/* Header + navegación de pestañas */}
      <header className="sticky top-0 z-20 border-b border-white border-opacity-10 glass-panel">
        <div className="mx-auto w-full max-w-3xl px-4">
          <div className="flex items-center gap-3 py-3">
            <img src="/one-iconocolor.webp" alt="ONE" className="h-10 w-10 flex-none rounded-full shadow-[0_0_10px_rgba(225,123,215,0.3)]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold leading-tight text-white tracking-wide">
                ONE · Asistente Previsional
              </p>
              <p className="truncate text-xs text-gray-400">
                Sistema de <span className="text-diplo-celeste font-semibold">preguntas y respuestas</span> de la diplomatura
              </p>
            </div>
            {/* Decorativo: se oculta en pantallas chicas para que sus logos
                (ancho fijo, no se achican) no empujen todo el header y
                terminen desbordando la página en un celular. El nombre ya
                está a la izquierda, así que no se pierde información. */}
            <div className="hidden flex-none flex-col items-end gap-1 sm:flex">
              <div className="flex items-center gap-2">
                <img src="/one-logoletra.webp" alt="ONE" className="h-5 w-auto object-contain opacity-90 brightness-0 invert" />
                <span className="text-gray-400 text-xs italic font-medium">by</span>
                <img src="/escencial-logoblanco.webp" alt="Escencial" className="h-10 w-auto object-contain opacity-100" />
              </div>
              <span className="text-gray-500 font-medium" style={{ fontSize: '8px', letterSpacing: '0.1em' }}>DIPLO PREVISIONAL</span>
            </div>
          </div>

          <nav className="flex gap-2 pb-1 overflow-x-auto hide-scrollbar whitespace-nowrap" role="tablist" aria-label="Vistas del asistente">
            <TabButton
              activo={tab === 'chat'}
              onClick={() => setTab('chat')}
              icon={ChatBubbleLeftRightIcon}
              label="Asistente"
            />
            <TabButton
              activo={tab === 'modulos'}
              onClick={() => setTab('modulos')}
              icon={Squares2X2Icon}
              label="Módulos"
            />
            <TabButton
              activo={tab === 'guia'}
              onClick={() => setTab('guia')}
              icon={BookOpenIcon}
              label="Guía"
            />
          </nav>
        </div>
      </header>

      {/* Contenido de la pestaña activa.
          key fuerza el remonte al cambiar de pestaña, para arrancar limpio. */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        {tab === 'chat' && <ChatLibre key="chat" />}
        {tab === 'modulos' && <ManualModulos key="modulos" />}
        {tab === 'guia' && (
          <GuiaUso 
            key="guia" 
            hasReadGuide={hasReadGuide} 
            onMarkAsRead={handleMarkAsRead} 
          />
        )}
      </div>

      {/* Cartel flotante de Bienvenida / Onboarding */}
      {!hasReadGuide && tab === 'chat' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity animate-fade-up">
          <div className="w-full max-w-sm rounded-3xl border border-white border-opacity-10 glass-panel p-6 shadow-2xl text-center flex flex-col items-center">
            <RobotAvatar estado="greeting" size="80px" className="mb-4 drop-shadow-xl" />
            <h3 className="mb-2 text-xl font-bold text-white">¡Te damos la bienvenida!</h3>
            <p className="mb-6 text-sm text-gray-300 leading-relaxed">
              Para sacarle el mayor provecho a este sistema de preguntas y respuestas, te recomendamos leer primero nuestra guía rápida de uso.
            </p>
            <button
              onClick={() => setTab('guia')}
              className="w-full rounded-full bg-diplo-celeste py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-diplo-celeste focus:ring-offset-2 focus:ring-offset-diplo-azul"
            >
              Leer guía de uso
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ activo, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={activo}
      onClick={onClick}
      className={
        'inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition focus:outline-none ' +
        (activo
          ? 'text-white'
          : 'text-gray-400 hover:text-white')
      }
      style={{
        borderBottom: activo ? '2px solid #f08b3a' : '2px solid transparent',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderRadius: 0,
      }}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
