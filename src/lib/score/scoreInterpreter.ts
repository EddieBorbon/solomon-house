import { useWorldStore, type Grid } from '../../state/useWorldStore';
import { useGridStore } from '../../stores/useGridStore';
import { useObjectStore } from '../../stores/useObjectStore';
import { useEffectStore } from '../../stores/useEffectStore';
import { useMobileStore } from '../../stores/useMobileStore';
import { audioManager } from '../AudioManager';
import { type TopologicalScore } from './topologicalScore';

/**
 * Intérprete de Partituras Topológicas (roadmap 5.5).
 *
 * Carga un archivo JSON de una sesión pasada (roadmap 5.3) y recrea la
 * espacialización completa de forma offline: cuadrículas, objetos sonoros
 * con sus motores de síntesis, zonas de efectos y objetos móviles. La
 * sesión recreada es local (desconectada del mundo global compartido),
 * de modo que la obra puede estudiarse y re-ejecutarse sin alterar el
 * lienzo colectivo.
 */

function isTopologicalScore(value: unknown): value is TopologicalScore {
  const score = value as TopologicalScore;
  return (
    typeof score === 'object' &&
    score !== null &&
    score.format === 'solomon-house/topological-score' &&
    typeof score.version === 'string' &&
    Array.isArray(score.grids)
  );
}

/**
 * Reconstruye el estado del mundo a partir de una partitura, reemplazando
 * la sesión actual.
 */
export function applyTopologicalScore(score: TopologicalScore): void {
  const worldStore = useWorldStore.getState();

  // 1. Desconectar del mundo global: la reproducción es offline y no debe
  //    escribirse en el lienzo compartido.
  worldStore.setGlobalWorldConnected(false);

  // 2. Liberar el audio de la sesión actual (roadmap 2.5)
  const currentGrids = useWorldStore.getState().grids;
  currentGrids.forEach((grid) => {
    grid.objects.forEach((obj) => {
      try {
        audioManager.removeSoundSource(obj.id);
      } catch {
        // Fuente ya liberada
      }
    });
  });

  // 3. Reconstruir las cuadrículas desde la partitura
  const newGrids = new Map<string, Grid>();
  for (const scoreGrid of score.grids) {
    newGrids.set(scoreGrid.id, {
      id: scoreGrid.id,
      coordinates: scoreGrid.coordinates || [0, 0, 0],
      position: scoreGrid.position || [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      gridSize: scoreGrid.gridSize || 20,
      gridColor: '#4a5568',
      isLoaded: true,
      isSelected: false,
      objects: scoreGrid.objects.map((obj) => ({
        id: obj.id,
        type: obj.type,
        position: obj.position,
        rotation: obj.rotation || [0, 0, 0],
        scale: obj.scale || [1, 1, 1],
        audioParams: obj.audioParams,
        audioEnabled: Boolean(obj.audioEnabled),
        isSelected: false,
        ...(obj.customShapeCode ? { customShapeCode: obj.customShapeCode } : {}),
        ...(obj.customSynthesisCode ? { customSynthesisCode: obj.customSynthesisCode } : {}),
      })),
      effectZones: scoreGrid.effectZones.map((zone) => ({
        id: zone.id,
        type: zone.type,
        shape: zone.shape || 'sphere',
        position: zone.position,
        rotation: zone.rotation || [0, 0, 0],
        scale: zone.scale || [1, 1, 1],
        effectParams: zone.effectParams,
        isSelected: false,
        isLocked: false,
      })),
      mobileObjects: scoreGrid.mobileObjects.map((mobile) => ({
        id: mobile.id,
        type: 'mobile' as const,
        position: mobile.position,
        rotation: mobile.rotation || [0, 0, 0],
        scale: mobile.scale || [1, 1, 1],
        mobileParams: mobile.mobileParams,
        isSelected: false,
      })),
    });
  }

  // 4. Aplicar el estado a todos los stores (misma estrategia que la carga
  //    inicial desde Firestore)
  useWorldStore.setState({
    grids: newGrids,
    activeGridId: newGrids.keys().next().value || null,
    selectedEntityId: null,
  });
  useGridStore.setState({ grids: newGrids });

  const allObjects = [...newGrids.values()].flatMap((grid) => grid.objects);
  const objectsByGrid = new Map(
    [...newGrids.entries()].map(([gridId, grid]) => [gridId, grid.objects])
  );
  useObjectStore.setState({ objects: allObjects, objectsByGrid });
  useEffectStore.setState({
    effectZones: [...newGrids.values()].flatMap((grid) => grid.effectZones),
  });
  useMobileStore.setState({
    mobileObjects: [...newGrids.values()].flatMap((grid) => grid.mobileObjects),
  });

  // 5. Recrear los motores de síntesis de cada objeto sonoro
  newGrids.forEach((grid) => {
    grid.objects.forEach((object) => {
      try {
        if (!audioManager.getSoundSourceState(object.id)) {
          audioManager.createSoundSource(
            object.id,
            object.type,
            object.audioParams,
            object.position
          );
          if (object.audioEnabled) {
            audioManager.startContinuousSound(object.id, object.audioParams);
          }
        }
      } catch (error) {
        console.error(`Error recreando audio para objeto ${object.id}:`, error);
      }
    });
  });
}

/**
 * Lee un archivo .json seleccionado por el usuario, lo valida contra la
 * especificación y recrea la sesión.
 */
export async function importTopologicalScoreFromFile(file: File): Promise<void> {
  const text = await file.text();
  const parsed: unknown = JSON.parse(text);

  if (!isTopologicalScore(parsed)) {
    throw new Error(
      'El archivo no es una partitura topológica válida (formato solomon-house/topological-score).'
    );
  }

  applyTopologicalScore(parsed);
}
