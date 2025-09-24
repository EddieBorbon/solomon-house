'use client';

import { useState } from 'react';
import { audioManager } from '../../lib/AudioManager';

export function AudioInitializer() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Función para inicializar el audio
  const handleInit = async () => {
    setIsInitializing(true);
    
    try {
      const success = await audioManager.startContext();
      if (success) {
        setIsInitialized(true);
        console.log('🎵 Audio inicializado exitosamente');
      }
    } catch (error) {
      console.error('❌ Error al inicializar audio:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  // Si ya está inicializado, no renderizar nada
  if (isInitialized) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 max-w-md mx-4">
        {/* Efecto de brillo interior */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-2xl pointer-events-none"></div>
        
        <div className="text-center relative">
          {/* Título */}
          <h2 className="text-2xl font-bold text-white mb-4">
            Bienvenido a La Casa de Salomón
          </h2>
          
          {/* Descripción */}
          <p className="text-gray-300 mb-8 leading-relaxed">
            Una experiencia musical 3D interactiva donde puedes crear y manipular objetos sonoros en tiempo real.
          </p>
          
          {/* Botón de inicio */}
          <button
            onClick={handleInit}
            disabled={isInitializing}
            className={`
              w-full px-8 py-4 rounded-xl text-gray-800 font-bold text-lg
              transition-all duration-300 transform hover:scale-105
              focus:outline-none focus:ring-4 focus:ring-gray-300/50
              bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-200 hover:to-gray-300
              ${isInitializing 
                ? 'opacity-70 cursor-not-allowed' 
                : 'hover:shadow-lg active:scale-95'
              }
            `}
          >
            {isInitializing ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-600 rounded-full animate-spin" />
                <span>Iniciando Experiencia Sonora...</span>
              </div>
            ) : (
              <span>Iniciar Experiencia Sonora</span>
            )}
          </button>
          
          {/* Información adicional */}
          <p className="text-xs text-gray-400 mt-6">
            Haz clic una vez para habilitar el audio en toda la aplicación
          </p>
        </div>
      </div>
    </div>
  );
}
