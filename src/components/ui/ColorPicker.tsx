'use client';

import React, { useState } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

// Colores predefinidos para objetos sonoros
const predefinedColors = [
  '#4ecdc4', // Turquesa
  '#8b5cf6', // Morado
  '#22c55e', // Verde
  '#ff6b35', // Naranja
  '#dc2626', // Rojo
  '#6366f1', // Índigo
  '#3b82f6', // Azul
  '#4a9eff', // Azul claro
  '#ec4899', // Rosa
  '#00ffff', // Cian
  '#fbbf24', // Amarillo
  '#10b981', // Verde esmeralda
  '#ef4444', // Rojo claro
  '#a855f7', // Púrpura
  '#06b6d4', // Cian oscuro
  '#84cc16', // Lima
];

export function ColorPicker({ value, onChange, label = 'Color', className = '' }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-white">
        {label}
      </label>
      
      <div className="relative">
        {/* Botón que muestra el color actual */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-10 border border-white/30 rounded-lg flex items-center justify-between px-3 bg-black/50 hover:bg-black/70 transition-colors duration-200"
        >
          <div className="flex items-center space-x-3">
            <div 
              className="w-6 h-6 rounded border border-white/20"
              style={{ backgroundColor: value }}
            />
            <span className="text-white text-sm font-mono">{value}</span>
          </div>
          <svg 
            className={`w-4 h-4 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Panel desplegable con colores */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-black border border-white/30 rounded-lg p-3 z-50 shadow-lg">
            {/* Colores predefinidos */}
            <div className="space-y-3">
              <div className="text-xs text-white/70 font-medium">Colores predefinidos</div>
              <div className="grid grid-cols-8 gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    className={`w-8 h-8 rounded border-2 transition-all duration-200 hover:scale-110 ${
                      value === color 
                        ? 'border-white shadow-lg shadow-white/50' 
                        : 'border-white/20 hover:border-white/50'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Separador */}
            <div className="my-3 border-t border-white/20"></div>

            {/* Selector de color personalizado */}
            <div className="space-y-2">
              <div className="text-xs text-white/70 font-medium">Color personalizado</div>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={value}
                  onChange={handleCustomColorChange}
                  className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="flex-1 px-2 py-1 bg-black/50 border border-white/20 rounded text-white text-sm font-mono placeholder-white/50"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
