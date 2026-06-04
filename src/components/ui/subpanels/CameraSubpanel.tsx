'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  Cog6ToothIcon,
  CameraIcon,
  ComputerDesktopIcon,
  CursorArrowRaysIcon,
  TrashIcon,
  CommandLineIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export function CameraSubpanel() {
  const { t } = useLanguage();
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);

  // Escuchar eventos de cambio de estado de la cámara
  useEffect(() => {
    const handleCameraStateChange = (event: CustomEvent) => {
      setIsCameraEnabled(event.detail.enabled);
    };

    window.addEventListener('camera-state-change', handleCameraStateChange as EventListener);

    return () => {
      window.removeEventListener('camera-state-change', handleCameraStateChange as EventListener);
    };
  }, []);

  const toggleCamera = () => {
    const newState = !isCameraEnabled;
    const event = new CustomEvent('camera-toggle', {
      detail: { enabled: newState }
    });
    window.dispatchEvent(event);
    setIsCameraEnabled(newState);
  };

  const enableCamera = () => {
    const event = new CustomEvent('camera-toggle', {
      detail: { enabled: true }
    });
    window.dispatchEvent(event);
    setIsCameraEnabled(true);
  };

  const disableCamera = () => {
    const event = new CustomEvent('camera-toggle', {
      detail: { enabled: false }
    });
    window.dispatchEvent(event);
    setIsCameraEnabled(false);
  };

  const debugCamera = () => {
    const event = new CustomEvent('camera-debug-request');
    window.dispatchEvent(event);
  };

  return (
    <div className="relative border border-white p-3">
      {/* Decoraciones de esquina */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-2">
          <Cog6ToothIcon className="w-3 h-3" />
          {t('controls.controls')}
        </h3>
        <button
          onClick={() => setIsControlsExpanded(!isControlsExpanded)}
          className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
          title={isControlsExpanded ? t('effects.hideControls') : t('effects.showControls')}
        >
          <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
          <span className="relative text-xs font-mono tracking-wider">
            {isControlsExpanded ? t('controls.hide') : t('controls.show')}
          </span>
        </button>
      </div>

      {isControlsExpanded && (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {/* Controles básicos */}
          <div className="p-2 border border-gray-600 text-xs text-gray-300 font-mono">
            <div className="space-y-1">
              <p className="flex items-center gap-2"><CameraIcon className="w-3 h-3" /><span className="text-white">{t('controls.camera')}</span> {t('controls.clickRotateScrollZoom')}</p>
              <p className="flex items-center gap-2"><ComputerDesktopIcon className="w-3 h-3" /><span className="text-white">{t('controls.wasd')}</span> {t('controls.movementShiftFast')}</p>
              <p className="flex items-center gap-2"><CursorArrowRaysIcon className="w-3 h-3" /><span className="text-white">{t('controls.click')}</span> {t('controls.selectObjects')}</p>
              <p className="flex items-center gap-2"><TrashIcon className="w-3 h-3" /><span className="text-white">{t('controls.delete')}</span> {t('controls.removeSelected')}</p>
              <p className="flex items-center gap-2"><CommandLineIcon className="w-3 h-3" /><span className="text-white">{t('controls.grx')}</span> {t('controls.transformModes')}</p>
              <p className="flex items-center gap-2"><XMarkIcon className="w-3 h-3" /><span className="text-white">{t('controls.esc')}</span> {t('controls.exitEditMode')}</p>
            </div>
          </div>

          {/* Controles de cámara */}
          <div className="p-2 border border-gray-600 text-xs text-gray-300 font-mono">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isCameraEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-white">
                  {isCameraEnabled ? t('effects.cameraActive') : t('effects.cameraLocked')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={toggleCamera}
                  className={`px-1 py-1 text-xs font-mono border transition-all duration-300 ${isCameraEnabled
                    ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                    : 'border-green-500 text-green-500 hover:bg-green-500 hover:text-white'
                    }`}
                >
                  {isCameraEnabled ? t('effects.lock') : t('effects.activate')}
                </button>

                <button
                  onClick={enableCamera}
                  className="px-1 py-1 text-xs font-mono border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300"
                >
                  Forzar ON
                </button>

                <button
                  onClick={disableCamera}
                  className="px-1 py-1 text-xs font-mono border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white transition-all duration-300"
                >
                  Forzar OFF
                </button>

                <button
                  onClick={debugCamera}
                  className="px-1 py-1 text-xs font-mono border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white transition-all duration-300"
                >
                  Debug
                </button>
              </div>

              {isCameraEnabled ? (
                <p className="text-green-400">
                  ✅ Puedes rotar la cámara con el mouse
                </p>
              ) : (
                <p className="text-red-400">
                  ⚠️ La cámara está bloqueada
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
