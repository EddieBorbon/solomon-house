'use client';

import { useState, useCallback } from 'react';
import * as Tone from 'tone';
import {
  EXAM_DIRECTIONS,
  generateExam,
  gradeExam,
  type ExamRound,
  type ExamGrade,
} from '../../lib/pedagogy/audioExam';

/**
 * Exámenes de Audio Psicoacústicos Gamificados (roadmap 8.4).
 *
 * Test dentro del espacio 3D con dos fases: localización espacial
 * binaural (¿de dónde viene el tono?) y discriminación de modulación
 * (¿cuál de los dos sonidos está modulado?), con dificultad creciente,
 * racha de aciertos y calificación final persistida en localStorage.
 */

const STORAGE_KEY = 'solomon-house:audio-exam-best';
const ROUNDS_PER_PHASE = 5;

interface BestResult {
  percent: number;
  label: string;
  date: string;
}

function loadBest(): BestResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BestResult) : null;
  } catch {
    return null;
  }
}

/** Tono espacializado en una dirección relativa al oyente (HRTF). */
async function playSpatialTone(offset: [number, number, number], frequency: number) {
  await Tone.start();
  const listener = Tone.getListener();
  const panner = new Tone.Panner3D({
    panningModel: 'HRTF',
    positionX: listener.positionX.value + offset[0],
    positionY: listener.positionY.value + offset[1],
    positionZ: listener.positionZ.value + offset[2],
  }).connect(Tone.getDestination());

  const oscillator = new Tone.Oscillator(frequency, 'sine').connect(panner);
  oscillator.volume.value = -10;
  oscillator.start();
  oscillator.stop('+1');

  setTimeout(() => {
    oscillator.dispose();
    panner.dispose();
  }, 1500);
}

/** Par de sonidos en secuencia: uno puro y uno con modulación FM. */
async function playModulationPair(
  modulatedFirst: boolean,
  modulationIndex: number,
  frequency: number
) {
  await Tone.start();
  const destination = Tone.getDestination();

  const playPure = (offsetSeconds: number) => {
    const osc = new Tone.Oscillator(frequency, 'sine').connect(destination);
    osc.volume.value = -12;
    osc.start(`+${offsetSeconds}`);
    osc.stop(`+${offsetSeconds + 0.8}`);
    setTimeout(() => osc.dispose(), (offsetSeconds + 1.5) * 1000);
  };

  const playModulated = (offsetSeconds: number) => {
    const osc = new Tone.FMOscillator({
      frequency,
      type: 'sine',
      modulationType: 'sine',
      harmonicity: 1,
      modulationIndex,
    }).connect(destination);
    osc.volume.value = -12;
    osc.start(`+${offsetSeconds}`);
    osc.stop(`+${offsetSeconds + 0.8}`);
    setTimeout(() => osc.dispose(), (offsetSeconds + 1.5) * 1000);
  };

  if (modulatedFirst) {
    playModulated(0);
    playPure(1.1);
  } else {
    playPure(0);
    playModulated(1.1);
  }
}

type Stage = 'inicio' | 'ronda' | 'resultado';

