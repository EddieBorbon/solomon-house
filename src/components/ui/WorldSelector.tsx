'use client';

import React, { useState } from 'react';
import { useWorldStore } from '../../state/useWorldStore';

export function WorldSelector() {
  const { 
    worlds, 
    currentWorldId, 
    switchWorld, 
    createWorld, 
    deleteWorld
  } = useWorldStore();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorldName, setNewWorldName] = useState('');

  const currentWorld = worlds.find(w => w.id === currentWorldId);

  const handleCreateWorld = () => {
    if (newWorldName.trim()) {
      createWorld(newWorldName.trim());
      setNewWorldName('');
      setShowCreateForm(false);
    }
  };

  const handleDeleteWorld = (worldId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este mundo? Todos los objetos se perderán.')) {
      deleteWorld(worldId);
    }
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-4 min-w-[300px]">
        {/* Efecto de brillo interior */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-2xl pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-xl">🌍</span>
            Mundos
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:scale-110 p-2 rounded-lg hover:bg-cyan-500/20"
            title={isExpanded ? "Ocultar mundos" : "Mostrar mundos"}
          >
            {isExpanded ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>

        {/* Mundo actual */}
        <div className="mb-3 p-3 bg-cyan-900/20 border border-cyan-700/50 rounded-lg">
          <div className="text-sm text-cyan-300 mb-1">Mundo Actual</div>
          <div className="text-white font-medium">{currentWorld?.name || 'Ninguno'}</div>
          <div className="text-xs text-cyan-200">
            {currentWorld ? `Mundo activo` : 'Sin mundo'}
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-3">
            {/* Lista de mundos */}
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent">
              {worlds.map((world) => (
                <div
                  key={world.id}
                  className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                    world.id === currentWorldId
                      ? 'bg-cyan-500/20 border-cyan-500/50'
                      : 'bg-gray-800/50 border-gray-600/50 hover:bg-gray-700/50'
                  }`}
                  onClick={() => switchWorld(world.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-white font-medium">{world.name}</div>
                      <div className="text-xs text-gray-400">
                        Mundo disponible
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {world.id === currentWorldId && (
                        <span className="text-cyan-400 text-sm">✓</span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWorld(world.id);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors p-1"
                        title="Eliminar mundo"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Formulario para crear mundo */}
            {showCreateForm ? (
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <div className="text-sm text-gray-300 mb-2">Crear Nuevo Mundo</div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newWorldName}
                    onChange={(e) => setNewWorldName(e.target.value)}
                    placeholder="Nombre del mundo"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateWorld()}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateWorld}
                      className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm transition-colors"
                    >
                      Crear
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewWorldName('');
                      }}
                      className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span className="text-lg">➕</span>
                <span>Crear Nuevo Mundo</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
