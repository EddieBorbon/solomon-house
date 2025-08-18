'use client';

import { Suspense } from 'react';
import { Experience } from '../components/world/Experience';
import { ControlPanel } from '../components/ui/ControlPanel';
import { ParameterEditor } from '../components/ui/ParameterEditor';
import { WorldInfo } from '../components/ui/WorldInfo';

export default function Home() {
  return (
    <div className="w-full h-screen relative">
      {/* Editor de parámetros */}
      <ParameterEditor />
      
      {/* Información del mundo */}
      <WorldInfo />
      
      {/* Panel de control */}
      <ControlPanel />
      
      {/* Escena 3D */}
      <Suspense 
        fallback={
          <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-700">
                Cargando Mundo 3D...
              </h2>
              <p className="text-gray-500 mt-2">Inicializando Casa de Salomon</p>
            </div>
          </div>
        }
      >
        <Experience />
      </Suspense>
    </div>
  );
}
