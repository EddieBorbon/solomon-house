import { useFrame } from '@react-three/fiber';
import { useWorldStore } from '../state/useWorldStore';
import { audioManager } from '../lib/AudioManager';
import * as THREE from 'three';

export function useEffectZoneDetection() {
  const { grids } = useWorldStore();
  let lastDebugTime = 0;
  
  // Obtener todos los objetos de todas las cuadrículas
  const allObjects = Array.from(grids.values()).flatMap(grid => grid.objects);
  const allEffectZones = Array.from(grids.values()).flatMap(grid => grid.effectZones);

  useFrame(() => {
    // Solo procesar si hay zonas de efectos
    if (allEffectZones.length === 0) return;

    // Solo debuggear cada 2 segundos para no saturar la consola
    const now = Date.now();
    const shouldDebug = now - lastDebugTime > 2000;

    // Iterar sobre cada objeto sonoro
    allObjects.forEach((soundObject) => {
      // Rastrear si el objeto está dentro de alguna zona
      let isInsideAnyZone = false;
      
      // Iterar sobre cada zona de efecto
      allEffectZones.forEach((effectZone) => {
        // DETECCIÓN DE COLISIÓN MEJORADA CON BOX3
        let isInside = false;
        let effectAmount = 0.0;

        if (effectZone.shape === 'sphere') {
          // Para zonas esféricas: usar Sphere con radio basado en scale
          const zoneRadius = effectZone.scale[0];
          const zoneCenter = new THREE.Vector3(...effectZone.position);
          const objectPoint = new THREE.Vector3(...soundObject.position);
          
          const distance = zoneCenter.distanceTo(objectPoint);
          isInside = distance <= zoneRadius;
          
          // CALCULAR AMOUNT VARIABLE para transiciones suaves
          if (isInside) {
            // El amount varía de 1 (centro) a 0 (borde)
            effectAmount = Math.max(0, Math.min(1, 1 - (distance / zoneRadius)));
            isInsideAnyZone = true; // Marcar que está dentro de al menos una zona
          }
          
        } else if (effectZone.shape === 'cube') {
          // Para zonas cúbicas: usar Box3 con rotación y escala
          const zoneSize = effectZone.scale[0]; // Asumir escala uniforme
          const zoneBox = new THREE.Box3();
          
          // Crear geometría de caja centrada en la posición de la zona
          zoneBox.setFromCenterAndSize(
            new THREE.Vector3(...effectZone.position),
            new THREE.Vector3(zoneSize, zoneSize, zoneSize)
          );
          
          // Aplicar rotación si es necesaria
          if (effectZone.rotation && (effectZone.rotation[0] !== 0 || effectZone.rotation[1] !== 0 || effectZone.rotation[2] !== 0)) {
            const rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeRotationFromEuler(new THREE.Euler(...effectZone.rotation));
            zoneBox.applyMatrix4(rotationMatrix);
          }
          
          const objectPoint = new THREE.Vector3(...soundObject.position);
          isInside = zoneBox.containsPoint(objectPoint);
          
          // Para cajas, calcular amount basado en la distancia al centro
          if (isInside) {
            const zoneCenter = new THREE.Vector3(...effectZone.position);
            const distance = zoneCenter.distanceTo(objectPoint);
            const maxDistance = zoneSize * 0.5; // Radio desde el centro al borde
            effectAmount = Math.max(0, Math.min(1, 1 - (distance / maxDistance)));
            isInsideAnyZone = true; // Marcar que está dentro de al menos una zona
          }
        }

        if (shouldDebug) {
          const zoneType = effectZone.shape;
          const zoneRadius = effectZone.scale[0];
          const objectPoint = new THREE.Vector3(...soundObject.position);
          const zoneCenter = new THREE.Vector3(...effectZone.position);
          const distance = zoneCenter.distanceTo(objectPoint);
          
        }

        // APLICAR EFECTO CON AMOUNT VARIABLE para transiciones suaves
        if (isInside) {
          // Objeto está dentro de la zona - aplicar efecto con amount variable
          audioManager.setEffectSendAmount(soundObject.id, effectZone.id, effectAmount);
        } else {
          // Objeto está fuera de la zona - remover efecto completamente
          audioManager.setEffectSendAmount(soundObject.id, effectZone.id, 0.0);
        }
      });

      // IMPORTANTE: Si el objeto no está dentro de ninguna zona, asegurar que todos los efectos estén desconectados
      if (!isInsideAnyZone && allEffectZones.length > 0) {
        allEffectZones.forEach((effectZone) => {
          audioManager.setEffectSendAmount(soundObject.id, effectZone.id, 0.0);
        });
        
        if (shouldDebug) {
        }
      }
    });

    if (shouldDebug) {
      lastDebugTime = now;
    }
  });
}
