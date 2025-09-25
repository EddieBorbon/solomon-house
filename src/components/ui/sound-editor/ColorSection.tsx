'use client';

import React from 'react';
import { type SoundObject } from '../../../state/useWorldStore';
import { type AudioParams } from '../../../lib/AudioManager';
import { ColorPicker } from '../ColorPicker';
import { FuturisticSlider } from '../FuturisticSlider';

interface ColorSectionProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
}

export function ColorSection({ selectedObject, onParamChange }: ColorSectionProps) {
  return (
    <div className="relative border border-white p-4 mb-4">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        VISUAL_APPEARANCE
      </h4>
      
      {/* Sección de Color */}
      <div className="mb-6">
        <h5 className="futuristic-label mb-3 text-white text-sm text-center border-b border-white/20 pb-2">
          COLOR_PROPERTIES
        </h5>
        <ColorPicker
          value={selectedObject.audioParams.color || '#000000'}
          onChange={(color) => onParamChange('color', color)}
          label="OBJECT_COLOR"
        />
      </div>

      {/* Sección de Material Properties */}
      <div className="mb-6">
        <h5 className="futuristic-label mb-3 text-white text-sm text-center border-b border-white/20 pb-2">
          MATERIAL_PROPERTIES
        </h5>
        
        {/* Metalness */}
        <div className="mb-6">
          <FuturisticSlider
            label="METALNESS"
            value={selectedObject.audioParams.metalness || 0.3}
            min={0}
            max={1}
            step={0.01}
            onChange={(value) => onParamChange('metalness', value)}
            displayValue={(selectedObject.audioParams.metalness || 0.3).toFixed(2)}
          />
        </div>

      {/* Roughness */}
      <div className="mb-6">
        <FuturisticSlider
          label="ROUGHNESS"
          value={selectedObject.audioParams.roughness || 0.2}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => onParamChange('roughness', value)}
          displayValue={(selectedObject.audioParams.roughness || 0.2).toFixed(2)}
        />
      </div>

      {/* Emissive Color */}
      <div className="mb-4">
        <ColorPicker
          value={selectedObject.audioParams.emissiveColor || '#000000'}
          onChange={(color) => onParamChange('emissiveColor', color)}
          label="EMISSIVE_COLOR"
        />
      </div>

      {/* Emissive Intensity */}
      <div className="mb-6">
        <FuturisticSlider
          label="EMISSIVE_INTENSITY"
          value={selectedObject.audioParams.emissiveIntensity || 0}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => onParamChange('emissiveIntensity', value)}
          displayValue={(selectedObject.audioParams.emissiveIntensity || 0).toFixed(2)}
        />
      </div>

      </div>

      {/* Sección de Transparencia */}
      <div className="mb-6">
        <h5 className="futuristic-label mb-3 text-white text-sm text-center border-b border-white/20 pb-2">
          TRANSPARENCY_PROPERTIES
        </h5>
        
        {/* Opacity */}
        <div className="mb-6">
          <FuturisticSlider
            label="OPACITY"
            value={selectedObject.audioParams.opacity || 0.9}
            min={0}
            max={1}
            step={0.01}
            onChange={(value) => onParamChange('opacity', value)}
            displayValue={(selectedObject.audioParams.opacity || 0.9).toFixed(2)}
          />
        </div>

        {/* Blending Mode */}
        <div className="mb-4">
          <label className="futuristic-label block mb-1 text-white text-xs">
            BLENDING_MODE
          </label>
          <select
            value={selectedObject.audioParams.blendingMode || 'NormalBlending'}
            onChange={(e) => onParamChange('blendingMode', e.target.value)}
            className="w-full bg-black/50 border border-white/30 rounded px-3 py-2 text-white text-xs font-mono tracking-wider focus:border-white focus:outline-none"
          >
            <option value="NormalBlending">NORMAL</option>
            <option value="AdditiveBlending">ADDITIVE</option>
            <option value="SubtractiveBlending">SUBTRACTIVE</option>
            <option value="MultiplyBlending">MULTIPLY</option>
          </select>
        </div>
      </div>

      {/* Sección de Animación */}
      <div className="mb-6">
        <h5 className="futuristic-label mb-3 text-white text-sm text-center border-b border-white/20 pb-2">
          ANIMATION_PROPERTIES
        </h5>
        
        {/* Pulse Speed */}
        <div className="mb-6">
          <FuturisticSlider
            label="PULSE_SPEED"
            value={selectedObject.audioParams.pulseSpeed || 2.0}
            min={0}
            max={10}
            step={0.1}
            onChange={(value) => onParamChange('pulseSpeed', value)}
            displayValue={(selectedObject.audioParams.pulseSpeed || 2.0).toFixed(1)}
          />
        </div>

      {/* Pulse Intensity */}
      <div className="mb-6">
        <FuturisticSlider
          label="PULSE_INTENSITY"
          value={selectedObject.audioParams.pulseIntensity || 0.3}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => onParamChange('pulseIntensity', value)}
          displayValue={(selectedObject.audioParams.pulseIntensity || 0.3).toFixed(2)}
        />
      </div>

      {/* Rotation Speed */}
      <div className="mb-6">
        <FuturisticSlider
          label="ROTATION_SPEED"
          value={selectedObject.audioParams.rotationSpeed || 1.0}
          min={0}
          max={10}
          step={0.1}
          onChange={(value) => onParamChange('rotationSpeed', value)}
          displayValue={(selectedObject.audioParams.rotationSpeed || 1.0).toFixed(1)}
        />
      </div>

      {/* Auto Rotate */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          AUTO_ROTATE
        </label>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selectedObject.audioParams.autoRotate || false}
            onChange={(e) => onParamChange('autoRotate', e.target.checked)}
            className="w-4 h-4 bg-black/50 border border-white/30 rounded focus:border-white focus:outline-none"
          />
          <span className="text-white font-mono text-xs tracking-wider">
            {selectedObject.audioParams.autoRotate ? 'ENABLED' : 'DISABLED'}
          </span>
        </div>
      </div>
      </div>

    </div>
  );
}
