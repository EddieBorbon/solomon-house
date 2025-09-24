'use client';

import React, { useMemo, useCallback, useEffect } from 'react';
import { TransformControls } from '@react-three/drei';
import { Group } from 'three';
import { useWorldStore, type SoundObject, type MobileObject as MobileObjectType, type EffectZone as EffectZoneType } from '../../state/useWorldStore';
import { SceneRenderer } from './SceneRenderer';
import { SceneObjectFactory } from './SceneObjectFactory';
import { 
  SceneObject, 
  SceneMobileObject, 
  SceneEffectZone,
  SceneConfig,
  SceneState,
  TransformData,
  ITransformHandler,
  ISelectionHandler,
  IAudioHandler
} from './types';
import { GridRenderer } from '../../components/world/GridRenderer';
import { CameraController } from '../../components/world/CameraController';
import { useEffectZoneDetection } from '../../hooks/useEffectZoneDetection';

interface SceneContentProps {
  orbitControlsRef: React.RefObject<{ enabled: boolean } | null>;
  config?: Partial<SceneConfig>;
}

/**
 * Componente contenedor para objetos de sonido usando el nuevo sistema
 */
interface SoundObjectContainerProps {
  object: SceneObject;
  onSelect: (id: string) => void;
  onAudioInteraction: (object: SceneObject) => void;
}

const SoundObjectContainer = React.forwardRef<Group, SoundObjectContainerProps>(
  ({ object, onSelect, onAudioInteraction }, ref) => {
    const handleClick = useCallback((event: React.MouseEvent) => {
      event.stopPropagation();
      onSelect(object.id);
      onAudioInteraction(object);
    }, [object.id, onSelect, onAudioInteraction]);

    const sceneRenderer = useMemo(() => new SceneRenderer(), []);
    const renderedObject = sceneRenderer.render(object);

    return (
      <group
        ref={ref}
        position={object.position}
        rotation={object.rotation}
        scale={object.scale}
        onClick={handleClick}
      >
        {renderedObject}
      </group>
    );
  }
);

SoundObjectContainer.displayName = 'SoundObjectContainer';

/**
 * Handler para transformaciones usando Strategy Pattern
 */
class TransformHandler implements ITransformHandler {
  constructor(
    private updateObject: (id: string, updates: any) => void,
    private updateMobileObject: (id: string, updates: any) => void,
    private updateEffectZone: (id: string, updates: any) => void,
    private allObjects: { objects: SceneObject[]; mobileObjects: SceneMobileObject[]; effectZones: SceneEffectZone[] },
    private grids: Map<string, any>,
    private orbitControlsRef: React.RefObject<{ enabled: boolean } | null>
  ) {}

  handleTransformChange(entityId: string, transform: TransformData): void {
    if (!transform) return;

    const updates: Record<string, unknown> = {};
    
    if (transform.position) {
      // Convertir posición mundial a posición local
      let localPosition = [transform.position.x, transform.position.y, transform.position.z];
      
      // Encontrar la cuadrícula que contiene este objeto
      for (const grid of this.grids.values()) {
        if (grid.objects.some((obj: any) => obj.id === entityId) ||
            grid.mobileObjects.some((obj: any) => obj.id === entityId) ||
            grid.effectZones.some((zone: any) => zone.id === entityId)) {
          // Convertir a posición local: posición mundial - posición de la cuadrícula
          localPosition = [
            transform.position.x - grid.position[0],
            transform.position.y - grid.position[1],
            transform.position.z - grid.position[2]
          ];
          break;
        }
      }
      
      updates.position = localPosition;
    }
    
    if (transform.rotation) {
      updates.rotation = [transform.rotation.x, transform.rotation.y, transform.rotation.z];
    }
    
    if (transform.scale) {
      updates.scale = [transform.scale.x, transform.scale.y, transform.scale.z];
    }
    
    if (Object.keys(updates).length > 0) {
      // Determinar el tipo de entidad y actualizar
      const isSoundObject = this.allObjects.objects.some(obj => obj.id === entityId);
      const isMobileObject = this.allObjects.mobileObjects.some(obj => obj.id === entityId);
      const isEffectZone = this.allObjects.effectZones.some(zone => zone.id === entityId);
      
      if (isSoundObject) {
        this.updateObject(entityId, updates);
      } else if (isMobileObject) {
        this.updateMobileObject(entityId, updates);
      } else if (isEffectZone) {
        this.updateEffectZone(entityId, updates);
      }
    }
  }

