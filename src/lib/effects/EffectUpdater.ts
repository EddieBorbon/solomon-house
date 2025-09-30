import * as Tone from 'tone';
import { EffectNode, EffectParams, EffectUpdater } from './types';

// Tipo para nodos de efectos de Tone.js
type ToneEffectNode = {
  [key: string]: unknown;
} & {
  wet?: { value: number };
  dry?: { value: number };
};

// Tipo más flexible para nodos de efectos
type FlexibleEffectNode = unknown;

// Actualizadores específicos para cada tipo de efecto
class PhaserUpdater implements EffectUpdater {
  update(effectNode: Tone.Phaser, params: EffectParams): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        this.safeUpdateParam(effectNode, paramName, params[paramName] as number | string);
      }
    });
  }

  getCurrentParams(effectNode: Tone.Phaser): Record<string, unknown> {
    return {
      frequency: (effectNode.frequency as { value?: number })?.value || 'N/A',
      octaves: effectNode.octaves || 'N/A',
      baseFrequency: effectNode.baseFrequency || 'N/A'
    };
  }

  private safeUpdateParam(node: FlexibleEffectNode, paramName: string, value: number | string): void {
    try {
      const typedNode = node as Record<string, unknown>;
      const param = typedNode[paramName];
      if (param && typeof param === 'object' && 'value' in param) {
        (param as { value: number | string }).value = value;
      } else if (param !== undefined) {
        (typedNode as Record<string, number | string>)[paramName] = value;
      }
    } catch {
      // Silently handle errors
    }
  }
}

class AutoFilterUpdater implements EffectUpdater {
  update(effectNode: Tone.AutoFilter, params: EffectParams): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        const value = params[paramName];
        
        if (paramName === 'filterType' && effectNode.filter) {
          this.safeUpdateParam(effectNode, 'filter.type', value as number | string);
        } else if (paramName === 'filterQ' && effectNode.filter) {
          this.safeUpdateParam(effectNode, 'filter.Q', value as number | string);
        } else {
          this.safeUpdateParam(effectNode, paramName, value as number | string);
        }
      }
    });
  }

  getCurrentParams(effectNode: Tone.AutoFilter): Record<string, unknown> {
    return {
      frequency: (effectNode.frequency as { value?: number })?.value || 'N/A',
      baseFrequency: effectNode.baseFrequency || 'N/A',
      octaves: effectNode.octaves || 'N/A',
      depth: (effectNode.depth as { value?: number })?.value || 'N/A',
      filterType: (effectNode.filter as { type?: string })?.type || 'N/A',
      filterQ: (effectNode.filter as { Q?: { value?: number } })?.Q?.value || 'N/A',
      lfoType: effectNode.type || 'N/A'
    };
  }

  private safeUpdateParam(node: FlexibleEffectNode, paramName: string, value: number | string): void {
    try {
      const typedNode = node as Record<string, unknown>;
      const param = typedNode[paramName];
      if (param && typeof param === 'object' && 'value' in param) {
        (param as { value: number | string }).value = value;
      } else if (param !== undefined) {
        (typedNode as Record<string, number | string>)[paramName] = value;
      }
    } catch {
      // Silently handle errors
    }
  }
}


class BitCrusherUpdater implements EffectUpdater {
  update(effectNode: Tone.BitCrusher, params: EffectParams): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        const value = params[paramName];
        
        if (paramName === 'bits') {
          // Los bits en BitCrusher se manejan directamente
          this.safeUpdateParam(effectNode, 'bits', value as number | string);
        } else {
          this.safeUpdateParam(effectNode, paramName, value as number | string);
        }
      }
    });
  }

  getCurrentParams(effectNode: Tone.BitCrusher): Record<string, unknown> {
    return {
      bits: effectNode.bits || 'N/A'
    };
  }

  private safeUpdateParam(node: FlexibleEffectNode, paramName: string, value: number | string): void {
    try {
      const typedNode = node as Record<string, unknown>;
      const param = typedNode[paramName];
      if (param && typeof param === 'object' && 'value' in param) {
        (param as { value: number | string }).value = value;
      } else if (param !== undefined) {
        (typedNode as Record<string, number | string>)[paramName] = value;
      }
    } catch {
      // Silently handle errors
    }
  }
}

class ChorusUpdater implements EffectUpdater {
  update(effectNode: Tone.Chorus, params: EffectParams): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        const value = params[paramName];
        
