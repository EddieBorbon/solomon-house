/**
 * Pipeline de Exámenes de Audio Psicoacústicos (roadmap 8.4) — lógica pura.
 *
 * Genera y califica tests gamificados de dos destrezas:
 *
 *   - **Localización espacial**: un tono se reproduce en una dirección
 *     oculta alrededor del oyente (espacialización binaural HRTF) y el
 *     estudiante debe señalar de dónde proviene.
 *   - **Modulación**: se reproducen dos sonidos en secuencia, uno puro y
 *     uno con modulación de fase/frecuencia; el estudiante identifica el
 *     modulado. La profundidad de modulación disminuye con las rondas
 *     (dificultad creciente).
 *
 * La reproducción y la UI viven en `AudioExamPanel.tsx`; este módulo es
 * determinista dado un generador aleatorio, para poder probarse.
 */

export interface ExamDirection {
  label: string;
  offset: [number, number, number];
}

/** Mismas seis direcciones que el calibrador acústico (4.4). */
export const EXAM_DIRECTIONS: ExamDirection[] = [
  { label: 'Frente', offset: [0, 0, -3] },
  { label: 'Atrás', offset: [0, 0, 3] },
  { label: 'Izquierda', offset: [-3, 0, 0] },
  { label: 'Derecha', offset: [3, 0, 0] },
  { label: 'Arriba', offset: [0, 3, 0] },
  { label: 'Abajo', offset: [0, -3, 0] },
];

export type ExamPhase = 'localizacion' | 'modulacion';

export interface LocalizationRound {
  phase: 'localizacion';
  directionIndex: number;
  /** Frecuencia del tono de prueba (vario para evitar memorizar timbre) */
  frequency: number;
}

export interface ModulationRound {
  phase: 'modulacion';
  /** true → el primer sonido es el modulado */
  modulatedFirst: boolean;
  /** Índice de modulación (profundidad); decrece con la dificultad */
  modulationIndex: number;
  frequency: number;
}

export type ExamRound = LocalizationRound | ModulationRound;

const LOCALIZATION_FREQS = [330, 440, 587, 784];
/** Profundidades por ronda: de evidente a sutil */
const MODULATION_DEPTHS = [12, 8, 5, 3, 1.5];

/**
 * Genera un examen completo: `roundsPerPhase` rondas de localización
 * seguidas de `roundsPerPhase` rondas de modulación con dificultad
 * creciente. `random` permite inyectar un generador determinista.
 */
export function generateExam(
  roundsPerPhase: number = 5,
  random: () => number = Math.random
): ExamRound[] {
  const rounds: ExamRound[] = [];

  let previousDirection = -1;
  for (let i = 0; i < roundsPerPhase; i++) {
    // Evitar repetir la dirección inmediatamente anterior
    let directionIndex = Math.floor(random() * EXAM_DIRECTIONS.length);
    if (directionIndex === previousDirection) {
      directionIndex = (directionIndex + 1) % EXAM_DIRECTIONS.length;
    }
    previousDirection = directionIndex;

    rounds.push({
      phase: 'localizacion',
      directionIndex,
      frequency: LOCALIZATION_FREQS[Math.floor(random() * LOCALIZATION_FREQS.length)],
    });
  }

  for (let i = 0; i < roundsPerPhase; i++) {
    const depthIndex = Math.min(i, MODULATION_DEPTHS.length - 1);
    rounds.push({
      phase: 'modulacion',
      modulatedFirst: random() < 0.5,
      modulationIndex: MODULATION_DEPTHS[depthIndex],
      frequency: 220 + Math.floor(random() * 3) * 110, // 220/330/440
    });
  }

  return rounds;
}

export interface ExamGrade {
  percent: number;
  label: string;
  byPhase: Record<ExamPhase, { correct: number; total: number }>;
}

const GRADE_LABELS: { min: number; label: string }[] = [
  { min: 90, label: 'Oído de arquitecto sonoro' },
  { min: 75, label: 'Escucha espacial avanzada' },
  { min: 55, label: 'Escucha en desarrollo' },
  { min: 0, label: 'Sigue explorando la sala' },
];

/** Califica las respuestas (true = acierto) agrupando por fase. */
export function gradeExam(
  rounds: ExamRound[],
  answers: boolean[]
): ExamGrade {
  const byPhase: ExamGrade['byPhase'] = {
    localizacion: { correct: 0, total: 0 },
    modulacion: { correct: 0, total: 0 },
  };

  rounds.forEach((round, index) => {
    const bucket = byPhase[round.phase];
    bucket.total++;
    if (answers[index]) bucket.correct++;
  });

  const total = rounds.length || 1;
  const correct = answers.filter(Boolean).length;
  const percent = Math.round((correct / total) * 100);
  const label = GRADE_LABELS.find((grade) => percent >= grade.min)!.label;

  return { percent, label, byPhase };
}
