import { AudioParams } from '../../lib/AudioManager';
import { SoundObjectType } from '../useWorldStore';

/**
 * Proveedor de parámetros por defecto para objetos de sonido
 * Responsabilidad única: Proporcionar parámetros por defecto para cada tipo de objeto
 */
export class DefaultParamsProvider {
  /**
   * Obtiene los parámetros por defecto para un tipo específico de objeto de sonido
   */
  public static getDefaultAudioParams(type: SoundObjectType): AudioParams {
    switch (type) {
      case 'cube':
        return this.getCubeParams();
      case 'sphere':
        return this.getSphereParams();
      case 'cylinder':
        return this.getCylinderParams();
      case 'cone':
        return this.getConeParams();
      case 'pyramid':
        return this.getPyramidParams();
      case 'icosahedron':
        return this.getIcosahedronParams();
      case 'plane':
        return this.getPlaneParams();
      case 'torus':
        return this.getTorusParams();
      case 'dodecahedronRing':
        return this.getDodecahedronRingParams();
      case 'spiral':
        return this.getSpiralParams();
      default:
        return this.getDefaultParams();
    }
  }

  /**
   * Parámetros por defecto para cubos (AMSynth)
   */
  private static getCubeParams(): AudioParams {
    return {
      frequency: 220,
      volume: 0.6,
      waveform: 'sine',
      color: '#000000',
      metalness: 0.3,
      roughness: 0.2,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      opacity: 0.9,
      blendingMode: 'NormalBlending',
      pulseSpeed: 2.0,
      pulseIntensity: 0.3,
      rotationSpeed: 1.0,
      autoRotate: false,
      harmonicity: 1.5,
      modulationWaveform: 'square',
      duration: 2.0,
    };
  }

  /**
   * Parámetros por defecto para esferas (FMSynth)
   */
  private static getSphereParams(): AudioParams {
    return {
      frequency: 300,
      volume: 0.6,
      waveform: 'sine',
      color: '#000000',
      metalness: 0.2,
      roughness: 0.15,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      opacity: 0.95,
      blendingMode: 'NormalBlending',
      pulseSpeed: 1.5,
      pulseIntensity: 0.4,
      rotationSpeed: 0.8,
      autoRotate: false,
      modulationWaveform: 'sine',
      harmonicity: 2,
      modulationIndex: 10,
      duration: 1.5,
    };
  }

  /**
   * Parámetros por defecto para cilindros (DuoSynth)
   */
  private static getCylinderParams(): AudioParams {
    return {
      frequency: 220,
      volume: 0.6,
      waveform: 'triangle',
      color: '#000000',
      metalness: 0.4,
      roughness: 0.25,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      opacity: 0.95,
      blendingMode: 'NormalBlending',
      pulseSpeed: 2.5,
      pulseIntensity: 0.2,
      rotationSpeed: 1.2,
      autoRotate: false,
      waveform2: 'sine',
      harmonicity: 1.5,
      vibratoAmount: 0.2,
      vibratoRate: 5,
      duration: 3.0,
    };
  }

  /**
   * Parámetros por defecto para conos (MembraneSynth)
   */
  private static getConeParams(): AudioParams {
    return {
      frequency: 100,
      volume: 0.6,
      waveform: 'square',
      color: '#000000',
      metalness: 0.3,
      roughness: 0.35,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      opacity: 0.95,
      blendingMode: 'NormalBlending',
      pulseSpeed: 3.0,
      pulseIntensity: 0.5,
      rotationSpeed: 0.5,
      autoRotate: false,
      pitchDecay: 0.05,
      octaves: 10,
      duration: 0.5,
    };
  }

  /**
   * Parámetros por defecto para pirámides (MonoSynth)
   */
  private static getPyramidParams(): AudioParams {
    return {
      frequency: 110,
      volume: 0.9,
      waveform: 'sawtooth',
      color: '#000000',
      metalness: 0.4,
      roughness: 0.3,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      opacity: 0.9,
      blendingMode: 'NormalBlending',
      pulseSpeed: 4.0,
      pulseIntensity: 0.6,
      rotationSpeed: 2.0,
      autoRotate: false,
      ampAttack: 0.01,
      ampDecay: 0.2,
      ampSustain: 0.1,
      ampRelease: 0.5,
      filterAttack: 0.005,
      filterDecay: 0.1,
      filterSustain: 0.05,
      filterRelease: 0.2,
      filterBaseFreq: 200,
      filterOctaves: 4,
      filterQ: 2,
    };
  }

