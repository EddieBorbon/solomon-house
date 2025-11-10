'use client';

import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

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
  const { t } = useLanguage();

  const handleCopyToClipboard = () => {
    const transformText = `${t('transformEditor.position')}: [${transformData.position.join(', ')}]\n${t('transformEditor.rotation')}: [${transformData.rotation.join(', ')}]\n${t('transformEditor.scale')}: [${transformData.scale.join(', ')}]`;
    navigator.clipboard.writeText(transformText);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={onReset}
        className="flex-1 px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={t('transformEditor.resetTransform')}
        disabled={disabled}
      >
        🔄 {t('transformEditor.reset')}
      </button>
      <button
        onClick={handleCopyToClipboard}
        className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 transition-colors"
        title={t('transformEditor.copyClipboard')}
        aria-label={t('transformEditor.copy')}
      >
        📋
        <span className="sr-only">{t('transformEditor.copy')}</span>
      </button>
    </div>
  );
}
