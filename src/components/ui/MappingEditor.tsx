'use client';

import { useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useWorldStore } from '../../state/useWorldStore';
import {
  useMappingStore,
  startMappingRuntime,
  SOURCE_LABELS,
  TARGET_LABELS,
  DEFAULT_SOURCE_RANGE,
  DEFAULT_TARGET_RANGE,
  type ParameterMapping,
  type GeometricSource,
  type AudioTarget,
} from '../../lib/mapping/MappingEngine';
import {
  CURVE_LABELS,
  FREE_CURVE_SIZE,
  defaultFreeCurve,
  evaluateCurve,
  type CurveType,
} from '../../lib/mapping/transferCurves';
import { useUIPanelStore } from '../../state/useUIPanelStore';

/**
 * Motor de Mapeo Paramétrico Unificado — UI (roadmap 5.1 y 5.2).
 *
 * Panel del compositor para declarar mapeos geometría→síntesis sobre el
 * objeto seleccionado, con curvas de transferencia (lineal, logarítmica,
 * exponencial, sigmoide o dibujada a mano alzada).
 */

const CURVE_PREVIEW_W = 180;
const CURVE_PREVIEW_H = 72;

/** Referencia estable para "sin mapeos" (evita re-renders infinitos) */
const EMPTY_MAPPINGS: ParameterMapping[] = [];

