import { useFrame } from '@react-three/fiber';
import { useWorldStore } from '../state/useWorldStore';
import { audioManager } from '../lib/AudioManager';
import { getLiveObjectLocalPosition } from '../lib/movement/soundObjectKinetics';
import * as THREE from 'three';

export function useEffectZoneDetection() {
  const { grids } = useWorldStore();
  let lastDebugTime = 0;

  // Obtener todos los objetos de todas las cuadrículas
  const allObjects = Array.from(grids.values()).flatMap((grid) => grid.objects);
  const allEffectZones = Array.from(grids.values()).flatMap((grid) => grid.effectZones);

  useFrame(() => {
    // Solo procesar si hay zonas de efectos
    if (allEffectZones.length === 0) return;

    // Solo debuggear cada 2 segundos para no saturar la consola
    const now = Date.now();
    const shouldDebug = now - lastDebugTime > 2000;

    // Iterar sobre cada objeto sonoro (usando su posición cinética en vivo M2)
    allObjects.forEach((soundObject) => {
      const livePos = getLiveObjectLocalPosition(soundObject.id, soundObject.position);
      // Rastrear si el objeto está dentro de alguna zona
      let isInsideAnyZone = false;

      // Iterar sobre cada zona de efecto
      allEffectZones.forEach((effectZone) => {
        let isInside = false;
        let effectAmount = 0.0;

        if (effectZone.shape === 'sphere') {
          const zoneRadius = effectZone.scale[0];
          const zoneCenter = new THREE.Vector3(...effectZone.position);
          const objectPoint = new THREE.Vector3(...livePos);

          const distance = zoneCenter.distanceTo(objectPoint);
          isInside = distance <= zoneRadius;

          if (isInside) {
            effectAmount = Math.max(0, Math.min(1, 1 - distance / zoneRadius));
            isInsideAnyZone = true;
          }
        } else if (effectZone.shape === 'cube') {
          const zoneSize = effectZone.scale[0];
          const zoneBox = new THREE.Box3();

          zoneBox.setFromCenterAndSize(
            new THREE.Vector3(...effectZone.position),
            new THREE.Vector3(zoneSize, zoneSize, zoneSize)
          );

          if (
            effectZone.rotation &&
            (effectZone.rotation[0] !== 0 ||
              effectZone.rotation[1] !== 0 ||
              effectZone.rotation[2] !== 0)
          ) {
            const rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeRotationFromEuler(new THREE.Euler(...effectZone.rotation));
            zoneBox.applyMatrix4(rotationMatrix);
          }

          const objectPoint = new THREE.Vector3(...livePos);
          isInside = zoneBox.containsPoint(objectPoint);

          if (isInside) {
            const zoneCenter = new THREE.Vector3(...effectZone.position);
            const distance = zoneCenter.distanceTo(objectPoint);
            const maxDistance = zoneSize * 0.5;
            effectAmount = Math.max(0, Math.min(1, 1 - distance / maxDistance));
            isInsideAnyZone = true;
          }
        }

        try {
          if (audioManager.hasEffectSend(soundObject.id, effectZone.id)) {
            if (isInside) {
              audioManager.setEffectSendAmount(soundObject.id, effectZone.id, effectAmount);
            } else {
              audioManager.setEffectSendAmount(soundObject.id, effectZone.id, 0.0);
            }
          }
        } catch {
          // Silenciar errores de EffectSend durante inicialización
        }
      });

      if (!isInsideAnyZone && allEffectZones.length > 0) {
        allEffectZones.forEach((effectZone) => {
          try {
            if (audioManager.hasEffectSend(soundObject.id, effectZone.id)) {
              audioManager.setEffectSendAmount(soundObject.id, effectZone.id, 0.0);
            }
          } catch {
            // Silenciar errores de EffectSend no encontrado
          }
        });
      }
    });

    if (shouldDebug) {
      lastDebugTime = now;
    }
  });
}
