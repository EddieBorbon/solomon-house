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
    return null; // No mostrar nada durante la hidratación
  }

  return <>{children}</>;
}
