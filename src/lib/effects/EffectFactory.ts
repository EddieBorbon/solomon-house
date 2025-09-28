import * as Tone from 'tone';
import { 
  EffectType, 
  EffectNode, 
  EffectCreator, 
  TestOscillatorConfig 
} from './types';

// Creadores específicos para cada tipo de efecto
class PhaserCreator implements EffectCreator {
  create(): Tone.Phaser {
    const effectNode = new Tone.Phaser({
      frequency: 0.5,
      octaves: 2.2,
      baseFrequency: 1000,
    });
    return effectNode;
  }

  getTestOscillatorConfig(): TestOscillatorConfig {
    return { frequency: 440, volume: -25, type: 'sine' };
  }
}

class AutoFilterCreator implements EffectCreator {
  create(): Tone.AutoFilter {
    const effectNode = new Tone.AutoFilter({
      frequency: 0.5,
      baseFrequency: 200,
      octaves: 2.6,
      depth: 0.5,
      filter: {
        type: 'lowpass',
        rolloff: -12,
        Q: 1,
      },
      type: 'sine',
    });
    return effectNode;
  }

  getTestOscillatorConfig(): TestOscillatorConfig {
    return { frequency: 440, volume: -25, type: 'sine' };
  }
}

class AutoWahCreator implements EffectCreator {
  create(): Tone.AutoWah {
    const effectNode = new Tone.AutoWah({
      baseFrequency: 50,    // Frecuencia base del filtro (Hz) - como en la documentación
      octaves: 6,          // Número de octavas del barrido - como en la documentación
      sensitivity: -30,    // Sensibilidad en dB (rango -40 a 0) - como en la documentación
    });

    // Configurar Q para mayor efecto (como en el ejemplo de la documentación)
    effectNode.Q.value = 6;

    console.log(`🎛️ AutoWahCreator: AutoWah creado con parámetros optimizados:`, {
      baseFrequency: effectNode.baseFrequency,
      octaves: effectNode.octaves,
      sensitivity: effectNode.sensitivity,
      qValue: effectNode.Q.value
    });

    return effectNode;
  }

  getTestOscillatorConfig(): TestOscillatorConfig {
    return { frequency: 220, volume: -25, type: 'sine' };
  }
}

class BitCrusherCreator implements EffectCreator {
  create(): Tone.BitCrusher {
    const effectNode = new Tone.BitCrusher(4);
    return effectNode;
  }

  getTestOscillatorConfig(): TestOscillatorConfig {
    return { frequency: 880, volume: -20, type: 'square' };
  }
}

class ChebyshevCreator implements EffectCreator {
  create(): Tone.Chebyshev {
    const effectNode = new Tone.Chebyshev(50);
    effectNode.oversample = 'none';
    return effectNode;
  }

  getTestOscillatorConfig(): TestOscillatorConfig {
    return { frequency: 660, volume: -20, type: 'sawtooth' };
  }
}

class ChorusCreator implements EffectCreator {
  create(): Tone.Chorus {
    const effectNode = new Tone.Chorus(1.5, 3.5, 0.7);
    try {
      effectNode.feedback.setValueAtTime(0, effectNode.context.currentTime);
      effectNode.spread = 180;
      effectNode.type = 'sine';
    } catch {
    }
    effectNode.start();
    return effectNode;
  }

  getTestOscillatorConfig(): TestOscillatorConfig {
    return { frequency: 440, volume: -25, type: 'sine' };
  }
}

class DistortionCreator implements EffectCreator {
  create(): Tone.Distortion {
    const effectNode = new Tone.Distortion(0.4);
    try {
      effectNode.oversample = 'none';
    } catch {
      // Ignorar
    }
    return effectNode;
  }

  getTestOscillatorConfig(): TestOscillatorConfig {
    return { frequency: 440, volume: -20, type: 'sawtooth' };
  }
}

class FeedbackDelayCreator implements EffectCreator {
  create(): Tone.FeedbackDelay {
    const effectNode = new Tone.FeedbackDelay('8n', 0.5);
    return effectNode;
  }

  getTestOscillatorConfig(): TestOscillatorConfig {
    return { frequency: 220, volume: -24, type: 'sine' };
  }
}

class FreeverbCreator implements EffectCreator {
  create(): Tone.Freeverb {
    const effectNode = new Tone.Freeverb({ roomSize: 0.7, dampening: 3000 });
    return effectNode;
  }

  getTestOscillatorConfig(): TestOscillatorConfig {
    return { frequency: 440, volume: -28, type: 'sine' };
  }
}

class FrequencyShifterCreator implements EffectCreator {
  create(): Tone.FrequencyShifter {
    const effectNode = new Tone.FrequencyShifter(0);
    return effectNode;
  }

