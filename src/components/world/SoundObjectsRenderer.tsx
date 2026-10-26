import React from 'react';
import { Group } from 'three';
import { useWorldStore, type SoundObject } from '../../state/useWorldStore';
import { SoundObjectRegistry } from './SoundObjectRegistry';
import { disposeObject3D } from '../../lib/three/dispose';
import { useNetworkSmoothing } from '../../hooks/useNetworkSmoothing';

interface SoundObjectContainerProps {
  object: SoundObject;
  onSelect: (id: string) => void;
  /** true mientras este objeto se arrastra localmente con el gizmo */
  isDragged: boolean;
}

const SoundObjectContainer = React.forwardRef<Group, SoundObjectContainerProps>(
  ({ object, onSelect, isDragged }, ref) => {
    const { triggerObjectNote } = useWorldStore();

    // GC manual de GPU (roadmap 3.1): al desmontar el contenedor (objeto
    // eliminado o salida de la sala), liberar geometrías, materiales y
    // texturas del subárbol para evitar fugas de VRAM.
    React.useEffect(() => {
      const groupRef = ref as React.RefObject<Group | null>;
      const node = groupRef?.current;
      return () => {
        // Cast: @react-three/xr aumenta Object3D con métodos de pointer
        // capture que el tipo Group plano no refleja
        disposeObject3D(node as unknown as import('three').Object3D | null);
      };
    }, [ref]);

    // Interpolación de movimiento en red (roadmap 1.5): los cambios de
    // posición sincronizados se aplican con suavizado en lugar de saltos.
    // Se suspende durante el arrastre local: el gizmo mueve el nodo
    // directamente y el suavizado lo devolvería a la posición vieja del store.
    useNetworkSmoothing(ref as React.RefObject<Group | null>, object.position, !isDragged);

    // Posición inicial estable: el movimiento posterior lo dirige el
    // suavizado por frame, no la re-aplicación de props de R3F.
    const initialPosition = React.useRef(object.position).current;


    const handleClick = React.useCallback((event: React.MouseEvent) => {
      event.stopPropagation();
      onSelect(object.id);
      
      // Para pirámides, el audio se maneja con onPointerDown/onPointerUp
      if (object.type === 'pyramid') {
        return;
      }
      
      triggerObjectNote(object.id);
    }, [object.id, onSelect, triggerObjectNote, object.type]);

    const Component = SoundObjectRegistry[object.type];
    if (!Component) return null;

    return (
      <group
        ref={ref}
        position={initialPosition}
        rotation={object.rotation}
        scale={object.scale}
        onClick={object.type !== 'cone' ? handleClick : undefined}
      >
        <Component
          id={object.id}
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          scale={[1, 1, 1]}
          isSelected={object.isSelected}
          audioEnabled={object.audioEnabled}
          audioParams={object.audioParams}
          customShapeCode={object.customShapeCode}
        />
      </group>
    );
  }
);

SoundObjectContainer.displayName = 'SoundObjectContainer';

interface SoundObjectsRendererProps {
  entityRefs: Map<string, React.RefObject<Group | null>>;
  isDragging: boolean;
  draggingEntityId: string | null;
}

export function SoundObjectsRenderer({ entityRefs, isDragging, draggingEntityId }: SoundObjectsRendererProps) {
  const { grids, selectEntity } = useWorldStore();

  const handleEntitySelect = React.useCallback((id: string) => {
    selectEntity(id);
  }, [selectEntity]);

  return (
    <>
      {Array.from(grids.values()).map((grid) => {
        if (!grid || !grid.id) return null;
        
        const gridObjects = grid.objects || [];
        
        return (
          <group key={grid.id} position={grid.position}>
            {gridObjects.map((obj) => {
              if (!obj || !obj.id) return null;
              const objectRef = entityRefs.get(obj.id);
              if (!objectRef) return null;
              
              return (
                <SoundObjectContainer
                  key={`sound-${obj.id}`}
                  object={obj}
                  onSelect={handleEntitySelect}
                  isDragged={isDragging && draggingEntityId === obj.id}
                  ref={objectRef}
                />
              );
            })}
          </group>
        );
      })}
    </>
  );
}
