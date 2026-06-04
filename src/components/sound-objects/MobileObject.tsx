'use client';

import React, { forwardRef, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group, MeshStandardMaterial, Color, Vector3, BufferGeometry, LineBasicMaterial } from 'three';
import { useWorldStore, type SoundObject } from '../../state/useWorldStore';

// Tipos de movimiento disponibles
export type MovementType = 'circular' | 'polar' | 'random' | 'figure8' | 'spiral';

// Interface para refs de líneas en React Three Fiber
interface LineRef {
  geometry?: BufferGeometry;
}


// Interfaz para los parámetros del objeto móvil
export interface MobileObjectParams {
  movementType: MovementType;
  radius: number;
  speed: number;
  proximityThreshold: number;
  isActive: boolean;
  centerPosition: [number, number, number];
  direction: [number, number, number]; // Para movimiento lineal
  axis: [number, number, number]; // Para movimiento circular
  amplitude: number; // Para movimiento polar
  frequency: number; // Para movimiento polar
  randomSeed: number; // Para movimiento aleatorio
  height: number; // Para movimiento vertical en movimientos circulares/polares
  heightSpeed: number; // Velocidad del movimiento vertical
  showRadiusIndicator?: boolean; // Para mostrar indicador de radio
  showProximityIndicator?: boolean; // Para mostrar indicador de proximidad
  spherePosition?: [number, number, number]; // Posición inicial/offset de la esfera
  sphereRotation?: [number, number, number]; // Rotación de la esfera
  sphereScale?: [number, number, number]; // Escala de la esfera
  showSphere?: boolean; // Mostrar la esfera
}

interface MobileObjectProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  mobileParams: MobileObjectParams;
  onSelect?: (id: string) => void;
  isBeingDragged?: boolean; // Nueva prop para pausar la animación durante el arrastre
}

