import * as Tone from 'tone';
import { type EffectNode } from '../managers/EffectManager';

type OscillatorType = 'sine' | 'square' | 'triangle' | 'sawtooth';

// Tipos para los parámetros de audio
export interface AudioParams {
  frequency: number;
  waveform: OscillatorType;
  volume: number;
  harmonicity?: number;
  modulationWaveform?: OscillatorType;
  modulationIndex?: number;
  waveform2?: OscillatorType;
  vibratoAmount?: number;
  vibratoRate?: number;
  pitchDecay?: number;
  octaves?: number;
  ampAttack?: number;
  ampDecay?: number;
  ampSustain?: number;
  ampRelease?: number;
  filterAttack?: number;
  filterDecay?: number;
  filterSustain?: number;
  filterRelease?: number;
  filterBaseFreq?: number;
  filterOctaves?: number;
  filterQ?: number;
  resonance?: number;
  noiseType?: 'white' | 'pink' | 'brown';
  attack?: number;
  decay?: number;
  sustain?: number;
  attackNoise?: number;
  dampening?: number;
  duration?: number;
  polyphony?: number;
  chord?: string[];
  release?: number;
  urls?: Record<string, string>;
  baseUrl?: string;
  curve?: 'linear' | 'exponential';
  notes?: string | string[];
}

// Tipos para las fuentes de sonido
export type SoundObjectType = 'cube' | 'sphere' | 'cylinder' | 'cone' | 'pyramid' | 'icosahedron' | 'plane' | 'torus' | 'dodecahedronRing' | 'spiral';

// Estructura de una fuente de sonido
export interface SoundSource {
  synth: Tone.Synth | Tone.AMSynth | Tone.FMSynth | Tone.DuoSynth | Tone.MembraneSynth | Tone.MonoSynth | Tone.MetalSynth | Tone.NoiseSynth | Tone.PluckSynth | Tone.PolySynth | Tone.Sampler;
  panner: Tone.Panner3D;
  dryGain: Tone.Gain;
  effectSends: Map<string, Tone.Gain>;
}

export class SoundSourceFactory {
  /**
   * Crea una nueva fuente de sonido con la arquitectura Send/Return
   */
  public createSoundSource(
    id: string, 
    type: SoundObjectType, 
    params: AudioParams, 
    position: [number, number, number],
    globalEffects: Map<string, { effectNode: EffectNode, panner: Tone.Panner3D, position: [number, number, number] }>
  ): SoundSource {
    // Verificar si ya existe una fuente con este ID
    if (id) {
      console.log(`🎵 SoundSourceFactory: Creando fuente de sonido ${id} de tipo ${type}`);
    }

    try {
      // Crear el sintetizador apropiado según el tipo
      const synth = this.createSynthesizer(type, params);
      
      // Crear la arquitectura Send/Return
      const { panner, dryGain, effectSends } = this.createAudioChain(synth, position, globalEffects);

      // Configurar parámetros iniciales
      this.configureInitialParameters(synth, type, params);

      return {
        synth,
        panner,
        dryGain,
        effectSends,
      };
    } catch (error) {
      console.error(`❌ SoundSourceFactory: Error al crear fuente de sonido:`, error);
      throw error;
    }
  }

  /**
   * Crea el sintetizador apropiado según el tipo
   */
  private createSynthesizer(type: SoundObjectType, params: AudioParams): Tone.Synth | Tone.AMSynth | Tone.FMSynth | Tone.DuoSynth | Tone.MembraneSynth | Tone.MonoSynth | Tone.MetalSynth | Tone.NoiseSynth | Tone.PluckSynth | Tone.PolySynth | Tone.Sampler {
    switch (type) {
      case 'cube':
        return this.createAMSynth(params);
      case 'sphere':
        return this.createFMSynth(params);
      case 'cylinder':
        return this.createDuoSynth(params);
      case 'cone':
        return this.createMembraneSynth(params);
      case 'pyramid':
        return this.createMonoSynth(params);
      case 'icosahedron':
        return this.createMetalSynth(params);
      case 'plane':
        return this.createNoiseSynth(params);
      case 'torus':
        return this.createPluckSynth(params);
      case 'dodecahedronRing':
        return this.createPolySynth(params);
      case 'spiral':
        return this.createSampler(params);
      default:
        return this.createAMSynth(params); // Fallback
    }
  }

