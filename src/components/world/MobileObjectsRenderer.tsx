'use client';

import React, { useRef, useEffect } from 'react';
import { Group } from 'three';
import { useWorldStore } from '../../state/useWorldStore';
import { MobileObject } from '../sound-objects/MobileObject';

interface MobileObjectsRendererProps {
  entityRefs: Map<string, React.RefObject<Group | null>>;
  isDragging: boolean;
  draggingEntityId: string | null;
}

export function MobileObjectsRenderer({
  entityRefs,
  isDragging,
  draggingEntityId,
}: MobileObjectsRendererProps) {
  const { grids, selectEntity } = useWorldStore();

  const handleEntitySelect = React.useCallback((id: string) => {
    selectEntity(id);
  }, [selectEntity]);

  // Refs para rastrear el estado de arrastre de objetos móviles (local al renderer)
  const mobileDragRefs = useRef(new Map<string, boolean>());
  // Refs para los timers de fin de arrastre
  const mobileDragTimers = useRef(new Map<string, NodeJS.Timeout | null>());

  // Sincronizar el estado de arrastre basado en props
  useEffect(() => {
    if (isDragging && draggingEntityId) {
      // Si se está arrastrando este objeto móvil, marcarlo como arrastrando y limpiar cualquier timer anterior
      mobileDragRefs.current.set(draggingEntityId, true);
      const activeTimer = mobileDragTimers.current.get(draggingEntityId);
      if (activeTimer) {
        clearTimeout(activeTimer);
        mobileDragTimers.current.set(draggingEntityId, null);
      }
    } else {
      // Si no se está arrastrando nada, pero algún objeto móvil estaba marcado como arrastrando,
      // iniciar un timer para volverlo a false tras 1 segundo para evitar snaps bruscos
      for (const [id, dragged] of mobileDragRefs.current.entries()) {
        if (dragged && id !== draggingEntityId) {
          // Si ya había un timer, no crear otro
          if (!mobileDragTimers.current.get(id)) {
            const timer = setTimeout(() => {
              mobileDragRefs.current.set(id, false);
              mobileDragTimers.current.set(id, null);
            }, 1000);
            mobileDragTimers.current.set(id, timer);
          }
        }
      }
    }
  }, [isDragging, draggingEntityId]);

  // Obtener todos los IDs de objetos móviles existentes de forma reactiva
  const allMobileIds = React.useMemo(() => {
    const ids = new Set<string>();
    for (const grid of grids.values()) {
      if (grid.mobileObjects) {
        grid.mobileObjects.forEach(obj => {
          if (obj && obj.id) ids.add(obj.id);
        });
      }
    }
    return ids;
  }, [grids]);

  // Limpiar refs de objetos que ya no existen
  useEffect(() => {
    for (const id of mobileDragRefs.current.keys()) {
      if (!allMobileIds.has(id)) {
        mobileDragRefs.current.delete(id);
      }
    }
    for (const [id, timer] of mobileDragTimers.current.entries()) {
      if (!allMobileIds.has(id)) {
        if (timer) clearTimeout(timer);
        mobileDragTimers.current.delete(id);
      }
    }
  }, [allMobileIds]);

  // Limpieza de timers al desmontar
  useEffect(() => {
    const timers = mobileDragTimers.current;
    return () => {
      for (const timer of timers.values()) {
        if (timer) clearTimeout(timer);
      }
    };
  }, []);

  return (
    <>
      {Array.from(grids.values()).map((grid) => {
        if (!grid || !grid.id) return null;

        const mobileObjects = grid.mobileObjects || [];

        return (
          <group key={grid.id} position={grid.position}>
            {mobileObjects.map((mobileObj) => {
              if (!mobileObj || !mobileObj.id) return null;
              const objectRef = entityRefs.get(mobileObj.id);
              if (!objectRef) return null;

              const isBeingDragged = mobileDragRefs.current.get(mobileObj.id) || false;

              return (
                <MobileObject
                  key={`mobile-${mobileObj.id}`}
                  id={mobileObj.id}
                  position={mobileObj.position}
                  rotation={mobileObj.rotation}
                  scale={mobileObj.scale}
                  isSelected={mobileObj.isSelected}
                  mobileParams={{
                    ...mobileObj.mobileParams,
                    centerPosition: [0, 0, 0]
                  }}
                  onSelect={handleEntitySelect}
                  isBeingDragged={isBeingDragged}
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
