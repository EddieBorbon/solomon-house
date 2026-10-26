'use client';

import { useState, useEffect } from 'react';
import { sonicGardener } from '../../lib/agents/SonicGardener';

/**
 * Activador del Jardinero Sónico (roadmap 6.1): agente autónomo que
 * habita la sala como compañero de ejecución — planta objetos en texturas
 * dispersas, genera contrapunto cuando una banda satura y poda cuando la
 * sala se sobrecarga.
 */
export function SonicGardenerToggle() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    return () => sonicGardener.stop();
  }, []);

  const toggle = () => {
    if (sonicGardener.isRunning()) {
      sonicGardener.stop();
      setActive(false);
    } else {
      sonicGardener.start();
      setActive(true);
    }
  };

  return (
    <button
      onClick={toggle}
      className={`fixed bottom-28 left-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 z-50 font-mono text-sm transition-colors ${
        active ? 'text-green-400' : 'text-gray-400 hover:text-gray-200'
      }`}
      title="Jardinero Sónico: agente autónomo que co-compone en la sala"
    >
      🌱 {active ? 'Jardinero activo' : 'Jardinero'}
    </button>
  );
}