export const MobileObject = forwardRef<Group, MobileObjectProps>(({
  id,
  position,
  rotation,
  scale,
  isSelected,
  mobileParams,
  onSelect,
  isBeingDragged = false,
}, ref) => {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const lineRef = useRef<LineRef>(null);
  const connectionLineRef = useRef<LineRef>(null);
  const touchLineRef = useRef<LineRef>(null);
  const energyRef = useRef(0);
  const timeRef = useRef(0);
  const [isActivating, setIsActivating] = useState(false);
  const [activatedObjectId, setActivatedObjectId] = useState<string | null>(null);
  const [touchedObjectId, setTouchedObjectId] = useState<string | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);

  const { grids, triggerObjectAttackRelease } = useWorldStore();

  // Función helper para obtener los objetos del mismo grid que este objeto móvil
  const getObjectsInSameGrid = (): SoundObject[] => {
    for (const grid of grids.values()) {
      if (grid.mobileObjects && grid.mobileObjects.some(obj => obj.id === id)) {
        return grid.objects || [];
      }
    }
    return [];
  };

  // Geometrías y materiales memoizados para evitar fugas de memoria
  const lineGeometry = React.useMemo(() => new BufferGeometry().setFromPoints([
    new Vector3(0, 0, 0),
    new Vector3(0, 0, 0)
  ]), []);
  const lineMaterial = React.useMemo(() => new LineBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.8,
    linewidth: 3
  }), []);

  // Crear geometría para la línea de conexión
  const connectionLineGeometry = React.useMemo(() => new BufferGeometry().setFromPoints([
    new Vector3(0, 0, 0),
    new Vector3(0, 0, 0)
  ]), []);
  const connectionLineMaterial = React.useMemo(() => new LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
    linewidth: 2
  }), []);

  // Crear geometría para la línea de toque
  const touchLineGeometry = React.useMemo(() => new BufferGeometry().setFromPoints([
    new Vector3(0, 0, 0),
    new Vector3(0, 0, 0)
  ]), []);
  const touchLineMaterial = React.useMemo(() => new LineBasicMaterial({
    color: 0xff6b6b,
    transparent: true,
    opacity: 0.8,
    linewidth: 4
  }), []);

  // Limpieza manual de recursos WebGL al desmontar el objeto móvil
  useEffect(() => {
    return () => {
      lineGeometry.dispose();
      lineMaterial.dispose();
      connectionLineGeometry.dispose();
      connectionLineMaterial.dispose();
      touchLineGeometry.dispose();
      touchLineMaterial.dispose();
    };
  }, [lineGeometry, lineMaterial, connectionLineGeometry, connectionLineMaterial, touchLineGeometry, touchLineMaterial]);

  // Función para calcular la nueva posición según el tipo de movimiento
  const calculateNewPosition = (time: number): [number, number, number] => {
    const {
      movementType,
      radius = 2,
      speed = 1,
      amplitude = 0.5,
      frequency = 1,
      randomSeed = 0,
      height = 1,
      heightSpeed = 0.5,
      spherePosition = [0, 0, 0] // Posición inicial/offset de la esfera
    } = mobileParams;

    // El objeto se mueve desde la posición inicial de la esfera (spherePosition)
    const origin = spherePosition as [number, number, number];

    switch (movementType) {
      case 'circular': {
        const angle = time * speed;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const yOffset = height * Math.sin(time * heightSpeed); // Movimiento vertical oscilatorio
        return [
          origin[0] + radius * cos,
          origin[1] + yOffset,
          origin[2] + radius * sin
        ];
      }

      case 'polar': {
        const angle = time * speed;
        const r = radius + amplitude * Math.sin(frequency * angle);
        const yOffset = height * Math.sin(time * heightSpeed); // Movimiento vertical oscilatorio
        return [
          origin[0] + r * Math.cos(angle),
          origin[1] + yOffset,
          origin[2] + r * Math.sin(angle)
        ];
      }

      case 'random': {
        // Usar semilla para movimiento pseudo-aleatorio
        const seed = randomSeed + time * 0.1;
        const x = origin[0] + (Math.sin(seed) * radius);
        const z = origin[2] + (Math.cos(seed * 1.3) * radius);
        const y = origin[1] + (Math.sin(seed * 0.7) * height); // Movimiento vertical aleatorio
        return [x, y, z];
      }

      case 'figure8': {
        const angle = time * speed;
        const x = origin[0] + radius * Math.sin(angle);
        const z = origin[2] + radius * Math.sin(2 * angle) * 0.5;
        const yOffset = height * Math.sin(time * heightSpeed); // Movimiento vertical oscilatorio
        return [x, origin[1] + yOffset, z];
      }

      case 'spiral': {
        const angle = time * speed;
        const r = radius * (1 + time * 0.1); // Radio creciente
        const yOffset = height * Math.sin(time * heightSpeed); // Movimiento vertical oscilatorio
        return [
          origin[0] + r * Math.cos(angle),
          origin[1] + yOffset,
          origin[2] + r * Math.sin(angle)
        ];
      }

      default:
        return origin;
    }
  };

  // Función para detectar objetos sonoros cercanos
  const detectNearbyObjects = (relativePos: [number, number, number]): string | null => {
    const { proximityThreshold } = mobileParams;

    // Obtener objetos del mismo grid
    const allObjects = getObjectsInSameGrid();

    // Si no hay objetos en el grid, no hay nada que detectar
    if (allObjects.length === 0) {
      return null;
    }

    // Los objetos móviles están en un sub-espacio desplazado por su `position` en el grid.
    const absolutePos = [
      position[0] + relativePos[0],
      position[1] + relativePos[1],
      position[2] + relativePos[2]
    ] as [number, number, number];

    let closestObjectId: string | null = null;
    let closestDistance = Infinity;

    // Controlar frecuencia de logs (aprox 1 vez por segundo = 60 frames)
    const shouldLog = Math.random() < 0.02;

    for (const obj of allObjects) {
      // Evitar detectarse a sí mismo si por alguna razón está en la lista de objetos
      if (obj.id === id) continue;

      const distance = Math.sqrt(
        Math.pow(absolutePos[0] - obj.position[0], 2) +
        Math.pow(absolutePos[1] - obj.position[1], 2) +
        Math.pow(absolutePos[2] - obj.position[2], 2)
      );

      if (shouldLog) {
        console.log(`[Mobile ${id.substring(0, 4)}] vs [Obj ${obj.id.substring(0, 4)}]: MobilePos: [${absolutePos.map(p => p.toFixed(1)).join(',')}], ObjPos: [${obj.position.join(',')}], Dist: ${distance.toFixed(1)}, Umbral: ${proximityThreshold}`);
      }

      // Encontrar el objeto más cercano dentro del umbral
      if (distance <= proximityThreshold && distance < closestDistance) {
        closestDistance = distance;
        closestObjectId = obj.id;
      }
    }

    if (closestObjectId) {
      console.log(`💥 COLISIÓN: Objeto móvil ${id} tocó objeto: ${closestObjectId} (distancia: ${closestDistance.toFixed(2)})`);
    }

    return closestObjectId;
  };

  // Función para actualizar la línea de activación
  const updateActivationLine = (targetPos: [number, number, number]) => {
    if (lineRef.current && meshRef.current) {
      // Usar la posición relativa del objeto móvil
      const currentPos = new Vector3(
        meshRef.current.position.x,
        meshRef.current.position.y,
        meshRef.current.position.z
      );
      const target = new Vector3(...targetPos);

      lineGeometry.setFromPoints([currentPos, target]);
      if (lineRef.current) {
        lineRef.current.geometry = lineGeometry;
      }
    }
  };

  // Función para actualizar la línea de toque
  const updateTouchLine = (targetPos: [number, number, number]) => {
    if (touchLineRef.current && meshRef.current) {
      // Usar la posición relativa del objeto móvil
      const currentPos = new Vector3(
        meshRef.current.position.x,
        meshRef.current.position.y,
        meshRef.current.position.z
      );
      const target = new Vector3(...targetPos);

      touchLineGeometry.setFromPoints([currentPos, target]);
      if (touchLineRef.current) {
        touchLineRef.current.geometry = touchLineGeometry;
      }
    }
  };

  // Aplicar transformaciones de rotación y escala de la esfera al montar o cuando cambian los parámetros
  useEffect(() => {
    if (meshRef.current) {
      const sphereRotation = mobileParams.sphereRotation || [0, 0, 0];
      const sphereScale = mobileParams.sphereScale || [1, 1, 1];

      meshRef.current.rotation.set(...sphereRotation);
      meshRef.current.scale.set(...sphereScale);
      // La posición se calcula dinámicamente en useFrame basándose en spherePosition como offset
    }
  }, [mobileParams.sphereRotation, mobileParams.sphereScale]);

  // Animación del objeto móvil
  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    // Verificar si el objeto móvil está activo
    if (!mobileParams.isActive) return;

    // Pausar la animación si el objeto está siendo arrastrado manualmente
    if (isBeingDragged) return;

    timeRef.current += delta;

    // Calcular nueva posición relativa al origen del grupo
    const newPosition = calculateNewPosition(timeRef.current);

    // Actualizar posición de la esfera móvil dentro del grupo
    // Esto NO afecta la posición del grupo completo
    meshRef.current.position.set(...newPosition);

    // Aplicar rotación y escala de la esfera desde los parámetros
    const sphereRotation = mobileParams.sphereRotation || [0, 0, 0];
    const sphereScale = mobileParams.sphereScale || [1, 1, 1];
    meshRef.current.rotation.set(...sphereRotation);
    meshRef.current.scale.set(...sphereScale);

    // NO actualizar la posición del grupo completo durante el movimiento
    // La posición del grupo se controla desde los controles de transformación
    // onUpdatePosition(id, newPosition); // Comentado para evitar conflictos

    // Actualizar línea de conexión
    if (connectionLineRef.current) {
      const spherePos = mobileParams.spherePosition || [0, 0, 0];
      connectionLineGeometry.setFromPoints([
        new Vector3(...spherePos), // Punto de origen (posición inicial de la esfera)
        new Vector3(...newPosition) // Posición actual del objeto móvil
      ]);
      if (connectionLineRef.current) {
        connectionLineRef.current.geometry = connectionLineGeometry;
      }
    }

    // Detectar objetos cercanos
    const nearbyObjectId = detectNearbyObjects(newPosition);

    if (nearbyObjectId && nearbyObjectId !== activatedObjectId) {
      // Activar objeto sonoro
      console.log('🎵 Objeto móvil activando objeto sonoro:', nearbyObjectId);
      triggerObjectAttackRelease(nearbyObjectId);
      setActivatedObjectId(nearbyObjectId);
      setTouchedObjectId(nearbyObjectId);
      setTouchStartTime(timeRef.current);
      setIsActivating(true);
      energyRef.current = 1;

      // Actualizar línea de activación
      const allObjects = getObjectsInSameGrid();
      const targetObj = allObjects.find(obj => obj.id === nearbyObjectId);
      if (targetObj) {
        updateActivationLine(targetObj.position);
        updateTouchLine(targetObj.position);
      }
    } else if (!nearbyObjectId && activatedObjectId) {
      // Desactivar objeto sonoro
      setActivatedObjectId(null);
      setTouchedObjectId(null);
      setIsActivating(false);
    }

    // Actualizar línea de toque si hay un objeto tocado
    if (touchedObjectId) {
      const allObjects = getObjectsInSameGrid();
      const targetObj = allObjects.find(obj => obj.id === touchedObjectId);
      if (targetObj) {
        updateTouchLine(targetObj.position);
      }
    }

    // Animación visual del objeto móvil
    if (energyRef.current > 0) {
      energyRef.current *= 0.95; // Decaimiento de la energía

      // Escala pulsante más intensa cuando toca un objeto
      const pulseScale = 1 + energyRef.current * 0.5;
      meshRef.current.scale.set(
        scale[0] * pulseScale,
        scale[1] * pulseScale,
        scale[2] * pulseScale
      );

      // Color basado en la energía - más brillante cuando toca
      const intensity = energyRef.current;
      const color = new Color(0.8 + intensity * 0.2, 0.2 + intensity * 0.8, 0.2 + intensity * 0.8);
      materialRef.current.color.copy(color);
      materialRef.current.emissiveIntensity = intensity * 0.8;
    } else {
      // Resetear a valores por defecto
      meshRef.current.scale.set(scale[0], scale[1], scale[2]);
      materialRef.current.color.setHex(0xff6b6b); // Rojo por defecto
      materialRef.current.emissiveIntensity = 0;
    }

    // Efecto visual adicional cuando toca un objeto sonoro
    if (touchedObjectId) {
      const touchDuration = timeRef.current - touchStartTime;
      const pulseIntensity = Math.sin(touchDuration * 10) * 0.3 + 0.7; // Pulso rápido

      // Escala adicional para el efecto de toque
      const touchScale = 1 + pulseIntensity * 0.2;
      meshRef.current.scale.multiplyScalar(touchScale);

      // Color más brillante durante el toque
      materialRef.current.emissiveIntensity = Math.max(materialRef.current.emissiveIntensity, pulseIntensity * 0.5);
    }
  });

  return (
    <group ref={ref} position={position} rotation={rotation} scale={scale}>
      {/* Área de clic invisible - solo un poco más grande que el objeto móvil */}
      <mesh
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(id);
        }}
      >
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0} // Completamente invisible
          side={2} // DoubleSide para asegurar que funcione desde cualquier ángulo
        />
      </mesh>

      {/* Punto de origen fijo - siempre visible y seleccionable */}
      <mesh
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(id);
        }}
      >
        <sphereGeometry args={[0.15, 12, 8]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Indicador de selección del punto de origen */}
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.2, 12, 8]} />
          <meshBasicMaterial
            color="#ffd93d"
            transparent
            opacity={0.4}
          />
        </mesh>
      )}

      {/* Objeto móvil principal */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(id);
        }}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#ff6b6b"
          transparent
          opacity={(mobileParams?.showSphere ?? true) ? 0.9 : 0}
          visible={(mobileParams?.showSphere ?? true)}
          roughness={0.2}
          metalness={0.3}
          emissive="#000000"
          emissiveIntensity={0}
        />
      </mesh>

      {/* Indicador de selección del objeto móvil */}
      {isSelected && (
        <mesh>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshBasicMaterial
            color="#ffd93d"
            transparent
            opacity={0.3}
          />
        </mesh>
      )}

      {/* Indicador del área de clic cuando está seleccionado */}
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshBasicMaterial
            color="#ffd93d"
            transparent
            opacity={0.1}
            wireframe={true}
          />
        </mesh>
      )}

      {/* Indicador del radio de desplazamiento */}
      {mobileParams?.showRadiusIndicator === true && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[mobileParams.radius * 0.8, mobileParams.radius * 1.2, 64]} />
          <meshBasicMaterial
            color="#00ff88"
            transparent
            opacity={0.3}
            side={2} // DoubleSide
          />
        </mesh>
      )}

      {/* Indicador del umbral de proximidad */}
      {(mobileParams?.showProximityIndicator ?? true) === true && (
        <mesh>
          <sphereGeometry args={[mobileParams.proximityThreshold, 16, 16]} />
          <meshBasicMaterial
            color="#ff6b6b"
            transparent
            opacity={0.1}
            wireframe={true}
          />
        </mesh>
      )}

      {/* Línea de activación */}
      {isActivating && activatedObjectId && (
        // @ts-expect-error - React Three Fiber line ref type compatibility
        <line ref={lineRef} geometry={lineGeometry} material={lineMaterial} />
      )}

      {/* Línea de toque - indicador visual cuando toca un objeto sonoro */}
      {touchedObjectId && (
        // @ts-expect-error - React Three Fiber line ref type compatibility
        <line ref={touchLineRef} geometry={touchLineGeometry} material={touchLineMaterial} />
      )}

      {/* Indicador de estado activo */}
      {mobileParams.isActive && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.1, 8, 6]} />
          <meshStandardMaterial
            color="#00ff88"
            emissive="#00ff88"
            emissiveIntensity={0.8}
          />
        </mesh>
      )}

      {/* Línea que conecta el objeto móvil con el punto de origen */}
      {/* @ts-expect-error - React Three Fiber line ref type compatibility */}
      <line ref={connectionLineRef} geometry={connectionLineGeometry} material={connectionLineMaterial} />
    </group>
  );
});

MobileObject.displayName = 'MobileObject';
