import {
  type TopologicalScore,
  type TopologicalScoreGrid,
  buildTopologicalScore,
} from './topologicalScore';

/**
 * Generador de Partituras Gráficas Vectoriales (roadmap 5.4).
 *
 * Convierte la partitura topológica (JSON, roadmap 5.3) en un plano
 * bidimensional anotado en SVG: una proyección cenital (plano X-Z) de cada
 * cuadrícula con simbología de audio — partitura arquitectónica expandida.
 *
 * Simbología:
 *   - Objetos sonoros: glifo según el tipo de síntesis, anotado con su
 *     frecuencia fundamental (Hz) y el radio proporcional a la escala.
 *   - Zonas de efectos: círculos punteados con el nombre del efecto;
 *     su radio refleja el alcance espacial de la zona.
 *   - Objetos móviles: trayectoria orbital indicada con círculo de guiones
 *     finos y flecha de dirección.
 *   - La altura (Y) se anota numéricamente junto a cada glifo, siguiendo la
 *     convención de cotas de los planos arquitectónicos.
 */

const SVG_SIZE = 800;
const MARGIN = 60;

/** Color por tipo de objeto sonoro (coincide con la paleta de la plataforma). */
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

/** Glifo SVG de un objeto sonoro según su tipo, centrado en (0,0). */
function objectGlyph(type: string, radius: number, color: string): string {
  switch (type) {
    case 'cube':
      return `<rect x="${-radius}" y="${-radius}" width="${radius * 2}" height="${radius * 2}" fill="${color}" fill-opacity="0.7" stroke="${color}"/>`;
    case 'pyramid':
    case 'cone':
      return `<polygon points="0,${-radius} ${radius},${radius} ${-radius},${radius}" fill="${color}" fill-opacity="0.7" stroke="${color}"/>`;
    case 'torus':
    case 'dodecahedronRing':
      return `<circle r="${radius}" fill="none" stroke="${color}" stroke-width="3"/>`;
    case 'plane':
      return `<rect x="${-radius}" y="${-radius / 3}" width="${radius * 2}" height="${radius / 1.5}" fill="${color}" fill-opacity="0.7" stroke="${color}"/>`;
    case 'spiral':
      return `<path d="M 0 0 m ${-radius} 0 a ${radius} ${radius} 0 1 1 ${radius * 2} 0 a ${radius * 0.66} ${radius * 0.66} 0 1 1 ${-radius * 1.32} 0" fill="none" stroke="${color}" stroke-width="2"/>`;
    default:
      // sphere, cylinder, icosahedron, custom
      return `<circle r="${radius}" fill="${color}" fill-opacity="0.7" stroke="${color}"/>`;
  }
}

