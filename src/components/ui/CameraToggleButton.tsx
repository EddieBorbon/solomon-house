'use client';

import { useState, useEffect } from 'react';

export function CameraToggleButton() {
  const [, setIsCameraEnabled] = useState(true);

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
    // FORZAR SIEMPRE HABILITADO - NO PERMITIR DESHABILITAR LA CÁMARA
    const event = new CustomEvent('camera-toggle', { 
      detail: { enabled: true } 
    });
    window.dispatchEvent(event);
    setIsCameraEnabled(true);
    console.log('🎥 Camera controls SIEMPRE habilitado (toggle ignorado)');
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
    // FORZAR SIEMPRE HABILITADO - NO PERMITIR DESHABILITAR LA CÁMARA
    const event = new CustomEvent('camera-toggle', { 
      detail: { enabled: true } 
    });
    window.dispatchEvent(event);
    setIsCameraEnabled(true);
    console.log('🎥 Camera controls SIEMPRE habilitado (disable ignorado)');
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold text-white">🎥 Control de Cámara</h3>
      
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-sm text-gray-300">
          Cámara SIEMPRE Activa
        </span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={toggleCamera}
          className="px-4 py-2 rounded-md text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
          disabled
        >
          Cámara Siempre Activa
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
          disabled
        >
          Deshabilitado
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

      <p className="text-xs text-green-400">
        ✅ La cámara está SIEMPRE habilitada y no se puede bloquear
      </p>

      <div className="text-xs text-gray-400">
        <p><strong>Controles:</strong></p>
        <p>• Clic derecho + arrastrar: Rotar</p>
        <p>• Rueda del mouse: Zoom</p>
        <p>• Botón medio + arrastrar: Pan</p>
        <p className="text-yellow-400 mt-2"><strong>Teclas de Emergencia:</strong></p>
        <p>• Tecla <kbd className="bg-gray-700 px-1 rounded">F</kbd>: Forzar habilitación inmediata</p>
        <p>• Tecla <kbd className="bg-gray-700 px-1 rounded">C</kbd>: Reset rápido de cámara</p>
        <p>• Tecla <kbd className="bg-gray-700 px-1 rounded">R</kbd>: Reset completo de cámara</p>
      </div>
    </div>
  );
}