  /**
   * Parámetros por defecto para icosaedros (MetalSynth)
   */
  private static getIcosahedronParams(): AudioParams {
    return {
      frequency: 200,
      volume: 0.8,
      waveform: 'sine',
      color: '#000000',
      metalness: 0.9,
      roughness: 0.05,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      opacity: 0.95,
      blendingMode: 'NormalBlending',
      pulseSpeed: 1.0,
      pulseIntensity: 0.1,
      rotationSpeed: 0.3,
      autoRotate: false,
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
      duration: 0.5,
    };
  }

  /**
   * Parámetros por defecto para planos (NoiseSynth)
   */
  private static getPlaneParams(): AudioParams {
    return {
      frequency: 0,
      volume: 0.7,
      waveform: 'sine',
      color: '#000000',
      metalness: 0.4,
      roughness: 0.25,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      opacity: 0.9,
      blendingMode: 'NormalBlending',
      pulseSpeed: 2.5,
      pulseIntensity: 0.3,
      rotationSpeed: 1.5,
      autoRotate: false,
      noiseType: 'white',
      attack: 0.001,
      decay: 0.1,
      sustain: 0,
      duration: 0.1,
    };
  }

  /**
   * Parámetros por defecto para toros (PluckSynth)
   */
  private static getTorusParams(): AudioParams {
    return {
      frequency: 440,
      volume: 0.9,
      waveform: 'sine',
      color: '#000000',
      metalness: 0.3,
      roughness: 0.4,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      opacity: 0.9,
      blendingMode: 'NormalBlending',
      pulseSpeed: 3.5,
      pulseIntensity: 0.4,
      rotationSpeed: 1.8,
      autoRotate: false,
      attackNoise: 1,
      dampening: 4000,
      resonance: 0.9,
    };
  }

  /**
   * Parámetros por defecto para anillos dodecaédricos (PolySynth)
   */
  private static getDodecahedronRingParams(): AudioParams {
    return {
      frequency: 220,
      volume: 0.7,
      waveform: 'sine',
      color: '#000000',
      metalness: 0.3,
      roughness: 0.1,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      opacity: 0.95,
      blendingMode: 'NormalBlending',
      pulseSpeed: 1.8,
      pulseIntensity: 0.2,
      rotationSpeed: 0.7,
      autoRotate: false,
      polyphony: 4,
      chord: ["C4", "E4", "G4", "B4"],
      attack: 1.5,
      release: 2.0,
      harmonicity: 1,
      modulationIndex: 2,
      modulationWaveform: 'triangle',
    };
  }

  /**
   * Parámetros por defecto para espirales (Sampler)
   */
  private static getSpiralParams(): AudioParams {
    return {
      volume: 0.9,
      attack: 0.1,
      release: 1.0,
      curve: 'exponential',
      color: '#000000',
      metalness: 0.2,
      roughness: 0.3,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      opacity: 0.9,
      blendingMode: 'NormalBlending',
      notes: ["C4", "E4", "G4"],
      duration: 1,
      urls: {
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
      },
      baseUrl: "/samples/piano/",
      frequency: 0,
      waveform: 'sine',
    };
  }

  /**
   * Parámetros por defecto genéricos
   */
  private static getDefaultParams(): AudioParams {
    return {
      frequency: 330,
      waveform: 'sine',
      volume: 0.6,
      color: '#000000',
      metalness: 0.3,
      roughness: 0.2,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      opacity: 0.9,
      blendingMode: 'NormalBlending',
      pulseSpeed: 2.0,
      pulseIntensity: 0.3,
      rotationSpeed: 1.0,
      autoRotate: false,
    };
  }
}