  handleTransformStart(): void {
    // Solo deshabilitar OrbitControls si hay una entidad seleccionada que NO sea una cuadrícula
    if (this.orbitControlsRef.current) {
      this.orbitControlsRef.current.enabled = false;
      console.log('🔄 TransformHandler: Transformación iniciada - OrbitControls deshabilitado');
    }
  }

  handleTransformEnd(): void {
    if (this.orbitControlsRef.current) {
      this.orbitControlsRef.current.enabled = true;
      console.log('✅ TransformHandler: Transformación completada - OrbitControls habilitado');
    }
  }
}

/**
 * Handler para selección usando Strategy Pattern
 */
class SelectionHandler implements ISelectionHandler {
  constructor(private selectEntity: (id: string | null) => void) {}

  handleEntitySelect(id: string): void {
    console.log(`🎯 SelectionHandler: Seleccionando entidad: ${id}`);
    this.selectEntity(id);
  }

  handleBackgroundClick(event: { object?: { type?: string; geometry?: { type?: string } } }): void {
    // Solo deseleccionar si se hace clic directamente en el fondo
    if (event.object === undefined || 
        event.object.type === 'Mesh' && event.object.geometry?.type === 'PlaneGeometry') {
      this.selectEntity(null);
    }
  }
}

/**
 * Handler para audio usando Strategy Pattern
 */
class AudioHandler implements IAudioHandler {
  constructor(
    private triggerObjectNote: (id: string) => void,
    private toggleObjectAudio: (id: string) => void
  ) {}

  handleObjectClick(object: SceneObject): void {
    // Lógica de audio específica por tipo de objeto
    switch (object.type) {
      case 'pyramid':
        // Para pirámides, solo selección (el audio se maneja con onPointerDown/onPointerUp)
        break;
      
      case 'cone':
      case 'dodecahedronRing':
        // Para conos y anillos de dodecaedros, activar/desactivar el audio (sonido continuo)
        this.toggleObjectAudio(object.id);
        break;
      
      case 'icosahedron':
      case 'plane':
      case 'torus':
      case 'spiral':
        // Para estos objetos, solo disparar la nota (sonido percusivo)
        this.triggerObjectNote(object.id);
        break;
      
      default:
        // Para otros objetos, solo disparar la nota
        this.triggerObjectNote(object.id);
        break;
    }
  }

  triggerObjectNote(id: string): void {
    this.triggerObjectNote(id);
  }

  toggleObjectAudio(id: string): void {
    this.toggleObjectAudio(id);
  }
}

/**
 * Componente principal de la escena refactorizado
 */
