'use client';

import AudioEffectCard from './AudioEffectCard';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AudioEffectsDashboard() {
  const { t } = useLanguage();

  const audioEffects = [
    {
      id: 'stereo-widener',
      title: t('audioEffects.cards.stereoWidener.title'),
      description: t('audioEffects.cards.stereoWidener.description'),
      icon: <span className="text-xl">🎧</span>,
      glowColor: 'from-blue-500',
      isActive: true,
      parameters: ['width', 'wet'],
    },
    {
      id: 'tremolo',
      title: t('audioEffects.cards.tremolo.title'),
      description: t('audioEffects.cards.tremolo.description'),
      icon: <span className="text-xl">🌊</span>,
      glowColor: 'from-red-500',
      isActive: false,
      parameters: ['frequency', 'depth', 'spread', 'type', 'wet'],
    },
    {
      id: 'vibrato',
      title: t('audioEffects.cards.vibrato.title'),
      description: t('audioEffects.cards.vibrato.description'),
      icon: <span className="text-xl">🎵</span>,
      glowColor: 'from-orange-500',
      isActive: false,
      parameters: ['frequency', 'depth', 'type', 'maxDelay', 'wet'],
    },
    {
      id: 'phaser',
      title: t('audioEffects.cards.phaser.title'),
      description: t('audioEffects.cards.phaser.description'),
      icon: <span className="text-xl">🌀</span>,
      glowColor: 'from-purple-500',
      isActive: false,
      parameters: ['frequency', 'depth', 'feedback', 'wet'],
    },
    {
      id: 'auto-filter',
      title: t('audioEffects.cards.autoFilter.title'),
      description: t('audioEffects.cards.autoFilter.description'),
      icon: <span className="text-xl">🔍</span>,
      glowColor: 'from-green-500',
      isActive: false,
      parameters: ['frequency', 'depth', 'baseFrequency', 'wet'],
    },
    {
      id: 'auto-wah',
      title: t('audioEffects.cards.autoWah.title'),
      description: t('audioEffects.cards.autoWah.description'),
      icon: <span className="text-xl">🎛️</span>,
      glowColor: 'from-orange-500',
      isActive: false,
      parameters: ['baseFrequency', 'octaves', 'sensitivity', 'wet'],
    },
    {
      id: 'bit-crusher',
      title: t('audioEffects.cards.bitCrusher.title'),
      description: t('audioEffects.cards.bitCrusher.description'),
      icon: <span className="text-xl">🔊</span>,
      glowColor: 'from-red-500',
      isActive: false,
      parameters: ['bits', 'frequency', 'wet'],
    },
    {
      id: 'chebyshev',
      title: t('audioEffects.cards.chebyshev.title'),
      description: t('audioEffects.cards.chebyshev.description'),
      icon: <span className="text-xl">📊</span>,
      glowColor: 'from-indigo-500',
      isActive: false,
      parameters: ['order', 'oversample', 'wet'],
    },
    {
      id: 'chorus',
      title: t('audioEffects.cards.chorus.title'),
      description: t('audioEffects.cards.chorus.description'),
      icon: <span className="text-xl">🎵</span>,
      glowColor: 'from-teal-500',
      isActive: false,
      parameters: ['frequency', 'delayTime', 'depth', 'wet'],
    },
    {
      id: 'distortion',
      title: t('audioEffects.cards.distortion.title'),
      description: t('audioEffects.cards.distortion.description'),
      icon: <span className="text-xl">⚡</span>,
      glowColor: 'from-pink-500',
      isActive: false,
      parameters: ['distortion', 'oversample', 'wet'],
    },
    {
      id: 'feedback-delay',
      title: t('audioEffects.cards.feedbackDelay.title'),
      description: t('audioEffects.cards.feedbackDelay.description'),
      icon: <span className="text-xl">🔁</span>,
      glowColor: 'from-yellow-500',
      isActive: false,
      parameters: ['delayTime', 'feedback', 'wet'],
    },
    {
      id: 'freeverb',
      title: t('audioEffects.cards.freeverb.title'),
      description: t('audioEffects.cards.freeverb.description'),
      icon: <span className="text-xl">🏛️</span>,
      glowColor: 'from-cyan-500',
      isActive: false,
      parameters: ['roomSize', 'damping', 'wet'],
    },
    {
      id: 'frequency-shifter',
      title: t('audioEffects.cards.frequencyShifter.title'),
      description: t('audioEffects.cards.frequencyShifter.description'),
      icon: <span className="text-xl">📡</span>,
      glowColor: 'from-lime-500',
      isActive: false,
      parameters: ['frequency', 'wet'],
    },
    {
      id: 'jc-reverb',
      title: t('audioEffects.cards.jcReverb.title'),
      description: t('audioEffects.cards.jcReverb.description'),
      icon: <span className="text-xl">🌊</span>,
      glowColor: 'from-sky-500',
      isActive: false,
      parameters: ['roomSize', 'wet'],
    },
    {
      id: 'ping-pong-delay',
      title: t('audioEffects.cards.pingPong.title'),
      description: t('audioEffects.cards.pingPong.description'),
      icon: <span className="text-xl">🏓</span>,
      glowColor: 'from-violet-500',
      isActive: false,
      parameters: ['delayTime', 'feedback', 'wet'],
    },
    {
      id: 'pitch-shift',
      title: t('audioEffects.cards.pitchShift.title'),
      description: t('audioEffects.cards.pitchShift.description'),
      icon: <span className="text-xl">🎼</span>,
      glowColor: 'from-emerald-500',
      isActive: false,
      parameters: ['pitch', 'windowSize', 'overlap', 'wet'],
    },
    {
      id: 'reverb',
      title: t('audioEffects.cards.reverb.title'),
      description: t('audioEffects.cards.reverb.description'),
      icon: <span className="text-xl">🏛️</span>,
      glowColor: 'from-amber-500',
      isActive: false,
      parameters: ['decay', 'preDelay', 'wet'],
    },
  ];

  return (
    <div className="min-h-screen bg-black p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">{t('audioEffects.title')}</h1>
        <p className="text-gray-400">{t('audioEffects.subtitle')}</p>
      </div>

      {/* Grid de efectos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {audioEffects.map((effect) => (
          <AudioEffectCard
            key={effect.id}
            title={effect.title}
            description={effect.description}
            icon={effect.icon}
            glowColor={effect.glowColor}
            isActive={effect.isActive}
            parameters={effect.parameters}
            className="h-64"
            onClick={() => {
              // Aquí puedes agregar la lógica para activar/desactivar el efecto
            }}
          />
        ))}
      </div>
    </div>
  );
}
