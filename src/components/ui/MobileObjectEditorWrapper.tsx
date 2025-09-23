'use client';

import React from 'react';
import { MobileObjectEditor } from './MobileObjectEditor';

interface MobileObjectEditorWrapperProps {
  mobileObject: any;
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