  /**
   * Crea la cadena de audio con arquitectura Send/Return
   */
  private createAudioChain(
    synth: Tone.Synth | Tone.AMSynth | Tone.FMSynth | Tone.DuoSynth | Tone.MembraneSynth | Tone.MonoSynth | Tone.MetalSynth | Tone.NoiseSynth | Tone.PluckSynth | Tone.PolySynth | Tone.Sampler, 
    position: [number, number, number],
    globalEffects: Map<string, { effectNode: EffectNode, panner: Tone.Panner3D, position: [number, number, number] }>
  ): { panner: Tone.Panner3D, dryGain: Tone.Gain, effectSends: Map<string, Tone.Gain> } {
    // 1. Crear panner 3D para la señal seca
    const panner = new Tone.Panner3D({
      positionX: position[0],
      positionY: position[1],
      positionZ: position[2],
      panningModel: 'HRTF',
      distanceModel: 'inverse',
      refDistance: 1,
      maxDistance: 100,
      rolloffFactor: 2,
      coneInnerAngle: 360,
      coneOuterAngle: 360,
      coneOuterGain: 0,
    });

    // 2. Crear control de volumen para la señal seca
    const dryGain = new Tone.Gain(1);

    // 3. Crear Map de envíos a efectos
    const effectSends = new Map<string, Tone.Gain>();

    // 4. ENRUTAMIENTO "SEND/RETURN" CORRECTO
    // CAMINO SECO: synth -> panner -> dryGain -> Destination
    synth.connect(panner);
    panner.connect(dryGain);
    dryGain.connect(Tone.Destination);

    // CAMINO MOJADO: synth -> effectSend -> globalEffect -> Destination
    globalEffects.forEach((effectData, effectId) => {
      const send = new Tone.Gain(0); // Inicialmente silenciado
      effectSends.set(effectId, send);
      
      // CONEXIÓN CORRECTA: synth -> send -> efecto (camino independiente)
      synth.connect(send);
      send.connect(effectData.effectNode);
    });

    return { panner, dryGain, effectSends };
  }

  /**
   * Configura los parámetros iniciales del sintetizador
   */
  private configureInitialParameters(synth: Tone.Synth | Tone.AMSynth | Tone.FMSynth | Tone.DuoSynth | Tone.MembraneSynth | Tone.MonoSynth | Tone.MetalSynth | Tone.NoiseSynth | Tone.PluckSynth | Tone.PolySynth | Tone.Sampler, type: SoundObjectType, params: AudioParams): void {
    // Configurar frecuencia según el tipo de sintetizador
    const safeFrequency = Math.max(params.frequency, 20);
    
    if (type === 'cube' || type === 'sphere') {
      const synthWithOsc = synth as { oscillator: { frequency: { setValueAtTime: (value: number, time: number) => void } } };
      synthWithOsc.oscillator.frequency.setValueAtTime(safeFrequency, Tone.now());
    } else if (type === 'cylinder') {
      const synthWithFreq = synth as { frequency: { setValueAtTime: (value: number, time: number) => void } };
      synthWithFreq.frequency.setValueAtTime(safeFrequency, Tone.now());
    } else if (type === 'cone') {
      const synthWithFreq = synth as { frequency: { setValueAtTime: (value: number, time: number) => void } };
      synthWithFreq.frequency.setValueAtTime(safeFrequency, Tone.now());
    } else if (type === 'pyramid') {
      const synthWithFreq = synth as { frequency: { setValueAtTime: (value: number, time: number) => void } };
      synthWithFreq.frequency.setValueAtTime(safeFrequency, Tone.now());
    } else if (type === 'icosahedron') {
      const synthWithFreq = synth as { frequency: { setValueAtTime: (value: number, time: number) => void } };
      synthWithFreq.frequency.setValueAtTime(safeFrequency, Tone.now());
    } else if (type === 'torus') {
      const pluckSynth = synth as { toFrequency: (freq: number) => void };
      pluckSynth.toFrequency(safeFrequency);
    }
    // Para 'plane', 'dodecahedronRing', 'spiral' no se configura frecuencia inicial
  }

