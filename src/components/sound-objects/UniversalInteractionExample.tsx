/**
 * UNIVERSAL INTERACTION EXAMPLE
 * 
 * Este archivo muestra cómo implementar la interacción universal
 * en cualquier componente de objeto sonoro de Solomon House.
 * 
 * Los tres tipos de interacción son:
 * 1. Clic corto (trigger) - reproduce una nota con duración configurable
 * 2. Clic sostenido (gate) - mantiene el sonido mientras se presiona
 * 3. Sonido continuo (toggle) - activa/desactiva el sonido permanente desde la UI
 */

import React, { forwardRef, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useWorldStore } from '../../state/useWorldStore';

// Interfaz base para todos los objetos sonoros
interface BaseSoundObjectProps {
  id: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  isSelected: boolean;
  audioEnabled: boolean;
  audioParams: any; // AudioParams específico del tipo
}

// Hook personalizado para interacción universal
export const useUniversalInteraction = (id: string) => {
  const { 
    selectObject, 
    triggerObjectAttackRelease, 
    startObjectGate, 
    stopObjectGate 
  } = useWorldStore();

  // Manejador para clic corto (trigger)
  const handleClick = (event: any) => {
    event.stopPropagation();
    selectObject(id);
    triggerObjectAttackRelease(id);
  };

  // Manejador para clic sostenido (gate)
  const handlePointerDown = (event: any) => {
    event.stopPropagation();
    startObjectGate(id);
  };

  // Manejador para liberar clic sostenido
  const handlePointerUp = (event: any) => {
    event.stopPropagation();
    stopObjectGate(id);
  };

  // Manejador para cuando el puntero sale del objeto
  const handlePointerLeave = (event: any) => {
    event.stopPropagation();
    stopObjectGate(id);
  };

  return {
    handleClick,
    handlePointerDown,
    handlePointerUp,
    handlePointerLeave,
  };
};

// Hook personalizado para animación reactiva
export const useReactiveAnimation = (
  meshRef: React.RefObject<any>,
  materialRef: React.RefObject<any>,
  audioParams: any,
  audioEnabled: boolean
) => {
  const energyRef = useRef(0);

  // Función para activar la animación
  const triggerAnimation = () => {
    energyRef.current = 1;
  };

  // Animación en useFrame
  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current || !audioParams) return;

    // Decaer la energía del clic/gate
    if (energyRef.current > 0) {
      // Calcular la velocidad de decaimiento basada en la duración del sonido
      const duration = audioParams?.duration;
      let decayRate = 0.9; // Decaimiento por defecto
      
      if (duration && duration !== Infinity) {
        // Ajustar la velocidad de decaimiento para que coincida con la duración del sonido
        decayRate = Math.pow(0.1, delta / duration);
      }
      
      energyRef.current *= decayRate;
      
      // Aplicar la energía como escala pulsante
      const pulseScale = 1 + energyRef.current * 0.2;
      if (meshRef.current.scale) {
        if (meshRef.current.scale.setScalar) {
          meshRef.current.scale.setScalar(pulseScale);
        } else {
          meshRef.current.scale.set(pulseScale, pulseScale, pulseScale);
        }
      }
      
      // Cambiar el color basado en la energía
      const intensity = energyRef.current;
      if (materialRef.current.color) {
        // Color base + intensidad (personalizable por tipo de objeto)
        const baseColor = materialRef.current.color;
        const intensityColor = baseColor.clone().multiplyScalar(1 + intensity * 0.3);
        materialRef.current.color.copy(intensityColor);
      }
      
      // Emisión basada en la energía
      if (materialRef.current.emissiveIntensity !== undefined) {
        materialRef.current.emissiveIntensity = intensity * 0.3;
      }
    } else {
      // Resetear a valores por defecto
      if (meshRef.current.scale) {
        if (meshRef.current.scale.setScalar) {
          meshRef.current.scale.setScalar(1);
        } else {
          meshRef.current.scale.set(1, 1, 1);
        }
      }
      
      // Resetear color y emisión
      if (materialRef.current.color) {
        // Restaurar color base (debe ser configurado por el componente)
      }
      
      if (materialRef.current.emissiveIntensity !== undefined) {
        materialRef.current.emissiveIntensity = audioEnabled ? 0.3 : 0;
      }
    }
  });

  return { triggerAnimation };
};

// Ejemplo de implementación para un nuevo tipo de objeto
export const ExampleSoundObject = forwardRef<any, BaseSoundObjectProps>(({
  id,
  position,
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  isSelected,
  audioEnabled,
  audioParams,
}, ref) => {
  const meshRef = useRef<any>(null);
  const materialRef = useRef<any>(null);
  
  // Usar el hook de interacción universal
  const interactionHandlers = useUniversalInteraction(id);
  
  // Usar el hook de animación reactiva
  const { triggerAnimation } = useReactiveAnimation(
    meshRef, 
    materialRef, 
    audioParams, 
    audioEnabled
  );

  // Combinar manejadores para activar animación
  const handleClick = (event: any) => {
    interactionHandlers.handleClick(event);
    triggerAnimation();
  };

  const handlePointerDown = (event: any) => {
    interactionHandlers.handlePointerDown(event);
    triggerAnimation();
  };

  return (
    <group ref={ref} position={position} rotation={rotation} scale={scale}>
      {/* Geometría del objeto */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={interactionHandlers.handlePointerUp}
        onPointerLeave={interactionHandlers.handlePointerLeave}
      >
        {/* Personalizar según el tipo de objeto */}
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#ff6b6b"
          transparent
          opacity={0.9}
          roughness={0.2}
          metalness={0.3}
          emissive="#ff6b6b"
          emissiveIntensity={0}
        />
      </mesh>

      {/* Indicador de selección */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[1.05, 1.05, 1.05]} />
          <meshBasicMaterial
            color="#ffd93d"
            transparent
            opacity={0.3}
          />
        </mesh>
      )}

      {/* Indicador de estado de audio */}
      {audioEnabled && (
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.15, 8, 6]} />
          <meshStandardMaterial
            color="#00ff88"
            emissive="#00ff88"
            emissiveIntensity={0.8}
          />
        </mesh>
      )}
    </group>
  );
});

ExampleSoundObject.displayName = 'ExampleSoundObject';

/**
 * INSTRUCCIONES DE USO:
 * 
 * 1. Importa los hooks en tu componente:
 *    import { useUniversalInteraction, useReactiveAnimation } from './UniversalInteractionExample';
 * 
 * 2. Usa useUniversalInteraction para obtener los manejadores de eventos:
 *    const { handleClick, handlePointerDown, handlePointerUp, handlePointerLeave } = useUniversalInteraction(id);
 * 
 * 3. Usa useReactiveAnimation para la animación reactiva:
 *    const { triggerAnimation } = useReactiveAnimation(meshRef, materialRef, audioParams, audioEnabled);
 * 
 * 4. Combina los manejadores con la activación de animación:
 *    const handleClickWithAnimation = (event) => {
 *      handleClick(event);
 *      triggerAnimation();
 *    };
 * 
 * 5. Aplica los manejadores a tu mesh:
 *    <mesh
 *      onClick={handleClickWithAnimation}
 *      onPointerDown={handlePointerDown}
 *      onPointerUp={handlePointerUp}
 *      onPointerLeave={handlePointerLeave}
 *    >
 * 
 * ¡Y listo! Tu objeto ahora soporta los tres tipos de interacción universal.
 */
