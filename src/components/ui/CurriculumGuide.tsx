'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  LESSON_COUNT,
  CHALLENGE_CHECKS,
  loadProgress,
  saveProgress,
} from '../../lib/pedagogy/curriculum';
import { useUIPanelStore } from '../../state/useUIPanelStore';

export function CurriculumGuide() {
  const { t } = useLanguage();
  const activeModal = useUIPanelStore((s) => s.activeModal);
  const closeModal = useUIPanelStore((s) => s.closeModal);
  const open = activeModal === 'curriculum';
  const [selected, setSelected] = useState(0);
  const [progress, setProgress] = useState<boolean[]>(() => Array(LESSON_COUNT).fill(false));
  const [feedback, setFeedback] = useState<'done' | 'notDone' | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const completedCount = progress.filter(Boolean).length;
  const lessonKey = `curriculum.l${selected + 1}`;

  const handleVerify = () => {
    const check = CHALLENGE_CHECKS[selected + 1];
    const passed = Boolean(check?.());
    setFeedback(passed ? 'done' : 'notDone');
    if (passed && !progress[selected]) {
      const next = [...progress];
      next[selected] = true;
      setProgress(next);
      saveProgress(next);
    }
    setTimeout(() => setFeedback(null), 2500);
  };

  return (
    <>
      {open && (
        <div className="fixed top-14 left-[21rem] w-80 max-h-[75vh] overflow-y-auto bg-black/95 border border-teal-500/40 backdrop-blur-md rounded-xl p-4 z-50 font-mono text-sm text-gray-200 space-y-3 shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-teal-300 font-bold mb-1">
                {t('curriculum.title')} ({completedCount}/{LESSON_COUNT})
              </h3>
              <p className="text-xs text-gray-400">{t('curriculum.subtitle')}</p>
            </div>
            <button onClick={closeModal} className="text-gray-400 hover:text-white px-1">
              ✕
            </button>
          </div>

          {/* Mapa de lecciones */}
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: LESSON_COUNT }, (_, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelected(index);
                  setFeedback(null);
                }}
                className={`px-1 py-1 rounded text-xs transition-colors ${
                  index === selected
                    ? 'bg-teal-500/40 text-white'
                    : progress[index]
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {progress[index] ? '✓' : index + 1}
              </button>
            ))}
          </div>

          {/* Lección seleccionada */}
          <div className="bg-white/5 rounded p-3 space-y-2">
            <p className="text-xs text-gray-500">
              {t('curriculum.lessonLabel')} {selected + 1}/{LESSON_COUNT}
            </p>
            <h4 className="text-teal-200 text-sm font-bold">{t(`${lessonKey}.title`)}</h4>
            <p className="text-xs text-gray-300">{t(`${lessonKey}.lesson`)}</p>
            <p className="text-xs text-amber-200">
              🎯 {t('curriculum.challengeLabel')}: {t(`${lessonKey}.challenge`)}
            </p>
          </div>

          <button
            onClick={handleVerify}
            className="w-full px-2 py-2 bg-teal-500/20 hover:bg-teal-500/40 rounded text-xs transition-colors"
          >
            {t('curriculum.verify')}
          </button>

          {feedback && (
            <p
              className={`text-xs ${feedback === 'done' ? 'text-emerald-300' : 'text-amber-300'}`}
            >
              {t(`curriculum.${feedback}`)}
            </p>
          )}

          <p className="text-xs text-gray-500">
            {t('curriculum.progress')}: {completedCount}/{LESSON_COUNT}
          </p>
        </div>
      )}
    </>
  );
}
