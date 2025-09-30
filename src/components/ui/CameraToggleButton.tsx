'use client';

import { useState, useEffect } from 'react';

export function CameraToggleButton() {
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);

  // Escuchar eventos de cambio de estado de la cámara
  useEffect(() => {
    const handleCameraStateChange = (event: CustomEvent) => {
      setIsCameraEnabled(event.detail.enabled);
    };

    const handleCameraDebug = (event: CustomEvent) => {
      console.log('🔍 Estado actual de OrbitControls:', event.detail);
    };

    window.addEventListener('camera-state-change', handleCameraStateChange as EventListener);
    window.addEventListener('camera-debug', handleCameraDebug as EventListener);

    return () => {
      window.removeEventListener('camera-state-change', handleCameraStateChange as EventListener);
      window.removeEventListener('camera-debug', handleCameraDebug as EventListener);
    };
  }, []);

  const toggleCamera = () => {
    const newState = !isCameraEnabled;
    const event = new CustomEvent('camera-toggle', { 
      detail: { enabled: newState } 
    });
    window.dispatchEvent(event);
    setIsCameraEnabled(newState);
    console.log(`🎥 Camera controls ${newState ? 'enabled' : 'disabled'}`);
  };

  const enableCamera = () => {
    const event = new CustomEvent('camera-toggle', { 
      detail: { enabled: true } 
    });
    window.dispatchEvent(event);
    setIsCameraEnabled(true);
    console.log('🎥 Camera controls enabled');
  };

  const disableCamera = () => {
    const event = new CustomEvent('camera-toggle', { 
      detail: { enabled: false } 
    });
    window.dispatchEvent(event);
    setIsCameraEnabled(false);
    console.log('🎥 Camera controls disabled');
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold text-white">🎥 Control de Cámara</h3>
      
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${
          isCameraEnabled ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="text-sm text-gray-300">
          {isCameraEnabled ? 'Cámara Activa' : 'Cámara Bloqueada'}
        </span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={toggleCamera}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isCameraEnabled
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isCameraEnabled ? 'Bloquear Cámara' : 'Activar Cámara'}
        </button>

        <button
          onClick={enableCamera}
          className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          Forzar ON
        </button>

        <button
          onClick={disableCamera}
          className="px-3 py-2 rounded-md text-sm font-medium bg-gray-600 hover:bg-gray-700 text-white transition-colors"
        >
          Forzar OFF
        </button>

        <button
          onClick={() => {
            const event = new CustomEvent('camera-debug-request');
            window.dispatchEvent(event);
          }}
          className="px-3 py-2 rounded-md text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors"
        >
          Debug
        </button>
      </div>

      {isCameraEnabled ? (
        <p className="text-xs text-green-400">
          ✅ Puedes rotar la cámara con el mouse (clic izquierdo + arrastrar)
        </p>
      ) : (
        <p className="text-xs text-red-400">
          ⚠️ La cámara está bloqueada. Haz clic en &quot;Activar Cámara&quot; para desbloquear.
        </p>
      )}

      <div className="text-xs text-gray-400">
        <p><strong>Controles:</strong></p>
        <p>• Clic izquierdo + arrastrar: Rotar</p>
        <p>• Clic derecho + arrastrar: Pan</p>
        <p>• Rueda del mouse: Zoom</p>
      </div>
    </div>
  );
}
