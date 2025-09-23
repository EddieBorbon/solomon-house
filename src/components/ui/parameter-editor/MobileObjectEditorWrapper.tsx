'use client';

import React from 'react';
import { MobileObjectEditor } from '../MobileObjectEditor';
import { type MobileObject } from '../../../state/useWorldStore';

interface MobileObjectEditorWrapperProps {
  mobileObject: MobileObject;
  onRemove: (id: string) => void;
}

/**
 * Wrapper para el editor de objetos móviles
 * Responsabilidad única: Renderizar la interfaz de edición de objetos móviles
 */
export function MobileObjectEditorWrapper({ 
  mobileObject, 
  onRemove 
}: MobileObjectEditorWrapperProps) {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl p-6 max-w-sm max-h-[90vh] overflow-y-auto">
        {/* Header con información del objeto móvil */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-purple-500 to-pink-500" />
              <h3 className="text-lg font-semibold text-white">
                Editor de Objeto Móvil
              </h3>
            </div>
            <button
              onClick={() => {
                if (confirm('¿Estás seguro de que quieres eliminar este objeto móvil?')) {
                  onRemove(mobileObject.id);
                }
              }}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200"
              title="Eliminar objeto móvil"
            >
              🗑️
            </button>
          </div>
          <div className="text-sm text-gray-400">
            <p>Tipo: <span className="text-white">Objeto Móvil</span></p>
            <p>ID: <span className="text-white font-mono text-xs">{mobileObject.id.slice(0, 8)}...</span></p>
          </div>
        </div>

        {/* Contenido del editor de objeto móvil */}
        <MobileObjectEditor mobileObject={mobileObject} />
      </div>
    </div>
  );
}
