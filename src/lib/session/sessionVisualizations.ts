import { type CasaSessionV2, buildCasaSessionV2 } from './sessionRecorder';

/**
 * Visualizaciones vectoriales de sesión para la tesis y artículos (Roadmap Funcional Jurado E1.5).
 *
 * Cubre:
 *  - E1.5.1: Mapa de calor de la distribución espacial de objetos y recorridos
 *            en proyección cenital (X-Z).
 *  - E1.5.2: Diagrama topológico por fases (experimentación, consolidación,
 *            producción, presentación) con animación SVG.
 *  - E1.5.3: Partitura gráfica temporal (eje horizontal = tiempo, eje vertical =
 *            altura logarítmica en Hz) exportable en SVG.
 */

const OBJECT_COLORS: Record<string, string> = {
  cube: '#60a5fa',
  sphere: '#a78bfa',
  cylinder: '#34d399',
  cone: '#f87171',
  pyramid: '#fbbf24',
  icosahedron: '#f472b6',
  plane: '#94a3b8',
  torus: '#2dd4bf',
  dodecahedronRing: '#c084fc',
  spiral: '#fb923c',
  custom: '#e879f9',
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function downloadSvgFile(svgContent: string, filenamePrefix: string): void {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenamePrefix}-${timestamp}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// E1.5.1 · Mapa de calor espacial de objetos y recorridos
// ============================================================================

export function generateSpatialHeatmapSvg(sessionInput?: CasaSessionV2): string {
  const session = sessionInput ?? buildCasaSessionV2();
  const size = 680;
  const margin = 56;
  const plotSize = size - margin * 2;
  const cells = 12;
  const cellSize = plotSize / cells;

  const gridSize = session.initialSnapshot.grids[0]?.gridSize || 20;
  const half = gridSize / 2;

  const heatGrid: number[][] = Array.from({ length: cells }, () =>
    Array.from({ length: cells }, () => 0)
  );

  const addHeat = (pos: [number, number, number], weight: number) => {
    const nx = Math.max(0, Math.min(0.999, (pos[0] + half) / (half * 2)));
    const nz = Math.max(0, Math.min(0.999, (pos[2] + half) / (half * 2)));
    const cx = Math.floor(nx * cells);
    const cz = Math.floor(nz * cells);
    heatGrid[cz][cx] += weight;
    // Difusión gaussiana suave a celdas vecinas
    for (let dz = -1; dz <= 1; dz++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dz === 0) continue;
        const r = cz + dz;
        const c = cx + dx;
        if (r >= 0 && r < cells && c >= 0 && c < cells) {
          heatGrid[r][c] += weight * 0.35;
        }
      }
    }
  };

  for (const g of session.initialSnapshot.grids) {
    for (const obj of g.objects) addHeat(obj.position, 2.5);
    for (const zone of g.effectZones) addHeat(zone.position, 1.5);
    for (const mob of g.mobileObjects) addHeat(mob.position, 2.0);
  }

  const trajectories: { from: [number, number, number]; to: [number, number, number]; color: string }[] = [];
  for (const ev of session.events) {
    if (ev.position) {
      addHeat(ev.position, ev.type === 'create' ? 2.0 : 1.0);
    }
    if (ev.type === 'move' && ev.previousPosition && ev.position) {
      trajectories.push({
        from: ev.previousPosition,
        to: ev.position,
        color: OBJECT_COLORS[ev.objectType || 'sphere'] || '#38bdf8',
      });
    }
  }

  let maxHeat = 1;
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if (heatGrid[r][c] > maxHeat) maxHeat = heatGrid[r][c];
    }
  }

  const toX = (x: number) => margin + ((x + half) / (half * 2)) * plotSize;
  const toY = (z: number) => margin + ((z + half) / (half * 2)) * plotSize;

  const rects: string[] = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const intensity = heatGrid[r][c] / maxHeat;
      const x = margin + c * cellSize;
      const y = margin + r * cellSize;
      const hue = Math.round(220 - intensity * 195); // azul profundo -> ámbar/rojo cálido
      const alpha = (0.12 + intensity * 0.78).toFixed(2);
      rects.push(
        `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cellSize.toFixed(1)}" height="${cellSize.toFixed(1)}" fill="hsla(${hue}, 88%, 54%, ${alpha})" stroke="#1e293b" stroke-width="0.5"/>`
      );
    }
  }

  const lines = trajectories.map(
    (tr) =>
      `<line x1="${toX(tr.from[0]).toFixed(1)}" y1="${toY(tr.from[2]).toFixed(1)}" x2="${toX(tr.to[0]).toFixed(1)}" y2="${toY(tr.to[2]).toFixed(1)}" stroke="${tr.color}" stroke-width="2" stroke-dasharray="4 2" stroke-opacity="0.9"/>`
  );

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" font-family="monospace">`,
    `<rect width="${size}" height="${size}" fill="#020617"/>`,
    `<text x="${margin}" y="28" fill="#f8fafc" font-size="15" font-weight="bold">Mapa de Calor Espacial y Recorridos (X-Z)</text>`,
    `<text x="${margin}" y="44" fill="#94a3b8" font-size="11">${escapeXml(session.metadata.title)} · Nivel ${session.metadata.level}</text>`,
    ...rects,
    ...lines,
    `<rect x="${margin}" y="${margin}" width="${plotSize}" height="${plotSize}" fill="none" stroke="#475569" stroke-width="1.5"/>`,
    `<text x="${size / 2}" y="${size - 16}" text-anchor="middle" fill="#64748b" font-size="10">Eje X espacial (−${half}m a +${half}m) · Líneas discontinuas = trayectorias gestuales</text>`,
    `</svg>`,
  ].join('\n');
}

