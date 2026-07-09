import { InformationCircleIcon, CheckCircleIcon, XCircleIcon, HandThumbUpIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { APP_VERSION } from '../version';

export default function GuiaUso({ hasReadGuide, onMarkAsRead }) {
  const [cleared, setCleared] = useState(false);

  const handleClearHistory = () => {
    localStorage.removeItem('diplo_chat_history');
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 animate-fade-up">
      <div className="mb-6 flex items-center gap-3 border-b border-white border-opacity-10 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-diplo-celeste text-white shadow-sm">
          <InformationCircleIcon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white drop-shadow-sm">Manual de Uso</h2>
          <p className="text-sm text-gray-300">Cómo preguntarle al asistente para obtener respuestas precisas.</p>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="mb-3 font-semibold text-white flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-400" /> 
            Buenas prácticas
          </h3>
          <ul className="space-y-3 text-sm text-gray-200">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-diplo-celeste"></span>
              <span><strong>Consultas puntuales e independientes:</strong> El sistema responde a tu pregunta actual y <strong>no recuerda tus mensajes anteriores</strong>. Si le decís "explicame más sobre eso", no sabrá de qué hablabas.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-diplo-celeste"></span>
              <span><strong>Usá palabras clave:</strong> En lugar de escribir oraciones largas, andá directo al punto (ej: "Requisitos de moratoria", "Edad mínima pensión").</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-diplo-celeste"></span>
              <span><strong>Sé preciso:</strong> Si la pregunta es demasiado genérica (ej: "Jubilación"), el sistema te pedirá que aclares a qué aspecto te referís.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-diplo-celeste"></span>
              <span><strong>Consultá el índice:</strong> Si no sabés qué preguntar, usá la pestaña "Consultar por módulo" para ver todas las preguntas disponibles organizadas por clase.</span>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-white border-opacity-10 glass-panel p-4 shadow-sm">
          <h3 className="mb-3 font-semibold text-white flex items-center gap-2">
            <XCircleIcon className="h-5 w-5 text-red-400" />
            Lo que debés evitar
          </h3>
          <p className="mb-2 text-sm text-gray-200">El asistente busca coincidencias exactas con el material de estudio. Aunque entienda lenguaje natural, funciona mejor sin preámbulos.</p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• <strong>No plantees casos de estudio ni consultas estructuradas:</strong> El sistema está para evacuar dudas teóricas y procedimentales de las clases, no para analizar historias de clientes. Evitá arrancar con <em className="text-gray-300">"Tengo un caso de un cliente que..."</em>.</li>
            <li>• No redactes párrafos largos con múltiples variables.</li>
            <li>• No pidas que redacte documentos legales ni haga cálculos numéricos.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-white border-opacity-10 bg-black bg-opacity-20 p-4 shadow-sm">
          <h3 className="mb-3 font-semibold text-white flex items-center gap-2">
            <InformationCircleIcon className="h-5 w-5 text-diplo-celeste" />
            Términos y Limitaciones
          </h3>
          <p className="mb-2 text-sm text-gray-300">Al utilizar este asistente, aceptás las siguientes condiciones:</p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• Las respuestas son generadas a partir del material oficial, pero <strong>no constituyen asesoramiento legal o profesional definitivo</strong>.</li>
            <li>• El asistente puede equivocarse o malinterpretar consultas ambiguas. Siempre verificá la información con la normativa vigente.</li>
            <li>• Tus conversaciones quedan guardadas en la memoria local de tu navegador.</li>
          </ul>
          
          <div className="mt-4 rounded-xl border border-white border-opacity-10 bg-black bg-opacity-20 p-3">
            <h4 className="mb-2 font-medium text-white flex items-center gap-2">
              <TrashIcon className="h-4 w-4 text-one-fucsia" />
              ¿Cómo borrar el historial?
            </h4>
            <p className="mb-3 text-xs text-gray-400">
              Podés borrar la memoria escribiendo en el chat comandos como <strong>"borrar historial"</strong>, <strong>"limpiar chat"</strong> o usando este botón:
            </p>
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 rounded-lg bg-one-oscuro border border-one-fucsia px-4 py-2 text-xs font-semibold text-white shadow-[0_0_10px_rgba(225,123,215,0.15)] transition hover:bg-one-fucsia hover:text-one-negro focus:outline-none"
            >
              <TrashIcon className="h-4 w-4" />
              {cleared ? '¡Historial borrado!' : 'Borrar historial ahora'}
            </button>
          </div>
        </section>
      </div>

      <p className="mt-8 text-center text-xs text-gray-500">
        Versión {APP_VERSION}
      </p>

      {!hasReadGuide && onMarkAsRead && (
        <div className="mt-8 flex justify-center animate-fade-up" style={{ animationDelay: '0.5s' }}>
          <button
            onClick={onMarkAsRead}
            className="flex items-center gap-2 rounded-full bg-diplo-naranja px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-diplo-naranja focus:ring-offset-2 focus:ring-offset-diplo-azul"
          >
            <HandThumbUpIcon className="h-5 w-5" />
            He leído el manual de uso
          </button>
        </div>
      )}
    </main>
  );
}
