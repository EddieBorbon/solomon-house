'use client';

import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { TransformControls } from '@react-three/drei';
import { Group } from 'three';
import { useWorldStore, type SoundObject, type MobileObject as MobileObjectType, type EffectZone as EffectZoneType } from '../../state/useWorldStore';
import { type AudioParams } from '../../lib/factories/SoundSourceFactory';
import { SoundCube } from '../sound-objects/SoundCube';
import { SoundSphere } from '../sound-objects/SoundSphere';
import { SoundCylinder } from '../sound-objects/SoundCylinder';
import { SoundCone } from '../sound-objects/SoundCone';
import { SoundPyramid } from '../sound-objects/SoundPyramid';
import { SoundIcosahedron } from '../sound-objects/SoundIcosahedron';
import { SoundPlane } from '../sound-objects/SoundPlane';
import { SoundTorus } from '../sound-objects/SoundTorus';
import { SoundDodecahedronRing } from '../sound-objects/SoundDodecahedronRing';
import { SoundSpiral } from '../sound-objects/SoundSpiral';
import { SoundCustom } from '../sound-objects/SoundCustom';
import { MobileObject } from '../sound-objects/MobileObject';
import { EffectZone } from './EffectZone';
import { GridRenderer } from './GridRenderer';
import { CameraController } from './CameraController';
import { useEffectZoneDetection } from '../../hooks/useEffectZoneDetection';
import { audioManager } from '../../lib/AudioManager';

interface SceneContentProps {
  orbitControlsRef: React.RefObject<{
    enabled: boolean;
    update: () => void;
    reset: () => void;
  } | null>;
}

// Componente contenedor para cada objeto de sonido
interface SoundObjectContainerProps {
  object: SoundObject;
  onSelect: (id: string) => void;
}

const SoundObjectContainer = React.forwardRef<Group, SoundObjectContainerProps>(
  ({ object, onSelect }, ref) => {
    const { triggerObjectNote } = useWorldStore();
    
    const handleClick = useCallback((event: React.MouseEvent) => {
      event.stopPropagation();
      onSelect(object.id);
      
      // Para pirámides, solo selección (el audio se maneja con onPointerDown/onPointerUp)
      if (object.type === 'pyramid') {
        // No hacer nada de audio aquí, se maneja en el componente SoundPyramid
        return;
      }
      
      // Para conos, disparar la nota (el audio se maneja con triggerObjectNote)
      if (object.type === 'cone') {
        triggerObjectNote(object.id);
      } else if (object.type === 'icosahedron' || object.type === 'plane' || object.type === 'torus') {
        // Para icosaedros, planos y toroides, solo disparar la nota (sonido percusivo)
        triggerObjectNote(object.id);
      } else if (object.type === 'dodecahedronRing') {
        // Para anillos de dodecaedros, disparar acorde (sonido percusivo)
        triggerObjectNote(object.id);
      } else if (object.type === 'spiral') {
        // Para espirales, disparar la nota (sonido percusivo)
        triggerObjectNote(object.id);
      } else {
        // Para otros objetos, solo disparar la nota
        triggerObjectNote(object.id);
      }
    }, [object.id, onSelect, triggerObjectNote, object.type]);

    return (
      <group
        ref={ref}
        position={object.position}
        rotation={object.rotation}
        scale={object.scale}
        onClick={object.type !== 'cone' ? handleClick : undefined}
      >
        {/* Renderizado según el tipo de objeto */}
        {object.type === 'cube' ? (
          <SoundCube
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams as unknown as AudioParams}
          />
        ) : object.type === 'sphere' ? (
          <SoundSphere
            id={object.id}
            position={[0, 0, 0]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams as unknown as AudioParams}
          />
        ) : object.type === 'cylinder' ? (
          <SoundCylinder
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams as unknown as AudioParams}
          />
        ) : object.type === 'cone' ? (
          <SoundCone
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams as unknown as AudioParams}
          />
        ) : object.type === 'pyramid' ? (
          <SoundPyramid
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams as unknown as AudioParams}
          />
        ) : object.type === 'icosahedron' ? (
          <SoundIcosahedron
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams as unknown as AudioParams}
          />
        ) : object.type === 'plane' ? (
          <SoundPlane
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams as unknown as AudioParams}
          />
        ) : object.type === 'torus' ? (
          <SoundTorus
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams as unknown as AudioParams}
          />
        ) : object.type === 'dodecahedronRing' ? (
          <SoundDodecahedronRing
            id={object.id}
            position={[0, 0, 0]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams as unknown as AudioParams}
          />
        ) : object.type === 'spiral' ? (
          <SoundSpiral
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams as unknown as AudioParams}
          />
        ) : object.type === 'custom' ? (
          <SoundCustom
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams as unknown as AudioParams}
            customShapeCode={object.customShapeCode}
          />
        ) : null}
      </group>
    );
  }
);

SoundObjectContainer.displayName = 'SoundObjectContainer';

