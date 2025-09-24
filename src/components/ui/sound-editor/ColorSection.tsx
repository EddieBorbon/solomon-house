'use client';

import React from 'react';
import { type SoundObject } from '../../../state/useWorldStore';
import { type AudioParams } from '../../../lib/AudioManager';
import { ColorPicker } from '../ColorPicker';

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
        <div className="mb-4">
          <label className="futuristic-label block mb-1 text-white text-xs">
            METALNESS
          </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={(selectedObject.audioParams as any).metalness || 0.3}
            onChange={(e) => onParamChange('metalness', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {((selectedObject.audioParams as any).metalness || 0.3).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.00</span>
          <span>1.00</span>
        </div>
        <p className="text-xs text-white mt-1 font-mono tracking-wider">
          CONTROLS_METALLIC_APPEARANCE
        </p>
      </div>

      {/* Roughness */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          ROUGHNESS
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={(selectedObject.audioParams as any).roughness || 0.2}
            onChange={(e) => onParamChange('roughness', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {((selectedObject.audioParams as any).roughness || 0.2).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.00</span>
          <span>1.00</span>
        </div>
        <p className="text-xs text-white mt-1 font-mono tracking-wider">
          CONTROLS_SURFACE_ROUGHNESS
        </p>
      </div>

      {/* Emissive Color */}
      <div className="mb-4">
        <ColorPicker
          value={(selectedObject.audioParams as any).emissiveColor || '#000000'}
          onChange={(color) => onParamChange('emissiveColor', color)}
          label="EMISSIVE_COLOR"
        />
      </div>

      {/* Emissive Intensity */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          EMISSIVE_INTENSITY
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={(selectedObject.audioParams as any).emissiveIntensity || 0}
            onChange={(e) => onParamChange('emissiveIntensity', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {((selectedObject.audioParams as any).emissiveIntensity || 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.00</span>
          <span>1.00</span>
        </div>
        <p className="text-xs text-white mt-1 font-mono tracking-wider">
          CONTROLS_EMISSIVE_LIGHT_INTENSITY
        </p>
      </div>

      </div>

      {/* Sección de Transparencia */}
      <div className="mb-6">
        <h5 className="futuristic-label mb-3 text-white text-sm text-center border-b border-white/20 pb-2">
          TRANSPARENCY_PROPERTIES
        </h5>
        
        {/* Opacity */}
        <div className="mb-4">
          <label className="futuristic-label block mb-1 text-white text-xs">
            OPACITY
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={(selectedObject.audioParams as any).opacity || 0.9}
              onChange={(e) => onParamChange('opacity', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
              {((selectedObject.audioParams as any).opacity || 0.9).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
            <span>0.00</span>
            <span>1.00</span>
          </div>
          <p className="text-xs text-white mt-1 font-mono tracking-wider">
            CONTROLS_OBJECT_TRANSPARENCY
          </p>
        </div>

        {/* Blending Mode */}
        <div className="mb-4">
          <label className="futuristic-label block mb-1 text-white text-xs">
            BLENDING_MODE
          </label>
          <select
            value={(selectedObject.audioParams as any).blendingMode || 'NormalBlending'}
            onChange={(e) => onParamChange('blendingMode', e.target.value)}
            className="w-full bg-black/50 border border-white/30 rounded px-3 py-2 text-white text-xs font-mono tracking-wider focus:border-white focus:outline-none"
          >
            <option value="NormalBlending">NORMAL</option>
            <option value="AdditiveBlending">ADDITIVE</option>
            <option value="SubtractiveBlending">SUBTRACTIVE</option>
            <option value="MultiplyBlending">MULTIPLY</option>
          </select>
          <p className="text-xs text-white mt-1 font-mono tracking-wider">
            CONTROLS_MATERIAL_BLENDING
          </p>
        </div>
      </div>

      {/* Sección de Animación */}
      <div className="mb-6">
        <h5 className="futuristic-label mb-3 text-white text-sm text-center border-b border-white/20 pb-2">
          ANIMATION_PROPERTIES
        </h5>
        
        {/* Pulse Speed */}
        <div className="mb-4">
          <label className="futuristic-label block mb-1 text-white text-xs">
            PULSE_SPEED
          </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={(selectedObject.audioParams as any).pulseSpeed || 2.0}
            onChange={(e) => onParamChange('pulseSpeed', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {((selectedObject.audioParams as any).pulseSpeed || 2.0).toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.0</span>
          <span>10.0</span>
        </div>
        <p className="text-xs text-white mt-1 font-mono tracking-wider">
          CONTROLS_PULSE_SPEED_WHEN_PLAYING
        </p>
      </div>

      {/* Pulse Intensity */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          PULSE_INTENSITY
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={(selectedObject.audioParams as any).pulseIntensity || 0.3}
            onChange={(e) => onParamChange('pulseIntensity', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {((selectedObject.audioParams as any).pulseIntensity || 0.3).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.00</span>
          <span>1.00</span>
        </div>
        <p className="text-xs text-white mt-1 font-mono tracking-wider">
          CONTROLS_PULSE_INTENSITY
        </p>
      </div>

      {/* Rotation Speed */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          ROTATION_SPEED
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={(selectedObject.audioParams as any).rotationSpeed || 1.0}
            onChange={(e) => onParamChange('rotationSpeed', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {((selectedObject.audioParams as any).rotationSpeed || 1.0).toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.0</span>
          <span>10.0</span>
        </div>
        <p className="text-xs text-white mt-1 font-mono tracking-wider">
          CONTROLS_AUTO_ROTATION_SPEED
        </p>
      </div>

      {/* Auto Rotate */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          AUTO_ROTATE
        </label>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(selectedObject.audioParams as any).autoRotate || false}
            onChange={(e) => onParamChange('autoRotate', e.target.checked)}
            className="w-4 h-4 bg-black/50 border border-white/30 rounded focus:border-white focus:outline-none"
          />
          <span className="text-white font-mono text-xs tracking-wider">
            {(selectedObject.audioParams as any).autoRotate ? 'ENABLED' : 'DISABLED'}
          </span>
        </div>
        <p className="text-xs text-white mt-1 font-mono tracking-wider">
          CONTROLS_AUTO_ROTATION_TOGGLE
        </p>
      </div>
      </div>

    </div>
  );
}
