import * as Tone from 'tone';
import { AudioParams } from '../factories/SoundSourceFactory';

// Union type for all possible synthesizer types
export type SynthesizerType = Tone.Synth | Tone.FMSynth | Tone.AMSynth | Tone.DuoSynth | Tone.MonoSynth | Tone.MetalSynth | Tone.NoiseSynth | Tone.PluckSynth | Tone.MembraneSynth | Tone.PolySynth | Tone.Sampler;

// Type definitions for synthesizer properties
export interface SynthesizerWithOscillator {
  oscillator: {
    type: string;
  };
}

export interface SynthesizerWithVoice0 {
  voice0: {
    oscillator: {
      type: string;
    };
  };
}

export interface SynthesizerWithHarmonicity {
  harmonicity: {
    rampTo: (value: number, time: number) => void;
  } | number;
}

export interface SynthesizerWithModulationIndex {
  modulationIndex: {
    rampTo: (value: number, time: number) => void;
  } | number;
}

export interface SynthesizerWithModulation {
  modulation: {
    type: string;
  };
}

export interface SynthesizerWithVoice1 {
  voice1: {
    oscillator: {
      type: string;
    };
  };
}

export interface SynthesizerWithEnvelope {
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    curve?: string;
  };
}

export interface SynthesizerWithFilterEnvelope {
  filterEnvelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    baseFrequency: number;
    octaves: number;
  };
}

export interface SynthesizerWithFilter {
  filter: {
    Q: {
      value: number;
    };
  };
}

export interface SynthesizerWithVibratoAmount {
  vibratoAmount: {
    rampTo: (value: number, time: number) => void;
  };
}

export interface SynthesizerWithVibratoRate {
  vibratoRate: {
    rampTo: (value: number, time: number) => void;
  };
}

export interface SynthesizerWithPitchDecay {
  pitchDecay: number;
}

export interface SynthesizerWithOctaves {
  octaves: number;
}

export interface SynthesizerWithResonance {
  resonance: number;
}

// Tipos para gestión de parámetros
export interface ParameterUpdateResult {
  success: boolean;
  updatedParams: string[];
  errors: string[];
}

export interface ParameterConfig {
  volumeRange: {
    min: number;
    max: number;
    dbRange: {
      min: number;
      max: number;
    };
  };
  frequencyRange: {
    min: number;
    max: number;
  };
  rampTime: number;
}

// Interfaz base para validadores de parámetros
export interface ParameterValidator {
  validate(params: Partial<AudioParams>): ParameterValidationResult;
}

export interface ParameterValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedParams: Partial<AudioParams>;
}

// Interfaz base para actualizadores de sintetizadores
export interface SynthParameterUpdater {
  update(synth: SynthesizerType, params: Partial<AudioParams>): ParameterUpdateResult;
  getSupportedParams(): string[];
}

// Interfaz para creadores de validadores
export interface ParameterValidatorFactory {
  createValidator(synthType: string): ParameterValidator;
}

// Interfaz para creadores de actualizadores
export interface SynthUpdaterFactory {
  createUpdater(synthType: string): SynthParameterUpdater;
}

// Tipos específicos de sintetizadores
export type SynthType = 
  | 'PolySynth'
  | 'PluckSynth' 
  | 'DuoSynth'
  | 'MembraneSynth'
  | 'MonoSynth'
  | 'MetalSynth'
  | 'NoiseSynth'
  | 'Sampler'
  | 'FMSynth'
  | 'AMSynth'
  | 'Synth';

// Configuración por defecto
export const DEFAULT_PARAMETER_CONFIG: ParameterConfig = {
  volumeRange: {
    min: 0,
    max: 1.0,
    dbRange: {
      min: -Infinity,
      max: 0
    }
  },
  frequencyRange: {
    min: 20,
    max: 20000
  },
  rampTime: 0.05
};
