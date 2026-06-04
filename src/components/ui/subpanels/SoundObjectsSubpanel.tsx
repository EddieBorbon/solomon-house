'use client';

import React from 'react';
import { useWorldStore } from '../../../state/useWorldStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { MusicalNoteIcon, CommandLineIcon } from '@heroicons/react/24/outline';
import {
  Box,
  Circle,
  Square,
  Hexagon,
  Triangle,
  RotateCcw,
  CircleDot,
  Loader2
} from 'lucide-react';

interface SoundObjectsSubpanelProps {
  isAddMenuExpanded: boolean;
  setIsAddMenuExpanded: (expanded: boolean) => void;
}

export function SoundObjectsSubpanel({
  isAddMenuExpanded,
  setIsAddMenuExpanded
}: SoundObjectsSubpanelProps) {
  const { addObject, activeGridId, grids } = useWorldStore();
  const { t } = useLanguage();

  const activeGrid = activeGridId ? grids.get(activeGridId) : null;

  const createObjectInActiveGrid = (type: string) => {
    if (!activeGrid) return;
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject(type as any, [x, 0.5, z]);
  };

  const handleAddCube = () => createObjectInActiveGrid('cube');
  const handleAddSphere = () => createObjectInActiveGrid('sphere');
  const handleAddCylinder = () => createObjectInActiveGrid('cylinder');
  const handleAddCone = () => createObjectInActiveGrid('cone');
  const handleAddPyramid = () => createObjectInActiveGrid('pyramid');
  const handleAddIcosahedron = () => createObjectInActiveGrid('icosahedron');
  const handleAddPlane = () => createObjectInActiveGrid('plane');
  const handleAddTorus = () => createObjectInActiveGrid('torus');
  const handleAddDodecahedronRing = () => createObjectInActiveGrid('dodecahedronRing');
  const handleAddSpiral = () => createObjectInActiveGrid('spiral');
  const handleAddCustomObject = () => createObjectInActiveGrid('custom');

  return (
    <div className="relative border border-white p-3">
      {/* Decoraciones de esquina */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-2">
          <MusicalNoteIcon className="w-3 h-3" />
          {t('controls.soundObjects')}
        </h3>
        <button
          onClick={() => setIsAddMenuExpanded(!isAddMenuExpanded)}
          className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
          title={isAddMenuExpanded ? t('effects.hideMenu') : t('effects.showMenu')}
        >
          <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
          <span className="relative text-xs font-mono tracking-wider">
            {isAddMenuExpanded ? t('controls.hide') : t('controls.show')}
          </span>
        </button>
      </div>

      {isAddMenuExpanded && (
        <div className="space-y-1">
          <div className="grid grid-cols-2 gap-1">
            <button onClick={handleAddCube} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Box className="w-3 h-3" />{t('controls.cube')}</span>
            </button>
            <button onClick={handleAddSphere} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Circle className="w-3 h-3" />{t('controls.sphere')}</span>
            </button>
            <button onClick={handleAddCylinder} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Square className="w-3 h-3" />{t('controls.cylinder')}</span>
            </button>
            <button onClick={handleAddCone} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Triangle className="w-3 h-3" />{t('controls.cone')}</span>
            </button>
            <button onClick={handleAddPyramid} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Triangle className="w-3 h-3" />{t('controls.pyramid')}</span>
            </button>
            <button onClick={handleAddIcosahedron} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Hexagon className="w-3 h-3" />{t('controls.icosahedron')}</span>
            </button>
            <button onClick={handleAddPlane} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Square className="w-3 h-3" />{t('controls.plane')}</span>
            </button>
            <button onClick={handleAddTorus} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><RotateCcw className="w-3 h-3" />{t('controls.torus')}</span>
            </button>
            <button onClick={handleAddDodecahedronRing} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><CircleDot className="w-3 h-3" />{t('controls.ring')}</span>
            </button>
            <button onClick={handleAddSpiral} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Loader2 className="w-3 h-3" />SPIRAL</span>
            </button>
            <button onClick={handleAddCustomObject} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group border-purple-500">
              <div className="absolute -inset-0.5 border border-purple-600 group-hover:border-purple-400 transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><CommandLineIcon className="w-3 h-3" />CUSTOM</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
