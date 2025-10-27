'use client';

import { useEffect, useState } from 'react';
import { tutorialSteps } from '../../lib/tutorial/tutorialSteps';
import { useTutorialStore } from '../../stores/useTutorialStore';

export function TutorialOverlay() {
  const { isActive, currentStep, nextStep, previousStep, stopTutorial } = useTutorialStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevenir menú contextual durante el tutorial
  useEffect(() => {
    if (!isActive || !mounted) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isActive, mounted]);

  if (!mounted || !isActive) return null;

  const step = tutorialSteps[currentStep];
  if (!step) return null;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const progressPercentage = ((currentStep + 1) / tutorialSteps.length) * 100;

  const handleNext = () => {
    // Permitir avanzar siempre (la experiencia del paso 7 es opcional)
    if (isLastStep) {
      stopTutorial();
    } else {
      nextStep();
    }
  };
  
  // Determinar si el botón siguiente debe estar deshabilitado
  // Para el paso 7, siempre permitir avanzar (la experiencia es opcional)
  const canProceed = true;

  const handlePrevious = () => {
    if (!isFirstStep) {
      previousStep();
    }
  };

  // Determinar qué bloquear según el paso actual
  const shouldBlockLeftPanel = isActive && currentStep !== 4 && currentStep !== 5 && currentStep !== 7 && currentStep !== 8 && currentStep !== 9 && currentStep !== 10; // Bloquear excepto en pasos 5, 6, 8, 9, 10 y 11
  const shouldBlockRightPanel = isActive && currentStep !== 7 && currentStep !== 8 && currentStep !== 9 && currentStep !== 10; // Bloquear el panel derecho excepto en pasos 8, 9, 10 y 11

  return (
    <>
      {/* Overlay que bloquea solo los paneles según el paso */}
      <div className="fixed inset-0 z-[90] pointer-events-none">
        {/* Bloqueo para panel izquierdo */}
        {shouldBlockLeftPanel && (
          <div className="fixed left-0 top-0 w-16 h-full bg-black/30 pointer-events-auto" />
        )}
        {/* Bloqueo para panel derecho */}
        {shouldBlockRightPanel && (
          <div className="fixed right-0 top-0 w-16 h-full bg-black/30 pointer-events-auto" />
        )}
      </div>

      {/* Mensaje de instrucción flotante - Abajo */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[100] pointer-events-auto">
        <div className="relative px-8 py-6 border border-white bg-black/95 backdrop-blur-md max-w-lg">
          {/* Decoraciones de esquina */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white"></div>
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white"></div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white"></div>

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}></div>
          </div>

          {/* Contenido */}
          <div className="relative z-10">
            {/* Título */}
            <h3 className="text-lg font-mono font-bold text-white mb-2">
              {step.title}
            </h3>
            
            {/* Descripción */}
            <p className="text-sm font-mono text-gray-300 mb-4">
              {step.description}
            </p>

            {/* Hints */}
            {step.hints && (
              <div className="space-y-1 text-xs font-mono mb-4">
                {step.hints.map((hint, i) => {
                  const isWarning = hint.includes('⚠️');
                  return (
                    <div 
                      key={i} 
                      className={isWarning ? 'text-yellow-400 bg-yellow-900/20 px-3 py-2 border border-yellow-500/30' : 'text-gray-400'}
                    >
                      {hint}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Botones de navegación */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/20">
              <div>
                {!isFirstStep && (
                  <button
                    onClick={handlePrevious}
                    className="px-4 py-2 border border-white text-white hover:bg-white hover:text-black transition-all duration-300 font-mono text-xs"
                  >
                    ← Anterior
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
            {/* Progress */}
            <span className="text-xs font-mono text-gray-400">
              {currentStep + 1}/{tutorialSteps.length}
            </span>
                
                <button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className={`px-6 py-2 border border-white font-mono text-xs transition-all duration-300 ${
                    canProceed
                      ? 'bg-white text-black hover:bg-transparent hover:text-white'
                      : 'bg-black/50 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLastStep ? 'Finalizar Tutorial' : 'Siguiente →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de cancelar en esquina superior derecha */}
      <div className="fixed top-4 right-4 z-[100] pointer-events-auto">
        <button
          onClick={() => {
            if (confirm('¿Cerrar el tutorial? Podrás continuarlo más tarde.')) {
              stopTutorial();
            }
          }}
          className="px-4 py-2 border border-gray-500 text-gray-400 hover:border-white hover:text-white transition-all duration-300 font-mono text-xs"
        >
          Cerrar
        </button>
      </div>
    </>
  );
}
