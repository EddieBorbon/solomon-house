import * as Tone from 'tone';

// Tipos para efectos
export type EffectType = 'phaser' | 'autoFilter' | 'autoWah' | 'bitCrusher' | 'chebyshev' | 'chorus' | 'distortion' | 'feedbackDelay' | 'freeverb' | 'frequencyShifter' | 'jcReverb' | 'pingPongDelay' | 'pitchShift' | 'reverb' | 'stereoWidener' | 'tremolo' | 'vibrato';

// Union type for all possible effect nodes
export type EffectNode = Tone.Phaser | Tone.AutoFilter | Tone.AutoWah | Tone.BitCrusher | Tone.Chebyshev | Tone.Chorus | Tone.Distortion | Tone.FeedbackDelay | Tone.Freeverb | Tone.FrequencyShifter | Tone.JCReverb | Tone.PingPongDelay | Tone.PitchShift | Tone.Reverb | Tone.StereoWidener | Tone.Tremolo | Tone.Vibrato;

// Estructura de un efecto global
export interface GlobalEffect {
  effectNode: EffectNode;
  panner: Tone.Panner3D;
  position: [number, number, number];
}

// Parámetros de efecto (genéricos)
export type EffectParams = Record<string, unknown>;

// Configuración de oscilador de prueba
export interface TestOscillatorConfig {
  frequency: number;
  volume: number;
  type: OscillatorType;
}

// Interfaz base para creadores de efectos
export interface EffectCreator {
  create(): EffectNode;
  getTestOscillatorConfig(): TestOscillatorConfig;
}

// Interfaz para actualizadores de efectos
export interface EffectUpdater {
  update(effectNode: EffectNode, params: EffectParams): void;
  getCurrentParams(effectNode: EffectNode): Record<string, unknown>;
}

// Interfaz para configuración de efectos
export interface EffectConfig {
  type: EffectType;
  defaultParams: EffectParams;
  testOscillatorConfig: TestOscillatorConfig;
}

// Mapa de configuraciones por tipo de efecto
export type EffectConfigMap = Record<EffectType, EffectConfig>;
