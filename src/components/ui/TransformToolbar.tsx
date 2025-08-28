'use client';

import { useWorldStore } from '../../state/useWorldStore';

export function TransformToolbar() {
  const { selectedEntityId, transformMode, setTransformMode } = useWorldStore();

  // Solo mostrar si hay un objeto seleccionado
  if (!selectedEntityId) {
    return null;
  }

  const modes = [
    { key: 'translate', label: 'Mover', shortcut: 'G', icon: '↔' },
    { key: 'rotate', label: 'Rotar', shortcut: 'R', icon: '🔄' },
    { key: 'scale', label: 'Escalar', shortcut: 'S', icon: '⤧' },
  ] as const;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-2">
        <div className="flex gap-2">
          {modes.map((mode) => (
            <button
              key={mode.key}
              onClick={() => setTransformMode(mode.key)}
              className={`
                px-4 py-2 rounded-md font-medium text-sm transition-all duration-200
                flex items-center gap-2 min-w-[80px] justify-center
                ${
                  transformMode === mode.key
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                }
              `}
              title={`${mode.label} (${mode.shortcut})`}
            >
              <span className="text-lg">{mode.icon}</span>
              <span className="hidden sm:inline">{mode.label}</span>
              <span className="text-xs opacity-70">({mode.shortcut})</span>
            </button>
          ))}
          
          {/* Botón para salir del modo edición */}
          <button
            onClick={() => {
              // Simular la acción de ESC
              const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
              window.dispatchEvent(escapeEvent);
            }}
            className="px-4 py-2 rounded-md font-medium text-sm transition-all duration-200
              bg-red-100 text-red-700 hover:bg-red-200 hover:scale-102
              flex items-center gap-2 min-w-[80px] justify-center"
            title="Salir del modo edición (ESC)"
          >
            <span className="text-lg">❌</span>
            <span className="hidden sm:inline">Salir</span>
            <span className="text-xs opacity-70">(ESC)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