export function SceneContentNew({ orbitControlsRef, config = {} }: SceneContentProps) {
  const { 
    grids,
    selectedEntityId, 
    transformMode, 
    updateObject, 
    updateMobileObject,
    updateEffectZone, 
    selectEntity,
    triggerObjectNote,
    toggleObjectAudio
  } = useWorldStore();
  
  // Configuración por defecto
  const defaultConfig: SceneConfig = {
    enableTransformControls: true,
    enableAudioInteraction: true,
    enableSelection: true,
    transformControlSize: 0.75,
    backgroundPlaneSize: 100,
    ...config
  };

  // Obtener todos los objetos de todas las cuadrículas
  const allObjects = useMemo(() => {
    const objects: SceneObject[] = [];
    const mobileObjects: SceneMobileObject[] = [];
    const effectZones: SceneEffectZone[] = [];
    
    const gridsArray = Array.from(grids.values());
    
    console.log(`🔍 SceneContentNew useMemo - Procesando ${gridsArray.length} cuadrículas`);
    
    gridsArray.forEach((grid, index) => {
      console.log(`🔍 Cuadrícula ${index} (${grid.id}):`, {
        objects: grid.objects?.length || 0,
        mobileObjects: grid.mobileObjects?.length || 0,
        effectZones: grid.effectZones?.length || 0
      });
      
      if (Array.isArray(grid.objects)) {
        objects.push(...grid.objects.filter(obj => obj && obj.id));
      }
      if (Array.isArray(grid.mobileObjects)) {
        mobileObjects.push(...grid.mobileObjects.filter(obj => obj && obj.id));
      }
      if (Array.isArray(grid.effectZones)) {
        effectZones.push(...grid.effectZones.filter(zone => zone && zone.id));
      }
    });
    
    console.log(`🔍 SceneContentNew useMemo - Total recopilado:`, {
      objects: objects.length,
      mobileObjects: mobileObjects.length,
      effectZones: effectZones.length
    });
    
    return { objects, mobileObjects, effectZones };
  }, [grids]);
  
  // Usar el hook de detección de zonas de efectos
  useEffectZoneDetection();
  
  // Crear un Map de refs para cada entidad
  const entityRefs = useMemo(() => {
    const refs = new Map<string, React.RefObject<Group | null>>();
    
    allObjects.objects.forEach(obj => {
      refs.set(obj.id, React.createRef<Group | null>());
    });
    
    allObjects.mobileObjects.forEach(obj => {
      refs.set(obj.id, React.createRef<Group | null>());
    });
    
    allObjects.effectZones.forEach(zone => {
      refs.set(zone.id, React.createRef<Group | null>());
    });
    
    return refs;
  }, [allObjects]);

  // Crear handlers usando Strategy Pattern
  const transformHandler = useMemo(() => 
    new TransformHandler(updateObject, updateMobileObject, updateEffectZone, allObjects, grids, orbitControlsRef),
    [updateObject, updateMobileObject, updateEffectZone, allObjects, grids, orbitControlsRef]
  );

  const selectionHandler = useMemo(() => 
    new SelectionHandler(selectEntity),
    [selectEntity]
  );

  const audioHandler = useMemo(() => 
    new AudioHandler(triggerObjectNote, toggleObjectAudio),
    [triggerObjectNote, toggleObjectAudio]
  );

  // Función para manejar cambios en las transformaciones
  const handleTransformChange = useCallback((entityId: string, newTransform: TransformData) => {
    transformHandler.handleTransformChange(entityId, newTransform);
  }, [transformHandler]);

  // Función para manejar la selección de entidades
  const handleEntitySelect = useCallback((id: string) => {
    selectionHandler.handleEntitySelect(id);
  }, [selectionHandler]);

  // Función para manejar clic en el espacio vacío
  const handleBackgroundClick = useCallback((event: any) => {
    selectionHandler.handleBackgroundClick(event);
  }, [selectionHandler]);

  // Función para manejar el inicio de la manipulación
  const handleTransformStart = useCallback(() => {
    transformHandler.handleTransformStart();
  }, [transformHandler]);

  // Función para manejar el fin de la manipulación
  const handleTransformEnd = useCallback(() => {
    transformHandler.handleTransformEnd();
  }, [transformHandler]);

  // Función para manejar interacciones de audio
  const handleAudioInteraction = useCallback((object: SceneObject) => {
    audioHandler.handleObjectClick(object);
  }, [audioHandler]);

  // Efecto para controlar OrbitControls
  React.useEffect(() => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = true;
      console.log('🎛️ SceneContentNew: OrbitControls siempre habilitados para permitir movimiento de cámara');
    }
  }, [orbitControlsRef]);

  // Log para verificar que está leyendo el estado correctamente
  useEffect(() => {
    console.log('🎵 SceneContentNew - Objetos en el mundo:', allObjects.objects.length);
    console.log('🚀 SceneContentNew - Objetos móviles:', allObjects.mobileObjects.length);
    console.log('🎛️ SceneContentNew - Zonas de efectos:', allObjects.effectZones.length);
    console.log('📐 SceneContentNew - Cuadrículas disponibles:', grids.size);
  }, [allObjects.objects.length, allObjects.mobileObjects.length, allObjects.effectZones.length, grids.size]);

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
        <planeGeometry args={[defaultConfig.backgroundPlaneSize, defaultConfig.backgroundPlaneSize]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Renderizado de cuadrículas con sus objetos */}
      {Array.from(grids.values()).map((grid) => {
        if (!grid || !grid.id) return null;
        return (
          <group key={grid.id} position={grid.position}>
            {/* Renderizado de objetos sonoros de esta cuadrícula */}
            {Array.isArray(grid.objects) && grid.objects.map((obj) => {
              if (!obj || !obj.id) return null;
              const objectRef = entityRefs.get(obj.id);
              if (!objectRef) return null;
              
              return (
                <SoundObjectContainer 
                  key={`sound-${obj.id}`} 
                  object={obj as SceneObject} 
                  onSelect={handleEntitySelect}
                  onAudioInteraction={handleAudioInteraction}
                  ref={objectRef}
                />
              );
            })}

            {/* Renderizado de objetos móviles de esta cuadrícula */}
            {Array.isArray(grid.mobileObjects) && grid.mobileObjects.map((mobileObj) => {
              if (!mobileObj || !mobileObj.id) return null;
              const objectRef = entityRefs.get(mobileObj.id);
              if (!objectRef) return null;
              
              return (
                <MobileObject
                  key={`mobile-${mobileObj.id}`}
                  id={mobileObj.id}
                  position={[0, 0, 0]}
                  rotation={mobileObj.rotation}
                  scale={mobileObj.scale}
                  isSelected={mobileObj.isSelected}
                  mobileParams={{
                    ...mobileObj.mobileParams,
                    centerPosition: [0, 0, 0]
                  }}
                  onUpdatePosition={(id, position) => updateMobileObject(id, { position })}
                  onSelect={handleEntitySelect}
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
      {defaultConfig.enableTransformControls && selectedEntityId && (() => {
        const selectedEntity = allObjects.objects.find(obj => obj.id === selectedEntityId) || 
                              allObjects.mobileObjects.find(obj => obj.id === selectedEntityId) ||
                              allObjects.effectZones.find(zone => zone.id === selectedEntityId);
        
        if (!selectedEntity) return null;
        
        // Verificar si la zona está bloqueada
        const isLocked = 'isLocked' in selectedEntity && selectedEntity.isLocked;
        
        // Encontrar la cuadrícula que contiene este objeto para calcular la posición mundial
        let worldPosition = selectedEntity.position;
        for (const grid of grids.values()) {
          if (grid.objects.some((obj: any) => obj.id === selectedEntityId) ||
              grid.mobileObjects.some((obj: any) => obj.id === selectedEntityId) ||
              grid.effectZones.some((zone: any) => zone.id === selectedEntityId)) {
            worldPosition = [
              grid.position[0] + selectedEntity.position[0],
              grid.position[1] + selectedEntity.position[1],
              grid.position[2] + selectedEntity.position[2]
            ] as [number, number, number];
            break;
          }
        }
        
        return (
          <TransformControls
            key={`${selectedEntityId}-${transformMode}`}
            object={entityRefs.get(selectedEntityId)?.current || undefined}
            mode={transformMode}
            position={worldPosition}
            rotation={[0, 0, 0]}
            scale={selectedEntity.scale}
            enabled={!isLocked}
            onObjectChange={(e) => {
              const event = e as { target?: { object?: TransformData } };
              if (event?.target?.object) {
                handleTransformChange(selectedEntityId, event.target.object);
              }
            }}
            onMouseDown={handleTransformStart}
            onMouseUp={handleTransformEnd}
            size={defaultConfig.transformControlSize}
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
    </>
  );
}
