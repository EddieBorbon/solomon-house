'use client';

import React, { useMemo, useCallback, useEffect } from 'react';
import { TransformControls, Html } from '@react-three/drei';
import { Group } from 'three';
import { useWorldStore, type SoundObject, type MobileObject as MobileObjectType, type EffectZone as EffectZoneType } from '../../state/useWorldStore';
import { GridRenderer } from './GridRenderer';
import { CameraController } from './CameraController';
import { SoundObjectsRenderer } from './SoundObjectsRenderer';
import { MobileObjectsRenderer } from './MobileObjectsRenderer';
import { EffectZonesRenderer } from './EffectZonesRenderer';
import { InfluenceGuides } from './InfluenceGuides';
import { AudioReactiveAuras } from './AudioReactiveAuras';
import { useEffectZoneDetection } from '../../hooks/useEffectZoneDetection';
import { useEmergencyCameraControls } from '../../hooks/useEmergencyCameraControls';
import { audioManager } from '../../lib/AudioManager';

interface SceneContentProps {
  orbitControlsRef: React.RefObject<{
    enabled: boolean;
    update: () => void;
    reset: () => void;
  } | null>;
}


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

  // Usar el hook de emergencia para la cámara
  const { showCameraBlockedIndicator } = useEmergencyCameraControls(orbitControlsRef);

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

      {/* Renderizado de objetos sonoros, móviles y zonas de efectos */}
      <SoundObjectsRenderer
        entityRefs={entityRefs}
        isDragging={isDragging}
        draggingEntityId={draggingEntityIdRef.current}
      />
      <MobileObjectsRenderer
        entityRefs={entityRefs}
        isDragging={isDragging}
        draggingEntityId={draggingEntityIdRef.current}
      />
      <EffectZonesRenderer entityRefs={entityRefs} />

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
              object={(objectRef?.current as unknown as import("three").Object3D) || undefined}
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
            object={(objectRef?.current as unknown as import("three").Object3D) || undefined}
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

      {/* Notaciones visuales en tiempo real: anillos de influencia sonora */}
      <InfluenceGuides />

      {/* Auras con shader reactivo al análisis espectral FFT */}
      <AudioReactiveAuras />

      {/* Indicador de cámara bloqueada */}
      {showCameraBlockedIndicator && (
        <Html center style={{ pointerEvents: 'none' }}>
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-red-500/90 backdrop-blur-sm rounded-lg p-3 text-white text-sm font-medium shadow-lg whitespace-nowrap">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse" />
                <span>🎥 Cámara bloqueada - Presiona &apos;C&apos; para desbloquear</span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </>
  );
}
