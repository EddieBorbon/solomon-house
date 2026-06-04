'use client';

import React from 'react';
import { Group } from 'three';
import { useWorldStore } from '../../state/useWorldStore';
import { EffectZone } from './EffectZone';

interface EffectZonesRendererProps {
  entityRefs: Map<string, React.RefObject<Group | null>>;
}

export function EffectZonesRenderer({ entityRefs }: EffectZonesRendererProps) {
  const { grids, selectEntity } = useWorldStore();

  const handleEntitySelect = React.useCallback((id: string) => {
    selectEntity(id);
  }, [selectEntity]);

  return (
    <>
      {Array.from(grids.values()).map((grid) => {
        if (!grid || !grid.id) return null;

        const effectZones = grid.effectZones || [];

        return (
          <group key={grid.id} position={grid.position}>
            {effectZones.map((zone) => {
              if (!zone || !zone.id) return null;
              const zoneRef = entityRefs.get(zone.id);
              if (!zoneRef) return null;

              return (
                <EffectZone
                  key={`effect-${zone.id}`}
                  zone={zone}
                  onSelect={handleEntitySelect}
                  ref={zoneRef}
                />
              );
            })}
          </group>
        );
      })}
    </>
  );
}
