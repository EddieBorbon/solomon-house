'use client';

import React from 'react';
import { useWorldStore } from '../../state/useWorldStore';
import { MobileObjectHeader } from './mobile-editor/MobileObjectHeader';
import { MobileMovementControls } from './mobile-editor/MobileMovementControls';
import { MobileTransformControls } from './mobile-editor/MobileTransformControls';
import { useTransformHandler } from '../../hooks/useTransformHandler';
import { type MobileObject } from '../../state/useWorldStore';

interface MobileObjectEditorProps {
  mobileObject: MobileObject;
  onRemove: (id: string) => void;
}

export function MobileObjectEditor({ mobileObject, onRemove }: MobileObjectEditorProps) {
  const { updateMobileObject } = useWorldStore();
  const { updateTransform, resetTransform, roundToDecimals } = useTransformHandler();

  const handleParamChange = (param: string, value: unknown) => {
    updateMobileObject(mobileObject.id, {
      mobileParams: {
        ...mobileObject.mobileParams,
        [param]: value,
      },
    });
  };

  const handleTransformChange = (property: 'position' | 'rotation' | 'scale', axis: 0 | 1 | 2, value: number) => {
    updateTransform(property, axis, value);
  };

  const handleResetTransform = () => {
    resetTransform();
  };

  return (
    <div className="space-y-4">
      {/* Header con información del objeto móvil */}
      <MobileObjectHeader
        mobileObject={mobileObject}
        onRemove={onRemove}
      />

      {/* Controles de movimiento */}
      <MobileMovementControls
        mobileObject={mobileObject}
        onParamChange={handleParamChange}
      />

      {/* Controles de transformación */}
      <MobileTransformControls
        mobileObject={mobileObject}
        onTransformChange={handleTransformChange}
        onResetTransform={handleResetTransform}
        roundToDecimals={roundToDecimals}
      />
    </div>
  );
}