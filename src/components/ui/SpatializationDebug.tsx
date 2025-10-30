'use client';

import React, { useState, useEffect } from 'react';
import { audioManager } from '../../lib/AudioManager';
import { useLanguage } from '../../contexts/LanguageContext';

export function SpatializationDebug() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    contextState?: string;
    soundSourcesCount?: number;
    soundSourceIds?: string[];
    listenerInfo?: { hasListener: boolean };
  }>({});

  useEffect(() => {
    if (!isVisible) return;

    const updateDebugInfo = () => {
      try {
        const info = {
          contextState: audioManager.getDebugInfo().contextState,
          soundSourcesCount: audioManager.getDebugInfo().soundSourcesCount,
          soundSourceIds: audioManager.getDebugInfo().soundSourceIds,
          listenerInfo: {
            // Información del listener si está disponible
            hasListener: true, // Asumimos que está configurado
          }
        };
        setDebugInfo(info);
      } catch {
      }
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm z-50"
      >
        🎧 {t('spatializationDebug.title')}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">🎧 {t('spatializationDebug.title')}</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white text-sm"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div>
          <span className="text-gray-400">{t('spatializationDebug.context')}</span>
          <span className={`ml-2 px-2 py-1 rounded text-xs ${
            debugInfo.contextState === 'running' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {debugInfo.contextState || t('spatializationDebug.unknown')}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">{t('spatializationDebug.soundSources')}</span>
          <span className="ml-2 text-white">{debugInfo.soundSourcesCount || 0}</span>
        </div>
        
        {debugInfo.soundSourceIds && debugInfo.soundSourceIds.length > 0 && (
          <div>
            <span className="text-gray-400">{t('spatializationDebug.sourceIds')}</span>
            <div className="mt-1 space-y-1">
              {debugInfo.soundSourceIds.slice(0, 5).map((id: string) => (
                <div key={id} className="text-white font-mono text-xs bg-gray-800 px-2 py-1 rounded">
                  {id.slice(0, 8)}...
                </div>
              ))}
              {debugInfo.soundSourceIds.length > 5 && (
                <div className="text-gray-500 text-xs">
                  +{debugInfo.soundSourceIds.length - 5} {t('spatializationDebug.moreSources')}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div>
          <span className="text-gray-400">{t('spatializationDebug.listener3D')}</span>
          <span className="ml-2 text-green-400">{t('spatializationDebug.configured')}</span>
        </div>
        
        <div className="mt-3 p-2 bg-blue-900/20 border border-blue-700/50 rounded">
          <p className="text-xs text-blue-300 text-center">
            {t('spatializationDebug.tip')}
          </p>
        </div>
      </div>
    </div>
  );
}
