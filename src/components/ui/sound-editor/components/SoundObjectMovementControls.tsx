'use client';

import React, { useState } from 'react';
import { type SoundObject } from '../../../../state/useWorldStore';
import { type AudioParams } from '../../../../lib/factories/SoundSourceFactory';
import { useLanguage } from '../../../../contexts/LanguageContext';

interface SoundObjectMovementControlsProps {
  selectedObject: SoundObject;
  onParamChange: (
    param: keyof AudioParams,
    value: number | string | string[] | number[] | Record<string, string> | boolean
  ) => void;
}

const MOVEMENT_TYPES: {
  id: NonNullable<AudioParams['movementType']>;
  icon: string;
  labelKey: string;
  fallback: string;
}[] = [
  { id: 'circular', icon: '⭕', labelKey: 'movementProps.typeCircular', fallback: 'Circular' },
  { id: 'polar', icon: '🌸', labelKey: 'movementProps.typePolar', fallback: 'Flor Polar' },
  { id: 'figure8', icon: '♾️', labelKey: 'movementProps.typeFigure8', fallback: 'Ocho (∞)' },
  { id: 'spiral', icon: '🌀', labelKey: 'movementProps.typeSpiral', fallback: 'Espiral' },
  { id: 'pendulum', icon: '⏱️', labelKey: 'movementProps.typePendulum', fallback: 'Péndulo' },
  { id: 'random', icon: '🎲', labelKey: 'movementProps.typeRandom', fallback: 'Deriva' },
  { id: 'waypoints', icon: '📍', labelKey: 'movementProps.typeWaypoints', fallback: 'Puntos A→B→C' },
];

/**
 * Controles completos de Propiedades de Movimiento Cinético y Espacialización Dinámica
 * para Objetos Sonoros (Roadmap M1–M5).
 */
