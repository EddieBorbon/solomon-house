'use client';

import React from 'react';
import { useGlobalWorldSync } from '../../hooks/useGlobalWorldSync';

interface GlobalWorldSyncStatusProps {
  className?: string;
}

export function GlobalWorldSyncStatus({ className = '' }: GlobalWorldSyncStatusProps) {
  const { isConnected, isSyncing, lastSyncTime, error, isUpdatingFromFirestore } = useGlobalWorldSync();

  const getStatusColor = () => {
    if (error) return 'text-red-500';
    if (isUpdatingFromFirestore) return 'text-blue-500';
    if (isSyncing) return 'text-yellow-500';
    if (isConnected) return 'text-green-500';
    return 'text-gray-500';
  };

  const getStatusText = () => {
    if (error) return `Error: ${error}`;
    if (isUpdatingFromFirestore) return 'Sincronizando desde Firestore...';
    if (isSyncing) return 'Sincronizando...';
    if (isConnected) return 'Mundo Global Conectado';
    return 'Desconectado';
  };

  const getStatusIcon = () => {
    if (error) return '❌';
    if (isUpdatingFromFirestore) return '⬇️';
    if (isSyncing) return '🔄';
    if (isConnected) return '🌍';
    return '🔌';
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className="bg-black/80 backdrop-blur-sm border border-neon-cyan/30 rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
            {lastSyncTime && (
              <span className="text-xs text-gray-400">
                Última sincronización: {lastSyncTime.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        
        {/* Indicador de actividad */}
        <div className="mt-2 flex space-x-1">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`} />
          <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-yellow-400' : 'bg-gray-400'}`} />
          <div className={`w-2 h-2 rounded-full ${isUpdatingFromFirestore ? 'bg-blue-400' : 'bg-gray-400'}`} />
        </div>
      </div>
    </div>
  );
}