/** Mini-editor de curva: vista previa siempre; dibujable cuando es libre. */
function CurveCanvas({
  mapping,
  onDraw,
}: {
  mapping: ParameterMapping;
  onDraw: (table: number[]) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const tableRef = useRef<number[]>(mapping.freeTable ?? defaultFreeCurve());

  useEffect(() => {
    tableRef.current = mapping.freeTable ?? defaultFreeCurve();
  }, [mapping.freeTable]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, CURVE_PREVIEW_W, CURVE_PREVIEW_H);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.strokeRect(0.5, 0.5, CURVE_PREVIEW_W - 1, CURVE_PREVIEW_H - 1);

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let px = 0; px < CURVE_PREVIEW_W; px++) {
      const t = px / (CURVE_PREVIEW_W - 1);
      const y = evaluateCurve(mapping.curve, t, mapping.shape, tableRef.current);
      const py = (1 - y) * (CURVE_PREVIEW_H - 4) + 2;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }, [mapping.curve, mapping.shape]);

  useEffect(() => {
    render();
  }, [render, mapping.freeTable]);

  const paintAt = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const y = Math.min(1, Math.max(0, 1 - (clientY - rect.top) / rect.height));
      const index = Math.round(x * (FREE_CURVE_SIZE - 1));
      const table = [...tableRef.current];
      // Pintar también vecinos para trazos continuos
      table[index] = y;
      if (index > 0) table[index - 1] = (table[index - 1] + y) / 2;
      if (index < FREE_CURVE_SIZE - 1) table[index + 1] = (table[index + 1] + y) / 2;
      tableRef.current = table;
      render();
    },
    [render]
  );

  const isFree = mapping.curve === 'libre';

  return (
    <canvas
      ref={canvasRef}
      width={CURVE_PREVIEW_W}
      height={CURVE_PREVIEW_H}
      className={`rounded bg-black/40 ${isFree ? 'cursor-crosshair touch-none' : ''}`}
      title={isFree ? 'Dibuja la curva de transferencia arrastrando' : 'Vista previa de la curva'}
      onPointerDown={(e) => {
        if (!isFree) return;
        drawing.current = true;
        (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
        paintAt(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (!isFree || !drawing.current) return;
        paintAt(e.clientX, e.clientY);
      }}
      onPointerUp={() => {
        if (!isFree) return;
        drawing.current = false;
        onDraw(tableRef.current);
      }}
    />
  );
}

function MappingRow({
  objectId,
  mapping,
}: {
  objectId: string;
  mapping: ParameterMapping;
}) {
  const { updateMapping, removeMapping } = useMappingStore();
  const update = (updates: Partial<ParameterMapping>) =>
    updateMapping(objectId, mapping.id, updates);

  return (
    <div className="border border-white/10 rounded p-2 space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={mapping.enabled}
          onChange={(e) => update({ enabled: e.target.checked })}
          title="Activar/desactivar este mapeo"
        />
        <select
          value={mapping.source}
          onChange={(e) => {
            const source = e.target.value as GeometricSource;
            const [inMin, inMax] = DEFAULT_SOURCE_RANGE[source];
            update({ source, inMin, inMax });
          }}
          className="flex-1 bg-black/60 rounded px-1 py-0.5 text-xs"
        >
          {(Object.keys(SOURCE_LABELS) as GeometricSource[]).map((key) => (
            <option key={key} value={key}>{SOURCE_LABELS[key]}</option>
          ))}
        </select>
        <span className="text-gray-500">→</span>
        <select
          value={mapping.target}
          onChange={(e) => {
            const target = e.target.value as AudioTarget;
            const [outMin, outMax] = DEFAULT_TARGET_RANGE[target];
            update({ target, outMin, outMax });
          }}
          className="flex-1 bg-black/60 rounded px-1 py-0.5 text-xs"
        >
          {(Object.keys(TARGET_LABELS) as AudioTarget[]).map((key) => (
            <option key={key} value={key}>{TARGET_LABELS[key]}</option>
          ))}
        </select>
        <button
          onClick={() => removeMapping(objectId, mapping.id)}
          className="text-red-400 hover:text-red-200 text-xs px-1"
          title="Eliminar mapeo"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={mapping.curve}
          onChange={(e) => {
            const curve = e.target.value as CurveType;
            update(
              curve === 'libre' && !mapping.freeTable
                ? { curve, freeTable: defaultFreeCurve() }
                : { curve }
            );
          }}
          className="bg-black/60 rounded px-1 py-0.5 text-xs"
        >
          {(Object.keys(CURVE_LABELS) as CurveType[]).map((key) => (
            <option key={key} value={key}>{CURVE_LABELS[key]}</option>
          ))}
        </select>
        {(mapping.curve === 'logaritmica' ||
          mapping.curve === 'exponencial' ||
          mapping.curve === 'sigmoide') && (
          <label className="flex items-center gap-1 text-xs text-gray-400">
            forma
            <input
              type="range"
              min={1}
              max={5}
              step={0.1}
              value={mapping.shape}
              onChange={(e) => update({ shape: Number(e.target.value) })}
              className="w-16"
            />
          </label>
        )}
      </div>

      <CurveCanvas mapping={mapping} onDraw={(table) => update({ freeTable: table })} />

      <div className="grid grid-cols-4 gap-1 text-xs">
        {(
          [
            ['inMin', 'ent. mín'],
            ['inMax', 'ent. máx'],
            ['outMin', 'sal. mín'],
            ['outMax', 'sal. máx'],
          ] as const
        ).map(([field, label]) => (
          <label key={field} className="flex flex-col text-gray-400">
            {label}
            <input
              type="number"
              step="any"
              value={mapping[field]}
              onChange={(e) => update({ [field]: Number(e.target.value) })}
              className="bg-black/60 rounded px-1 py-0.5 text-gray-200 w-full"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

export function MappingEditor() {
  const activeModal = useUIPanelStore((s) => s.activeModal);
  const closeModal = useUIPanelStore((s) => s.closeModal);
  const open = activeModal === 'mapping';
  const selectedEntityId = useWorldStore((state) => state.selectedEntityId);
  const grids = useWorldStore((state) => state.grids);
  // El selector debe devolver una referencia estable: usar el array del
  // store directamente (o undefined) y aplicar el fallback fuera
  const storedMappings = useMappingStore((state) =>
    selectedEntityId ? state.mappings[selectedEntityId] : undefined
  );
  const mappings = storedMappings ?? EMPTY_MAPPINGS;
  const { addMapping } = useMappingStore();

  // Bucle de evaluación de mapeos: activo durante toda la sesión
  useEffect(() => {
    startMappingRuntime();
  }, []);

  // Buscar el objeto sonoro seleccionado (o el primero de la sala)
  const selectedObject = (() => {
    const allObjs = Array.from(grids.values()).flatMap((g) => g.objects ?? []);
    if (selectedEntityId) {
      const found = allObjs.find((obj) => obj?.id === selectedEntityId);
      if (found) return found;
    }
    return allObjs[0] ?? null;
  })();

  if (!open) return null;

  const handleAdd = () => {
    if (!selectedObject) return;
    const mapping: ParameterMapping = {
      id: uuidv4(),
      source: 'posY',
      target: 'frequency',
      curve: 'lineal',
      shape: 2,
      inMin: DEFAULT_SOURCE_RANGE.posY[0],
      inMax: DEFAULT_SOURCE_RANGE.posY[1],
      outMin: DEFAULT_TARGET_RANGE.frequency[0],
      outMax: DEFAULT_TARGET_RANGE.frequency[1],
      enabled: true,
    };
    addMapping(selectedObject.id, mapping);
  };

  return (
    <div className="fixed top-14 left-[21rem] w-80 max-h-[75vh] overflow-y-auto bg-black/95 border border-yellow-500/40 backdrop-blur-md rounded-xl p-4 z-50 font-mono text-sm text-gray-200 space-y-3 shadow-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-yellow-300 font-bold mb-1">Mapeo paramétrico</h3>
          <p className="text-xs text-gray-400">
            Define qué parámetro geométrico del objeto controla qué parámetro
            de síntesis mediante una curva de transferencia.
          </p>
        </div>
        <button onClick={closeModal} className="text-gray-400 hover:text-white px-1">
          ✕
        </button>
      </div>

      {!selectedObject ? (
        <p className="text-xs text-amber-300 border border-amber-500/30 rounded p-2">
          Crea o selecciona primero un objeto sonoro en la cuadrícula para editar sus curvas de mapeo.
        </p>
      ) : (
        <>
          <div className="text-[11px] text-yellow-200 bg-yellow-950/30 border border-yellow-500/30 rounded px-2 py-1">
            Objeto activo: <strong>{selectedObject.type}</strong> ({selectedObject.id.slice(0, 6)})
          </div>

          {mappings.map((mapping) => (
            <MappingRow key={mapping.id} objectId={selectedObject.id} mapping={mapping} />
          ))}

          <button
            onClick={handleAdd}
            className="w-full px-2 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/40 rounded text-xs transition-colors"
          >
            + Añadir mapeo
          </button>
        </>
      )}
    </div>
  );
}
