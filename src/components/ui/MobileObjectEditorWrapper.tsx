'use client';

import React from 'react';
import { MobileObjectEditor } from './MobileObjectEditor';
import { type MobileObject } from '../../state/useWorldStore';

interface MobileObjectEditorWrapperProps {
  mobileObject: MobileObject;
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