function renderGrid(grid: TopologicalScoreGrid, index: number): string {
  const half = (grid.gridSize || 20) / 2;
  const scale = (SVG_SIZE - MARGIN * 2) / (half * 2);

  // Proyección cenital: X del mundo -> X del plano, Z del mundo -> Y del plano
  const toX = (x: number) => MARGIN + (x + half) * scale;
  const toY = (z: number) => MARGIN + (z + half) * scale;

  const parts: string[] = [];

  parts.push(`<g id="grid-${index}">`);

  // Marco y retícula de referencia
  parts.push(
    `<rect x="${MARGIN}" y="${MARGIN}" width="${SVG_SIZE - MARGIN * 2}" height="${SVG_SIZE - MARGIN * 2}" fill="#0f172a" stroke="#334155"/>`
  );
  const step = (SVG_SIZE - MARGIN * 2) / 10;
  for (let i = 1; i < 10; i++) {
    const offset = MARGIN + i * step;
    parts.push(
      `<line x1="${offset}" y1="${MARGIN}" x2="${offset}" y2="${SVG_SIZE - MARGIN}" stroke="#1e293b" stroke-width="0.5"/>`,
      `<line x1="${MARGIN}" y1="${offset}" x2="${SVG_SIZE - MARGIN}" y2="${offset}" stroke="#1e293b" stroke-width="0.5"/>`
    );
  }

  // Zonas de efectos: campo de influencia espacial
  for (const zone of grid.effectZones) {
    const cx = toX(zone.position[0]);
    const cy = toY(zone.position[2]);
    const radius = Math.max(zone.scale[0], zone.scale[2]) * scale;
    parts.push(
      `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="#22d3ee" fill-opacity="0.08" stroke="#22d3ee" stroke-dasharray="6 4" stroke-opacity="0.6"/>`,
      `<text x="${cx}" y="${cy - radius - 6}" text-anchor="middle" fill="#22d3ee" font-size="11">${escapeXml(zone.type)}</text>`
    );
  }

  // Objetos móviles: órbita y dirección
  for (const mobile of grid.mobileObjects) {
    const cx = toX(mobile.mobileParams.centerPosition?.[0] ?? mobile.position[0]);
    const cy = toY(mobile.mobileParams.centerPosition?.[2] ?? mobile.position[2]);
    const orbit = (mobile.mobileParams.radius || 1) * scale;
    parts.push(
      `<circle cx="${cx}" cy="${cy}" r="${orbit}" fill="none" stroke="#facc15" stroke-dasharray="2 4" stroke-opacity="0.7"/>`,
      `<circle cx="${toX(mobile.position[0])}" cy="${toY(mobile.position[2])}" r="5" fill="#facc15"/>`,
      `<text x="${cx}" y="${cy + orbit + 14}" text-anchor="middle" fill="#facc15" font-size="10">móvil · ${escapeXml(mobile.mobileParams.movementType || 'circular')} · v=${mobile.mobileParams.speed ?? 1}</text>`
    );
  }

  // Objetos sonoros: glifo + cota de altura + frecuencia
  for (const obj of grid.objects) {
    const cx = toX(obj.position[0]);
    const cy = toY(obj.position[2]);
    const radius = Math.max(6, Math.max(obj.scale[0], obj.scale[2]) * scale * 0.35);
    const color = OBJECT_COLORS[obj.type] || '#e2e8f0';
    const frequency = obj.audioParams?.frequency;
    const label = frequency ? `${Math.round(Number(frequency))} Hz` : obj.type;

    parts.push(
      `<g transform="translate(${cx},${cy})">`,
      objectGlyph(obj.type, radius, color),
      `<text y="${radius + 12}" text-anchor="middle" fill="${color}" font-size="10">${escapeXml(label)}</text>`,
      `<text y="${radius + 23}" text-anchor="middle" fill="#64748b" font-size="8">y=${obj.position[1].toFixed(1)}${obj.audioEnabled ? ' · dron' : ''}</text>`,
      `</g>`
    );
  }

  parts.push('</g>');
  return parts.join('\n');
}

/**
 * Convierte una partitura topológica en un documento SVG anotado
 * (una "página" por cuadrícula, apiladas verticalmente).
 */
export function topologicalScoreToSvg(score: TopologicalScore): string {
  const pages = score.grids.length || 1;
  const height = SVG_SIZE * pages;

  const body = score.grids
    .map((grid, i) => `<g transform="translate(0,${i * SVG_SIZE})">${renderGrid(grid, i)}</g>`)
    .join('\n');

  const title = score.metadata?.title || 'Partitura Topológica';
  const date = score.exportedAt.slice(0, 10);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_SIZE}" height="${height}" viewBox="0 0 ${SVG_SIZE} ${height}" font-family="monospace">`,
    `<rect width="${SVG_SIZE}" height="${height}" fill="#020617"/>`,
    `<text x="${MARGIN}" y="${MARGIN - 28}" fill="#e2e8f0" font-size="18">${escapeXml(title)}</text>`,
    `<text x="${MARGIN}" y="${MARGIN - 10}" fill="#64748b" font-size="11">La Casa de Salomón · ${date} · proyección cenital (X-Z), cotas de altura en Y</text>`,
    body,
    '</svg>',
  ].join('\n');
}

/**
 * Exporta la sesión actual como partitura gráfica vectorial (.svg).
 */
export function exportGraphicScore(metadata?: TopologicalScore['metadata']): void {
  const score = buildTopologicalScore(metadata);
  const svg = topologicalScoreToSvg(score);
  const blob = new Blob([svg], { type: 'image/svg+xml' });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `partitura-grafica-${score.exportedAt.slice(0, 19).replace(/[:T]/g, '-')}.svg`;
  anchor.click();
  URL.revokeObjectURL(url);
}
