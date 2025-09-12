'use client';

import { useRealtimeSync } from '../../hooks/useRealtimeSync';

interface RealtimeSyncStatusProps {
  projectId: string | null;
}

export function RealtimeSyncStatus({ projectId }: RealtimeSyncStatusProps) {
  const { isConnected, isSyncing, lastSyncTime, error, startSync, stopSync, syncChanges } = useRealtimeSync(projectId);

  if (!projectId) {
    return null;
  }

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Nunca';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `Hace ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Hace ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `Hace ${hours}h`;
  };

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 backdrop-blur-xl rounded-lg border border-white/10 p-3 z-50 min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="text-lg">🔄</span>
          Sincronización
        </h3>
        <div className="flex gap-1">
          <button
            onClick={isConnected ? stopSync : startSync}
            disabled={isSyncing}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              isConnected 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            } disabled:bg-gray-600 disabled:cursor-not-allowed`}
          >
            {isConnected ? 'Desconectar' : 'Conectar'}
          </button>
          
          {isConnected && (
            <button
              onClick={syncChanges}
              disabled={isSyncing}
              className="px-2 py-1 rounded text-xs bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isSyncing ? 'Sincronizando...' : 'Sync'}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-gray-300">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>

        {lastSyncTime && (
          <div className="text-gray-400">
            Última sync: {formatLastSync(lastSyncTime)}
          </div>
        )}

        {error && (
          <div className="text-red-400 bg-red-900/20 p-2 rounded">
            Error: {error}
          </div>
        )}

        {isSyncing && (
          <div className="flex items-center gap-2 text-cyan-400">
            <div className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span>Sincronizando cambios...</span>
          </div>
        )}
      </div>

      {isConnected && (
        <div className="mt-2 pt-2 border-t border-white/10">
          <div className="text-xs text-gray-400">
            💡 Usa el botón "Sync" para sincronizar cambios manualmente
          </div>
        </div>
      )}
    </div>
  );
}
