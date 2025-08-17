'use client';

import { ReactNode, useEffect, useState } from 'react';

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Evita problemas de hidratación mostrando contenido solo cuando el componente esté montado
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            Cargando Casa de Salomon...
          </h2>
          <p className="text-gray-500 mt-2">Inicializando el mundo musical 3D</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
