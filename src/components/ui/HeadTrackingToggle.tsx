'use client';

import { useState, useEffect } from 'react';
import {
  isHeadTrackingSupported,
  enableHeadTracking,
  disableHeadTracking,
} from '../../lib/audio/headTracking';
import { useIsMobile } from '../../hooks/useIsMobile';

/**
 * Activador del seguimiento de cabeza (roadmap 4.5): en dispositivos
 * móviles, la rotación física del aparato compensa la espacialización
 * binaural. Solo se muestra cuando el navegador expone el sensor.
 */
export function HeadTrackingToggle() {
  const [active, setActive] = useState(false);
  const [supported, setSupported] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setSupported(isHeadTrackingSupported());
    return () => disableHeadTracking();
  }, []);

  if (!supported || !isMobile) return null;

  const toggle = async () => {
    if (active) {
      disableHeadTracking();
      setActive(false);
    } else {
      const enabled = await enableHeadTracking();
      setActive(enabled);
      if (!enabled) {
        alert('No se obtuvo permiso para usar el sensor de orientación del dispositivo.');
      }
    }
  };

  return (
    <button
      onClick={toggle}
      className={`fixed bottom-16 left-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 z-50 font-mono text-sm transition-colors ${
        active ? 'text-green-400' : 'text-gray-400 hover:text-gray-200'
      }`}
      title="Seguimiento de cabeza: usa la orientación física del dispositivo para el audio binaural"
    >
      🎧 {active ? 'Head tracking ON' : 'Head tracking'}
    </button>
  );
}