        if (paramName === 'chorusFrequency') {
          this.safeUpdateParam(effectNode, 'frequency', value as number | string);
        } else if (paramName === 'chorusDepth') {
          this.safeUpdateParam(effectNode, 'depth', value as number | string);
        } else if (paramName === 'chorusType') {
          this.safeUpdateParam(effectNode, 'type', value as number | string);
        } else {
          this.safeUpdateParam(effectNode, paramName, value as number | string);
        }
      }
    });
  }

  getCurrentParams(effectNode: Tone.Chorus): Record<string, unknown> {
    return {
      frequency: (effectNode.frequency as { value?: number })?.value || 'N/A',
      delayTime: effectNode.delayTime || 'N/A',
      depth: effectNode.depth || 'N/A',
      feedback: (effectNode.feedback as { value?: number })?.value || 'N/A',
      spread: effectNode.spread || 'N/A',
      type: effectNode.type || 'N/A'
    };
  }

  private safeUpdateParam(node: FlexibleEffectNode, paramName: string, value: number | string): void {
    try {
      const typedNode = node as Record<string, unknown>;
      const param = typedNode[paramName];
      if (param && typeof param === 'object' && 'value' in param) {
        (param as { value: number | string }).value = value;
      } else if (param !== undefined) {
        (typedNode as Record<string, number | string>)[paramName] = value;
      }
    } catch {
      // Silently handle errors
    }
  }
}

class DistortionUpdater implements EffectUpdater {
  update(effectNode: Tone.Distortion, params: EffectParams): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        const value = params[paramName];
        
        if (paramName === 'distortion') {
          this.safeUpdateParam(effectNode, 'distortion', value as number | string);
        } else if (paramName === 'oversample') {
          this.safeUpdateParam(effectNode, 'oversample', value as number | string);
        } else {
          this.safeUpdateParam(effectNode, paramName, value as number | string);
        }
      }
    });
  }

  getCurrentParams(effectNode: Tone.Distortion): Record<string, unknown> {
    return {
      distortion: effectNode.distortion,
      oversample: effectNode.oversample
    };
  }

  private safeUpdateParam(node: FlexibleEffectNode, paramName: string, value: number | string): void {
    try {
      const typedNode = node as Record<string, unknown>;
      const param = typedNode[paramName];
      if (param && typeof param === 'object' && 'value' in param) {
        (param as { value: number | string }).value = value;
      } else if (param !== undefined) {
        (typedNode as Record<string, number | string>)[paramName] = value;
      }
    } catch {
      // Silently handle errors
    }
  }
}

// Actualizador genérico para efectos simples
class GenericUpdater implements EffectUpdater {
  update(effectNode: EffectNode, params: EffectParams): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        this.safeUpdateParam(effectNode as FlexibleEffectNode, paramName, params[paramName] as number | string);
      }
    });
  }

  getCurrentParams(effectNode: EffectNode): Record<string, unknown> {
    // Retornar parámetros básicos disponibles en todos los efectos
    const node = effectNode as unknown as ToneEffectNode;
    return {
      wet: node.wet?.value || 'N/A',
      dry: node.dry?.value || 'N/A'
    };
  }

  private safeUpdateParam(node: FlexibleEffectNode, paramName: string, value: number | string): void {
    try {
      const typedNode = node as Record<string, unknown>;
      const param = typedNode[paramName];
      if (param && typeof param === 'object' && 'value' in param) {
        (param as { value: number | string }).value = value;
      } else if (param !== undefined) {
        (typedNode as Record<string, number | string>)[paramName] = value;
      }
    } catch {
      // Silently handle errors
    }
  }
}

// Factory para actualizadores de efectos
export class EffectUpdaterFactory {
  private updaters: Map<string, EffectUpdater> = new Map();

  constructor() {
    this.initializeUpdaters();
  }

  private initializeUpdaters(): void {
    this.updaters.set('phaser', new PhaserUpdater());
    this.updaters.set('autoFilter', new AutoFilterUpdater());
    // this.updaters.set('autoWah', new AutoWahUpdater()); // Usar el updater específico en su lugar
    this.updaters.set('bitCrusher', new BitCrusherUpdater());
    this.updaters.set('chorus', new ChorusUpdater());
    this.updaters.set('distortion', new DistortionUpdater());
    
    // Para efectos que no necesitan actualizadores específicos
    const genericUpdater = new GenericUpdater();
    this.updaters.set('chebyshev', genericUpdater);
    this.updaters.set('feedbackDelay', genericUpdater);
    this.updaters.set('freeverb', genericUpdater);
    this.updaters.set('frequencyShifter', genericUpdater);
    this.updaters.set('jcReverb', genericUpdater);
    this.updaters.set('pingPongDelay', genericUpdater);
    this.updaters.set('pitchShift', genericUpdater);
    this.updaters.set('reverb', genericUpdater);
    this.updaters.set('stereoWidener', genericUpdater);
    this.updaters.set('tremolo', genericUpdater);
    this.updaters.set('vibrato', genericUpdater);
  }

  public getUpdater(effectType: string): EffectUpdater {
    return this.updaters.get(effectType) || this.updaters.get('generic') || new GenericUpdater();
  }

  public updateEffect(effectNode: EffectNode, effectType: string, params: EffectParams): void {
    const updater = this.getUpdater(effectType);
    updater.update(effectNode, params);
  }

  public getCurrentParams(effectNode: EffectNode, effectType: string): Record<string, unknown> {
    const updater = this.getUpdater(effectType);
    return updater.getCurrentParams(effectNode);
  }
}
