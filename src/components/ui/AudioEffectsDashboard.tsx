import AudioEffectCard from './AudioEffectCard';

export default function AudioEffectsDashboard() {
  const audioEffects = [
    {
      id: 'stereo-widener',
      title: 'StereoWidener',
      description: 'Aplica un factor de ancho a la separación mid/side. 0 es todo mid y 1 es todo side.',
      icon: <span className="text-xl">🎧</span>,
      glowColor: 'from-blue-500',
      isActive: true,
      parameters: ['width', 'wet'],
    },
    {
      id: 'tremolo',
      title: 'Tremolo',
      description: 'Modula la amplitud de la señal usando un LFO. Efecto estéreo donde la fase de modulación se invierte en cada canal.',
      icon: <span className="text-xl">🌊</span>,
      glowColor: 'from-red-500',
      isActive: false,
      parameters: ['frequency', 'depth', 'spread', 'type', 'wet'],
    },
    {
      id: 'vibrato',
      title: 'Vibrato',
      description: 'Efecto de vibrato compuesto por un Delay y un LFO. El LFO modula el delayTime del delay, causando que el pitch suba y baje.',
      icon: <span className="text-xl">🎵</span>,
      glowColor: 'from-orange-500',
      isActive: false,
      parameters: ['frequency', 'depth', 'type', 'maxDelay', 'wet'],
    },
    {
      id: 'phaser',
      title: 'Phaser',
      description: 'Efecto de modulación de fase que crea un sonido de barrido característico.',
      icon: <span className="text-xl">🌀</span>,
      glowColor: 'from-purple-500',
      isActive: false,
      parameters: ['frequency', 'depth', 'feedback', 'wet'],
    },
    {
      id: 'auto-filter',
      title: 'AutoFilter',
      description: 'Filtro automático que modula la frecuencia de corte basado en la entrada de audio.',
      icon: <span className="text-xl">🔍</span>,
      glowColor: 'from-green-500',
      isActive: false,
      parameters: ['frequency', 'depth', 'baseFrequency', 'wet'],
    },
    {
      id: 'auto-wah',
      title: 'AutoWah',
      description: 'Efecto de wah automático que modula un filtro basado en la amplitud de la señal.',
      icon: <span className="text-xl">🎛️</span>,
      glowColor: 'from-orange-500',
      isActive: false,
      parameters: ['baseFrequency', 'octaves', 'sensitivity', 'wet'],
    },
    {
      id: 'bit-crusher',
      title: 'BitCrusher',
      description: 'Reduce la resolución de bits y la frecuencia de muestreo para crear distorsión digital.',
      icon: <span className="text-xl">🔊</span>,
      glowColor: 'from-red-500',
      isActive: false,
      parameters: ['bits', 'frequency', 'wet'],
    },
    {
      id: 'chebyshev',
      title: 'Chebyshev',
      description: 'Genera armónicos usando polinomios de Chebyshev para crear distorsión musical.',
      icon: <span className="text-xl">📊</span>,
      glowColor: 'from-indigo-500',
      isActive: false,
      parameters: ['order', 'oversample', 'wet'],
    },
    {
      id: 'chorus',
      title: 'Chorus',
      description: 'Efecto de coro que duplica la señal con modulación de pitch y delay.',
      icon: <span className="text-xl">🎵</span>,
      glowColor: 'from-teal-500',
      isActive: false,
      parameters: ['frequency', 'delayTime', 'depth', 'wet'],
    },
    {
      id: 'distortion',
      title: 'Distortion',
      description: 'Aplica distorsión no lineal a la señal de audio para crear saturación.',
      icon: <span className="text-xl">⚡</span>,
      glowColor: 'from-pink-500',
      isActive: false,
      parameters: ['distortion', 'oversample', 'wet'],
    },
    {
      id: 'feedback-delay',
      title: 'FeedbackDelay',
      description: 'Delay con retroalimentación que crea ecos repetitivos y resonantes.',
      icon: <span className="text-xl">🔁</span>,
      glowColor: 'from-yellow-500',
      isActive: false,
      parameters: ['delayTime', 'feedback', 'wet'],
    },
    {
      id: 'freeverb',
      title: 'Freeverb',
      description: 'Algoritmo de reverberación libre basado en el Freeverb de Jezar.',
      icon: <span className="text-xl">🏛️</span>,
      glowColor: 'from-cyan-500',
      isActive: false,
      parameters: ['roomSize', 'damping', 'wet'],
    },
    {
      id: 'frequency-shifter',
      title: 'FrequencyShifter',
      description: 'Desplaza todas las frecuencias de la señal por una cantidad fija.',
      icon: <span className="text-xl">📡</span>,
      glowColor: 'from-lime-500',
      isActive: false,
      parameters: ['frequency', 'wet'],
    },
    {
      id: 'jc-reverb',
      title: 'JCReverb',
      description: 'Reverberación basada en el algoritmo de John Chowning.',
      icon: <span className="text-xl">🌊</span>,
      glowColor: 'from-sky-500',
      isActive: false,
      parameters: ['roomSize', 'wet'],
    },
    {
      id: 'ping-pong-delay',
      title: 'PingPongDelay',
      description: 'Delay estéreo que alterna entre canales izquierdo y derecho.',
      icon: <span className="text-xl">🏓</span>,
      glowColor: 'from-violet-500',
      isActive: false,
      parameters: ['delayTime', 'feedback', 'wet'],
    },
    {
      id: 'pitch-shift',
      title: 'PitchShift',
      description: 'Cambia el pitch de la señal sin afectar la velocidad de reproducción.',
      icon: <span className="text-xl">🎼</span>,
      glowColor: 'from-emerald-500',
      isActive: false,
      parameters: ['pitch', 'windowSize', 'overlap', 'wet'],
    },
    {
      id: 'reverb',
      title: 'Reverb',
      description: 'Reverberación espacial que simula el sonido en diferentes ambientes.',
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
        <h1 className="text-4xl font-bold text-white mb-2">Efectos de Audio</h1>
        <p className="text-gray-400">Colección completa de efectos Tone.js para audio espacial 3D</p>
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
              console.log(`Clicked on ${effect.title}`);
              // Aquí puedes agregar la lógica para activar/desactivar el efecto
            }}
          />
        ))}
      </div>
    </div>
  );
}
