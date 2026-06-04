'use client';

import { useMemo } from 'react';
import { PersistencePanel } from './PersistencePanel';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGlobalWorldSync } from '../../hooks/useGlobalWorldSync';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useTutorialUIEffects } from '../../hooks/useTutorialUIEffects';
import { CameraSubpanel } from './subpanels/CameraSubpanel';
import { SoundObjectsSubpanel } from './subpanels/SoundObjectsSubpanel';
import { EffectsSubpanel } from './subpanels/EffectsSubpanel';
import { MobileObjectsSubpanel } from './subpanels/MobileObjectsSubpanel';
import { GridsSubpanel } from './subpanels/GridsSubpanel';

export function ControlPanel() {
  const {
    isPanelExpanded,
    setIsPanelExpanded,
    isAddMenuExpanded,
    setIsAddMenuExpanded,
    isEffectsExpanded,
    setIsEffectsExpanded,
    isMobileObjectExpanded,
    setIsMobileObjectExpanded,
    isTutorialActive,
    currentStep
  } = useTutorialUIEffects();

  const isMobile = useIsMobile();
  const { t } = useLanguage();

  // Estado de conexión del mundo global
  const {
    isConnected: isGlobalWorldConnected,
    error: globalWorldError,
    isInitializing: isGlobalWorldInitializing,
    reconnect: reconnectGlobalWorld,
    clearError: clearGlobalWorldError
  } = useGlobalWorldSync();

  const panelWidth = useMemo(() => {
    if (!isPanelExpanded) {
      return '0px';
    }

    return isMobile ? 'min(90vw, 19rem)' : '20rem';
  }, [isPanelExpanded, isMobile]);

  return (
    <div className="fixed left-0 top-0 h-full z-50 flex">
      {/* Botón de toggle futurista */}
      <button
        onClick={() => {
          // Permitir toggle en los pasos 5 y 6 del tutorial
          if (!isTutorialActive || currentStep === 4 || currentStep === 5) {
            setIsPanelExpanded(prev => !prev);
          }
        }}
        className={`relative bg-black border border-white p-3 flex items-center justify-center transition-all duration-300 group ${(isTutorialActive && currentStep !== 4 && currentStep !== 5) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:text-black'
          }`}
        title={(isTutorialActive && currentStep !== 4 && currentStep !== 5) ? t('effects.panelLockedDuringTutorial') : (isPanelExpanded ? t('ui.collapsePanel') : t('ui.expandPanel'))}
        disabled={isTutorialActive && currentStep !== 4 && currentStep !== 5}
      >
        {/* Decoraciones de esquina */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>

        {isPanelExpanded ? (
          <svg className="w-4 h-4 text-white group-hover:text-black transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-white group-hover:text-black transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>

      {/* Panel principal futurista */}
      <div
        className="relative bg-black border border-white transition-all duration-300 overflow-hidden"
        style={{ width: panelWidth }}
      >
        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Scan lines effect */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Scanner line effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute w-full h-1 bg-white shadow-lg shadow-white/80"
              style={{
                animation: 'scanner 2s linear infinite',
                top: '-8px'
              }}
            ></div>
          </div>
        </div>

        <div className="p-4 h-full overflow-y-auto">
          {isPanelExpanded && (
            <>
              {/* Sección de Controles */}
              <div className={`mb-4 relative ${isTutorialActive && (currentStep === 9 || currentStep === 10 || currentStep === 11) ? 'opacity-30 pointer-events-none' : ''}`}>
                <CameraSubpanel />
              </div>

              {/* Sección de Añadir Objeto */}
              <div className={`mb-4 relative ${isTutorialActive && (currentStep === 9 || currentStep === 11) ? 'opacity-30 pointer-events-none' : ''}`}>
                <SoundObjectsSubpanel
                  isAddMenuExpanded={isAddMenuExpanded}
                  setIsAddMenuExpanded={setIsAddMenuExpanded}
                />
              </div>

              {/* Sección de Zonas de Efectos */}
              <div className={`mb-4 relative ${isTutorialActive && (currentStep === 4 || currentStep === 5 || currentStep === 10 || currentStep === 11) ? 'opacity-30 pointer-events-none' : ''}`}>
                <EffectsSubpanel
                  isEffectsExpanded={isEffectsExpanded}
                  setIsEffectsExpanded={setIsEffectsExpanded}
                />
              </div>

              {/* Sección de Objeto Móvil */}
              <div className={`mb-4 relative ${isTutorialActive && (currentStep === 4 || currentStep === 5 || currentStep === 9 || currentStep === 11) ? 'opacity-30 pointer-events-none' : ''}`}>
                <MobileObjectsSubpanel
                  isMobileObjectExpanded={isMobileObjectExpanded}
                  setIsMobileObjectExpanded={setIsMobileObjectExpanded}
                />
              </div>

              {/* Sección de Cuadrículas */}
              <div className="mb-4 relative opacity-30 pointer-events-none">
                <GridsSubpanel />
              </div>

              {/* Panel de Persistencia */}
              <div className={isTutorialActive && currentStep !== 11 ? 'opacity-30 pointer-events-none' : ''}>
                <PersistencePanel />
              </div>

              {/* Estado del Mundo Global */}
              <div className="mb-4 relative">
                <div className="relative border border-white p-3">
                  {/* Decoraciones de esquina */}
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>

                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-2">
                      <span>🌐</span>
                      {t('globalWorld.title')}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {/* Estado de conexión */}
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${isGlobalWorldConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className="text-white font-mono">
                        {isGlobalWorldInitializing
                          ? t('globalWorld.initializing')
                          : isGlobalWorldConnected
                            ? t('globalWorld.connected')
                            : t('globalWorld.disconnected')}
                      </span>
                    </div>

                    {/* Error si existe */}
                    {globalWorldError && (
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between text-red-300 bg-red-900/20 px-2 py-1 border border-red-500/30">
                          <span className="font-mono">{t('globalWorld.error')} {globalWorldError}</span>
                          <button
                            onClick={clearGlobalWorldError}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                        <button
                          onClick={reconnectGlobalWorld}
                          className="text-blue-300 hover:text-blue-200 underline font-mono"
                        >
                          {t('globalWorld.retryConnection')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