  // Métodos específicos para crear cada tipo de sintetizador
  private createAMSynth(params: AudioParams): Tone.AMSynth {
    return new Tone.AMSynth({
      harmonicity: params.harmonicity || 1.5,
      oscillator: {
        type: params.waveform,
      },
      modulation: {
        type: params.modulationWaveform || 'square',
      },
      envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.8,
        release: 0.5,
      },
    });
  }

  private createFMSynth(params: AudioParams): Tone.FMSynth {
    return new Tone.FMSynth({
      harmonicity: params.harmonicity || 2,
      modulationIndex: params.modulationIndex || 10,
      oscillator: {
        type: params.waveform,
      },
      modulation: {
        type: params.modulationWaveform || 'sine',
      },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 1.0,
      },
    });
  }

  private createDuoSynth(params: AudioParams): Tone.DuoSynth {
    return new Tone.DuoSynth({
      harmonicity: params.harmonicity || 1.5,
      vibratoAmount: params.vibratoAmount || 0.2,
      vibratoRate: params.vibratoRate || 5,
      voice0: { 
        oscillator: { type: params.waveform || 'triangle' } 
      },
      voice1: { 
        oscillator: { type: params.waveform2 || 'sine' } 
      },
    });
  }

  private createMembraneSynth(params: AudioParams): Tone.MembraneSynth {
    return new Tone.MembraneSynth({
      pitchDecay: params.pitchDecay || 0.05,
      octaves: params.octaves || 10,
      oscillator: { 
        type: params.waveform || 'sine' 
      },
      envelope: { 
        attack: 0.001, 
        decay: 0.2, 
        sustain: 0.01, 
        release: 0.3 
      },
    });
  }

  private createMonoSynth(params: AudioParams): Tone.MonoSynth {
    return new Tone.MonoSynth({
      oscillator: { 
        type: params.waveform || 'sawtooth' 
      },
      envelope: { 
        attack: params.ampAttack || 0.01, 
        decay: params.ampDecay || 0.2, 
        sustain: params.ampSustain || 0.1, 
        release: params.ampRelease || 0.5 
      },
      filterEnvelope: { 
        attack: params.filterAttack || 0.005, 
        decay: params.filterDecay || 0.1, 
        sustain: params.filterSustain || 0.05, 
        release: params.filterRelease || 0.2, 
        baseFrequency: params.filterBaseFreq || 200, 
        octaves: params.filterOctaves || 4 
      },
      filter: { 
        Q: params.filterQ || 2, 
        type: 'lowpass' 
      },
    });
  }

  private createMetalSynth(params: AudioParams): Tone.MetalSynth {
    return new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 1.4,
        release: 0.2,
      },
      harmonicity: params.harmonicity || 5.1,
      modulationIndex: params.modulationIndex || 32,
      resonance: params.resonance || 4000,
      octaves: params.octaves || 1.5,
    });
  }

  private createNoiseSynth(params: AudioParams): Tone.NoiseSynth {
    return new Tone.NoiseSynth({
      noise: { 
        type: params.noiseType || 'white' 
      },
      envelope: { 
        attack: params.attack || 0.001, 
        decay: params.decay || 0.1, 
        sustain: params.sustain || 0, 
        release: 0.1 
      },
    });
  }

  private createPluckSynth(params: AudioParams): Tone.PluckSynth {
    return new Tone.PluckSynth({
      attackNoise: params.attackNoise || 1,
      dampening: params.dampening || 4000,
      resonance: params.resonance || 0.9,
    });
  }

  private createPolySynth(params: AudioParams): Tone.PolySynth {
    const polySynth = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: params.harmonicity || 1,
      modulationIndex: params.modulationIndex || 2,
      oscillator: {
        type: params.waveform || 'sine',
      },
      modulation: {
        type: params.modulationWaveform || 'triangle',
      },
      envelope: {
        attack: params.attack || 1.5,
        decay: 0.1,
        sustain: 1.0,
        release: params.release || 2.0,
      },
    });
    polySynth.maxPolyphony = params.polyphony || 4;
    return polySynth;
  }

  private createSampler(params: AudioParams): Tone.Sampler | Tone.AMSynth {
    try {
      return new Tone.Sampler({
        urls: params.urls || { C4: 'C4.mp3' },
        baseUrl: params.baseUrl || '/samples/piano/',
        release: params.release || 1.0,
        attack: params.attack || 0.1,
        onload: () => {
          // Sample cargado exitosamente
        },
        onerror: () => {
          // Usar fallback de sintetizador si el Sampler falla
        }
      });
    } catch {
      // Fallback a un sintetizador básico si el Sampler falla
      const fallbackSynth = new Tone.AMSynth({
        harmonicity: 1.5,
        oscillator: { type: 'sine' },
        envelope: {
          attack: params.attack || 0.1,
          decay: 0.2,
          sustain: 0.8,
          release: params.release || 1.0,
        }
      });
      
      // Marcar que este objeto usa fallback para futuras referencias
      (fallbackSynth as { _isFallback?: boolean })._isFallback = true;
      return fallbackSynth;
    }
  }
}
