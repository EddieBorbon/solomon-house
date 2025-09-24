import { useCallback } from 'react';
import { useWorldStore } from '../state/useWorldStore';
import { useEntitySelector } from './useEntitySelector';

/**
 * Tipos de propiedades de transformación 3D
 */
export type TransformProperty = 'position' | 'rotation' | 'scale';

/**
 * Valores por defecto para resetear transformaciones
 */
export const DEFAULT_TRANSFORM_VALUES = {
  position: [0, 0, 0] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
  scale: [1, 1, 1] as [number, number, number]
} as const;

/**
 * Hook personalizado para manejar transformaciones 3D de entidades
 * 
 * Responsabilidades:
 * - Actualizar posición, rotación y escala de entidades
 * - Resetear transformaciones a valores por defecto
 * - Manejar tanto objetos sonoros como zonas de efectos
 * - Proporcionar utilidades para transformaciones
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo maneja transformaciones 3D
 * - Open/Closed: Fácil extender para nuevos tipos de transformaciones
 * - Dependency Inversion: Depende de abstracciones (hooks)
 */
export function useTransformHandler() {
  const { updateObject, updateEffectZone } = useWorldStore();
  const {
    hasSelection,
    isSoundObject,
    isEffectZone,
    getSoundObject,
    getEffectZone
  } = useEntitySelector();

  /**
   * Actualiza una propiedad de transformación específica
   * @param property - Propiedad a actualizar (position, rotation, scale)
   * @param axis - Eje específico (0=X, 1=Y, 2=Z)
   * @param value - Nuevo valor
   */
  const updateTransform = useCallback((
    property: TransformProperty,
    axis: 0 | 1 | 2,
    value: number
  ) => {
    if (!hasSelection) {
      return;
    }

    if (isSoundObject) {
      const soundObject = getSoundObject();
      if (!soundObject) {
        return;
      }

      const newValues = [...soundObject[property]] as [number, number, number];
      newValues[axis] = value;

      
      updateObject(soundObject.id, {
        [property]: newValues
      });
    } else if (isEffectZone) {
      const effectZone = getEffectZone();
      if (!effectZone) {
        return;
      }

      const newValues = [...effectZone[property]] as [number, number, number];
      newValues[axis] = value;

      
      updateEffectZone(effectZone.id, {
        [property]: newValues
      });
    } else {
    }
  }, [hasSelection, isSoundObject, isEffectZone, getSoundObject, getEffectZone, updateObject, updateEffectZone]);

  /**
   * Resetea todas las transformaciones a valores por defecto
   */
  const resetTransform = useCallback(() => {
    if (!hasSelection) {
      return;
    }


    if (isSoundObject) {
      const soundObject = getSoundObject();
      if (soundObject) {
        updateObject(soundObject.id, DEFAULT_TRANSFORM_VALUES);
      }
    } else if (isEffectZone) {
      const effectZone = getEffectZone();
      if (effectZone) {
        updateEffectZone(effectZone.id, DEFAULT_TRANSFORM_VALUES);
      }
    }
  }, [hasSelection, isSoundObject, isEffectZone, getSoundObject, getEffectZone, updateObject, updateEffectZone]);

  /**
   * Actualiza una transformación completa (todos los ejes)
   * @param property - Propiedad a actualizar
   * @param values - Valores para los 3 ejes [X, Y, Z]
   */
  const setTransform = useCallback((
    property: TransformProperty,
    values: [number, number, number]
  ) => {
    if (!hasSelection) {
      return;
    }


    if (isSoundObject) {
      const soundObject = getSoundObject();
      if (soundObject) {
        updateObject(soundObject.id, {
          [property]: values
        });
      }
    } else if (isEffectZone) {
      const effectZone = getEffectZone();
      if (effectZone) {
        updateEffectZone(effectZone.id, {
          [property]: values
        });
      }
    }
  }, [hasSelection, isSoundObject, isEffectZone, getSoundObject, getEffectZone, updateObject, updateEffectZone]);

  /**
   * Obtiene los valores actuales de una propiedad de transformación
   * @param property - Propiedad a obtener
   * @returns Valores actuales o valores por defecto si no hay selección
   */
  const getTransform = useCallback((property: TransformProperty): [number, number, number] => {
    if (!hasSelection) {
      return DEFAULT_TRANSFORM_VALUES[property];
    }

    if (isSoundObject) {
      const soundObject = getSoundObject();
      return soundObject?.[property] || DEFAULT_TRANSFORM_VALUES[property];
    } else if (isEffectZone) {
      const effectZone = getEffectZone();
      return effectZone?.[property] || DEFAULT_TRANSFORM_VALUES[property];
    }

    return DEFAULT_TRANSFORM_VALUES[property];
  }, [hasSelection, isSoundObject, isEffectZone, getSoundObject, getEffectZone]);

  /**
   * Utilidad para redondear valores decimales
   * @param value - Valor a redondear
   * @param decimals - Número de decimales (por defecto 2)
   * @returns Valor redondeado
   */
  const roundToDecimals = useCallback((value: number, decimals: number = 2): number => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }, []);

  return {
    // Funciones principales
    updateTransform,
    resetTransform,
    setTransform,
    getTransform,
    
    // Utilidades
    roundToDecimals,
    
    // Valores por defecto
    defaultValues: DEFAULT_TRANSFORM_VALUES,
    
    // Estado
    hasSelection,
    canTransform: hasSelection && (isSoundObject || isEffectZone)
  };
}
