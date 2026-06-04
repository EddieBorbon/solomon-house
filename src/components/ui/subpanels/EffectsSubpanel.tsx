'use client';

import React from 'react';
import { useWorldStore } from '../../../state/useWorldStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';

interface EffectsSubpanelProps {
  isEffectsExpanded: boolean;
  setIsEffectsExpanded: (expanded: boolean) => void;
}

export function EffectsSubpanel({
  isEffectsExpanded,
  setIsEffectsExpanded
}: EffectsSubpanelProps) {
  const { addEffectZone, activeGridId, grids } = useWorldStore();
  const { t } = useLanguage();

  const activeGrid = activeGridId ? grids.get(activeGridId) : null;

  const createEffectZoneInActiveGrid = (type: string) => {
    if (!activeGrid) return;
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addEffectZone(
      type as 'phaser' | 'autoFilter' | 'autoWah' | 'bitCrusher' | 'chebyshev' | 'chorus' | 'distortion' | 'feedbackDelay' | 'freeverb' | 'frequencyShifter' | 'jcReverb' | 'pingPongDelay' | 'pitchShift' | 'reverb' | 'stereoWidener' | 'tremolo' | 'vibrato',
      [x, 1, z],
      'sphere'
    );
  };

  const handleAddPhaserZone = () => createEffectZoneInActiveGrid('phaser');
  const handleAddAutoFilterZone = () => createEffectZoneInActiveGrid('autoFilter');
  const handleAddAutoWahZone = () => createEffectZoneInActiveGrid('autoWah');
  const handleAddBitCrusherZone = () => createEffectZoneInActiveGrid('bitCrusher');
  const handleAddChebyshevZone = () => createEffectZoneInActiveGrid('chebyshev');
  const handleAddChorusZone = () => createEffectZoneInActiveGrid('chorus');
  const handleAddDistortionZone = () => createEffectZoneInActiveGrid('distortion');
  const handleAddFeedbackDelayZone = () => createEffectZoneInActiveGrid('feedbackDelay');
  const handleAddFreeverbZone = () => createEffectZoneInActiveGrid('freeverb');
  const handleAddFrequencyShifterZone = () => createEffectZoneInActiveGrid('frequencyShifter');
  const handleAddJCReverbZone = () => createEffectZoneInActiveGrid('jcReverb');
  const handleAddPingPongDelayZone = () => createEffectZoneInActiveGrid('pingPongDelay');
  const handleAddPitchShiftZone = () => createEffectZoneInActiveGrid('pitchShift');
  const handleAddReverbZone = () => createEffectZoneInActiveGrid('reverb');
  const handleAddStereoWidenerZone = () => createEffectZoneInActiveGrid('stereoWidener');
  const handleAddTremoloZone = () => createEffectZoneInActiveGrid('tremolo');
  const handleAddVibratoZone = () => createEffectZoneInActiveGrid('vibrato');

  return (
    <div className="relative border border-white p-3">
      {/* Decoraciones de esquina */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-2">
          <SpeakerWaveIcon className="w-3 h-3" />
          {t('controls.effectZones')}
        </h3>
        <button
          onClick={() => setIsEffectsExpanded(!isEffectsExpanded)}
          className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
          title={isEffectsExpanded ? t('effects.hideMenu') : t('effects.showMenu')}
        >
          <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
          <span className="relative text-xs font-mono tracking-wider">
            {isEffectsExpanded ? t('controls.hide') : t('controls.show')}
          </span>
        </button>
      </div>

      {isEffectsExpanded && (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          <div className="grid grid-cols-2 gap-1">
            <button onClick={handleAddPhaserZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">{t('controls.phaser')}</span>
            </button>
            <button onClick={handleAddAutoFilterZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">{t('controls.autoFilter')}</span>
            </button>
            <button onClick={handleAddAutoWahZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">{t('controls.autoWah')}</span>
            </button>
            <button onClick={handleAddBitCrusherZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">{t('controls.bitCrusher')}</span>
            </button>
            <button onClick={handleAddChebyshevZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">{t('controls.chebyshev')}</span>
            </button>
            <button onClick={handleAddChorusZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">{t('controls.chorus')}</span>
            </button>
            <button onClick={handleAddDistortionZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">{t('controls.distortion')}</span>
            </button>
            <button onClick={handleAddFeedbackDelayZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">{t('controls.feedbackDelay')}</span>
            </button>
            <button onClick={handleAddFreeverbZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">{t('controls.freeverb')}</span>
            </button>
            <button onClick={handleAddFrequencyShifterZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">{t('controls.freqShifter')}</span>
            </button>
            <button onClick={handleAddJCReverbZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">{t('controls.jcReverb')}</span>
            </button>
            <button onClick={handleAddPingPongDelayZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">{t('controls.pingPong')}</span>
            </button>
            <button onClick={handleAddPitchShiftZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">{t('controls.pitchShift')}</span>
            </button>
            <button onClick={handleAddReverbZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">{t('controls.reverb')}</span>
            </button>
            <button onClick={handleAddStereoWidenerZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">{t('controls.stereoWidener')}</span>
            </button>
            <button onClick={handleAddTremoloZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">{t('controls.trem')}</span>
            </button>
            <button onClick={handleAddVibratoZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">{t('controls.vibrato')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
