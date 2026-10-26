import {
  useWorldStore,
  type Grid,
  type SoundObject,
  type MobileObject,
  type EffectZone,
} from '../../state/useWorldStore';

/**
 * Partitura Topológica — La Casa de Salomón (roadmap 5.3).
 *
 * Especificación de datos para documentar la disposición espacial de una
 * sesión como partitura: la organización tridimensional de objetos sonoros,
 * zonas de efectos y objetos móviles constituye la notación de la obra
 * (partitura arquitectónica expandida). El formato es JSON versionado y
 * autodescriptivo, pensado para:
 *   - archivo y preservación de sesiones (corpus de investigación),
 *   - reproducción offline (intérprete de partituras, roadmap 5.5),
 *   - conversión a partitura gráfica vectorial (roadmap 5.4).
 */

export const TOPOLOGICAL_SCORE_VERSION = '1.0.0';

export interface TopologicalScoreObject {
  id: string;
  type: SoundObject['type'];
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  audioEnabled: boolean;
  audioParams: SoundObject['audioParams'];
  customShapeCode?: string;
  customSynthesisCode?: string;
}

export interface TopologicalScoreEffectZone {
  id: string;
  type: EffectZone['type'];
  shape: EffectZone['shape'];
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  effectParams: EffectZone['effectParams'];
}

export interface TopologicalScoreMobileObject {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  mobileParams: MobileObject['mobileParams'];
}

export interface TopologicalScoreGrid {
  id: string;
  coordinates: [number, number, number];
  position: [number, number, number];
  gridSize: number;
  objects: TopologicalScoreObject[];
  effectZones: TopologicalScoreEffectZone[];
  mobileObjects: TopologicalScoreMobileObject[];
}

export interface TopologicalScore {
  /** Identificador del formato, para validación al importar. */
  format: 'solomon-house/topological-score';
  version: string;
  exportedAt: string; // ISO 8601
  metadata: {
    title?: string;
    author?: string;
    description?: string;
  };
  grids: TopologicalScoreGrid[];
}

/**
 * JSON Schema (draft 2020-12) de la especificación, exportable junto a las
 * partituras para validación en herramientas externas.
 */
export const TOPOLOGICAL_SCORE_JSON_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://solomon-house.org/schemas/topological-score-1.0.0.json',
  title: 'Partitura Topológica de La Casa de Salomón',
  type: 'object',
  required: ['format', 'version', 'exportedAt', 'grids'],
  properties: {
    format: { const: 'solomon-house/topological-score' },
    version: { type: 'string' },
    exportedAt: { type: 'string', format: 'date-time' },
    metadata: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        author: { type: 'string' },
        description: { type: 'string' },
      },
    },
    grids: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'position', 'objects', 'effectZones', 'mobileObjects'],
        properties: {
          id: { type: 'string' },
          coordinates: { $ref: '#/$defs/vector3' },
          position: { $ref: '#/$defs/vector3' },
          gridSize: { type: 'number' },
          objects: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'type', 'position', 'audioParams'],
              properties: {
                id: { type: 'string' },
                type: { type: 'string' },
                position: { $ref: '#/$defs/vector3' },
                rotation: { $ref: '#/$defs/vector3' },
                scale: { $ref: '#/$defs/vector3' },
                audioEnabled: { type: 'boolean' },
                audioParams: { type: 'object' },
                customShapeCode: { type: 'string' },
                customSynthesisCode: { type: 'string' },
              },
            },
          },
          effectZones: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'type', 'position', 'effectParams'],
              properties: {
                id: { type: 'string' },
                type: { type: 'string' },
                shape: { type: 'string' },
                position: { $ref: '#/$defs/vector3' },
                rotation: { $ref: '#/$defs/vector3' },
                scale: { $ref: '#/$defs/vector3' },
                effectParams: { type: 'object' },
              },
            },
          },
          mobileObjects: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'position', 'mobileParams'],
              properties: {
                id: { type: 'string' },
                position: { $ref: '#/$defs/vector3' },
                rotation: { $ref: '#/$defs/vector3' },
                scale: { $ref: '#/$defs/vector3' },
                mobileParams: { type: 'object' },
              },
            },
          },
        },
      },
    },
  },
  $defs: {
    vector3: {
      type: 'array',
      items: { type: 'number' },
      minItems: 3,
      maxItems: 3,
    },
  },
} as const;

function serializeGrid(grid: Grid): TopologicalScoreGrid {
  return {
    id: grid.id,
    coordinates: grid.coordinates,
    position: grid.position,
    gridSize: grid.gridSize,
    objects: grid.objects.map((obj) => ({
      id: obj.id,
      type: obj.type,
      position: obj.position,
      rotation: obj.rotation,
      scale: obj.scale,
      audioEnabled: obj.audioEnabled,
      audioParams: obj.audioParams,
      ...(obj.customShapeCode ? { customShapeCode: obj.customShapeCode } : {}),
      ...(obj.customSynthesisCode ? { customSynthesisCode: obj.customSynthesisCode } : {}),
    })),
    effectZones: grid.effectZones.map((zone) => ({
      id: zone.id,
      type: zone.type,
      shape: zone.shape,
      position: zone.position,
      rotation: zone.rotation,
      scale: zone.scale,
      effectParams: zone.effectParams,
    })),
    mobileObjects: grid.mobileObjects.map((mobile) => ({
      id: mobile.id,
      position: mobile.position,
      rotation: mobile.rotation,
      scale: mobile.scale,
      mobileParams: mobile.mobileParams,
    })),
  };
}

/**
 * Construye la partitura topológica del estado actual de la sesión.
 */
export function buildTopologicalScore(
  metadata: TopologicalScore['metadata'] = {}
): TopologicalScore {
  const { grids } = useWorldStore.getState();
  return {
    format: 'solomon-house/topological-score',
    version: TOPOLOGICAL_SCORE_VERSION,
    exportedAt: new Date().toISOString(),
    metadata,
    grids: Array.from(grids.values()).map(serializeGrid),
  };
}

/**
 * Exporta la sesión actual como archivo .json descargado por el navegador.
 */
export function exportTopologicalScore(metadata?: TopologicalScore['metadata']): void {
  const score = buildTopologicalScore(metadata);
  const blob = new Blob([JSON.stringify(score, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `partitura-topologica-${score.exportedAt.slice(0, 19).replace(/[:T]/g, '-')}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
