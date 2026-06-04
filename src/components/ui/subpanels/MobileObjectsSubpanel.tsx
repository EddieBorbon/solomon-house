'use client';

import React from 'react';
import { useWorldStore } from '../../../state/useWorldStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { RocketLaunchIcon } from '@heroicons/react/24/outline';

interface MobileObjectsSubpanelProps {
  isMobileObjectExpanded: boolean;
  setIsMobileObjectExpanded: (expanded: boolean) => void;
}

export function MobileObjectsSubpanel({
  isMobileObjectExpanded,
  setIsMobileObjectExpanded
}: MobileObjectsSubpanelProps) {
  const { addMobileObject, activeGridId, grids } = useWorldStore();
  const { t } = useLanguage();

  const activeGrid = activeGridId ? grids.get(activeGridId) : null;

  const createMobileObjectInActiveGrid = () => {
    if (!activeGrid) return;
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addMobileObject([x, 0.5, z]);
  };

  return (
    <div className="relative border border-white p-3">
      {/* Decoraciones de esquina */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-2">
          <RocketLaunchIcon className="w-3 h-3" />
          {t('controls.mobileObjects')}
        </h3>
        <button
          onClick={() => setIsMobileObjectExpanded(!isMobileObjectExpanded)}
          className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
          title={isMobileObjectExpanded ? t('effects.hideMenu') : t('effects.showMenu')}
        >
          <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
          <span className="relative text-xs font-mono tracking-wider">
            {isMobileObjectExpanded ? t('controls.hide') : t('controls.show')}
          </span>
        </button>
      </div>

      {isMobileObjectExpanded && (
        <div className="space-y-1">
          <button
            onClick={createMobileObjectInActiveGrid}
            className="relative w-full border border-white px-3 py-2 text-white hover:bg-white hover:text-black transition-all duration-300 group"
          >
            <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
            <span className="relative text-xs font-mono tracking-wider flex items-center justify-center">
              <span>{t('controls.createMobileObject')}</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
