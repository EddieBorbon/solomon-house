'use client';

import React, { forwardRef, useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group, MeshStandardMaterial, Color, Vector3, BufferGeometry, LineBasicMaterial } from 'three';
import { useWorldStore } from '../../state/useWorldStore';

// Tipos de movimiento disponibles
export type MovementType = 'linear' | 'circular' | 'polar' | 'random' | 'figure8' | 'spiral';

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
  showRadiusIndicator?: boolean; // Para mostrar indicador de radio
  showProximityIndicator?: boolean; // Para mostrar indicador de proximidad
}

interface MobileObjectProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  mobileParams: MobileObjectParams;
  onUpdatePosition: (id: string, position: [number, number, number]) => void;
  onSelect?: (id: string) => void;
}

export const MobileObject = forwardRef<Group, MobileObjectProps>(({
  id,
  position,
  rotation,
  scale,
  isSelected,
  mobileParams,
  onUpdatePosition,
  onSelect,
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
  
  // Obtener todos los objetos de todas las cuadrículas
  const allObjects = useMemo(() => {
    const objects: any[] = [];
    grids.forEach((grid) => {
      objects.push(...grid.objects);
    });
    return objects;
  }, [grids]);

  // Crear geometría para la línea de activación
  const lineGeometry = new BufferGeometry().setFromPoints([
    new Vector3(0, 0, 0),
    new Vector3(0, 0, 0)
  ]);
  const lineMaterial = new LineBasicMaterial({ 
    color: 0x00ff88, 
    transparent: true, 
    opacity: 0.8,
    linewidth: 3
  });

  // Crear geometría para la línea de conexión
  const connectionLineGeometry = new BufferGeometry().setFromPoints([
    new Vector3(0, 0, 0),
    new Vector3(0, 0, 0)
  ]);
  const connectionLineMaterial = new LineBasicMaterial({ 
    color: 0xffffff, 
    transparent: true, 
    opacity: 0.5,
    linewidth: 2
  });

  // Crear geometría para la línea de toque
  const touchLineGeometry = new BufferGeometry().setFromPoints([
    new Vector3(0, 0, 0),
    new Vector3(0, 0, 0)
  ]);
  const touchLineMaterial = new LineBasicMaterial({ 
    color: 0xff6b6b, 
    transparent: true, 
    opacity: 0.8,
    linewidth: 4
  });

  // Función para calcular la nueva posición según el tipo de movimiento
  const calculateNewPosition = (time: number): [number, number, number] => {
    const { movementType, radius, speed, direction, amplitude, frequency, randomSeed } = mobileParams;
    
    // El objeto se mueve desde el origen (0,0,0) del grupo
    const origin = [0, 0, 0] as [number, number, number];
    
    switch (movementType) {
      case 'linear': {
        const normalizedDirection = new Vector3(...direction).normalize();
        const offset = normalizedDirection.multiplyScalar(time * speed);
        return [
          origin[0] + offset.x,
          origin[1] + offset.y,
          origin[2] + offset.z
        ];
      }
      
      case 'circular': {
        const angle = time * speed;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return [
          origin[0] + radius * cos,
          origin[1],
          origin[2] + radius * sin
        ];
      }
      
      case 'polar': {
        const angle = time * speed;
        const r = radius + amplitude * Math.sin(frequency * angle);
        return [
          origin[0] + r * Math.cos(angle),
          origin[1],
          origin[2] + r * Math.sin(angle)
        ];
      }
      
      case 'random': {
        // Usar semilla para movimiento pseudo-aleatorio
        const seed = randomSeed + time * 0.1;
        const x = origin[0] + (Math.sin(seed) * radius);
        const z = origin[2] + (Math.cos(seed * 1.3) * radius);
        return [x, origin[1], z];
      }
      
      case 'figure8': {
        const angle = time * speed;
        const x = origin[0] + radius * Math.sin(angle);
        const z = origin[2] + radius * Math.sin(2 * angle) * 0.5;
        return [x, origin[1], z];
      }
      
      case 'spiral': {
        const angle = time * speed;
        const r = radius * (1 + time * 0.1); // Radio creciente
        return [
          origin[0] + r * Math.cos(angle),
          origin[1] + time * 0.5, // Movimiento vertical
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
    
    // Calcular la posición absoluta del objeto móvil
    const absolutePos: [number, number, number] = [
      position[0] + relativePos[0],
      position[1] + relativePos[1],
      position[2] + relativePos[2]
    ];
    
    // Debug: Log de objetos disponibles
    if (allObjects.length > 0) {
    }
    
    for (const obj of allObjects) {
      const distance = Math.sqrt(
        Math.pow(absolutePos[0] - obj.position[0], 2) +
        Math.pow(absolutePos[1] - obj.position[1], 2) +
        Math.pow(absolutePos[2] - obj.position[2], 2)
      );
      
      // Debug: Log de distancias
      if (distance <= proximityThreshold * 2) { // Log si está cerca del doble del umbral
      }
      
      if (distance <= proximityThreshold) {
        return obj.id;
      }
    }
    
    return null;
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

  // Animación del objeto móvil
  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current || !mobileParams.isActive) return;

    timeRef.current += delta;
    
    // Calcular nueva posición
    const newPosition = calculateNewPosition(timeRef.current);
    
    // Actualizar posición del objeto
    meshRef.current.position.set(...newPosition);
    onUpdatePosition(id, newPosition);

    // Actualizar línea de conexión
    if (connectionLineRef.current) {
      connectionLineGeometry.setFromPoints([
        new Vector3(0, 0, 0), // Punto de origen
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
      triggerObjectAttackRelease(nearbyObjectId);
      setActivatedObjectId(nearbyObjectId);
      setTouchedObjectId(nearbyObjectId);
      setTouchStartTime(timeRef.current);
      setIsActivating(true);
      energyRef.current = 1;
      
      // Actualizar línea de activación
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
          opacity={0.9}
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
      {mobileParams.showRadiusIndicator && (
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
      {mobileParams.showProximityIndicator && (
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
