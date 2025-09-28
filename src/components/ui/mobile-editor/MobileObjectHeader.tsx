'use client';

import React from 'react';
import { type MobileObject } from '../../../state/useWorldStore';

interface MobileObjectHeaderProps {
  mobileObject: MobileObject;
  onRemove: (id: string) => void;
}

export function MobileObjectHeader({
  mobileObject,
  onRemove
}: MobileObjectHeaderProps) {
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
            <div className="w-4 h-4 border border-white bg-cyan-400" />
            <h3 className="text-sm font-mono font-bold text-white tracking-wider">
              001_MOBILE_OBJECT_EDITOR
            </h3>
          </div>
          <button
            onClick={() => {
              if (confirm('¿Estás seguro de que quieres eliminar este objeto móvil?')) {
                onRemove(mobileObject.id);
              }
            }}
            className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
            title="Eliminar objeto móvil"
          >
            <span className="text-xs font-mono">DELETE</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Información del objeto */}
        <div className="space-y-2 text-xs font-mono text-white">
          <div className="flex justify-between">
            <span className="text-gray-400">ID:</span>
            <span className="text-cyan-400">{mobileObject.id.slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">TIPO:</span>
            <span className="text-cyan-400">MOBILE</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">ESTADO:</span>
            <span className={`${mobileObject.mobileParams.isActive ? 'text-green-400' : 'text-red-400'}`}>
              {mobileObject.mobileParams.isActive ? 'ACTIVO' : 'INACTIVO'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">MOVIMIENTO:</span>
            <span className="text-cyan-400 uppercase">{mobileObject.mobileParams.movementType}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
