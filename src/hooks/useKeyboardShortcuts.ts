import { useEffect } from 'react';
import { useWorldStore } from '../state/useWorldStore';

export function useKeyboardShortcuts() {
  const { 
    setTransformMode, 
    selectEntity, 
    removeObject, 
    removeEffectZone, 
    selectedEntityId,
    objects,
    effectZones 
  } = useWorldStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Solo procesar si no estamos escribiendo en un input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
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
            const soundObject = objects.find(obj => obj.id === selectedEntityId);
            if (soundObject) {
              removeObject(selectedEntityId);
              console.log(`🗑️ Objeto sonoro eliminado: ${selectedEntityId}`);
            } else {
              // Buscar si es una zona de efecto
              const effectZone = effectZones.find(zone => zone.id === selectedEntityId);
              if (effectZone) {
                removeEffectZone(selectedEntityId);
                console.log(`🗑️ Zona de efecto eliminada: ${selectedEntityId}`);
              }
            }
          }
          break;
        // Controles de cámara WASD
        case 'w':
        case 'a':
        case 's':
        case 'd':
        case 'q':
        case 'e':
        case 'shift':
        case ' ':
          event.preventDefault();
          // Los controles de cámara se manejan en el componente Experience
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setTransformMode, selectEntity, removeObject, removeEffectZone, selectedEntityId, objects, effectZones]);
}
