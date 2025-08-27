import { useFrame } from '@react-three/fiber';
import { useWorldStore } from '../state/useWorldStore';
import { audioManager } from '../lib/AudioManager';
import * as THREE from 'three';

export function useEffectZoneDetection() {
  const { objects, effectZones } = useWorldStore();
  let lastDebugTime = 0;

  useFrame(() => {
    // Solo procesar si hay zonas de efectos
    if (effectZones.length === 0) return;

    // Solo debuggear cada 2 segundos para no saturar la consola
    const now = Date.now();
    const shouldDebug = now - lastDebugTime > 2000;

    // Iterar sobre cada objeto sonoro
    objects.forEach((soundObject) => {
      // Iterar sobre cada zona de efecto
      effectZones.forEach((effectZone) => {
        // Crear esfera de colisión para la zona de efecto
        const zoneRadius = effectZone.scale[0]; // Usar el primer componente de scale como radio
        const zoneSphere = new THREE.Sphere(
          new THREE.Vector3(...effectZone.position),
          zoneRadius
        );

        // Crear punto para la posición del objeto sonoro
        const objectPoint = new THREE.Vector3(...soundObject.position);

        // Calcular distancia entre el objeto y el centro de la zona
        const distance = zoneSphere.center.distanceTo(objectPoint);

        // Verificar si el objeto está dentro de la zona
        const isInside = distance <= zoneRadius;

        if (shouldDebug) {
          console.log(`🎛️ Debug zona: ${effectZone.id} | Objeto: ${soundObject.id} | Distancia: ${distance.toFixed(2)} | Radio: ${zoneRadius} | Dentro: ${isInside}`);
        }

        if (isInside) {
          // Objeto está dentro de la zona - aplicar efecto completo (solo señal con efecto)
          audioManager.setEffectSendAmount(soundObject.id, effectZone.id, 1.0);
        } else {
          // Objeto está fuera de la zona - remover efecto (solo señal seca)
          audioManager.setEffectSendAmount(soundObject.id, effectZone.id, 0.0);
        }
      });
    });

    if (shouldDebug) {
      lastDebugTime = now;
    }
  });
}