export function AudioExamPanel() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>('inicio');
  const [rounds, setRounds] = useState<ExamRound[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [grade, setGrade] = useState<ExamGrade | null>(null);
  const [best, setBest] = useState<BestResult | null>(() =>
    typeof window === 'undefined' ? null : loadBest()
  );

  const round = rounds[current];

  const startExam = useCallback(() => {
    setRounds(generateExam(ROUNDS_PER_PHASE));
    setCurrent(0);
    setAnswers([]);
    setFeedback(null);
    setStreak(0);
    setGrade(null);
    setStage('ronda');
  }, []);

  const playRound = useCallback(() => {
    if (!round) return;
    if (round.phase === 'localizacion') {
      playSpatialTone(EXAM_DIRECTIONS[round.directionIndex].offset, round.frequency);
    } else {
      playModulationPair(round.modulatedFirst, round.modulationIndex, round.frequency);
    }
  }, [round]);

  const answer = useCallback(
    (isCorrect: boolean, correctLabel: string) => {
      const nextAnswers = [...answers, isCorrect];
      setAnswers(nextAnswers);
      setStreak(isCorrect ? streak + 1 : 0);
      setFeedback(isCorrect ? `✅ ¡Correcto!${streak >= 2 ? ` Racha de ${streak + 1}` : ''}` : `❌ Era: ${correctLabel}`);

      setTimeout(() => {
        setFeedback(null);
        if (current + 1 < rounds.length) {
          setCurrent(current + 1);
        } else {
          const finalGrade = gradeExam(rounds, nextAnswers);
          setGrade(finalGrade);
          setStage('resultado');
          if (!best || finalGrade.percent > best.percent) {
            const record: BestResult = {
              percent: finalGrade.percent,
              label: finalGrade.label,
              date: new Date().toISOString().slice(0, 10),
            };
            setBest(record);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
            } catch {
              // Sin almacenamiento: el récord vive solo en sesión
            }
          }
        }
      }, 1400);
    },
    [answers, best, current, rounds, streak]
  );

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-40 left-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 z-50 font-mono text-sm text-gray-400 hover:text-gray-200 transition-colors"
        title="Examen psicoacústico: localización espacial y discriminación de modulación"
      >
        🎯 Examen
      </button>

      {open && (
        <div className="fixed bottom-52 left-4 w-80 bg-black/90 backdrop-blur-md rounded-lg p-4 z-50 font-mono text-sm text-gray-200 space-y-3">
          <div>
            <h3 className="text-orange-300 font-bold mb-1">Examen de escucha espacial</h3>
            {stage === 'inicio' && (
              <p className="text-xs text-gray-400">
                {ROUNDS_PER_PHASE} rondas de localización binaural y{' '}
                {ROUNDS_PER_PHASE} de discriminación de modulación, con
                dificultad creciente. Usa auriculares.
              </p>
            )}
          </div>

          {stage === 'inicio' && (
            <>
              {best && (
                <p className="text-xs bg-white/5 rounded p-2">
                  🏆 Mejor marca: <span className="text-orange-300">{best.percent}%</span> —{' '}
                  {best.label} ({best.date})
                </p>
              )}
              <button
                onClick={startExam}
                className="w-full px-2 py-2 bg-orange-500/20 hover:bg-orange-500/40 rounded text-xs transition-colors"
              >
                ▶ Comenzar examen
              </button>
            </>
          )}

          {stage === 'ronda' && round && (
            <>
              <div className="flex justify-between text-xs text-gray-400">
                <span>
                  Ronda {current + 1}/{rounds.length} ·{' '}
                  {round.phase === 'localizacion' ? 'Localización' : 'Modulación'}
                </span>
                {streak >= 2 && <span className="text-orange-300">🔥 {streak}</span>}
              </div>

              <button
                onClick={playRound}
                disabled={!!feedback}
                className="w-full px-2 py-2 bg-white/10 hover:bg-white/20 rounded text-xs transition-colors disabled:opacity-40"
              >
                🔊 Reproducir sonido
              </button>

              {round.phase === 'localizacion' ? (
                <div className="grid grid-cols-3 gap-1">
                  {EXAM_DIRECTIONS.map((direction, index) => (
                    <button
                      key={direction.label}
                      disabled={!!feedback}
                      onClick={() =>
                        answer(
                          index === round.directionIndex,
                          EXAM_DIRECTIONS[round.directionIndex].label
                        )
                      }
                      className="px-2 py-1 bg-white/10 hover:bg-orange-500/30 rounded text-xs transition-colors disabled:opacity-40"
                    >
                      {direction.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">¿Cuál sonido estaba modulado?</p>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      disabled={!!feedback}
                      onClick={() => answer(round.modulatedFirst, round.modulatedFirst ? 'el primero' : 'el segundo')}
                      className="px-2 py-1 bg-white/10 hover:bg-orange-500/30 rounded text-xs transition-colors disabled:opacity-40"
                    >
                      El primero
                    </button>
                    <button
                      disabled={!!feedback}
                      onClick={() => answer(!round.modulatedFirst, round.modulatedFirst ? 'el primero' : 'el segundo')}
                      className="px-2 py-1 bg-white/10 hover:bg-orange-500/30 rounded text-xs transition-colors disabled:opacity-40"
                    >
                      El segundo
                    </button>
                  </div>
                </div>
              )}

              {feedback && <p className="text-xs text-orange-200">{feedback}</p>}
            </>
          )}

          {stage === 'resultado' && grade && (
            <>
              <div className="bg-white/5 rounded p-3 text-center">
                <p className="text-2xl text-orange-300">{grade.percent}%</p>
                <p className="text-xs text-gray-200">{grade.label}</p>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <p>
                  Localización: {grade.byPhase.localizacion.correct}/
                  {grade.byPhase.localizacion.total} aciertos
                </p>
                <p>
                  Modulación: {grade.byPhase.modulacion.correct}/
                  {grade.byPhase.modulacion.total} aciertos
                </p>
              </div>
              <p className="text-xs text-gray-500">
                ¿Localización baja? Prueba el calibrador 🎚 o carga tu perfil
                HRTF personalizado 👂.
              </p>
              <button
                onClick={startExam}
                className="w-full px-2 py-2 bg-orange-500/20 hover:bg-orange-500/40 rounded text-xs transition-colors"
              >
                ↻ Repetir examen
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
