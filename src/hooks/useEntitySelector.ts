import { useMemo } from 'react';
import { useWorldStore, type SoundObject, type EffectZone, type MobileObject } from '../state/useWorldStore';
import { useObjectStore } from '../stores/useObjectStore';

/**
 * Tipos de entidades que pueden ser seleccionadas
 */
export type EntityType = 'soundObject' | 'mobileObject' | 'effectZone';

/**
 * Entidad seleccionada con su tipo y datos
 */
export interface SelectedEntity {
  type: EntityType;
  data: SoundObject | MobileObject | EffectZone;
}

/**
 * Hook personalizado para manejar la selección de entidades en el mundo 3D
 * 
 * Responsabilidades:
 * - Buscar entidades por ID en todas las cuadrículas
 * - Determinar el tipo de entidad seleccionada
 * - Proporcionar información sobre la entidad actual
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo maneja la lógica de selección
 * - Open/Closed: Fácil extender para nuevos tipos de entidades
 */
export function useEntitySelector() {
  const { grids, selectedEntityId } = useWorldStore();

  // Encontrar la entidad seleccionada (objeto sonoro, objeto móvil o zona de efecto)
  const selectedEntity = useMemo((): SelectedEntity | null => {
    console.log(`🔍 EntitySelector - Buscando entidad con ID: ${selectedEntityId}`);
    console.log(`🔍 EntitySelector - Cuadrículas disponibles:`, Array.from(grids.keys()));
    
    if (!selectedEntityId) {
      console.log(`🔍 EntitySelector - No hay entidad seleccionada`);
      return null;
    }
    
    // Buscar en objetos sonoros usando el ObjectStore
    const objectStore = useObjectStore.getState();
    const soundObject = objectStore.getObjectById(selectedEntityId);
    if (soundObject) {
      console.log(`✅ EntitySelector - Objeto sonoro encontrado en ObjectStore:`, soundObject);
      return { type: 'soundObject', data: soundObject };
    }
    
    // Buscar en objetos móviles y zonas de efectos en las cuadrículas
    for (const grid of grids.values()) {
      console.log(`🔍 EntitySelector - Buscando en cuadrícula ${grid.id}:`, {
        mobileObjects: grid.mobileObjects.length,
        effectZones: grid.effectZones.length
      });
      
      // Buscar en objetos móviles
      const mobileObject = grid.mobileObjects.find(obj => obj.id === selectedEntityId);
      if (mobileObject) {
        console.log(`✅ EntitySelector - Objeto móvil encontrado:`, mobileObject);
        return { type: 'mobileObject', data: mobileObject };
      }
      
      // Buscar en zonas de efectos
      const effectZone = grid.effectZones.find(zone => zone.id === selectedEntityId);
      if (effectZone) {
        console.log(`✅ EntitySelector - Zona de efecto encontrada:`, effectZone);
        return { type: 'effectZone', data: effectZone };
      }
    }
    
    console.log(`❌ EntitySelector - Entidad ${selectedEntityId} no encontrada`);
    return null;
  }, [grids, selectedEntityId]);

  // Helper functions para verificar el tipo de entidad
  const isSoundObject = useMemo(() => selectedEntity?.type === 'soundObject', [selectedEntity?.type]);
  const isMobileObject = useMemo(() => selectedEntity?.type === 'mobileObject', [selectedEntity?.type]);
  const isEffectZone = useMemo(() => selectedEntity?.type === 'effectZone', [selectedEntity?.type]);

  // Helper functions para obtener datos tipados
  const getSoundObject = (): SoundObject | null => {
    return isSoundObject ? selectedEntity?.data as SoundObject : null;
  };

  const getMobileObject = (): MobileObject | null => {
    return isMobileObject ? selectedEntity?.data as MobileObject : null;
  };

  const getEffectZone = (): EffectZone | null => {
    return isEffectZone ? selectedEntity?.data as EffectZone : null;
  };

  return {
    // Estado principal
    selectedEntity,
    selectedEntityId,
    
    // Helpers de tipo
    isSoundObject,
    isMobileObject,
    isEffectZone,
    
    // Helpers de datos tipados
    getSoundObject,
    getMobileObject,
    getEffectZone,
    
    // Estado de selección
    hasSelection: selectedEntity !== null
  };
}
