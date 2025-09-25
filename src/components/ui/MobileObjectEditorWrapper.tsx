'use client';

import React from 'react';
import { MobileObjectEditor } from './MobileObjectEditor';

interface MobileObjectEditorWrapperProps {
  mobileObject: unknown;
  onRemove: (id: string) => void;
}

export function MobileObjectEditorWrapper({ 
  mobileObject, 
  onRemove 
}: MobileObjectEditorWrapperProps) {
  return (
    <MobileObjectEditor 
      mobileObject={mobileObject} 
      onRemove={onRemove} 
    />
  );
}
