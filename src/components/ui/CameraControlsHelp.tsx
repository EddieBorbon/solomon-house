'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export function CameraControlsHelp() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-black/80 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl p-2 text-white hover:bg-white/10 transition-colors"
        title={t('cameraControls.toggleTooltip')}
        aria-label={t('cameraControls.toggleTooltip')}
      >
        ⌨️
      </button>
      
      {isVisible && (
        <div className="absolute top-12 right-0 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl p-4 min-w-[200px]">
          <div className="text-white text-sm space-y-2">
            <div className="font-semibold text-cyan-400 mb-2">{t('cameraControls.title')}</div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>W</span>
                <span className="text-gray-400">{t('cameraControls.forward')}</span>
              </div>
              <div className="flex justify-between">
                <span>S</span>
                <span className="text-gray-400">{t('cameraControls.backward')}</span>
              </div>
              <div className="flex justify-between">
                <span>A</span>
                <span className="text-gray-400">{t('cameraControls.left')}</span>
              </div>
              <div className="flex justify-between">
                <span>D</span>
                <span className="text-gray-400">{t('cameraControls.right')}</span>
              </div>
              <div className="flex justify-between">
                <span>Q</span>
                <span className="text-gray-400">{t('cameraControls.down')}</span>
              </div>
              <div className="flex justify-between">
                <span>E</span>
                <span className="text-gray-400">{t('cameraControls.up')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shift</span>
                <span className="text-gray-400">{t('cameraControls.fast')}</span>
              </div>
            </div>
            
            <div className="border-t border-white/20 pt-2 mt-2">
              <div className="text-xs text-gray-400">
                {t('cameraControls.mouse')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
