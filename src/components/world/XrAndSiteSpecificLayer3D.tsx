'use client';

import React, { useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import {
  useFutureProjectionStore,
  updateLocalMixedRealityPresence,
} from '../../lib/future/futureProjection';
import { useWorldStore } from '../../state/useWorldStore';
import { isHeadTrackingActive } from '../../lib/audio/headTracking';

/**
 * Capa 3D real para la Etapa E8.1 (Realidad Extendida, Anclas Espaciales Passthrough
 * e Instalaciones Site-Specific a escala métrica).
 */
export function XrAndSiteSpecificLayer3D() {
  const { gl, camera } = useThree();
  const {
    passthroughArEnabled,
    passthroughAnchors,
    siteSpecificConfig,
  } = useFutureProjectionStore();
  const { selectEntity, triggerObjectNote, clearAllObjects } = useWorldStore();

  // E8.1.2: Modo Passthrough AR — Fondo transparente del WebGLRenderer para superponer cámara física
  useEffect(() => {
    if (passthroughArEnabled) {
      gl.setClearColor('#000000', 0);
    } else {
      gl.setClearColor('#f0f0f0', 1);
    }
  }, [passthroughArEnabled, gl]);

  // E8.1.4: Temporizador real de auto-reinicio para quiosco de museo / galería en modo Site-Specific
  useEffect(() => {
    if (!siteSpecificConfig.enabled || siteSpecificConfig.kioskAutoResetMinutes <= 0) {
      return;
    }
    const ms = siteSpecificConfig.kioskAutoResetMinutes * 60 * 1000;
    const timer = setInterval(() => {
      clearAllObjects();
    }, ms);
    return () => clearInterval(timer);
  }, [siteSpecificConfig.enabled, siteSpecificConfig.kioskAutoResetMinutes, clearAllObjects]);

  // E8.1.3: Sincronizar la modalidad real del dispositivo local y su posición de cámara cada 1.5s
  const lastUpdateRef = React.useRef(0);
  useFrame(({ clock }) => {
    if (clock.elapsedTime - lastUpdateRef.current < 1.5) return;
    lastUpdateRef.current = clock.elapsedTime;

    const xrSession = gl.xr?.getSession?.();
    let modality: 'vr_headset' | 'ar_passthrough' | 'mobile_gyro' | 'desktop_webgl' =
      'desktop_webgl';
    let handTracking = false;

    if (xrSession) {
      const envBlend = (xrSession as unknown as { environmentBlendMode?: string })
        .environmentBlendMode;
      modality =
        passthroughArEnabled || envBlend === 'alpha-blend' || envBlend === 'additive'
          ? 'ar_passthrough'
          : 'vr_headset';
      handTracking = Array.from(xrSession.inputSources || []).some((src) => Boolean(src.hand));
    } else if (passthroughArEnabled) {
      modality = 'ar_passthrough';
    } else if (isHeadTrackingActive()) {
      modality = 'mobile_gyro';
    }

    updateLocalMixedRealityPresence(modality, handTracking, [
      Math.round(camera.position.x * 10) / 10,
      Math.round(camera.position.y * 10) / 10,
      Math.round(camera.position.z * 10) / 10,
    ]);
  });

  const [widthM, heightM, depthM] = siteSpecificConfig.physicalDimensionsMeters;
  const [offX, offY, offZ] = siteSpecificConfig.originOffsetMeters;

  return (
    <group name="xr-and-site-specific-layer-3d">
      {/* E8.1.2: Anclas espaciales físicas Passthrough AR renderizadas en 3D */}
      {passthroughAnchors.map((anchor) => {
        const [ax, ay, az] = anchor.physicalRoomCoordMeters;
        return (
          <group key={anchor.id} position={[ax, ay, az]}>
            {/* Anillo de suelo en la coordenada física real */}
            <mesh position={[0, -ay + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.25, 0.38, 24]} />
              <meshBasicMaterial color="#e879f9" transparent opacity={0.85} side={2} />
            </mesh>

            {/* Línea vertical de anclaje físico suelo -> escultura sonora */}
            <Line
              points={[
                [0, -ay + 0.02, 0],
                [0, 0, 0],
              ]}
              color="#e879f9"
              lineWidth={1.5}
              dashed
              dashSize={0.15}
              gapSize={0.1}
            />

            {/* Nodo de ancla interactivo */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                if (anchor.objectId) {
                  selectEntity(anchor.objectId);
                  triggerObjectNote(anchor.objectId);
                }
              }}
            >
              <octahedronGeometry args={[0.18, 0]} />
              <meshStandardMaterial
                color="#d946ef"
                emissive="#d946ef"
                emissiveIntensity={1.2}
                wireframe
              />
            </mesh>

            <Html position={[0, 0.32, 0]} center distanceFactor={14}>
              <div className="px-1.5 py-0.5 rounded bg-fuchsia-950/90 border border-fuchsia-400 text-[9px] font-mono text-fuchsia-100 whitespace-nowrap pointer-events-none shadow">
                ⚓ {anchor.label} [{ax}m, {ay}m, {az}m]
              </div>
            </Html>
          </group>
        );
      })}

      {/* E8.1.4: Envolvente arquitectónica Site-Specific a escala métrica real */}
      {siteSpecificConfig.enabled && (
        <group position={[offX, offY + heightM / 2, offZ]}>
          <mesh>
            <boxGeometry args={[widthM, heightM, depthM]} />
            <meshBasicMaterial
              color="#c026d3"
              wireframe
              transparent
              opacity={0.35}
            />
          </mesh>
          <Html position={[0, heightM / 2 + 0.4, 0]} center distanceFactor={20}>
            <div className="px-2 py-1 rounded bg-black/90 border border-fuchsia-400 text-[10px] font-mono text-fuchsia-200 whitespace-nowrap pointer-events-none">
              🏛 {siteSpecificConfig.venueName} ({widthM}m × {heightM}m × {depthM}m)
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}
