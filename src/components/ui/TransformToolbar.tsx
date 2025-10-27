'use client';

import { useWorldStore } from '../../state/useWorldStore';
import { Move, RotateCcw, Scale, X, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function TransformToolbar() {
  const { selectedEntityId, transformMode, setTransformMode, removeObject, removeEffectZone, removeMobileObject, grids } = useWorldStore();
  const { t } = useLanguage();
  
  const handleDelete = () => {
    if (!selectedEntityId) return;
    
    // Buscar en todas las cuadrículas para determinar el tipo de entidad
    for (const grid of grids.values()) {
      const soundObject = grid.objects.find(obj => obj.id === selectedEntityId);
      if (soundObject) {
        removeObject(selectedEntityId);
        return;
      }
      
      const effectZone = grid.effectZones.find(zone => zone.id === selectedEntityId);
      if (effectZone) {
        removeEffectZone(selectedEntityId);
        return;
      }
      
      const mobileObject = grid.mobileObjects.find(obj => obj.id === selectedEntityId);
      if (mobileObject) {
        removeMobileObject(selectedEntityId);
        return;
      }
    }
  };

  // Solo mostrar si hay un objeto seleccionado
  if (!selectedEntityId) {
    return null;
  }

  const modes = [
    { key: 'translate', label: t('ui.move'), shortcut: 'G', icon: Move },
    { key: 'rotate', label: t('ui.rotate'), shortcut: 'R', icon: RotateCcw },
    { key: 'scale', label: t('ui.scale'), shortcut: 'X', icon: Scale },
  ] as const;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      {/* Contenedor principal con estilo FUI/HUD */}
      <div className="relative bg-black border border-white p-1">
        {/* Decoraciones de esquina cortada */}
        <div className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t border-l border-white"></div>
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 border-t border-r border-white"></div>
        <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 border-b border-l border-white"></div>
        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b border-r border-white"></div>
        
        {/* Líneas decorativas internas */}
        <div className="absolute top-0 left-2 w-4 h-px bg-white"></div>
        <div className="absolute bottom-0 right-2 w-4 h-px bg-white"></div>
        
        <div className="flex gap-1">
          {modes.map((mode) => (
            <button
              key={mode.key}
              onClick={() => setTransformMode(mode.key)}
              className={`
                relative px-3 py-2 font-mono text-xs tracking-wider transition-all duration-200
                flex items-center gap-1 min-w-[70px] justify-center
                border border-white
                ${
                  transformMode === mode.key
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-black text-white hover:bg-gray-800'
                }
              `}
              title={`${mode.label} (${mode.shortcut})`}
            >
              {/* Decoración de esquina para botón activo */}
              {transformMode === mode.key && (
                <>
                  <div className="absolute -top-0.5 -left-0.5 w-1 h-1 bg-white"></div>
                  <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-white"></div>
                  <div className="absolute -bottom-0.5 -left-0.5 w-1 h-1 bg-white"></div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-1 h-1 bg-white"></div>
                </>
              )}
              
              <mode.icon className="w-4 h-4" />
              <div className="flex flex-col items-center">
                <span className="text-xs font-mono uppercase">{mode.label}</span>
                <span className="text-xs opacity-60">({mode.shortcut})</span>
              </div>
            </button>
          ))}
          
          {/* Botón para salir del modo edición */}
          <button
            onClick={() => {
              // Simular la acción de ESC
              const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
              window.dispatchEvent(escapeEvent);
            }}
            className="relative px-3 py-2 font-mono text-xs tracking-wider transition-all duration-200
              bg-black text-white hover:bg-gray-800 border border-white
              flex items-center gap-1 min-w-[70px] justify-center"
            title="Salir del modo edición (ESC)"
          >
            <X className="w-4 h-4" />
            <div className="flex flex-col items-center">
              <span className="text-xs font-mono uppercase">Salir</span>
              <span className="text-xs opacity-60">(ESC)</span>
            </div>
          </button>
          
          {/* Botón para eliminar */}
          <button
            onClick={handleDelete}
            className="relative px-3 py-2 font-mono text-xs tracking-wider transition-all duration-200
              bg-black text-white hover:bg-red-900 border border-red-500
              flex items-center gap-1 min-w-[70px] justify-center"
            title="Eliminar objeto seleccionado (SUPR)"
          >
            <Trash2 className="w-4 h-4" />
            <div className="flex flex-col items-center">
              <span className="text-xs font-mono uppercase">Eliminar</span>
              <span className="text-xs opacity-60">(SUPR)</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