  getTestOscillatorConfig(): TestOscillatorConfig {
    return { frequency: 330, volume: -24, type: 'sine' };
  }
}

class JCReverbCreator implements EffectCreator {
  create(): Tone.JCReverb {
    const effectNode = new Tone.JCReverb({ roomSize: 0.5 });
    return effectNode;
  }

  getTestOscillatorConfig(): TestOscillatorConfig {
    return { frequency: 520, volume: -28, type: 'sine' };
  }
}

class PingPongDelayCreator implements EffectCreator {
  create(): Tone.PingPongDelay {
    const effectNode = new Tone.PingPongDelay({
      delayTime: '4n',
      feedback: 0.2,
      maxDelay: 1
    });
    return effectNode;
  }

  getTestOscillatorConfig(): TestOscillatorConfig {
    return { frequency: 220, volume: -24, type: 'sine' };
  }
}

class PitchShiftCreator implements EffectCreator {
  create(): Tone.PitchShift {
    const effectNode = new Tone.PitchShift({
      pitch: 0,
      windowSize: 0.1,
      delayTime: 0,
      feedback: 0
    });
    return effectNode;
  }

  getTestOscillatorConfig(): TestOscillatorConfig {
    return { frequency: 440, volume: -22, type: 'sine' };
  }
}

class ReverbCreator implements EffectCreator {
  create(): Tone.Reverb {
    const effectNode = new Tone.Reverb({
      decay: 1.5,
      preDelay: 0.01
    });
    return effectNode;
  }

  getTestOscillatorConfig(): TestOscillatorConfig {
    return { frequency: 330, volume: -20, type: 'sine' };
  }
}

class StereoWidenerCreator implements EffectCreator {
  create(): Tone.StereoWidener {
    const effectNode = new Tone.StereoWidener({
      width: 0.5
    });
    return effectNode;
  }

  getTestOscillatorConfig(): TestOscillatorConfig {
    return { frequency: 550, volume: -18, type: 'sine' };
  }
}

class TremoloCreator implements EffectCreator {
  create(): Tone.Tremolo {
    const effectNode = new Tone.Tremolo({
      frequency: 10,
      depth: 0.5,
      type: 'sine',
      spread: 180
    });
    return effectNode;
  }

  getTestOscillatorConfig(): TestOscillatorConfig {
    return { frequency: 440, volume: -20, type: 'sine' };
  }
}

class VibratoCreator implements EffectCreator {
  create(): Tone.Vibrato {
    const effectNode = new Tone.Vibrato({
      frequency: 5,
      depth: 0.1,
      type: 'sine',
      maxDelay: 0.005
    });
    return effectNode;
  }

  getTestOscillatorConfig(): TestOscillatorConfig {
    return { frequency: 440, volume: -20, type: 'sine' };
  }
}

// Factory principal para crear efectos
export class EffectFactory {
  private creators: Map<EffectType, EffectCreator> = new Map();

  constructor() {
    this.initializeCreators();
  }

  private initializeCreators(): void {
    this.creators.set('phaser', new PhaserCreator());
    this.creators.set('autoFilter', new AutoFilterCreator());
    this.creators.set('autoWah', new AutoWahCreator());
    this.creators.set('bitCrusher', new BitCrusherCreator());
    this.creators.set('chebyshev', new ChebyshevCreator());
    this.creators.set('chorus', new ChorusCreator());
    this.creators.set('distortion', new DistortionCreator());
    this.creators.set('feedbackDelay', new FeedbackDelayCreator());
    this.creators.set('freeverb', new FreeverbCreator());
    this.creators.set('frequencyShifter', new FrequencyShifterCreator());
    this.creators.set('jcReverb', new JCReverbCreator());
    this.creators.set('pingPongDelay', new PingPongDelayCreator());
    this.creators.set('pitchShift', new PitchShiftCreator());
    this.creators.set('reverb', new ReverbCreator());
    this.creators.set('stereoWidener', new StereoWidenerCreator());
    this.creators.set('tremolo', new TremoloCreator());
    this.creators.set('vibrato', new VibratoCreator());
  }

  public createEffect(type: EffectType): EffectNode {
    const creator = this.creators.get(type);
    if (!creator) {
      throw new Error(`Tipo de efecto no soportado: ${type}`);
    }
    
    return creator.create();
  }

  public getTestOscillatorConfig(type: EffectType): TestOscillatorConfig {
    const creator = this.creators.get(type);
    if (!creator) {
      throw new Error(`Tipo de efecto no soportado: ${type}`);
    }
    
    return creator.getTestOscillatorConfig();
  }

  public getSupportedTypes(): EffectType[] {
    return Array.from(this.creators.keys());
  }
}
