import * as Tone from 'tone';
import { EffectNode, EffectParams, EffectUpdater } from './types';

// Actualizadores específicos para cada tipo de efecto
class PhaserUpdater implements EffectUpdater {
  update(effectNode: Tone.Phaser, params: EffectParams): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ PhaserUpdater: Aplicando ${paramName} ${params[paramName]} al phaser`);
        this.safeUpdateParam(effectNode, paramName, params[paramName] as number | string);
      }
    });
  }

  getCurrentParams(effectNode: Tone.Phaser): Record<string, unknown> {
    return {
      frequency: effectNode.frequency?.value || 'N/A',
      octaves: effectNode.octaves || 'N/A',
      baseFrequency: effectNode.baseFrequency || 'N/A'
    };
  }

  private safeUpdateParam(node: any, paramName: string, value: number | string): void {
    try {
      if (node[paramName] && typeof node[paramName].value !== 'undefined') {
        node[paramName].value = value;
      } else if (node[paramName] !== undefined) {
        node[paramName] = value;
      }
    } catch (error) {
      console.warn(`⚠️ PhaserUpdater: No se pudo actualizar ${paramName}:`, error);
    }
  }
}

class AutoFilterUpdater implements EffectUpdater {
  update(effectNode: Tone.AutoFilter, params: EffectParams): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ AutoFilterUpdater: Aplicando ${paramName} ${params[paramName]} al autoFilter`);
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
      frequency: effectNode.frequency?.value || 'N/A',
      baseFrequency: effectNode.baseFrequency || 'N/A',
      octaves: effectNode.octaves || 'N/A',
      depth: effectNode.depth?.value || 'N/A',
      filterType: effectNode.filter?.type || 'N/A',
      filterQ: effectNode.filter?.Q?.value || 'N/A',
      lfoType: effectNode.type || 'N/A'
    };
  }

  private safeUpdateParam(node: any, paramName: string, value: number | string): void {
    try {
      if (node[paramName] && typeof node[paramName].value !== 'undefined') {
        node[paramName].value = value;
      } else if (node[paramName] !== undefined) {
        node[paramName] = value;
      }
    } catch (error) {
      console.warn(`⚠️ AutoFilterUpdater: No se pudo actualizar ${paramName}:`, error);
    }
  }
}

class AutoWahUpdater implements EffectUpdater {
  update(effectNode: Tone.AutoWah, params: EffectParams): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ AutoWahUpdater: Aplicando ${paramName} ${params[paramName]} al autoWah`);
        this.safeUpdateParam(effectNode, paramName, params[paramName] as number | string);
      }
    });
  }

  getCurrentParams(effectNode: Tone.AutoWah): Record<string, unknown> {
    return {
      baseFrequency: effectNode.baseFrequency || 'N/A',
      octaves: effectNode.octaves || 'N/A',
      sensitivity: effectNode.sensitivity || 'N/A'
    };
  }

  private safeUpdateParam(node: any, paramName: string, value: number | string): void {
    try {
      if (node[paramName] && typeof node[paramName].value !== 'undefined') {
        node[paramName].value = value;
      } else if (node[paramName] !== undefined) {
        node[paramName] = value;
      }
    } catch (error) {
      console.warn(`⚠️ AutoWahUpdater: No se pudo actualizar ${paramName}:`, error);
    }
  }
}

class BitCrusherUpdater implements EffectUpdater {
  update(effectNode: Tone.BitCrusher, params: EffectParams): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ BitCrusherUpdater: Aplicando ${paramName} ${params[paramName]} al bitCrusher`);
        
        if (paramName === 'bits') {
          console.log(`ℹ️ BitCrusherUpdater: Los bits del BitCrusher no se pueden cambiar después de la creación`);
        } else {
          this.safeUpdateParam(effectNode, paramName, params[paramName] as number | string);
        }
      }
    });
  }

  getCurrentParams(effectNode: Tone.BitCrusher): Record<string, unknown> {
    return {
      bits: effectNode.bits || 'N/A'
    };
  }

  private safeUpdateParam(node: any, paramName: string, value: number | string): void {
    try {
      if (node[paramName] && typeof node[paramName].value !== 'undefined') {
        node[paramName].value = value;
      } else if (node[paramName] !== undefined) {
        node[paramName] = value;
      }
    } catch (error) {
      console.warn(`⚠️ BitCrusherUpdater: No se pudo actualizar ${paramName}:`, error);
    }
  }
}

class ChorusUpdater implements EffectUpdater {
  update(effectNode: Tone.Chorus, params: EffectParams): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ ChorusUpdater: Aplicando ${paramName} ${params[paramName]} al chorus`);
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
      frequency: effectNode.frequency?.value || 'N/A',
      delayTime: effectNode.delayTime || 'N/A',
      depth: effectNode.depth || 'N/A',
      feedback: effectNode.feedback?.value || 'N/A',
      spread: effectNode.spread || 'N/A',
      type: effectNode.type || 'N/A'
    };
  }

  private safeUpdateParam(node: any, paramName: string, value: number | string): void {
    try {
      if (node[paramName] && typeof node[paramName].value !== 'undefined') {
        node[paramName].value = value;
      } else if (node[paramName] !== undefined) {
        node[paramName] = value;
      }
    } catch (error) {
      console.warn(`⚠️ ChorusUpdater: No se pudo actualizar ${paramName}:`, error);
    }
  }
}

class DistortionUpdater implements EffectUpdater {
  update(effectNode: Tone.Distortion, params: EffectParams): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ DistortionUpdater: Aplicando ${paramName} ${params[paramName]} al distortion`);
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

  private safeUpdateParam(node: any, paramName: string, value: number | string): void {
    try {
      if (node[paramName] && typeof node[paramName].value !== 'undefined') {
        node[paramName].value = value;
      } else if (node[paramName] !== undefined) {
        node[paramName] = value;
      }
    } catch (error) {
      console.warn(`⚠️ DistortionUpdater: No se pudo actualizar ${paramName}:`, error);
    }
  }
}

// Actualizador genérico para efectos simples
class GenericUpdater implements EffectUpdater {
  update(effectNode: EffectNode, params: EffectParams): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ GenericUpdater: Aplicando ${paramName} ${params[paramName]} al efecto`);
        this.safeUpdateParam(effectNode, paramName, params[paramName] as number | string);
      }
    });
  }

  getCurrentParams(effectNode: EffectNode): Record<string, unknown> {
    // Retornar parámetros básicos disponibles en todos los efectos
    return {
      wet: (effectNode as any).wet?.value || 'N/A',
      dry: (effectNode as any).dry?.value || 'N/A'
    };
  }

  private safeUpdateParam(node: any, paramName: string, value: number | string): void {
    try {
      if (node[paramName] && typeof node[paramName].value !== 'undefined') {
        node[paramName].value = value;
      } else if (node[paramName] !== undefined) {
        node[paramName] = value;
      }
    } catch (error) {
      console.warn(`⚠️ GenericUpdater: No se pudo actualizar ${paramName}:`, error);
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
    this.updaters.set('autoWah', new AutoWahUpdater());
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
