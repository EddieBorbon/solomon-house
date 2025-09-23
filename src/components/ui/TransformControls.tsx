'use client';

import React from 'react';

interface TransformData {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

interface TransformControlsProps {
  transformData: TransformData;
  onReset: () => void;
  disabled?: boolean;
}

export function TransformControls({ transformData, onReset, disabled = false }: TransformControlsProps) {
  const handleCopyToClipboard = () => {
    const transformText = `Position: [${transformData.position.join(', ')}]\nRotation: [${transformData.rotation.join(', ')}]\nScale: [${transformData.scale.join(', ')}]`;
    navigator.clipboard.writeText(transformText);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={onReset}
        className="flex-1 px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Resetear transformación a valores por defecto"
        disabled={disabled}
      >
        🔄 Reset
      </button>
      <button
        onClick={handleCopyToClipboard}
        className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 transition-colors"
        title="Copiar valores al portapapeles"
      >
        📋
      </button>
    </div>
  );
}
