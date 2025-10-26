'use client';

import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export function NoSelectionMessage() {
  const { t } = useLanguage();
  
  return (
    <div className="futuristic-param-container">
      <h4 className="futuristic-label mb-4 text-white text-center">
        {t('noSelection.selectObject')}
      </h4>
      <div className="text-center">
        <p className="text-sm text-white font-mono tracking-wider mb-4 px-4">
          {t('noSelection.clickToEdit')}
        </p>
        <div className="text-xs text-white font-mono tracking-wider">
          {t('noSelection.objectsAppear')}
        </div>
      </div>
    </div>
  );
}
