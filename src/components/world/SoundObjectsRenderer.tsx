import React from 'react';
import { Group } from 'three';
import { useWorldStore, type SoundObject } from '../../state/useWorldStore';
import { SoundObjectRegistry } from './SoundObjectRegistry';

interface SoundObjectContainerProps {
  object: SoundObject;
  onSelect: (id: string) => void;
}

const SoundObjectContainer = React.forwardRef<Group, SoundObjectContainerProps>(
  ({ object, onSelect }, ref) => {
    const { triggerObjectNote } = useWorldStore();
    
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
        position={object.position}
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
}

export function SoundObjectsRenderer({ entityRefs }: SoundObjectsRendererProps) {
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
