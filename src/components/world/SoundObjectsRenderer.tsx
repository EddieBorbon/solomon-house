import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { useWorldStore, type SoundObject } from '../../state/useWorldStore';
import { SoundObjectRegistry } from './SoundObjectRegistry';
import { disposeObject3D } from '../../lib/three/dispose';
import { useNetworkSmoothing } from '../../hooks/useNetworkSmoothing';
import { audioManager } from '../../lib/AudioManager';
import {
  useVisualSonicStore,
  submitPerceptualGuess,
} from '../../lib/mapping/visualSonicCoherence';
import {
  computeKineticState,
  computeDopplerFrequencyMultiplier,
  computeOrbitPreviewPoints,
  setLiveObjectKineticPosition,
  clearLiveObjectKineticPosition,
  checkInterObjectProximityCollision,
} from '../../lib/movement/soundObjectKinetics';

interface SoundObjectContainerProps {
  object: SoundObject;
  gridPosition: [number, number, number];
  gridSize: number;
  onSelect: (id: string) => void;
  /** true mientras este objeto se arrastra localmente con el gizmo */
  isDragged: boolean;
}

const TRAIL_LENGTH = 24;

const SoundObjectContainer = React.forwardRef<Group, SoundObjectContainerProps>(
  ({ object, gridPosition, gridSize, onSelect, isDragged }, ref) => {
    const { triggerObjectNote, triggerObjectAttackRelease } = useWorldStore();
    const acousmaticMode = useVisualSonicStore((s) => s.acousmaticMode);
    const envelopeGroupRef = useRef<Group>(null);

    const movementEnabled = Boolean(object.audioParams?.movementEnabled);
    const showPath = object.audioParams?.showMovementPath ?? true;
    const showTrail = object.audioParams?.showMovementTrail ?? true;

    // Buffer circular de puntos para la estela cinética (M3) sin re-renders React
    const trailPointsRef = useRef<THREE.Vector3[]>([]);
    const trailGeometry = useMemo(() => {
      const pts = Array.from({ length: TRAIL_LENGTH }, () => new THREE.Vector3(0, 0, 0));
      return new THREE.BufferGeometry().setFromPoints(pts);
    }, []);
    const trailMaterial = useMemo(
      () =>
        new THREE.LineBasicMaterial({
          color: object.audioParams?.color || '#22d3ee',
          transparent: true,
          opacity: 0.65,
        }),
      [object.audioParams?.color]
    );
    const trailLineObject = useMemo(
      () => new THREE.Line(trailGeometry, trailMaterial),
      [trailGeometry, trailMaterial]
    );

    useEffect(() => {
      return () => {
        trailGeometry.dispose();
        trailMaterial.dispose();
        clearLiveObjectKineticPosition(object.id);
      };
    }, [trailGeometry, trailMaterial, object.id]);

    // GC manual de GPU (roadmap 3.1)
    useEffect(() => {
      const groupRef = ref as React.RefObject<Group | null>;
      const node = groupRef?.current;
      return () => {
        disposeObject3D(node as unknown as THREE.Object3D | null);
      };
    }, [ref]);

    // Interpolación de movimiento en red (roadmap 1.5):
    // se suspende tanto durante el arrastre local como cuando el motor cinético M1 lleva el control.
    useNetworkSmoothing(
      ref as React.RefObject<Group | null>,
      object.position,
      !isDragged && !movementEnabled
    );

    // Puntos de previsualización de la órbita 3D (M3)
    const orbitPreviewPoints = useMemo(() => {
      if (!movementEnabled || !showPath) return null;
      return computeOrbitPreviewPoints(
        object.audioParams,
        object.position,
        72,
        (gridSize || 20) / 2
      );
    }, [
      movementEnabled,
      showPath,
      object.position,
      object.audioParams,
      gridSize,
    ]);

    // Bucle por frame: Motor Cinético M1 + Audio Espacial/Doppler M2 + Estela M3 + Colisiones M4
    useFrame(({ clock, camera }) => {
      const groupNode = (ref as React.RefObject<Group | null>)?.current;
      const envNode = envelopeGroupRef.current;

      // 1. Motor Cinético (M1–M4)
      if (groupNode) {
        if (movementEnabled && !isDragged) {
          const halfSize = (gridSize || 20) / 2;
          const { offset, velocity } = computeKineticState(
            object.audioParams,
            clock.elapsedTime,
            object.position,
            halfSize
          );

          const liveLocal: [number, number, number] = [
            object.position[0] + offset[0],
            object.position[1] + offset[1],
            object.position[2] + offset[2],
          ];
          const liveWorld: [number, number, number] = [
            gridPosition[0] + liveLocal[0],
            gridPosition[1] + liveLocal[1],
            gridPosition[2] + liveLocal[2],
          ];

          groupNode.position.set(liveLocal[0], liveLocal[1], liveLocal[2]);
          setLiveObjectKineticPosition(object.id, liveLocal, liveWorld);

          // M2: Actualizar Panner3D / HRTF / Zonas de Efecto con la posición mundial en vivo
          audioManager.updateSoundPosition(object.id, liveWorld);

          // M2: Efecto Doppler acústico opcional
          if (object.audioParams?.dopplerEnabled && object.audioParams?.frequency) {
            const mult = computeDopplerFrequencyMultiplier(
              liveWorld,
              velocity,
              [camera.position.x, camera.position.y, camera.position.z],
              Number(object.audioParams.dopplerIntensity ?? 1.0)
            );
            const baseFreq = Number(object.audioParams.frequency || 440);
            audioManager.updateSoundParams(object.id, {
              frequency: Math.round(baseFreq * mult * 100) / 100,
            });
          }

          // M3: Actualizar estela luminosa detrás del objeto
          if (showTrail) {
            const history = trailPointsRef.current;
            history.push(new THREE.Vector3(liveLocal[0], liveLocal[1], liveLocal[2]));
            if (history.length > TRAIL_LENGTH) {
              history.shift();
            }
            if (history.length >= 2) {
              trailGeometry.setFromPoints(history);
              trailGeometry.attributes.position.needsUpdate = true;
            }
          }

          // M4: Colisiones musicales por proximidad entre figuras
          if (object.audioParams?.triggerOnProximity) {
            const radius = Number(object.audioParams.proximityTriggerRadius ?? 1.8);
            const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
            const collidedIds = checkInterObjectProximityCollision(
              object.id,
              liveWorld,
              radius,
              nowMs
            );
            if (collidedIds.length > 0) {
              triggerObjectAttackRelease(object.id);
              collidedIds.forEach((otherId) => triggerObjectAttackRelease(otherId));
            }
          }
        } else {
          // Objeto estático o siendo arrastrado manualmente: registrar su posición actual
          const liveLocal: [number, number, number] = [
            groupNode.position.x,
            groupNode.position.y,
            groupNode.position.z,
          ];
          const liveWorld: [number, number, number] = [
            gridPosition[0] + liveLocal[0],
            gridPosition[1] + liveLocal[1],
            gridPosition[2] + liveLocal[2],
          ];
          setLiveObjectKineticPosition(object.id, liveLocal, liveWorld);
        }
      }

      // 2. Modulación de escala pulsante por amplitud y envolvente visual (E3)
      if (!envNode) return;

      const vsState = useVisualSonicStore.getState();
      if (vsState.activeTrialTargetId) {
        envNode.scale.set(1, 1, 1);
        return;
      }

      const lastTrig = vsState.lastTriggerTimestamps[object.id] ?? 0;
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const elapsedSec = Math.max(0, (now - lastTrig) / 1000);

      const attack = Math.max(0.01, Number(object.audioParams?.ampAttack ?? 0.05));
      const release = Math.max(0.08, Number(object.audioParams?.ampRelease ?? 0.6));
      let envBoost = 0;
      if (lastTrig > 0 && elapsedSec < attack + release) {
        if (elapsedSec < attack) {
          envBoost = (elapsedSec / attack) * 0.28;
        } else {
          const relProgress = (elapsedSec - attack) / release;
          envBoost = Math.max(0, (1 - relProgress) * (1 - relProgress) * 0.28);
        }
      }

      const continuousAmp = object.audioEnabled
        ? Math.sin(clock.elapsedTime * 5.0) * 0.04 * Number(object.audioParams?.volume ?? 0.6)
        : 0;

      const s = 1 + envBoost + continuousAmp;
      envNode.scale.set(s, s, s);
    });

    const initialPosition = useRef(object.position).current;

    const handleClick = React.useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation();
        onSelect(object.id);

        if (useVisualSonicStore.getState().activeTrialTargetId) {
          submitPerceptualGuess(object.id);
          return;
        }

        if (object.type === 'pyramid') {
          return;
        }

        triggerObjectNote(object.id);
      },
      [object.id, onSelect, triggerObjectNote, object.type]
    );

    const Component = SoundObjectRegistry[object.type];
    if (!Component) return null;

    return (
      <>
        {/* M3: Línea de Órbita 3D en el espacio de la cuadrícula */}
        {!acousmaticMode && movementEnabled && showPath && orbitPreviewPoints && (
          <Line
            points={orbitPreviewPoints}
            color={object.isSelected ? '#22d3ee' : object.audioParams?.color || '#64748b'}
            lineWidth={object.isSelected ? 1.8 : 1.0}
            transparent
            opacity={object.isSelected ? 0.75 : 0.35}
            dashed
            dashSize={0.35}
            gapSize={0.2}
          />
        )}

        {/* M3: Estela luminosa cinética detrás del objeto */}
        {!acousmaticMode && movementEnabled && showTrail && (
          <primitive object={trailLineObject} />
        )}

        <group
          ref={ref}
          position={initialPosition}
          rotation={object.rotation}
          scale={object.scale}
          visible={!acousmaticMode}
          onClick={object.type !== 'cone' ? handleClick : undefined}
        >
          <group ref={envelopeGroupRef}>
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
        </group>
      </>
    );
  }
);

SoundObjectContainer.displayName = 'SoundObjectContainer';

interface SoundObjectsRendererProps {
  entityRefs: Map<string, React.RefObject<Group | null>>;
  isDragging: boolean;
  draggingEntityId: string | null;
}

export function SoundObjectsRenderer({
  entityRefs,
  isDragging,
  draggingEntityId,
}: SoundObjectsRendererProps) {
  const { grids, selectEntity } = useWorldStore();

  const handleEntitySelect = React.useCallback(
    (id: string) => {
      selectEntity(id);
    },
    [selectEntity]
  );

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
                  gridPosition={grid.position}
                  gridSize={grid.gridSize || 20}
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
