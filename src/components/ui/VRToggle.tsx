'use client';

import { useState, useEffect } from 'react';
import { xrStore } from '../world/Experience';

/**
 * Botón de entrada a sesión inmersiva WebXR (roadmap 3.3).
 *
 * Visible solo cuando el navegador expone la WebXR Device API y el modo
 * correspondiente está soportado (visores VR como Meta Quest, o AR en
 * móviles compatibles). Los controladores y el seguimiento de manos los
 * gestiona el almacén XR por defecto.
 */
export function VRToggle() {
  const [vrSupported, setVrSupported] = useState(false);
  const [arSupported, setArSupported] = useState(false);

  useEffect(() => {
    const xr = navigator.xr;
    if (!xr) return;
    xr.isSessionSupported('immersive-vr')
      .then((supported) => setVrSupported(supported))
      .catch(() => {});
    xr.isSessionSupported('immersive-ar')
      .then((supported) => setArSupported(supported))
      .catch(() => {});
  }, []);

  if (!vrSupported && !arSupported) return null;

  return (
    <div className="fixed bottom-4 left-[33rem] flex gap-1 z-50">
      {vrSupported && (
        <button
          onClick={() => xrStore.enterVR()}
          className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 font-mono text-sm text-violet-300 hover:text-violet-100 transition-colors"
          title="Entrar en realidad virtual inmersiva (WebXR)"
        >
          🥽 VR
        </button>
      )}
      {arSupported && (
        <button
          onClick={() => xrStore.enterAR()}
          className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 font-mono text-sm text-violet-300 hover:text-violet-100 transition-colors"
          title="Entrar en realidad aumentada (WebXR passthrough)"
        >
          📲 AR
        </button>
      )}
    </div>
  );
}
