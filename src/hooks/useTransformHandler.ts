import { useCallback } from 'react';
import { useWorldStore } from '../state/useWorldStore';
import { useGridStore } from '../stores/useGridStore';
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
  const { 
    // updateObject, // No utilizado 
    updateEffectZone,
    // Funciones globales
    updateGlobalSoundObject,
    updateGlobalEffectZone
  } = useWorldStore();
  
  const { activeGridId } = useGridStore();
  const {
    hasSelection,
    isSoundObject,
    isEffectZone,
    getSoundObject,
    getEffectZone
  } = useEntitySelector();

  // Detectar si estamos en modo global
  const isGlobalMode = activeGridId === 'global-world';
  console.log('🎛️ useTransformHandler: Detección de modo global', { activeGridId, isGlobalMode });

  /**
   * Actualiza una propiedad de transformación específica
   * @param property - Propiedad a actualizar (position, rotation, scale)
   * @param axis - Eje específico (0=X, 1=Y, 2=Z)
   * @param value - Nuevo valor
   */
  const updateTransform = useCallback(async (
    property: TransformProperty,
    axis: 0 | 1 | 2,
    value: number
  ) => {
    console.log('🎛️ useTransformHandler.updateTransform: INICIANDO', { property, axis, value, hasSelection });
    
    if (!hasSelection) {
      console.log('🎛️ useTransformHandler.updateTransform: No hay selección');
      return;
    }

    if (isSoundObject) {
      console.log('🎛️ useTransformHandler.updateTransform: Es un objeto sonoro');
      const soundObject = getSoundObject();
      if (!soundObject) {
        console.log('🎛️ useTransformHandler.updateTransform: No se pudo obtener el objeto sonoro');
        return;
      }

      console.log('🎛️ useTransformHandler.updateTransform: Objeto sonoro encontrado', { id: soundObject.id, currentTransform: { position: soundObject.position, rotation: soundObject.rotation, scale: soundObject.scale } });

      const newValues = [...soundObject[property]] as [number, number, number];
      newValues[axis] = value;

      console.log('🎛️ useTransformHandler.updateTransform: Nueva transformación calculada', { property, newValues, isGlobalMode });

      // TEMPORAL: Forzar uso de updateGlobalSoundObject para transformaciones
      // ya que activeGridId está undefined pero el objeto está en global-world
      console.log('🎛️ useTransformHandler.updateTransform: Forzando modo global - updateGlobalSoundObject');
      await updateGlobalSoundObject(soundObject.id, {
        [property]: newValues,
        // Preservar datos de audio y otras transformaciones
        audioParams: soundObject.audioParams,
        position: property === 'position' ? newValues : soundObject.position,
        rotation: property === 'rotation' ? newValues : soundObject.rotation,
        scale: property === 'scale' ? newValues : soundObject.scale
      });
      console.log('🎛️ useTransformHandler.updateTransform: updateGlobalSoundObject completado');
    } else if (isEffectZone) {
      const effectZone = getEffectZone();
      if (!effectZone) {
        return;
      }

      const newValues = [...effectZone[property]] as [number, number, number];
      newValues[axis] = value;

      // Usar función global o local según el modo
      if (isGlobalMode) {
        await updateGlobalEffectZone(effectZone.id, {
          [property]: newValues
        });
      } else {
        updateEffectZone(effectZone.id, {
          [property]: newValues
        });
      }
    } else {
      // No hay entidad seleccionada válida
    }
  }, [hasSelection, isSoundObject, isEffectZone, getSoundObject, getEffectZone, updateEffectZone, updateGlobalSoundObject, updateGlobalEffectZone, isGlobalMode]);

  /**
   * Resetea todas las transformaciones a valores por defecto
   */
  const resetTransform = useCallback(async () => {
    if (!hasSelection) {
      return;
    }

      if (isSoundObject) {
        const soundObject = getSoundObject();
        if (soundObject) {
          // TEMPORAL: Forzar uso de updateGlobalSoundObject para transformaciones
          console.log('🎛️ useTransformHandler.resetTransform: Forzando modo global - updateGlobalSoundObject');
          await updateGlobalSoundObject(soundObject.id, {
            ...DEFAULT_TRANSFORM_VALUES,
            // Preservar datos de audio
            audioParams: soundObject.audioParams
          });
          console.log('🎛️ useTransformHandler.resetTransform: updateGlobalSoundObject completado');
        }
    } else if (isEffectZone) {
      const effectZone = getEffectZone();
      if (effectZone) {
        // Usar función global o local según el modo
        if (isGlobalMode) {
          await updateGlobalEffectZone(effectZone.id, DEFAULT_TRANSFORM_VALUES);
        } else {
          updateEffectZone(effectZone.id, DEFAULT_TRANSFORM_VALUES);
        }
      }
    }
  }, [hasSelection, isSoundObject, isEffectZone, getSoundObject, getEffectZone, updateEffectZone, updateGlobalSoundObject, updateGlobalEffectZone, isGlobalMode]);

  /**
   * Actualiza una transformación completa (todos los ejes)
   * @param property - Propiedad a actualizar
   * @param values - Valores para los 3 ejes [X, Y, Z]
   */
  const setTransform = useCallback(async (
    property: TransformProperty,
    values: [number, number, number]
  ) => {
    if (!hasSelection) {
      return;
    }

      if (isSoundObject) {
        const soundObject = getSoundObject();
        if (soundObject) {
          // TEMPORAL: Forzar uso de updateGlobalSoundObject para transformaciones
          console.log('🎛️ useTransformHandler.setTransform: Forzando modo global - updateGlobalSoundObject');
          await updateGlobalSoundObject(soundObject.id, {
            [property]: values,
            // Preservar datos de audio y otras transformaciones
            audioParams: soundObject.audioParams,
            position: property === 'position' ? values : soundObject.position,
            rotation: property === 'rotation' ? values : soundObject.rotation,
            scale: property === 'scale' ? values : soundObject.scale
          });
          console.log('🎛️ useTransformHandler.setTransform: updateGlobalSoundObject completado');
        }
    } else if (isEffectZone) {
      const effectZone = getEffectZone();
      if (effectZone) {
        // Usar función global o local según el modo
        if (isGlobalMode) {
          await updateGlobalEffectZone(effectZone.id, {
            [property]: values
          });
        } else {
          updateEffectZone(effectZone.id, {
            [property]: values
          });
        }
      }
    }
  }, [hasSelection, isSoundObject, isEffectZone, getSoundObject, getEffectZone, updateEffectZone, updateGlobalSoundObject, updateGlobalEffectZone, isGlobalMode]);

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
