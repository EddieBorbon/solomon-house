import { useEffect } from 'react';
import { useWorldStore } from '../state/useWorldStore';

export function useKeyboardShortcuts() {
  const { 
    setTransformMode, 
    selectEntity, 
    removeObject, 
    removeEffectZone, 
    removeMobileObject
  } = useWorldStore();

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
          const currentState = useWorldStore.getState();
          if (currentState.selectedEntityId) {
            const currentGrids = currentState.grids;
            
            // Buscar en todas las cuadrículas para encontrar el tipo de entidad
            for (const grid of currentGrids.values()) {
              // Buscar si es un objeto sonoro
              const soundObject = grid.objects.find(obj => obj.id === currentState.selectedEntityId);
              if (soundObject) {
                removeObject(currentState.selectedEntityId);
                break;
              }
              
              // Buscar si es una zona de efecto
              const effectZone = grid.effectZones.find(zone => zone.id === currentState.selectedEntityId);
              if (effectZone) {
                removeEffectZone(currentState.selectedEntityId);
                break;
              }
              
              // Buscar si es un objeto móvil
              const mobileObject = grid.mobileObjects.find(obj => obj.id === currentState.selectedEntityId);
              if (mobileObject) {
                removeMobileObject(currentState.selectedEntityId);
                break;
              }
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
  }, [setTransformMode, selectEntity, removeObject, removeEffectZone, removeMobileObject]);
}