export function exportSpatialHeatmapSvg(sessionInput?: CasaSessionV2): void {
  downloadSvgFile(generateSpatialHeatmapSvg(sessionInput), 'mapa-calor-espacial');
}

// ============================================================================
// E1.5.2 · Diagrama topológico animado / por fases
// ============================================================================

export function generatePhaseTopologicalSvg(sessionInput?: CasaSessionV2): string {
  const session = sessionInput ?? buildCasaSessionV2();
  const width = 880;
  const height = 280;
  const panelSize = 180;
  const phases = [
    { name: 'I. Experimentación', ratio: 0.25 },
    { name: 'II. Consolidación', ratio: 0.55 },
    { name: 'III. Producción', ratio: 0.85 },
    { name: 'IV. Presentación', ratio: 1.0 },
  ];

  const durationMs = Math.max(1000, session.metadata.durationMs);
  const gridSize = session.initialSnapshot.grids[0]?.gridSize || 20;
  const half = gridSize / 2;

  const panelsSvg = phases.map((phase, idx) => {
    const offsetX = 28 + idx * 212;
    const offsetY = 58;
    const cutoffMs = durationMs * phase.ratio;

    const objectsMap = new Map<
      string,
      { type: string; position: [number, number, number]; freq: number; authorRole: string }
    >();
    for (const g of session.initialSnapshot.grids) {
      for (const o of g.objects) {
        objectsMap.set(o.id, {
          type: o.type,
          position: o.position,
          freq: Number(o.audioParams?.frequency ?? 440),
          authorRole: 'user',
        });
      }
    }

    for (const ev of session.events) {
      if (ev.t > cutoffMs) break;
      if (ev.entityType === 'soundObject') {
        if (ev.type === 'create') {
          objectsMap.set(ev.entityId, {
            type: ev.objectType || 'sphere',
            position: ev.position || [0, 1, 0],
            freq: Number(ev.params?.frequency ?? 440),
            authorRole: ev.author.role,
          });
        } else if (ev.type === 'move' && ev.position) {
          const cur = objectsMap.get(ev.entityId);
          if (cur) cur.position = ev.position;
        } else if (ev.type === 'remove') {
          objectsMap.delete(ev.entityId);
        }
      }
    }

    const toLocalX = (x: number) => ((x + half) / (half * 2)) * panelSize;
    const toLocalY = (z: number) => ((z + half) / (half * 2)) * panelSize;

    const nodes: string[] = [];
    const arr = Array.from(objectsMap.values());

    // Enlaces topológicos entre objetos cercanos (< 6m)
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const d = Math.hypot(
          arr[i].position[0] - arr[j].position[0],
          arr[i].position[2] - arr[j].position[2]
        );
        if (d <= 6.5) {
          nodes.push(
            `<line x1="${toLocalX(arr[i].position[0]).toFixed(1)}" y1="${toLocalY(arr[i].position[2]).toFixed(1)}" x2="${toLocalX(arr[j].position[0]).toFixed(1)}" y2="${toLocalY(arr[j].position[2]).toFixed(1)}" stroke="#38bdf8" stroke-opacity="0.35" stroke-width="1"/>`
          );
        }
      }
    }

    for (const obj of arr) {
      const cx = toLocalX(obj.position[0]).toFixed(1);
      const cy = toLocalY(obj.position[2]).toFixed(1);
      const color = OBJECT_COLORS[obj.type] || '#a78bfa';
      const r = obj.authorRole === 'agent' ? 6 : 5;
      nodes.push(
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="${obj.authorRole === 'agent' ? '#34d399' : '#f8fafc'}" stroke-width="1.2">`,
        `<animate attributeName="r" values="${r};${r + 2};${r}" dur="2.4s" repeatCount="indefinite"/>`,
        `</circle>`
      );
    }

    return [
      `<g transform="translate(${offsetX},${offsetY})">`,
      `<rect width="${panelSize}" height="${panelSize}" fill="#0f172a" stroke="#334155" rx="6"/>`,
      `<text x="${panelSize / 2}" y="-8" text-anchor="middle" fill="#e2e8f0" font-size="11" font-weight="bold">${escapeXml(phase.name)}</text>`,
      ...nodes,
      `<text x="${panelSize / 2}" y="${panelSize + 16}" text-anchor="middle" fill="#64748b" font-size="10">${arr.length} nodos activos · t=${Math.round(cutoffMs / 1000)}s</text>`,
      `</g>`,
    ].join('\n');
  });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="monospace">`,
    `<rect width="${width}" height="${height}" fill="#020617"/>`,
    `<text x="28" y="26" fill="#f8fafc" font-size="15" font-weight="bold">Evolución Topológica por Fases — ${escapeXml(session.metadata.title)}</text>`,
    ...panelsSvg,
    `</svg>`,
  ].join('\n');
}

export function exportPhaseTopologicalSvg(sessionInput?: CasaSessionV2): void {
  downloadSvgFile(generatePhaseTopologicalSvg(sessionInput), 'diagrama-topologico-fases');
}

// ============================================================================
// E1.5.3 · Partitura gráfica temporal (eje horizontal = tiempo, vertical = Hz)
// ============================================================================

export function generateTemporalGraphicScoreSvg(sessionInput?: CasaSessionV2): string {
  const session = sessionInput ?? buildCasaSessionV2();
  const width = 920;
  const height = 420;
  const left = 72;
  const right = 36;
  const top = 56;
  const bottom = 52;
  const plotW = width - left - right;
  const plotH = height - top - bottom;

  const durationMs = Math.max(5000, session.metadata.durationMs || 60_000);
  const minFreq = 30;
  const maxFreq = 4000;

  const timeToX = (tMs: number) =>
    left + Math.max(0, Math.min(1, tMs / durationMs)) * plotW;

  const freqToY = (freq: number) => {
    const clamped = Math.max(minFreq, Math.min(maxFreq, freq));
    const norm = Math.log2(clamped / minFreq) / Math.log2(maxFreq / minFreq);
    return top + plotH - norm * plotH;
  };

  interface SpanTrack {
    id: string;
    type: string;
    authorRole: string;
    startMs: number;
    endMs: number;
    freq: number;
  }

  const tracks = new Map<string, SpanTrack>();
  const finishedTracks: SpanTrack[] = [];

  for (const g of session.initialSnapshot.grids) {
    for (const obj of g.objects) {
      tracks.set(obj.id, {
        id: obj.id,
        type: obj.type,
        authorRole: 'user',
        startMs: 0,
        endMs: durationMs,
        freq: Number(obj.audioParams?.frequency ?? 440),
      });
    }
  }

  for (const ev of session.events) {
    if (ev.entityType === 'soundObject') {
      if (ev.type === 'create') {
        tracks.set(ev.entityId, {
          id: ev.entityId,
          type: ev.objectType || 'sphere',
          authorRole: ev.author.role,
          startMs: ev.t,
          endMs: durationMs,
          freq: Number(ev.params?.frequency ?? 440),
        });
      } else if (ev.type === 'param_change' && typeof ev.params?.frequency === 'number') {
        const cur = tracks.get(ev.entityId);
        if (cur) {
          finishedTracks.push({ ...cur, endMs: ev.t });
          tracks.set(ev.entityId, {
            ...cur,
            startMs: ev.t,
            endMs: durationMs,
            freq: ev.params.frequency,
          });
        }
      } else if (ev.type === 'remove') {
        const cur = tracks.get(ev.entityId);
        if (cur) {
          finishedTracks.push({ ...cur, endMs: ev.t });
          tracks.delete(ev.entityId);
        }
      }
    }
  }

  tracks.forEach((tr) => finishedTracks.push(tr));

  const freqGuides = [55, 110, 220, 440, 880, 1760, 3520];
  const guideLines = freqGuides.map((f) => {
    const y = freqToY(f).toFixed(1);
    return [
      `<line x1="${left}" y1="${y}" x2="${left + plotW}" y2="${y}" stroke="#1e293b" stroke-dasharray="3 3"/>`,
      `<text x="${left - 8}" y="${Number(y) + 3}" text-anchor="end" fill="#64748b" font-size="10">${f} Hz</text>`,
    ].join('\n');
  });

  const timeTicks = 6;
  const timeLines: string[] = [];
  for (let i = 0; i <= timeTicks; i++) {
    const t = (i / timeTicks) * durationMs;
    const x = timeToX(t).toFixed(1);
    timeLines.push(
      `<line x1="${x}" y1="${top}" x2="${x}" y2="${top + plotH}" stroke="#1e293b" stroke-width="0.7"/>`,
      `<text x="${x}" y="${top + plotH + 18}" text-anchor="middle" fill="#94a3b8" font-size="10">${Math.round(t / 1000)}s</text>`
    );
  }

  const bars = finishedTracks.map((tr) => {
    const x1 = timeToX(tr.startMs);
    const x2 = Math.max(x1 + 8, timeToX(tr.endMs));
    const y = freqToY(tr.freq);
    const color = OBJECT_COLORS[tr.type] || '#60a5fa';
    const dash = tr.authorRole === 'agent' ? 'stroke-dasharray="5 3"' : '';
    return [
      `<g>`,
      `<line x1="${x1.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-opacity="0.82" ${dash}/>`,
      `<circle cx="${x1.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="#f8fafc"/>`,
      `</g>`,
    ].join('\n');
  });

  const markerElements = (session.markers ?? []).map((mk) => {
    const x = timeToX(mk.t).toFixed(1);
    return [
      `<line x1="${x}" y1="${top}" x2="${x}" y2="${top + plotH}" stroke="#facc15" stroke-width="1.2" stroke-dasharray="2 2"/>`,
      `<text x="${Number(x) + 4}" y="${top + 12}" fill="#facc15" font-size="9">${escapeXml(mk.label)}</text>`,
    ].join('\n');
  });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="monospace">`,
    `<rect width="${width}" height="${height}" fill="#020617"/>`,
    `<text x="${left}" y="26" fill="#f8fafc" font-size="16" font-weight="bold">Partitura Gráfica Temporal — ${escapeXml(session.metadata.title)}</text>`,
    `<text x="${left}" y="43" fill="#64748b" font-size="11">Eje X: tiempo (0–${Math.round(durationMs / 1000)}s) · Eje Y: frecuencia logarítmica (Hz) · Trazo continuo = humano · Discontinuo = Jardinero Sónico</text>`,
    `<rect x="${left}" y="${top}" width="${plotW}" height="${plotH}" fill="#0f172a" stroke="#334155"/>`,
    ...guideLines,
    ...timeLines,
    ...bars,
    ...markerElements,
    `</svg>`,
  ].join('\n');
}

export function exportTemporalGraphicScoreSvg(sessionInput?: CasaSessionV2): void {
  downloadSvgFile(generateTemporalGraphicScoreSvg(sessionInput), 'partitura-grafica-temporal');
}
