'use client';

import React from 'react';
import { useWorldStore } from '../../state/useWorldStore';
import { MobileObjectHeader } from './mobile-editor/MobileObjectHeader';
import { MobileMovementControls } from './mobile-editor/MobileMovementControls';
import { MobileTransformControls } from './mobile-editor/MobileTransformControls';
import { MobileSphereControls } from './mobile-editor/MobileSphereControls';
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

  const handleSphereTransformChange = (property: 'spherePosition' | 'sphereRotation' | 'sphereScale', axis: 0 | 1 | 2, value: number) => {
    const currentSphereValue = mobileObject.mobileParams[property] || 
      (property === 'spherePosition' ? [0, 0, 0] : property === 'sphereRotation' ? [0, 0, 0] : [1, 1, 1]);
    const newValues = [...currentSphereValue] as [number, number, number];
    newValues[axis] = value;
    
    updateMobileObject(mobileObject.id, {
      mobileParams: {
        ...mobileObject.mobileParams,
        [property]: newValues,
      },
    });
  };

  const handleResetSphereTransform = () => {
    updateMobileObject(mobileObject.id, {
      mobileParams: {
        ...mobileObject.mobileParams,
        spherePosition: [0, 0, 0],
        sphereRotation: [0, 0, 0],
        sphereScale: [1, 1, 1],
      },
    });
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

      {/* Controles de transformación del grupo completo */}
      <MobileTransformControls
        mobileObject={mobileObject}
        onTransformChange={handleTransformChange}
        onResetTransform={handleResetTransform}
        roundToDecimals={roundToDecimals}
      />

      {/* Controles de transformación de la esfera móvil */}
      <MobileSphereControls
        mobileObject={mobileObject}
        onSphereTransformChange={handleSphereTransformChange}
        onResetSphereTransform={handleResetSphereTransform}
        roundToDecimals={roundToDecimals}
      />
    </div>
  );
}