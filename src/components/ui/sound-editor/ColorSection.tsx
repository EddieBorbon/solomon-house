'use client';

import React from 'react';
import { type SoundObject } from '../../../state/useWorldStore';
import { type AudioParams } from '../../../lib/AudioManager';
import { ColorPicker } from '../ColorPicker';
import { FuturisticSlider } from '../FuturisticSlider';
import { InfoTooltip } from '../InfoTooltip';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ColorSectionProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
}

export function ColorSection({ selectedObject, onParamChange }: ColorSectionProps) {
  const { t } = useLanguage();
  
  return (
    <div className="relative border border-white p-4 mb-4">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center flex items-center justify-center">
        {t('parameterEditor.visualAppearance')}
      </h4>
      
      {/* Sección de Color */}
      <div className="mb-6">
        <h5 className="futuristic-label mb-3 text-white text-sm text-center border-b border-white/20 pb-2 flex items-center justify-center">
          {t('parameterEditor.colorProperties')}
        </h5>
        <div className="flex items-center justify-center mb-1">
          <label className="futuristic-label text-white text-xs font-mono tracking-wider flex items-center">
            {t('parameterEditor.objectColor').toUpperCase()}
            <InfoTooltip content={t('parameterEditor.tooltips.color')} />
          </label>
        </div>
        <ColorPicker
          value={selectedObject.audioParams.color || '#000000'}
          onChange={(color) => onParamChange('color', color)}
          label={t('parameterEditor.objectColor')}
        />
      </div>

      {/* Sección de Material Properties */}
      <div className="mb-6">
        <h5 className="futuristic-label mb-3 text-white text-sm text-center border-b border-white/20 pb-2 flex items-center justify-center">
          {t('parameterEditor.materialProperties')}
        </h5>
        
        {/* Metalness */}
        <div className="mb-6">
          <FuturisticSlider
            label={t('parameterEditor.metalness')}
            value={selectedObject.audioParams.metalness || 0.3}
            min={0}
            max={1}
            step={0.01}
            onChange={(value) => onParamChange('metalness', value)}
            displayValue={(selectedObject.audioParams.metalness || 0.3).toFixed(2)}
            tooltip={t('parameterEditor.tooltips.metalness')}
          />
        </div>

      {/* Roughness */}
      <div className="mb-6">
        <FuturisticSlider
          label={t('parameterEditor.roughness')}
          value={selectedObject.audioParams.roughness || 0.2}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => onParamChange('roughness', value)}
          displayValue={(selectedObject.audioParams.roughness || 0.2).toFixed(2)}
          tooltip={t('parameterEditor.tooltips.roughness')}
        />
      </div>

      {/* Emissive Color */}
      <div className="mb-4">
        <div className="flex items-center justify-center mb-1">
          <label className="futuristic-label text-white text-xs font-mono tracking-wider flex items-center">
            {t('parameterEditor.emissiveColor').toUpperCase()}
            <InfoTooltip content={t('parameterEditor.tooltips.emissiveColor')} />
          </label>
        </div>
        <ColorPicker
          value={selectedObject.audioParams.emissiveColor || '#000000'}
          onChange={(color) => onParamChange('emissiveColor', color)}
          label={t('parameterEditor.emissiveColor')}
        />
      </div>

      {/* Emissive Intensity */}
      <div className="mb-6">
        <FuturisticSlider
          label={t('parameterEditor.emissiveIntensity')}
          value={selectedObject.audioParams.emissiveIntensity || 0}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => onParamChange('emissiveIntensity', value)}
          displayValue={(selectedObject.audioParams.emissiveIntensity || 0).toFixed(2)}
          tooltip={t('parameterEditor.tooltips.emissiveIntensity')}
        />
      </div>

      </div>

      {/* Sección de Transparencia */}
      <div className="mb-6">
        <h5 className="futuristic-label mb-3 text-white text-sm text-center border-b border-white/20 pb-2 flex items-center justify-center">
          {t('parameterEditor.transparencyProperties')}
        </h5>
        
        {/* Opacity */}
        <div className="mb-6">
          <FuturisticSlider
            label={t('parameterEditor.opacity')}
            value={selectedObject.audioParams.opacity || 0.9}
            min={0}
            max={1}
            step={0.01}
            onChange={(value) => onParamChange('opacity', value)}
            displayValue={(selectedObject.audioParams.opacity || 0.9).toFixed(2)}
            tooltip={t('parameterEditor.tooltips.opacity')}
          />
        </div>

        {/* Blending Mode */}
        <div className="mb-4">
          <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
            {t('parameterEditor.blendingMode')}
            <InfoTooltip content={t('parameterEditor.tooltips.blendingMode')} />
          </label>
          <select
            value={selectedObject.audioParams.blendingMode || 'NormalBlending'}
            onChange={(e) => onParamChange('blendingMode', e.target.value)}
            className="w-full bg-black/50 border border-white/30 rounded px-3 py-2 text-white text-xs font-mono tracking-wider focus:border-white focus:outline-none"
          >
            <option value="NormalBlending">{t('parameterEditor.normal')}</option>
            <option value="AdditiveBlending">{t('parameterEditor.additive')}</option>
            <option value="SubtractiveBlending">{t('parameterEditor.subtractive')}</option>
            <option value="MultiplyBlending">{t('parameterEditor.multiply')}</option>
          </select>
        </div>
      </div>

      {/* Sección de Animación */}
      <div className="mb-6">
        <h5 className="futuristic-label mb-3 text-white text-sm text-center border-b border-white/20 pb-2 flex items-center justify-center">
          {t('parameterEditor.animationProperties')}
        </h5>
        
        {/* Pulse Speed */}
        <div className="mb-6">
          <FuturisticSlider
            label={t('parameterEditor.pulseSpeed')}
            value={selectedObject.audioParams.pulseSpeed || 2.0}
            min={0}
            max={10}
            step={0.1}
            onChange={(value) => onParamChange('pulseSpeed', value)}
            displayValue={(selectedObject.audioParams.pulseSpeed || 2.0).toFixed(1)}
            tooltip={t('parameterEditor.tooltips.pulseSpeed')}
          />
        </div>

      {/* Pulse Intensity */}
      <div className="mb-6">
        <FuturisticSlider
          label={t('parameterEditor.pulseIntensity')}
          value={selectedObject.audioParams.pulseIntensity || 0.3}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => onParamChange('pulseIntensity', value)}
          displayValue={(selectedObject.audioParams.pulseIntensity || 0.3).toFixed(2)}
          tooltip={t('parameterEditor.tooltips.pulseIntensity')}
        />
      </div>

      {/* Rotation Speed */}
      <div className="mb-6">
        <FuturisticSlider
          label={t('parameterEditor.rotationSpeed')}
          value={selectedObject.audioParams.rotationSpeed || 1.0}
          min={0}
          max={10}
          step={0.1}
          onChange={(value) => onParamChange('rotationSpeed', value)}
          displayValue={(selectedObject.audioParams.rotationSpeed || 1.0).toFixed(1)}
          tooltip={t('parameterEditor.tooltips.rotationSpeed')}
        />
      </div>

      {/* Auto Rotate */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          {t('parameterEditor.autoRotate')}
          <InfoTooltip content={t('parameterEditor.tooltips.autoRotate')} />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selectedObject.audioParams.autoRotate || false}
            onChange={(e) => onParamChange('autoRotate', e.target.checked ? 1 : 0)}
            className="w-4 h-4 bg-black/50 border border-white/30 rounded focus:border-white focus:outline-none"
          />
          <span className="text-white font-mono text-xs tracking-wider">
            {selectedObject.audioParams.autoRotate ? t('parameterEditor.enabled') : t('parameterEditor.disabled')}
          </span>
        </div>
      </div>
      </div>

    </div>
  );
}
