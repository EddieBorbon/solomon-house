'use client';

import React from 'react';
import { type SoundObject } from '../../../state/useWorldStore';

interface SoundObjectHeaderProps {
  selectedObject: SoundObject;
  onRemove: (id: string) => void;
}

export function SoundObjectHeader({
  selectedObject,
  onRemove
}: SoundObjectHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded ${
            selectedObject.type === 'cube' ? 'bg-blue-500' : 
            selectedObject.type === 'sphere' ? 'bg-purple-500' : 
            selectedObject.type === 'cylinder' ? 'bg-green-500' :
            selectedObject.type === 'cone' ? 'bg-orange-500' :
            selectedObject.type === 'pyramid' ? 'bg-red-500' :
            selectedObject.type === 'icosahedron' ? 'bg-indigo-500' :
            selectedObject.type === 'torus' ? 'bg-cyan-500' :
            selectedObject.type === 'dodecahedronRing' ? 'bg-pink-500' :
            selectedObject.type === 'spiral' ? 'bg-cyan-500' : 'bg-gray-500'
          }`} />
          <h3 className="text-lg font-semibold text-white">
            Editor de Parámetros
          </h3>
        </div>
        <button
          onClick={() => {
            if (confirm('¿Estás seguro de que quieres eliminar este objeto?')) {
              onRemove(selectedObject.id);
            }
          }}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200"
          title="Eliminar objeto"
        >
          🗑️
        </button>
      </div>
      <div className="text-sm text-gray-400">
        <p>Objeto: <span className="text-white">{selectedObject.type}</span></p>
        <p>ID: <span className="text-white font-mono text-xs">{selectedObject.id.slice(0, 8)}...</span></p>
      </div>
    </div>
  );
}
