'use client';

import React from 'react';

interface FuturisticSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  unit?: string;
  displayValue?: string | number;
}

export function FuturisticSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  disabled = false,
  unit = '',
  displayValue
}: FuturisticSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const displayVal = displayValue !== undefined ? displayValue : value;

  return (
    <div className="relative">
      <label className="futuristic-label block mb-3 text-white text-xs font-mono tracking-wider">
        {label.toUpperCase()}
      </label>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="futuristic-slider flex-1 h-2 bg-black border border-white rounded-lg appearance-none cursor-pointer"
          disabled={disabled}
          style={{
            background: `linear-gradient(to right, #666666 0%, #666666 ${percentage}%, #333333 ${percentage}%, #333333 100%)`
          }}
        />
        <div className="bg-black border border-white px-3 py-1 min-w-[4rem] text-center">
          <span className="text-white font-mono text-sm tracking-wider">
            {displayVal}{unit}
          </span>
        </div>
      </div>
    </div>
  );
}
