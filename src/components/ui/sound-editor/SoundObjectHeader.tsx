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
    <div className="mb-6 relative">
      {/* Contenedor con borde complejo */}
      <div className="relative border border-white p-4">
        {/* Decoraciones de esquina */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 border border-white ${
              selectedObject.type === 'cube' ? 'bg-white' : 
              selectedObject.type === 'sphere' ? 'bg-gray-300' : 
              selectedObject.type === 'cylinder' ? 'bg-gray-400' :
              selectedObject.type === 'cone' ? 'bg-gray-500' :
              selectedObject.type === 'pyramid' ? 'bg-gray-600' :
              selectedObject.type === 'icosahedron' ? 'bg-gray-700' :
              selectedObject.type === 'torus' ? 'bg-gray-800' :
              selectedObject.type === 'dodecahedronRing' ? 'bg-gray-900' :
              selectedObject.type === 'spiral' ? 'bg-gray-900' : 'bg-gray-500'
            }`} />
            <h3 className="text-sm font-mono font-bold text-white tracking-wider">
              001_SOUND_OBJECT_EDITOR
            </h3>
          </div>
          <button
            onClick={() => {
              if (confirm('¿Estás seguro de que quieres eliminar este objeto?')) {
                onRemove(selectedObject.id);
              }
            }}
            className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
            title="Eliminar objeto"
          >
            <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
            <span className="relative text-xs font-mono tracking-wider">DELETE</span>
          </button>
        </div>
        <div className="text-xs font-mono text-gray-300 tracking-wider">
          <p><span className="text-white">TYPE:</span> {selectedObject.type.toUpperCase()}</p>
          <p><span className="text-white">ID:</span> {selectedObject.id.slice(0, 8).toUpperCase()}...</p>
        </div>
      </div>
    </div>
  );
}
