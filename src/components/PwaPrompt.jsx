import { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, ShareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import RobotAvatar from './RobotAvatar';

export default function PwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if user already dismissed or installed
    const dismissed = localStorage.getItem('diplo_pwa_dismissed');
    if (dismissed === 'true') return;

    // Is it iOS? (iPhone, iPad, iPod) and not standalone
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;

    if (isIosDevice && !isStandalone) {
      // It's iOS browser
      setIsIOS(true);
      setShowPrompt(true);
    }

    // For Android and Desktop Chrome/Edge
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('diplo_pwa_dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-up">
      <div className="relative w-full max-w-sm rounded-3xl border border-one-fucsia border-opacity-30 bg-one-oscuro p-6 shadow-[0_0_20px_rgba(225,123,215,0.15)] text-center flex flex-col items-center">
        
        <button 
          onClick={handleDismiss}
          className="absolute right-4 top-4 text-gray-400 hover:text-white focus:outline-none"
          aria-label="Cerrar"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <RobotAvatar estado="greeting" size="70px" className="mb-3 drop-shadow-xl" />
        
        <h3 className="mb-2 text-xl font-bold text-white">¡Instalá la App!</h3>
        
        {isIOS ? (
          <>
            <p className="mb-5 text-sm text-gray-300 leading-relaxed px-2">
              Para tener ONE siempre a mano, tocá el ícono de <ShareIcon className="inline h-5 w-5 mx-1" /> (Compartir) en el menú de Safari y seleccioná <strong>"Agregar a inicio"</strong>.
            </p>
            <button
              onClick={handleDismiss}
              className="w-full rounded-full bg-one-fucsia py-3 text-sm font-semibold text-one-negro shadow-lg transition hover:bg-pink-400 focus:outline-none"
            >
              ¡Entendido!
            </button>
          </>
        ) : (
          <>
            <p className="mb-5 text-sm text-gray-300 leading-relaxed px-2">
              Instalá ONE en tu pantalla de inicio para acceder al instante y tener una mejor experiencia.
            </p>
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-one-fucsia py-3 text-sm font-semibold text-one-negro shadow-lg transition hover:bg-pink-400 focus:outline-none"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Instalar Aplicación
            </button>
          </>
        )}
      </div>
    </div>
  );
}