// Componente principal de la escena
export function SceneContent({ orbitControlsRef }: SceneContentProps) {
  const { 
    grids, 
    selectedEntityId, 
    transformMode, 
    updateObject, 
    updateMobileObject,
    updateEffectZone, 
    selectEntity,
    loadGrid,
    setActiveGrid,
    getGridKey
  } = useWorldStore();

  // Inicializar la cuadrícula por defecto si no hay ninguna
  useEffect(() => {
    if (grids.size === 0) {
      loadGrid([0, 0, 0]);
      const defaultGridKey = getGridKey([0, 0, 0]);
      setActiveGrid(defaultGridKey);
    }
  }, [grids.size, loadGrid, setActiveGrid, getGridKey]);
  
  // Obtener objetos directamente del useObjectStore organizados por cuadrícula
  const allObjects = useMemo(() => {
    const objects: SoundObject[] = [];
    const mobileObjects: MobileObjectType[] = [];
    const effectZones: EffectZoneType[] = [];
    
    // Convertir Map a Array para que useMemo detecte cambios correctamente
    const gridsArray = Array.from(grids.values());
    
    
    gridsArray.forEach((grid) => {
      // Usar objetos directamente de la cuadrícula (useWorldStore) en lugar del ObjectStore
      const gridObjects = grid.objects || [];
      
      // Usar objetos de la cuadrícula directamente
      objects.push(...gridObjects.filter(obj => obj && obj.id));
      
      // Mantener objetos móviles y zonas de efectos de la cuadrícula
      if (Array.isArray(grid.mobileObjects)) {
        mobileObjects.push(...grid.mobileObjects.filter(obj => obj && obj.id));
      }
      if (Array.isArray(grid.effectZones)) {
        effectZones.push(...grid.effectZones.filter(zone => zone && zone.id));
      }
    });
    
    return { objects, mobileObjects, effectZones };
  }, [grids]);
  
  // Usar el hook de detección de zonas de efectos
  useEffectZoneDetection();
  
  // Crear un Map de refs para cada objeto y zona de efecto
  // Usar useRef para mantener las referencias entre renders y evitar que se pierdan
  // cuando se actualizan los objetos
  const entityRefsRef = React.useRef(new Map<string, React.RefObject<Group | null>>());
  
  // Actualizar el mapa de refs cuando cambian los objetos, pero preservar las referencias existentes
  const entityRefs = useMemo(() => {
    const refs = entityRefsRef.current;
    
    // Crear un Set de IDs existentes para identificar qué refs ya tenemos
    const existingIds = new Set(refs.keys());
    
    // Agregar refs para objetos sonoros que no existan
    allObjects.objects.forEach(obj => {
      if (!existingIds.has(obj.id)) {
        refs.set(obj.id, React.createRef<Group | null>());
      }
    });
    
    // Agregar refs para objetos móviles que no existan
    allObjects.mobileObjects.forEach(obj => {
      if (!existingIds.has(obj.id)) {
        refs.set(obj.id, React.createRef<Group | null>());
      }
    });
    
    // Agregar refs para zonas de efectos que no existan
    allObjects.effectZones.forEach(zone => {
      if (!existingIds.has(zone.id)) {
        refs.set(zone.id, React.createRef<Group | null>());
      }
    });
    
    // Limpiar refs de objetos que ya no existen
    const currentIds = new Set([
      ...allObjects.objects.map(obj => obj.id),
      ...allObjects.mobileObjects.map(obj => obj.id),
      ...allObjects.effectZones.map(zone => zone.id)
    ]);
    
    for (const [id] of refs) {
      if (!currentIds.has(id)) {
        refs.delete(id);
      }
    }
    
    return refs;
  }, [allObjects]);

  // Crear refs auxiliares para los gizmos de objetos móviles
  // Estos grupos vacíos estarán siempre en el centro del objeto móvil (esfera grande de wireframe)
  // const mobileGizmoRefs = useMemo(() => {
  //   const refs = new Map<string, React.RefObject<Group | null>>();
  //   
  //   allObjects.mobileObjects.forEach(obj => {
  //     refs.set(obj.id, React.createRef<Group | null>());
  //   });
  //   
  //   return refs;
  // }, [allObjects.mobileObjects]);

  // Refs para rastrear el estado de arrastre de objetos móviles
  const mobileDragRefs = useRef(new Map<string, React.MutableRefObject<boolean>>());
  
  // Refs para los timers de fin de arrastre de objetos móviles
  const mobileDragTimers = useRef(new Map<string, NodeJS.Timeout | null>());
  
  // Inicializar refs de arrastre para objetos móviles
  useEffect(() => {
    allObjects.mobileObjects.forEach(obj => {
      if (!mobileDragRefs.current.has(obj.id)) {
        mobileDragRefs.current.set(obj.id, { current: false });
      }
      if (!mobileDragTimers.current.has(obj.id)) {
        mobileDragTimers.current.set(obj.id, null);
      }
    });
    
    // Limpiar refs de objetos que ya no existen
    const existingIds = new Set(allObjects.mobileObjects.map(obj => obj.id));
    for (const [id] of mobileDragRefs.current) {
      if (!existingIds.has(id)) {
        mobileDragRefs.current.delete(id);
      }
    }
    for (const [id] of mobileDragTimers.current) {
      if (!existingIds.has(id)) {
        const timer = mobileDragTimers.current.get(id);
        if (timer) clearTimeout(timer);
        mobileDragTimers.current.delete(id);
      }
    }
  }, [allObjects.mobileObjects]);


  // Estado para rastrear si se está arrastrando (para UI)
  const [isDragging, setIsDragging] = React.useState(false);
  
  // Ref para rastrear si estamos arrastrando sin causar re-renders
  const isDraggingRef = React.useRef(false);
  const draggingEntityIdRef = React.useRef<string | null>(null);
  
  // Protección: Resetear estado de arrastre si el mouse se suelta fuera del viewport
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        // Log silenciado - reset global de arrastre
        setIsDragging(false);
        isDraggingRef.current = false;
        draggingEntityIdRef.current = null;
      }
    };
    
    const handleGlobalMouseLeave = () => {
      if (isDraggingRef.current) {
        // Log silenciado - reset global de arrastre
        setIsDragging(false);
        isDraggingRef.current = false;
        draggingEntityIdRef.current = null;
      }
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mouseleave', handleGlobalMouseLeave);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mouseleave', handleGlobalMouseLeave);
    };
  }, [isDragging]);

  // Estado para forzar re-render cuando se selecciona un objeto (para asegurar que el ref esté conectado)
  const [forceRender, setForceRender] = React.useState(0);
  
  // Efecto para forzar un re-render cuando se selecciona una entidad
  // Esto ayuda a asegurar que el gizmo se renderice cuando el objeto esté montado
  React.useEffect(() => {
    if (selectedEntityId) {
      // Usar requestAnimationFrame para asegurar que el DOM esté actualizado
      // Dar tiempo a React para conectar el ref antes de intentar renderizar el gizmo
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setForceRender(prev => prev + 1);
        });
      });
    }
  }, [selectedEntityId]);

  // Función para manejar cambios en las transformaciones
  const handleTransformChange = useCallback((entityId: string, newTransform: { position?: { x: number, y: number, z: number }, rotation?: { x: number, y: number, z: number }, scale?: { x: number, y: number, z: number } }) => {
    if (newTransform) {
      // Determinar si es un objeto sonoro, móvil o una zona de efecto
      const isSoundObject = allObjects.objects.some(obj => obj.id === entityId);
      const isMobileObject = allObjects.mobileObjects.some(obj => obj.id === entityId);
      const isEffectZone = allObjects.effectZones.some(zone => zone.id === entityId);
      
      // Usar refs para verificar si estamos arrastrando (sin causar re-renders)
      const isCurrentlyDragging = isDraggingRef.current && draggingEntityIdRef.current === entityId;
      
      if (newTransform.position) {
        // Convertir posición mundial a posición local
        let localPosition = [newTransform.position.x, newTransform.position.y, newTransform.position.z];
        
        // Encontrar la cuadrícula que contiene este objeto para convertir a posición local
        for (const grid of grids.values()) {
          if (grid.objects.some(obj => obj.id === entityId) ||
              grid.mobileObjects.some(obj => obj.id === entityId) ||
              grid.effectZones.some(zone => zone.id === entityId)) {
            // Convertir a posición local: posición mundial - posición de la cuadrícula
            localPosition = [
              newTransform.position.x - grid.position[0],
              newTransform.position.y - grid.position[1],
              newTransform.position.z - grid.position[2]
            ];
            break;
          }
        }
        
        // Durante el arrastre, actualizar directamente el grupo de Three.js sin tocar el store
        if (isCurrentlyDragging) {
          const objectRef = entityRefs.get(entityId);
          if (objectRef?.current) {
            // Actualizar directamente la posición del grupo de Three.js
            objectRef.current.position.set(localPosition[0], localPosition[1], localPosition[2]);
            
            // Para zonas de efectos, actualizar audio inmediatamente
            if (isEffectZone) {
              try {
                audioManager.updateEffectZonePosition(entityId, localPosition as [number, number, number]);
              } catch (error) {
                console.error('Error updating effect zone position:', error);
              }
            }
          }
        }
        // NO actualizar el store durante onObjectChange para evitar re-renders que ocultan el gizmo
        // El estado se actualizará solo cuando se suelte el mouse (onMouseUp)
        return;
      }
      
      // Para rotación y escala, actualizar directamente el objeto durante el arrastre
      if (isCurrentlyDragging) {
        const objectRef = entityRefs.get(entityId);
        if (objectRef?.current) {
          if (newTransform.rotation) {
            objectRef.current.rotation.set(newTransform.rotation.x, newTransform.rotation.y, newTransform.rotation.z);
          }
          if (newTransform.scale) {
            objectRef.current.scale.set(newTransform.scale.x, newTransform.scale.y, newTransform.scale.z);
          }
        }
        // NO actualizar el store durante onObjectChange
        return;
      }
      
      // Si no estamos arrastrando y hay cambios de rotación o escala, actualizar el store
      // (esto solo debería pasar en casos especiales, normalmente solo actualizamos en onMouseUp)
      const updates: Record<string, unknown> = {};
      
      if (newTransform.rotation) {
        updates.rotation = [newTransform.rotation.x, newTransform.rotation.y, newTransform.rotation.z];
      }
      
      if (newTransform.scale) {
        updates.scale = [newTransform.scale.x, newTransform.scale.y, newTransform.scale.z];
      }
      
      // Solo actualizar el store si hay updates y NO estamos arrastrando
      if (Object.keys(updates).length > 0) {
        if (isSoundObject) {
          updateObject(entityId, updates);
        } else if (isMobileObject) {
          updateMobileObject(entityId, updates);
        } else if (isEffectZone) {
          updateEffectZone(entityId, updates);
        }
      }
    }
  }, [updateObject, updateMobileObject, updateEffectZone, allObjects, grids, entityRefs]);

  // Función para manejar la selección de entidades
  const handleEntitySelect = useCallback((id: string) => {
    selectEntity(id);
  }, [selectEntity]);

  // Función para manejar clic en el espacio vacío
  const handleBackgroundClick = useCallback((event: { object?: { type?: string; geometry?: { type?: string } } }) => {
    // No deseleccionar si estamos arrastrando el gizmo
    if (isDragging) {
      return;
    }
    
    // Solo deseleccionar si se hace clic directamente en el fondo (no en un objeto)
    if (event.object === undefined || event.object.type === 'Mesh' && event.object.geometry?.type === 'PlaneGeometry') {
      selectEntity(null);
    }
  }, [selectEntity, isDragging]);

  // Funciones de transformación removidas - no se utilizan actualmente

  // Efecto para asegurar que OrbitControls SIEMPRE esté habilitado
  React.useEffect(() => {
    if (orbitControlsRef.current) {
      // FORZAR OrbitControls SIEMPRE HABILITADO - NUNCA BLOQUEAR LA CÁMARA
      orbitControlsRef.current.enabled = true;
      console.log('✅ SceneContent: OrbitControls garantizado como habilitado');
    }
  }, [orbitControlsRef]);

  const releasePointerCaptures = useCallback((element?: HTMLElement | null) => {
    if (!element || typeof element.releasePointerCapture !== 'function') {
      return;
    }

    const canCheckCapture = typeof element.hasPointerCapture === 'function';

    for (let pointerId = 0; pointerId < 10; pointerId++) {
      try {
        if (!canCheckCapture || element.hasPointerCapture(pointerId)) {
          element.releasePointerCapture(pointerId);
        }
      } catch {
        // Ignorar errores si el puntero no estaba capturado o el navegador no soporta la operación
      }
    }
  }, []);

  // Función de emergencia para desbloquear y resetear la cámara
  const handleEmergencyCameraUnlock = useCallback((event: KeyboardEvent) => {
    // Presionar 'C' para restaurar el movimiento de rotación con clic derecho
    if (event.key.toLowerCase() === 'c' && !(event.target as HTMLElement)?.tagName?.match(/INPUT|TEXTAREA/)) {
      // Prevenir que otros handlers procesen C
      event.preventDefault();
      event.stopPropagation();
      
      console.log('🔑 Tecla C presionada - Restaurando controles de rotación...');
      
      if (orbitControlsRef.current) {
        try {
          const controls = orbitControlsRef.current as {
            enabled: boolean;
            _domElement?: HTMLElement;
            domElement?: HTMLElement;
            _state?: Record<string, number>;
            [key: string]: unknown;
          };
          
          // MÉTODO MÁS EFECTIVO: Deshabilitar y volver a habilitar para forzar reset completo del estado
          // Esto resetea todo el estado interno de OrbitControls incluyendo el estado de los botones del mouse
          
          // Paso 1: Obtener el elemento DOM
          const domElement = controls._domElement || controls.domElement || document.querySelector('canvas');
          
          // Paso 2: Liberar cualquier puntero capturado de forma segura
          releasePointerCaptures(domElement);
          
          // Paso 3: Deshabilitar temporalmente OrbitControls (esto resetea el estado interno)
          controls.enabled = false;
          
          // Paso 4: Resetear estado interno manualmente si es accesible
          try {
            // OrbitControls v0.37+ usa un objeto _state
            if (controls._state && typeof controls._state === 'object') {
              const state = controls._state;
              // Resetear todos los estados de botones a -1 (ninguno presionado)
              if (typeof state.MOUSEDOWN === 'number') state.MOUSEDOWN = -1;
              if (typeof state.POINTER_DOWN === 'number') state.POINTER_DOWN = -1;
              if (typeof state.TOUCH_DOWN === 'number') state.TOUCH_DOWN = -1;
              
              // También resetear estados de interacción
              if (typeof state.ROTATE_START === 'number') state.ROTATE_START = -1;
              if (typeof state.PAN_START === 'number') state.PAN_START = -1;
              if (typeof state.DOLLY_START === 'number') state.DOLLY_START = -1;
            }
            
            // Intentar resetear otras propiedades que puedan mantener estado
            const stateProps = ['_touchStart', '_panStart', '_rotateStart', '_dollyStart'];
            stateProps.forEach(prop => {
              if (controls[prop] !== undefined) {
                try {
                  const propValue = controls[prop];
                  if (typeof propValue === 'object' && propValue !== null) {
                    // Si es un objeto, resetear sus propiedades
                    Object.keys(propValue).forEach(key => {
                      const keyValue = (propValue as Record<string, unknown>)[key];
                      if (typeof keyValue === 'number') {
                        (propValue as Record<string, number>)[key] = -1;
                      }
                    });
                  }
                } catch {
                  // Ignorar errores
                }
              }
            });
          } catch {
            // Ignorar errores de acceso al estado interno
          }
          
          // Paso 5: Pequeño delay para asegurar que los eventos se procesen
          setTimeout(() => {
            if (orbitControlsRef.current) {
              const controls = orbitControlsRef.current as {
                enabled: boolean;
                enableRotate?: boolean;
                update: () => void;
              };
              
              // Rehabilitar con todas las configuraciones correctas
              controls.enabled = true;
              
              if (typeof controls.enableRotate !== 'undefined') {
                controls.enableRotate = true;
              }
              
              // Forzar actualización
              controls.update();
              
              console.log('✅ SceneContent: Estado de rotación con clic derecho restaurado con tecla C');
            }
          }, 10);
          
        } catch (error) {
          console.error('❌ SceneContent: Error al restaurar rotación:', error);
          // Fallback: solo habilitar
          if (orbitControlsRef.current) {
            orbitControlsRef.current.enabled = true;
            const controlsFallback = orbitControlsRef.current as { enabled: boolean; enableRotate?: boolean; update: () => void };
            if (typeof controlsFallback.enableRotate !== 'undefined') {
              controlsFallback.enableRotate = true;
            }
            orbitControlsRef.current.update();
          }
        }
      } else {
        console.warn('🚨 SceneContent: No se puede restaurar rotación - OrbitControls no disponible');
      }
    }
    
    // Presionar 'F' para forzar habilitación inmediata
    if (event.key.toLowerCase() === 'f' && !(event.target as HTMLElement)?.tagName?.match(/INPUT|TEXTAREA/)) {
      if (orbitControlsRef.current) {
        try {
          orbitControlsRef.current.enabled = true;
          orbitControlsRef.current.update();
          console.log('⚡ SceneContent: OrbitControls forzado como habilitado con tecla F');
        } catch (error) {
          console.warn('⚠️ SceneContent: Error al forzar habilitación:', error);
        }
      }
    }
  }, [orbitControlsRef]);

  // Agregar listener de teclado para desbloqueo de emergencia
  // Usar capture: true para asegurar que se ejecute antes que otros handlers
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      handleEmergencyCameraUnlock(event);
    };
    
    // Agregar con capture para máxima prioridad
    window.addEventListener('keydown', handler, { capture: true });
    
    console.log('✅ Listener de tecla C registrado para restaurar rotación');
    
    return () => {
      window.removeEventListener('keydown', handler, { capture: true });
    };
  }, [handleEmergencyCameraUnlock]);

  // Agregar listener para detectar cuando el mouse sale del canvas y liberar estado
  useEffect(() => {
    if (!orbitControlsRef.current) return;
    
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    const handleMouseLeave = () => {
      // Cuando el mouse sale del canvas, liberar cualquier estado de botón presionado
      if (orbitControlsRef.current) {
        try {
          const controls = orbitControlsRef.current as {
            _domElement?: HTMLElement;
            domElement?: HTMLElement;
            _state?: Record<string, number>;
            update: () => void;
          };
          
          // Liberar todos los punteros
          const domElement = controls._domElement || controls.domElement || canvas;
          releasePointerCaptures(domElement);
          
          // Resetear estado interno
          if (controls._state) {
            const state = controls._state;
            if (typeof state.MOUSEDOWN === 'number') state.MOUSEDOWN = -1;
            if (typeof state.POINTER_DOWN === 'number') state.POINTER_DOWN = -1;
          }
          
          controls.update();
        } catch {
          // Ignorar errores silenciosamente
        }
      }
    };
    
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [orbitControlsRef, releasePointerCaptures]);

  // Verificar que está leyendo el estado correctamente (solo cuando cambie)
  useEffect(() => {
    // Log solo en desarrollo y solo cuando realmente cambien los objetos
    if (process.env.NODE_ENV === 'development') {
      console.log('SceneContent: Estado actualizado', {
        objects: allObjects.objects.length,
        mobileObjects: allObjects.mobileObjects.length,
        effectZones: allObjects.effectZones.length,
        grids: grids.size
      });
    }
  }, [allObjects.objects.length, allObjects.mobileObjects.length, allObjects.effectZones.length, grids.size]);

  // Estado para mostrar indicador de cámara bloqueada
  const [showCameraBlockedIndicator, setShowCameraBlockedIndicator] = React.useState(false);
  
  // Efecto para detectar cuando la cámara está bloqueada
  useEffect(() => {
    const interval = setInterval(() => {
      if (orbitControlsRef.current && !orbitControlsRef.current.enabled) {
        setShowCameraBlockedIndicator(true);
      } else {
        setShowCameraBlockedIndicator(false);
      }
    }, 1000); // Verificar cada segundo
    
    return () => clearInterval(interval);
  }, [orbitControlsRef]);

  return (
    <>
      {/* Controlador de cámara para navegación entre cuadrículas */}
      <CameraController />
      
      {/* Renderizador de cuadrículas */}
      <GridRenderer />
      
      {/* Plano invisible para capturar clics en el espacio vacío */}
      <mesh 
        position={[0, -10, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleBackgroundClick}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Renderizado de cuadrículas con sus objetos */}
      {Array.from(grids.values()).map((grid) => {
        if (!grid || !grid.id) return null;
        
        // Usar objetos directamente de la cuadrícula
        const gridObjects = grid.objects || [];
        
        return (
          <group key={grid.id} position={grid.position}>
          {/* Renderizado de objetos sonoros de esta cuadrícula */}
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

          {/* Renderizado de objetos móviles de esta cuadrícula */}
          {Array.isArray(grid.mobileObjects) && grid.mobileObjects.map((mobileObj) => {
            if (!mobileObj || !mobileObj.id) return null;
            const objectRef = entityRefs.get(mobileObj.id);
            if (!objectRef) return null;
            
            // Verificar si este objeto móvil está siendo arrastrado
            const isDraggingThisMobile = mobileDragRefs.current.get(mobileObj.id);
            const isBeingDragged = isDraggingThisMobile?.current || false;
            
            return (
              <MobileObject
                key={`mobile-${mobileObj.id}`}
                id={mobileObj.id}
                position={mobileObj.position} // Posición del objeto móvil completo en el mundo
                rotation={mobileObj.rotation}
                scale={mobileObj.scale}
                isSelected={mobileObj.isSelected}
                mobileParams={{
                  ...mobileObj.mobileParams,
                  centerPosition: [0, 0, 0] // Centro relativo al grupo (origen del movimiento)
                }}
                onSelect={handleEntitySelect}
                isBeingDragged={isBeingDragged}
                ref={objectRef}
              />
            );
          })}

          {/* Renderizado de zonas de efectos de esta cuadrícula */}
          {Array.isArray(grid.effectZones) && grid.effectZones.map((zone) => {
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

      {/* TransformControls para la entidad seleccionada */}
      {selectedEntityId && (() => {
        // Buscar la entidad directamente en las cuadrículas para obtener los datos más actualizados
        let selectedEntity = null;
        let foundGrid = null;
        
        for (const grid of grids.values()) {
          const soundObj = grid.objects.find(obj => obj.id === selectedEntityId);
          const mobileObj = grid.mobileObjects.find(obj => obj.id === selectedEntityId);
          const effectZone = grid.effectZones.find(zone => zone.id === selectedEntityId);
          
          if (soundObj) {
            selectedEntity = soundObj;
            foundGrid = grid;
            break;
          } else if (mobileObj) {
            selectedEntity = mobileObj;
            foundGrid = grid;
            break;
          } else if (effectZone) {
            selectedEntity = effectZone;
            foundGrid = grid;
            break;
          }
        }
        
        if (!selectedEntity || !foundGrid) return null;
        
        // Obtener la referencia del objeto antes de verificar
        const objectRef = entityRefs.get(selectedEntityId);
        
        // Si la referencia no existe aún, intentar esperar un frame más
        // Esto ayuda con el timing de React cuando se selecciona un objeto recién renderizado
        if (!objectRef) {
          return null;
        }
        
        // Si es una zona de efecto, verificar si está oculta (wireframe y color desactivados)
        if ('type' in selectedEntity && selectedEntity.type !== 'mobile' && 'showWireframe' in selectedEntity) {
          const showWireframe = selectedEntity.showWireframe !== undefined ? selectedEntity.showWireframe : true;
          const showColor = selectedEntity.showColor !== undefined ? selectedEntity.showColor : true;
          const isHidden = !showWireframe && !showColor;
          // No renderizar TransformControls si la zona está oculta y no se deben mostrar zonas ocultas
          const showHiddenZones = useWorldStore.getState().showHiddenZones;
          if (isHidden && !showHiddenZones) {
            // La zona está oculta y no se deben mostrar zonas ocultas, no renderizar TransformControls
            // pero verificar si el objeto todavía existe en el grafo de escena antes de retornar null
            const zoneRef = entityRefs.get(selectedEntityId);
            if (!zoneRef?.current) {
              return null;
            }
          }
        }
        
        // Verificar si la zona está bloqueada
        const isLocked = 'isLocked' in selectedEntity && selectedEntity.isLocked;
        
        // Determinar si es un objeto móvil
        const isMobileObject = selectedEntity.type === 'mobile';
        
        // Calcular posición mundial usando la posición actual del objeto Three.js si está disponible,
        // o usar la posición del estado como fallback
        // Nota: objectRef ya fue declarado anteriormente (línea 703)
        let worldPosition: [number, number, number];
        if (objectRef?.current?.position) {
          // Usar la posición real del objeto en Three.js si está disponible
          worldPosition = [
            objectRef.current.position.x,
            objectRef.current.position.y,
            objectRef.current.position.z
          ];
        } else {
          // Usar la posición del estado como fallback (útil cuando el objeto se acaba de seleccionar)
          worldPosition = [
            foundGrid.position[0] + selectedEntity.position[0],
            foundGrid.position[1] + selectedEntity.position[1],
            foundGrid.position[2] + selectedEntity.position[2]
          ];
        }
        
        // Verificar que el objeto exista en el grafo de escena antes de renderizar TransformControls
        // Esto es crítico porque TransformControls necesita un objeto válido de Three.js
        // Si el ref aún no está conectado, esperar un frame más antes de renderizar
        if (!objectRef?.current) {
          // Si el objeto aún no está montado, intentar renderizar en el siguiente frame
          // El efecto anterior forzará un re-render para que el ref esté disponible
          // En el siguiente render, el ref debería estar conectado
          // Usar worldPosition calculada del estado como fallback para que el gizmo aparezca
          // incluso si el ref no está listo
          return null;
        }
        
        // Verificar que el objeto esté realmente en el scene graph antes de adjuntar TransformControls
        // Esto previene el error "The attached 3D object must be a part of the scene graph"
        const object = objectRef.current;
        
        // Verificar que el objeto esté completamente inicializado
        if (!object.uuid || !object.type) {
          return null;
        }
        
        // Verificar que el objeto esté en el scene graph:
        // - Si tiene parent, verificar que el parent también esté inicializado
        // - Si no tiene parent, debe ser la escena raíz (lo cual es válido en algunos casos)
        // Pero en React Three Fiber, los objetos generalmente tienen parent cuando se montan
        // Una verificación simple: si el objeto tiene parent, debe estar conectado
        // Si no tiene parent pero es Scene o tiene isScene, también es válido
        
        // Para objetos móviles, verificación más estricta ya que pueden re-renderizarse frecuentemente
        if (isMobileObject) {
          // Verificar que el objeto tenga parent válido (los objetos móviles siempre deben tener parent)
          if (!object.parent) {
            // El objeto móvil aún no está completamente montado en el scene graph
            return null;
          }
          
          // Verificar que el parent esté completamente inicializado
          if (!object.parent.uuid || !object.parent.type) {
            return null;
          }
          
          // Verificar que el objeto esté realmente conectado: debe tener acceso a la escena
          // Buscar hacia arriba en el árbol para encontrar la escena
          // Esto es crucial porque TransformControls requiere que el objeto esté en el scene graph
          let current: typeof object.parent | null = object.parent;
          let foundScene = false;
          let depth = 0;
          const maxDepth = 10; // Prevenir bucles infinitos
          while (current && depth < maxDepth) {
            const currentWithScene = current as { type?: string; isScene?: boolean; parent: typeof current };
            if (currentWithScene.type === 'Scene' || currentWithScene.isScene) {
              foundScene = true;
              break;
            }
            current = current.parent;
            depth++;
          }
          
          // Si no encontramos la escena, el objeto no está en el scene graph
          // Esperar un frame más para que React Three Fiber lo monte completamente
          if (!foundScene) {
            return null;
          }
        } else {
          // Para otros objetos, usar verificación más simple
          const objectWithScene = object as { type?: string; isScene?: boolean; parent: typeof object.parent };
          if (objectWithScene.parent === null && objectWithScene.type !== 'Scene' && !objectWithScene.isScene) {
            // El objeto no tiene parent y no es la escena, probablemente no está en el scene graph aún
            return null;
          }
          
          // Si tiene parent, verificar que el parent también esté inicializado
          if (object.parent && (!object.parent.uuid || !object.parent.type)) {
            return null;
          }
        }
        
        // Nota: No verificar la posición aquí porque puede causar que el gizmo desaparezca
        // innecesariamente durante las actualizaciones. El objeto Three.js siempre tiene
        // una posición válida una vez que está montado.
        
        // Para objetos móviles, usar el mismo comportamiento que objetos sonoros
        if (isMobileObject) {
          return (
            <TransformControls
              key={`${selectedEntityId}-${transformMode}-${forceRender}`}
              object={objectRef?.current || undefined}
              mode={transformMode}
              position={worldPosition}
              rotation={[0, 0, 0]}
              scale={selectedEntity.scale}
              enabled={!isLocked}
              onObjectChange={(e) => {
                const event = e as { target?: { object?: { position?: { x: number; y: number; z: number }; rotation?: { x: number; y: number; z: number }; scale?: { x: number; y: number; z: number } } } };
                if (event?.target?.object) {
                  handleTransformChange(selectedEntityId, event.target.object);
                }
              }}
              onMouseDown={() => {
                setIsDragging(true);
                isDraggingRef.current = true;
                draggingEntityIdRef.current = selectedEntityId;
              }}
            onMouseUp={() => {
              const wasDragging = isDraggingRef.current && draggingEntityIdRef.current === selectedEntityId;
              
              setIsDragging(false);
              isDraggingRef.current = false;
              draggingEntityIdRef.current = null;
              
              // Actualizar estado con los valores finales después de soltar
              // Usar un triple requestAnimationFrame para asegurar que el gizmo se mantenga visible
              // El primer frame permite que el TransformControls termine su actualización
              // El segundo frame actualiza el estado después de que todo se haya renderizado
              // El tercer frame fuerza un re-render para que el gizmo se vuelva a conectar
              if (wasDragging) {
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    try {
                      // Obtener los valores actuales del grupo de Three.js
                      const zoneRef = entityRefs.get(selectedEntityId);
                      if (zoneRef?.current) {
                        const worldPos = zoneRef.current.position;
                        const worldRot = zoneRef.current.rotation;
                        const worldScale = zoneRef.current.scale;
                        
                        let finalPosition: [number, number, number] | null = null;
                        let finalRotation: [number, number, number] | null = null;
                        let finalScale: [number, number, number] | null = null;
                        
                        // Encontrar la cuadrícula para convertir a valores locales
                        for (const grid of grids.values()) {
                          const isSoundObject = grid.objects.some(obj => obj.id === selectedEntityId);
                          const isMobileObject = grid.mobileObjects.some(obj => obj.id === selectedEntityId);
                          const isEffectZone = grid.effectZones.some(zone => zone.id === selectedEntityId);
                          
                          if (isSoundObject || isMobileObject || isEffectZone) {
                            finalPosition = [
                              worldPos.x - grid.position[0],
                              worldPos.y - grid.position[1],
                              worldPos.z - grid.position[2]
                            ] as [number, number, number];
                            
                            finalRotation = [
                              worldRot.x,
                              worldRot.y,
                              worldRot.z
                            ] as [number, number, number];
                            
                            finalScale = [
                              worldScale.x,
                              worldScale.y,
                              worldScale.z
                            ] as [number, number, number];
                            
                            // Actualizar el store según el tipo de objeto con todos los valores
                            const updates: Record<string, unknown> = {
                              position: finalPosition,
                              rotation: finalRotation,
                              scale: finalScale
                            };
                            
                            if (isSoundObject) {
                              updateObject(selectedEntityId, updates);
                            } else if (isMobileObject) {
                              updateMobileObject(selectedEntityId, updates);
                            } else if (isEffectZone) {
                              updateEffectZone(selectedEntityId, updates);
                            }
                            
                            // Asegurar que el objeto permanezca seleccionado después de arrastrar
                            // Preservar el modo de transformación actual (translate, rotate, scale)
                            // NO llamar a selectEntity si el objeto ya está seleccionado porque eso resetea el modo
                            const currentSelectedId = useWorldStore.getState().selectedEntityId;
                            
                            // Solo asegurar que el objeto esté seleccionado si no lo está
                            // Si ya está seleccionado, no hacer nada para preservar el modo de transformación
                            if (currentSelectedId !== selectedEntityId) {
                              // Solo si realmente cambió la selección, entonces llamar a selectEntity
                              // Esto reseteará el modo a 'translate', pero solo cuando es un objeto diferente
                              useWorldStore.getState().selectEntity(selectedEntityId);
                            }
                            // Si currentSelectedId === selectedEntityId, no hacer nada
                            // Esto preserva el modo de transformación actual (rotate, scale, etc.)
                            
                            // Forzar múltiples re-renders después de actualizar para que el gizmo se mantenga visible
                            // El store se actualiza, lo que causa un re-render, pero necesitamos asegurar
                            // que el gizmo se reconecte correctamente
                            requestAnimationFrame(() => {
                              requestAnimationFrame(() => {
                                setForceRender(prev => prev + 1);
                              });
                            });
                            
                            break;
                          }
                        }
                      }
                    } catch (error) {
                      console.error('❌ Error actualizando transformación final:', error);
                    }
                  });
                });
              }
              
              // Asegurar que el objeto permanezca seleccionado después de mover
              // No deseleccionar explícitamente aquí
            }}
            size={1.0}
            />
          );
        }
        
        return (
          <TransformControls
            key={`${selectedEntityId}-${transformMode}-${forceRender}`}
            object={objectRef?.current || undefined}
            mode={transformMode}
            position={worldPosition}
            // No aplicar la rotación del objeto al gizmo para que se mantenga alineado con la vista
            rotation={[0, 0, 0]} // Gizmo siempre alineado con la vista
            scale={selectedEntity.scale}
            enabled={!isLocked} // Deshabilitar si está bloqueada
            onObjectChange={(e) => {
              const event = e as { target?: { object?: { position?: { x: number; y: number; z: number }; rotation?: { x: number; y: number; z: number }; scale?: { x: number; y: number; z: number } } } };
              if (event?.target?.object) {
                handleTransformChange(selectedEntityId, event.target.object);
              }
            }}
            onMouseDown={() => {
              // Log silenciado - inicio de arrastre
              setIsDragging(true);
              isDraggingRef.current = true;
              draggingEntityIdRef.current = selectedEntityId;
            }}
            onMouseUp={() => {
              const wasDragging = isDraggingRef.current && draggingEntityIdRef.current === selectedEntityId;
              
              // Siempre resetear el estado de arrastre, incluso si algo sale mal
              setIsDragging(false);
              isDraggingRef.current = false;
              draggingEntityIdRef.current = null;
              
              // Actualizar estado con los valores finales después de soltar
              // Usar un triple requestAnimationFrame para asegurar que el gizmo se mantenga visible
              // El primer frame permite que el TransformControls termine su actualización
              // El segundo frame actualiza el estado después de que todo se haya renderizado
              // El tercer frame fuerza un re-render para que el gizmo se vuelva a conectar
              if (wasDragging) {
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    try {
                      // Obtener los valores actuales del grupo de Three.js
                      const objectRef = entityRefs.get(selectedEntityId);
                      if (objectRef?.current) {
                        const worldPos = objectRef.current.position;
                        const worldRot = objectRef.current.rotation;
                        const worldScale = objectRef.current.scale;
                        
                        let finalPosition: [number, number, number] | null = null;
                        let finalRotation: [number, number, number] | null = null;
                        let finalScale: [number, number, number] | null = null;
                        
                        // Encontrar la cuadrícula para convertir a valores locales
                        for (const grid of grids.values()) {
                          const isSoundObject = grid.objects.some(obj => obj.id === selectedEntityId);
                          const isMobileObject = grid.mobileObjects.some(obj => obj.id === selectedEntityId);
                          const isEffectZone = grid.effectZones.some(zone => zone.id === selectedEntityId);
                          
                          if (isSoundObject || isMobileObject || isEffectZone) {
                            finalPosition = [
                              worldPos.x - grid.position[0],
                              worldPos.y - grid.position[1],
                              worldPos.z - grid.position[2]
                            ] as [number, number, number];
                            
                            finalRotation = [
                              worldRot.x,
                              worldRot.y,
                              worldRot.z
                            ] as [number, number, number];
                            
                            finalScale = [
                              worldScale.x,
                              worldScale.y,
                              worldScale.z
                            ] as [number, number, number];
                            
                            // Actualizar el store según el tipo de objeto con todos los valores
                            const updates: Record<string, unknown> = {
                              position: finalPosition,
                              rotation: finalRotation,
                              scale: finalScale
                            };
                            
                            if (isSoundObject) {
                              updateObject(selectedEntityId, updates);
                            } else if (isMobileObject) {
                              updateMobileObject(selectedEntityId, updates);
                            } else if (isEffectZone) {
                              updateEffectZone(selectedEntityId, updates);
                            }
                            
                            // Asegurar que el objeto permanezca seleccionado después de arrastrar
                            // Preservar el modo de transformación actual (translate, rotate, scale)
                            // NO llamar a selectEntity si el objeto ya está seleccionado porque eso resetea el modo
                            const currentSelectedId = useWorldStore.getState().selectedEntityId;
                            
                            // Solo asegurar que el objeto esté seleccionado si no lo está
                            // Si ya está seleccionado, no hacer nada para preservar el modo de transformación
                            if (currentSelectedId !== selectedEntityId) {
                              // Solo si realmente cambió la selección, entonces llamar a selectEntity
                              // Esto reseteará el modo a 'translate', pero solo cuando es un objeto diferente
                              useWorldStore.getState().selectEntity(selectedEntityId);
                            }
                            // Si currentSelectedId === selectedEntityId, no hacer nada
                            // Esto preserva el modo de transformación actual (rotate, scale, etc.)
                            
                            // Forzar múltiples re-renders después de actualizar para que el gizmo se mantenga visible
                            // El store se actualiza, lo que causa un re-render, pero necesitamos asegurar
                            // que el gizmo se reconecte correctamente
                            requestAnimationFrame(() => {
                              requestAnimationFrame(() => {
                                setForceRender(prev => prev + 1);
                              });
                            });
                            
                            break;
                          }
                        }
                      }
                    } catch (error) {
                      console.error('❌ Error actualizando transformación final:', error);
                    }
                  });
                });
              }
              
              // Asegurar que el objeto permanezca seleccionado después de mover
              // No deseleccionar explícitamente aquí
            }}
            size={1.0}
          />
        );
      })()}

      {/* Mensaje cuando no hay entidades */}
      {allObjects.objects.length === 0 && allObjects.mobileObjects.length === 0 && allObjects.effectZones.length === 0 && (
        <group position={[0, 2, 0]}>
          <mesh>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial color="#6c5ce7" transparent opacity={0.3} />
          </mesh>
        </group>
      )}

      {/* Indicador de cámara bloqueada */}
      {showCameraBlockedIndicator && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-red-500/90 backdrop-blur-sm rounded-lg p-3 text-white text-sm font-medium shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse" />
              <span>🎥 Cámara bloqueada - Presiona &apos;C&apos; para desbloquear</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