export function SoundObjectMovementControls({
  selectedObject,
  onParamChange,
}: SoundObjectMovementControlsProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);

  const tr = (key: string, fallback: string): string => {
    const val = t(key);
    return val === key ? fallback : val;
  };

  const p = selectedObject.audioParams;
  const enabled = Boolean(p.movementEnabled);
  const movementType = p.movementType ?? 'circular';
  const radius = Number(p.movementRadius ?? 2.5);
  const speed = Number(p.movementSpeed ?? 1.0);
  const height = Number(p.movementHeight ?? 0.6);
  const heightSpeed = Number(p.movementHeightSpeed ?? 0.8);
  const amplitude = Number(p.movementAmplitude ?? 0.6);
  const frequency = Number(p.movementFrequency ?? 3);
  const randomSeed = Number(p.movementRandomSeed ?? 42);
  const axis = p.movementAxis ?? 'x';

  // M2: Doppler
  const dopplerEnabled = Boolean(p.dopplerEnabled);
  const dopplerIntensity = Number(p.dopplerIntensity ?? 1.0);

  // M3: Guías visuales de órbita, estelas y bordes
  const showPath = p.showMovementPath ?? true;
  const showTrail = p.showMovementTrail ?? true;
  const boundaryMode = p.movementBoundaryMode ?? 'free';

  // M4: Sincronización rítmica BPM, colisiones y waypoints
  const syncBpm = Boolean(p.syncMovementToBpm);
  const bpm = Number(p.movementBpm ?? 120);
  const subdivision = p.movementBpmSubdivision ?? '1n';
  const triggerOnProximity = Boolean(p.triggerOnProximity);
  const proximityRadius = Number(p.proximityTriggerRadius ?? 1.8);

  const defaultWaypoints = [-2.5, -1.5, 2.5, -1.5, 0, 2.2];
  const waypoints =
    Array.isArray(p.movementWaypoints) && p.movementWaypoints.length >= 6
      ? p.movementWaypoints
      : defaultWaypoints;

  const updateWaypointCoord = (index: number, val: number) => {
    const next = [...waypoints];
    next[index] = val;
    onParamChange('movementWaypoints', next);
  };

  return (
    <div className="relative border border-white p-4 mt-4 mb-4 bg-black">
      {/* Decoraciones de esquina */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white" />
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white" />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white" />

      {/* Encabezado y botón de colapsar */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-mono font-bold text-cyan-300 tracking-wider uppercase flex items-center gap-1.5">
          <span>🛸 {t('parameterEditor.movementProperties')}</span>
        </h4>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="border border-white px-2 py-0.5 text-[10px] font-mono text-white hover:bg-white hover:text-black transition-colors"
        >
          {isExpanded ? t('controls.hide') : t('controls.show')}
        </button>
      </div>

      {/* Activación principal y reinicio de fase */}
      <div className="flex items-center justify-between p-2 border border-gray-700 bg-zinc-950 mb-3">
        <div>
          <div className="text-xs font-mono font-bold text-white">
            {tr('movementProps.enableMovement', 'Movimiento Automático 3D')}
          </div>
          <div className="text-[10px] font-mono text-gray-400">
            {enabled
              ? tr('movementProps.statusActive', 'En órbita · Espacialización activa')
              : tr('movementProps.statusStopped', 'Fijo en su posición')}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {enabled && (
            <button
              onClick={() =>
                onParamChange(
                  'movementPhaseOffset',
                  Math.round(((Number(p.movementPhaseOffset ?? 0) + Math.PI / 2) % (Math.PI * 2)) * 100) / 100
                )
              }
              className="px-2 py-1 border border-gray-600 text-[10px] font-mono text-gray-300 hover:border-white hover:text-white"
              title={tr('movementProps.shiftPhase', 'Desfasar ángulo de órbita (+90°)')}
            >
              ↻ +90°
            </button>
          )}
          <button
            onClick={() => onParamChange('movementEnabled', !enabled)}
            className={`px-3 py-1 border text-xs font-mono font-bold transition-colors ${
              enabled
                ? 'border-emerald-400 bg-emerald-400 text-black'
                : 'border-white text-white hover:bg-white hover:text-black'
            }`}
          >
            {enabled
              ? tr('integratedTools.on', 'ENCENDIDO')
              : tr('integratedTools.off', 'APAGADO')}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {/* 1. TIPO DE TRAYECTORIA (M1) */}
          <div className="p-2.5 border border-gray-800 bg-zinc-950 space-y-2">
            <div className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
              {tr('movementProps.trajectoryType', '1. Forma de la Trayectoria')}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {MOVEMENT_TYPES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onParamChange('movementType', item.id);
                    if (!enabled) onParamChange('movementEnabled', true);
                  }}
                  className={`text-left px-2 py-1.5 border text-[10px] font-mono transition-colors ${
                    movementType === item.id
                      ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200 font-bold'
                      : 'border-gray-700 bg-black text-gray-300 hover:border-white hover:text-white'
                  }`}
                >
                  <span>{item.icon} </span>
                  <span>{tr(item.labelKey, item.fallback)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. PARÁMETROS CINÉTICOS BASE (M1) */}
          <div className="p-2.5 border border-gray-800 bg-zinc-950 space-y-2.5">
            <div className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
              {tr('movementProps.speedAndSize', '2. Alcance, Velocidad y Altura')}
            </div>

            {/* Radio */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-gray-300">
                  {tr('movementProps.radius', 'Radio / Distancia de recorrido')}
                </span>
                <span className="text-cyan-400 font-bold">{radius.toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="15"
                step="0.1"
                value={radius}
                onChange={(e) => onParamChange('movementRadius', parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Velocidad (si no está bloqueada a BPM) */}
            {!syncBpm && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-gray-300">
                    {tr('movementProps.speed', 'Velocidad de traslación')}
                  </span>
                  <span className="text-cyan-400 font-bold">{speed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={speed}
                  onChange={(e) => onParamChange('movementSpeed', parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            )}

            {/* Altura vertical */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-gray-300">
                  {tr('movementProps.verticalWave', 'Ondulación vertical (Eje Y)')}
                </span>
                <span className="text-cyan-400 font-bold">{height.toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="0.1"
                value={height}
                onChange={(e) => onParamChange('movementHeight', parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Velocidad vertical */}
            {height > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-gray-300">
                    {tr('movementProps.verticalSpeed', 'Velocidad vertical')}
                  </span>
                  <span className="text-cyan-400 font-bold">{heightSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="4"
                  step="0.1"
                  value={heightSpeed}
                  onChange={(e) =>
                    onParamChange('movementHeightSpeed', parseFloat(e.target.value))
                  }
                  className="w-full accent-cyan-400"
                />
              </div>
            )}

            {/* Controles específicos: Flor Polar */}
            {movementType === 'polar' && (
              <div className="pt-2 border-t border-gray-800 space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-amber-200">
                      {tr('movementProps.polarPetals', 'Número de pétalos')}
                    </span>
                    <span className="text-amber-300 font-bold">{frequency}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="9"
                    step="1"
                    value={frequency}
                    onChange={(e) =>
                      onParamChange('movementFrequency', parseInt(e.target.value, 10))
                    }
                    className="w-full accent-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-amber-200">
                      {tr('movementProps.polarDepth', 'Profundidad de pétalos')}
                    </span>
                    <span className="text-amber-300 font-bold">{amplitude.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.8"
                    step="0.1"
                    value={amplitude}
                    onChange={(e) =>
                      onParamChange('movementAmplitude', parseFloat(e.target.value))
                    }
                    className="w-full accent-amber-400"
                  />
                </div>
              </div>
            )}

            {/* Controles específicos: Péndulo */}
            {movementType === 'pendulum' && (
              <div className="pt-2 border-t border-gray-800 space-y-1.5">
                <div className="text-[10px] font-mono text-amber-200">
                  {tr('movementProps.pendulumAxis', 'Dirección del Péndulo:')}
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['x', 'z', 'y'] as const).map((ax) => (
                    <button
                      key={ax}
                      onClick={() => onParamChange('movementAxis', ax)}
                      className={`py-1 border text-[10px] font-mono uppercase ${
                        axis === ax
                          ? 'border-amber-400 bg-amber-400 text-black font-bold'
                          : 'border-gray-700 text-gray-300 hover:border-white'
                      }`}
                    >
                      {tr('movementProps.axis', 'Eje')} {ax.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Controles específicos: Deriva Orgánica */}
            {movementType === 'random' && (
              <div className="pt-2 border-t border-gray-800 space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-amber-200">
                    {tr('movementProps.randomSeed', 'Semilla de variación')}
                  </span>
                  <span className="text-amber-300 font-bold">#{randomSeed}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="500"
                  step="1"
                  value={randomSeed}
                  onChange={(e) =>
                    onParamChange('movementRandomSeed', parseInt(e.target.value, 10))
                  }
                  className="w-full accent-amber-400"
                />
              </div>
            )}

            {/* Controles específicos: Ruta por Puntos (Waypoints M4) */}
            {movementType === 'waypoints' && (
              <div className="pt-2 border-t border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-300">
                    {tr('movementProps.waypointsTitle', 'Puntos de Ruta (X, Z en metros):')}
                  </span>
                  <button
                    onClick={() =>
                      onParamChange('movementWaypoints', [-3, -2, 3, -2, 0, 3])
                    }
                    className="px-1.5 py-0.5 border border-gray-700 text-[9px] font-mono text-gray-300 hover:border-white"
                  >
                    △ Reset
                  </button>
                </div>
                {[0, 1, 2].map((ptIdx) => (
                  <div
                    key={ptIdx}
                    className="grid grid-cols-3 items-center gap-1 text-[10px] font-mono"
                  >
                    <span className="text-gray-400">
                      {tr('movementProps.point', 'Punto')} {String.fromCharCode(65 + ptIdx)}:
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      value={waypoints[ptIdx * 2]}
                      onChange={(e) =>
                        updateWaypointCoord(ptIdx * 2, parseFloat(e.target.value) || 0)
                      }
                      className="px-1.5 py-0.5 bg-black border border-gray-700 text-white text-[10px]"
                      title="X"
                    />
                    <input
                      type="number"
                      step="0.5"
                      value={waypoints[ptIdx * 2 + 1]}
                      onChange={(e) =>
                        updateWaypointCoord(ptIdx * 2 + 1, parseFloat(e.target.value) || 0)
                      }
                      className="px-1.5 py-0.5 bg-black border border-gray-700 text-white text-[10px]"
                      title="Z"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. FÍSICA MUSICAL: PULSO BPM Y COLISIONES SONORAS (M4) */}
          <div className="p-2.5 border border-gray-800 bg-zinc-950 space-y-2">
            <div className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider">
              {tr('movementProps.musicalPhysics', '3. Ritmo Orbital y Colisiones')}
            </div>

            {/* Sincronizar a BPM */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-300">
                {tr('movementProps.syncBpm', 'Sincronizar vuelta al Tempo (BPM)')}
              </span>
              <button
                onClick={() => onParamChange('syncMovementToBpm', !syncBpm)}
                className={`px-2 py-0.5 border text-[10px] font-mono ${
                  syncBpm
                    ? 'border-purple-400 bg-purple-400 text-black font-bold'
                    : 'border-gray-600 text-gray-400 hover:border-white'
                }`}
              >
                {syncBpm
                  ? tr('integratedTools.yes', 'SÍ')
                  : tr('integratedTools.no', 'NO')}
              </button>
            </div>

            {syncBpm && (
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <div>
                  <label className="block text-[9px] font-mono text-gray-400 mb-0.5">
                    Tempo (BPM)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="240"
                    value={bpm}
                    onChange={(e) =>
                      onParamChange('movementBpm', parseInt(e.target.value, 10) || 120)
                    }
                    className="w-full px-1.5 py-0.5 bg-black border border-purple-500/50 text-purple-200 text-[10px] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-gray-400 mb-0.5">
                    {tr('movementProps.cycleDuration', 'Duración de vuelta')}
                  </label>
                  <select
                    value={subdivision}
                    onChange={(e) =>
                      onParamChange(
                        'movementBpmSubdivision',
                        e.target.value as NonNullable<AudioParams['movementBpmSubdivision']>
                      )
                    }
                    className="w-full px-1 py-0.5 bg-black border border-purple-500/50 text-purple-200 text-[10px] font-mono"
                  >
                    <option value="1n">1 Compás (4/4)</option>
                    <option value="2n">1/2 Compás (Blanca)</option>
                    <option value="4n">1 Pulso (Negra)</option>
                    <option value="8n">1/2 Pulso (Corchea)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Disparar al cruzarse con otra figura */}
            <div className="border-t border-gray-800 pt-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-300">
                  {tr('movementProps.collisionTrigger', 'Sonar al cruzarse con otra figura')}
                </span>
                <button
                  onClick={() => onParamChange('triggerOnProximity', !triggerOnProximity)}
                  className={`px-2 py-0.5 border text-[10px] font-mono ${
                    triggerOnProximity
                      ? 'border-rose-400 bg-rose-400 text-black font-bold'
                      : 'border-gray-600 text-gray-400 hover:border-white'
                  }`}
                >
                  {triggerOnProximity
                    ? tr('integratedTools.yes', 'SÍ')
                    : tr('integratedTools.no', 'NO')}
                </button>
              </div>
              {triggerOnProximity && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-gray-400">
                      {tr('movementProps.collisionDistance', 'Distancia de cruce')}
                    </span>
                    <span className="text-rose-300 font-bold">
                      {proximityRadius.toFixed(1)} m
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.1"
                    value={proximityRadius}
                    onChange={(e) =>
                      onParamChange('proximityTriggerRadius', parseFloat(e.target.value))
                    }
                    className="w-full accent-rose-400"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 4. EFECTO DOPPLER Y VISUALIZACIÓN DE ÓRBITA 3D (M2 & M3) */}
          <div className="p-2.5 border border-gray-800 bg-zinc-950 space-y-2">
            <div className="text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wider">
              {tr('movementProps.spatialAndVisuals', '4. Efecto Doppler y Guías 3D')}
            </div>

            {/* Efecto Doppler */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-300">
                {tr('movementProps.dopplerEffect', 'Efecto Doppler al acercarse/alejarse')}
              </span>
              <button
                onClick={() => onParamChange('dopplerEnabled', !dopplerEnabled)}
                className={`px-2 py-0.5 border text-[10px] font-mono ${
                  dopplerEnabled
                    ? 'border-emerald-400 bg-emerald-400 text-black font-bold'
                    : 'border-gray-600 text-gray-400 hover:border-white'
                }`}
              >
                {dopplerEnabled
                  ? tr('integratedTools.yes', 'SÍ')
                  : tr('integratedTools.no', 'NO')}
              </button>
            </div>

            {dopplerEnabled && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-gray-400">
                    {tr('movementProps.dopplerIntensity', 'Intensidad Doppler')}
                  </span>
                  <span className="text-emerald-300 font-bold">
                    {dopplerIntensity.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={dopplerIntensity}
                  onChange={(e) =>
                    onParamChange('dopplerIntensity', parseFloat(e.target.value))
                  }
                  className="w-full accent-emerald-400"
                />
              </div>
            )}

            {/* Guías visuales de órbita y estela */}
            <div className="grid grid-cols-2 gap-1 pt-1 border-t border-gray-800">
              <button
                onClick={() => onParamChange('showMovementPath', !showPath)}
                className={`py-1 px-1.5 border text-[10px] font-mono ${
                  showPath
                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 font-bold'
                    : 'border-gray-700 text-gray-400'
                }`}
              >
                {showPath ? '✓ ' : ''}
                {tr('movementProps.showOrbitLine', 'Línea de Órbita')}
              </button>
              <button
                onClick={() => onParamChange('showMovementTrail', !showTrail)}
                className={`py-1 px-1.5 border text-[10px] font-mono ${
                  showTrail
                    ? 'border-emerald-400 bg-emerald-950/40 text-emerald-200 font-bold'
                    : 'border-gray-700 text-gray-400'
                }`}
              >
                {showTrail ? '✓ ' : ''}
                {tr('movementProps.showTrail', 'Estela Luminosa')}
              </button>
            </div>

            {/* Modo de frontera entre cuadrículas */}
            <div className="pt-1 border-t border-gray-800 space-y-1">
              <div className="text-[9px] font-mono text-gray-400">
                {tr('movementProps.boundaryBehavior', 'Al llegar al borde de la cuadrícula:')}
              </div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => onParamChange('movementBoundaryMode', 'free')}
                  className={`py-1 px-1.5 border text-[10px] font-mono ${
                    boundaryMode === 'free'
                      ? 'border-white bg-white text-black font-bold'
                      : 'border-gray-700 text-gray-300'
                  }`}
                >
                  {tr('movementProps.boundaryFree', 'Cruzar a vecinas')}
                </button>
                <button
                  onClick={() => onParamChange('movementBoundaryMode', 'bounce')}
                  className={`py-1 px-1.5 border text-[10px] font-mono ${
                    boundaryMode === 'bounce'
                      ? 'border-amber-400 bg-amber-400 text-black font-bold'
                      : 'border-gray-700 text-gray-300'
                  }`}
                >
                  {tr('movementProps.boundaryBounce', 'Rebotar en borde')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
