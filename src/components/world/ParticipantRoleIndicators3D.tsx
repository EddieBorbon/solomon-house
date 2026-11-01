'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import {
  useExpandedScoreStore,
  ROLE_LABELS,
  ROLE_VISUAL_COLORS,
} from '../../lib/score/expandedScoreProtocol';

/**
 * Indicador visual 3D del rol y capa compositiva de cada participante
 * dentro de la escena (Roadmap Funcional Jurado E2.1.4).
 */
export function ParticipantRoleIndicators3D() {
  const {
    participants,
    localParticipantId,
    showRoleIndicatorsIn3D,
    collaborationMode,
    activeTurnParticipantId,
  } = useExpandedScoreStore();

  if (!showRoleIndicatorsIn3D) return null;

  // Renderizar balizas 3D solo para otros participantes reales conectados o agentes activos en escena
  const visibleParticipants = participants.filter((p) => p.id !== localParticipantId);
  if (visibleParticipants.length === 0) return null;

  return (
    <group name="participant-role-indicators-3d">
      {visibleParticipants.map((p) => {
        const color = ROLE_VISUAL_COLORS[p.role] || '#60a5fa';
        const isCurrentTurn =
          collaborationMode === 'turn_based' && activeTurnParticipantId === p.id;

        return (
          <group key={p.id} position={p.position3D}>
            {/* Baliza luminosa del participante según su rol */}
            <mesh>
              <octahedronGeometry args={[0.24, 0]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={isCurrentTurn ? 1.8 : 0.7}
                transparent
                opacity={p.role === 'listener' ? 0.35 : 0.85}
              />
            </mesh>

            {/* Halo de suelo proyectado */}
            <mesh position={[0, -p.position3D[1] + 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.45, isCurrentTurn ? 0.72 : 0.56, 32]} />
              <meshBasicMaterial color={color} transparent opacity={0.55} />
            </mesh>

            {/* Etiqueta flotante con Rol y Capa */}
            <Html position={[0, 0.45, 0]} center distanceFactor={14}>
              <div
                className="px-2 py-0.5 rounded bg-slate-950/90 border text-[10px] font-mono whitespace-nowrap pointer-events-none shadow-lg"
                style={{ borderColor: color, color: '#f8fafc' }}
              >
                <span className="font-bold" style={{ color }}>
                  ● {p.alias}
                </span>{' '}
                · {ROLE_LABELS[p.role].split(' ')[0]} ({p.layer})
                {isCurrentTurn && (
                  <span className="ml-1 text-amber-300 font-bold">[TURNO ACTIVO]</span>
                )}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
