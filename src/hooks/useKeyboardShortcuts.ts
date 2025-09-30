import { useEffect, useMemo } from 'react';
import { useWorldStore, type SoundObject, type EffectZone, type MobileObject } from '../state/useWorldStore';
import { useGridStore } from '../stores/useGridStore';

export function useKeyboardShortcuts() {
  const { 
    setTransformMode, 
    selectEntity, 
    removeObject, 
    removeEffectZone, 
    removeMobileObject,
    selectedEntityId
  } = useWorldStore();

  const { grids } = useGridStore();

  // Obtener todos los objetos de todas las cuadrículas
  const allObjects = useMemo(() => {
    const objects: SoundObject[] = [];
    const effectZones: EffectZone[] = [];
    const mobileObjects: MobileObject[] = [];
    
    if (grids) {
      Array.from(grids.values()).forEach((grid) => {
        objects.push(...grid.objects);
        effectZones.push(...grid.effectZones);
        mobileObjects.push(...grid.mobileObjects);
      });
    }
    
    return { objects, effectZones, mobileObjects };
  }, [grids]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Solo procesar si no estamos escribiendo en un input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Log para debug de atajos de teclado
      if (['delete', 'backspace', 'escape', 'g', 'r', 's'].includes(event.key.toLowerCase())) {
      }

      switch (event.key.toLowerCase()) {
        case 'g':
          event.preventDefault();
          setTransformMode('translate');
          break;
        case 'r':
          event.preventDefault();
          setTransformMode('rotate');
          break;
        case 's':
          event.preventDefault();
          setTransformMode('scale');
          break;
        case 'escape':
          event.preventDefault();
          // ESC: Salir del modo edición - deseleccionar entidad y resetear modo
          selectEntity(null);
          setTransformMode('translate');
          break;
        case 'delete':
        case 'backspace':
          event.preventDefault();
          // DEL/BACKSPACE: Eliminar la entidad seleccionada
          if (selectedEntityId) {
            // Buscar si es un objeto sonoro
            const soundObject = allObjects.objects.find(obj => obj.id === selectedEntityId);
            if (soundObject) {
              removeObject(selectedEntityId).catch(error => {
                console.error('Error al eliminar objeto:', error);
              });
              return;
            }
            
            // Buscar si es una zona de efecto
            const effectZone = allObjects.effectZones.find(zone => zone.id === selectedEntityId);
            if (effectZone) {
              removeEffectZone(selectedEntityId).catch(error => {
                console.error('Error al eliminar zona de efecto:', error);
              });
              return;
            }
            
            // Buscar si es un objeto móvil
            const mobileObject = allObjects.mobileObjects.find(obj => obj.id === selectedEntityId);
            if (mobileObject) {
              removeMobileObject(selectedEntityId).catch(error => {
                console.error('Error al eliminar objeto móvil:', error);
              });
              return;
            }
            
          }
          break;
        // Controles de cámara WASD - no interceptar, dejar que se manejen en useCameraControls
        case 'w':
        case 'a':
        case 's':
        case 'd':
        case 'q':
        case 'e':
        case 'shift':
        case ' ':
          // No hacer preventDefault para permitir que useCameraControls los maneje
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setTransformMode, selectEntity, removeObject, removeEffectZone, removeMobileObject, selectedEntityId, allObjects]);
}
