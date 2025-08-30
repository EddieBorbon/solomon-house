import * as Tone from 'tone';
import * as THREE from 'three';

// Tipos para los parámetros de audio
export interface AudioParams {
  frequency: number;
  waveform: OscillatorType;
  volume: number;
  harmonicity?: number;
  modulationWaveform?: OscillatorType;
  modulationIndex?: number; // Nuevo parámetro para FMSynth
  // Nuevos parámetros para DuoSynth
  waveform2?: OscillatorType;
  vibratoAmount?: number;
  vibratoRate?: number;
  // Nuevos parámetros para MembraneSynth
  pitchDecay?: number;
  octaves?: number;
  // Nuevos parámetros para MonoSynth (pyramid)
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
  // Nuevos parámetros para MetalSynth (icosahedron)
  resonance?: number;
  // Nuevos parámetros para NoiseSynth (plane)
  noiseType?: 'white' | 'pink' | 'brown';
  attack?: number;
  decay?: number;
  sustain?: number;
  // Nuevos parámetros para PluckSynth (torus)
  attackNoise?: number;
  dampening?: number;
  // Campo de duración para todos los objetos (Infinity para duración infinita)
  duration?: number;
  // Nuevos parámetros para PolySynth (dodecahedronRing)
  polyphony?: number;
  chord?: string[];
  release?: number;
  // Nuevos parámetros para Sampler (spiral)
  urls?: Record<string, string>;
  baseUrl?: string;
  curve?: 'linear' | 'exponential';
  notes?: string | string[];
}

// Tipos para las fuentes de sonido
export type SoundObjectType = 'cube' | 'sphere' | 'cylinder' | 'cone' | 'pyramid' | 'icosahedron' | 'plane' | 'torus' | 'dodecahedronRing' | 'spiral';

// Estructura de una fuente de sonido (REFACTORIZADA para Sistema Send/Return Profesional)
interface SoundSource {
  synth: Tone.AMSynth | Tone.FMSynth | Tone.DuoSynth | Tone.MembraneSynth | Tone.MonoSynth | Tone.MetalSynth | Tone.NoiseSynth | Tone.PluckSynth | Tone.PolySynth | Tone.Sampler;
  panner: Tone.Panner3D; // Panner 3D para la señal seca (posición del objeto sonoro)
  dryGain: Tone.Gain; // Control de volumen para la señal seca (crossfade)
  effectSends: Map<string, Tone.Gain>; // Map de envíos a efectos específicos
}

export class AudioManager {
  private static instance: AudioManager;
  private soundSources: Map<string, SoundSource> = new Map();
  private globalEffects: Map<string, { effectNode: Tone.Phaser | Tone.AutoFilter | Tone.AutoWah | Tone.BitCrusher | Tone.Chebyshev | Tone.Chorus | any, panner: Tone.Panner3D }> = new Map(); // Efectos globales con panners independientes
  private isContextStarted: boolean = false;
  private playingSounds: Set<string> = new Set(); // Rastrear qué sonidos están activos
  private lastListenerPosition: string = ''; // Para reducir logs del listener
  private lastSendAmounts: Map<string, number> = new Map(); // Para reducir logs de send amounts
  private testOscillators: Map<string, Tone.Oscillator> = new Map(); // Osciladores de prueba para efectos
  private lastEffectIntensities: Map<string, number> = new Map(); // Para reducir logs de intensidades de efectos

  private constructor() {
    // Constructor privado para Singleton
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Crea un efecto global con espacialización independiente
   */
  public createGlobalEffect(effectId: string, type: 'phaser' | 'autoFilter' | 'autoWah' | 'bitCrusher' | 'chebyshev' | 'chorus', position: [number, number, number]): void {
    try {
      console.log(`🎛️ AudioManager: Creando efecto global ${type} con ID ${effectId} en posición [${position.join(', ')}]`);
      
      let effectNode: Tone.Phaser | Tone.AutoFilter | Tone.AutoWah | Tone.BitCrusher | Tone.Chebyshev | Tone.Chorus | any;
      
      if (type === 'phaser') {
        effectNode = new Tone.Phaser({
          frequency: 0.5,
          octaves: 2.2,
          baseFrequency: 1000,
        });
        console.log(`🎛️ AudioManager: Phaser creado con parámetros iniciales:`, {
          frequency: effectNode.frequency.value,
          octaves: effectNode.octaves,
          baseFrequency: effectNode.baseFrequency
        });
      } else if (type === 'autoFilter') {
        effectNode = new Tone.AutoFilter({
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
        console.log(`🎛️ AudioManager: AutoFilter creado con parámetros iniciales:`, {
          frequency: effectNode.frequency.value,
          baseFrequency: effectNode.baseFrequency,
          octaves: effectNode.octaves,
          depth: effectNode.depth.value,
          filterType: effectNode.filter.type,
          filterQ: effectNode.filter.Q.value
        });
      } else if (type === 'autoWah') {
        effectNode = new Tone.AutoWah({
          baseFrequency: 200,
          octaves: 2.6,
          sensitivity: 0.5,
        });
        console.log(`🎛️ AudioManager: AutoWah creado con parámetros iniciales:`, {
          baseFrequency: effectNode.baseFrequency,
          octaves: effectNode.octaves,
          sensitivity: effectNode.sensitivity.value
        });
      } else if (type === 'bitCrusher') {
        effectNode = new Tone.BitCrusher(4); // bits parameter
        effectNode.normFreq = 0.5; // Set normFreq after creation
        console.log(`🎛️ AudioManager: BitCrusher creado con parámetros iniciales:`, {
          bits: effectNode.bits,
          normFreq: effectNode.normFreq
        });
      } else if (type === 'chebyshev') {
        effectNode = new Tone.Chebyshev(50); // order parameter
        effectNode.oversample = 'none'; // Set oversample after creation
        console.log(`🎛️ AudioManager: Chebyshev creado con parámetros iniciales:`, {
          order: effectNode.order,
          oversample: effectNode.oversample
        });
      } else if (type === 'chorus') {
        effectNode = new Tone.Chorus(1.5, 3.5, 0.7); // frequency, delayTime, depth
        // Configurar parámetros usando los métodos de Tone.js
        try {
          effectNode.feedback.setValueAtTime(0, effectNode.context.currentTime);
          effectNode.spread = 180;
          effectNode.type = 'sine';
        } catch (error) {
          console.log(`ℹ️ AudioManager: Algunos parámetros del Chorus no se pudieron configurar inicialmente:`, error);
        }
        effectNode.start(); // Start the LFOs
        console.log(`🎛️ AudioManager: Chorus creado con parámetros iniciales:`, {
          frequency: effectNode.frequency.value,
          delayTime: effectNode.delayTime,
          depth: effectNode.depth,
          feedback: effectNode.feedback.value,
          spread: effectNode.spread,
          type: effectNode.type
        });
      }
      
      if (effectNode) {
        // Crear panner 3D independiente para el efecto
        const effectPanner = new Tone.Panner3D({
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
        
        // Conectar efecto -> panner -> destination
        effectNode.chain(effectPanner, Tone.Destination);
        console.log(`🎛️ AudioManager: Efecto conectado a la cadena de audio`);
        
        // Almacenar tanto el nodo del efecto como su panner
        this.globalEffects.set(effectId, { effectNode, panner: effectPanner });
        console.log(`🎛️ AudioManager: Efecto almacenado en globalEffects. Total de efectos: ${this.globalEffects.size}`);
        
        // Crear sends para todas las fuentes de sonido existentes
        this.soundSources.forEach((source, sourceId) => {
          this.addEffectSendToSource(sourceId, effectId, effectNode);
        });
        console.log(`🎛️ AudioManager: Sends creados para ${this.soundSources.size} fuentes de sonido`);
        
        // Crear un oscilador de prueba para escuchar los efectos del phaser
        this.createTestOscillatorForEffect(effectId, effectNode);
      }
    } catch (error) {
      console.error(`❌ AudioManager: Error al crear efecto global:`, error);
    }
  }

  /**
   * Añade un send de efecto a una fuente de sonido existente
   */
  private addEffectSendToSource(sourceId: string, effectId: string, effectNode: any): void {
    try {
      const source = this.soundSources.get(sourceId);
      if (!source) {
        console.warn(`⚠️ AudioManager: No se encontró fuente de sonido ${sourceId} para crear send de efecto`);
        return;
      }

      // Crear el send de efecto
      const send = new Tone.Gain(0); // Inicialmente silenciado
      source.effectSends.set(effectId, send);
      
      // Conectar synth -> send -> efecto
      source.synth.connect(send);
      send.connect(effectNode);
      
      console.log(`🎛️ AudioManager: Send de efecto ${effectId} creado para fuente ${sourceId}`);
    } catch (error) {
      console.error(`❌ AudioManager: Error al crear send de efecto:`, error);
    }
  }

  /**
   * Crea un oscilador de prueba para escuchar los efectos del phaser
   */
  private createTestOscillatorForEffect(effectId: string, effectNode: any): void {
    try {
      // Configurar el oscilador según el tipo de efecto para mejor audibilidad
      let frequency = 440; // Nota A4 por defecto
      let volume = -30; // Volumen bajo por defecto
      let type: OscillatorType = 'sine';
      
      if (effectNode instanceof Tone.Phaser) {
        frequency = 440; // A4 - buena para efectos de modulación de fase
        volume = -25; // Un poco más alto para phaser
      } else if (effectNode instanceof Tone.AutoFilter) {
        frequency = 440; // A4 - buena para filtros automáticos
        volume = -25; // Un poco más alto para autoFilter
      } else if (effectNode instanceof Tone.AutoWah) {
        frequency = 220; // A3 - frecuencia más baja para activar mejor el wah
        volume = -25; // Un poco más alto para autoWah
      } else if (effectNode instanceof Tone.BitCrusher) {
        frequency = 880; // A5 - frecuencia más alta para hacer la distorsión más audible
        volume = -20; // Más alto para bitCrusher
        type = 'square'; // Forma de onda cuadrada para mejor distorsión
      } else if (effectNode instanceof Tone.Chebyshev) {
        frequency = 660; // E5 - frecuencia media para distorsión polinomial
        volume = -20; // Más alto para chebyshev
        type = 'sawtooth'; // Forma de onda de sierra para mejor distorsión
      } else if (effectNode instanceof Tone.Chorus) {
        frequency = 440; // A4 - buena para efectos de chorus
        volume = -25; // Un poco más alto para chorus
        type = 'sine'; // Forma de onda sinusoidal para mejor chorus
      }
      
      // Crear un oscilador de prueba optimizado para el tipo de efecto
      const testOsc = new Tone.Oscillator({
        frequency,
        type,
        volume,
      });
      
      // Conectar el oscilador directamente al efecto
      testOsc.connect(effectNode);
      
      // Iniciar el oscilador
      testOsc.start();
      
      console.log(`🎛️ AudioManager: Oscilador de prueba optimizado creado para ${effectNode.constructor.name} (${effectId}) - Frecuencia: ${frequency}Hz, Tipo: ${type}, Volumen: ${volume}dB`);
      
      // Almacenar el oscilador para poder limpiarlo después
      if (!this.testOscillators) {
        this.testOscillators = new Map();
      }
      this.testOscillators.set(effectId, testOsc);
      
    } catch (error) {
      console.error(`❌ AudioManager: Error al crear oscilador de prueba:`, error);
    }
  }

  /**
   * Obtiene un efecto global por ID
   */
  public getGlobalEffect(effectId: string): { effectNode: Tone.Phaser | any, panner: Tone.Panner3D } | undefined {
    return this.globalEffects.get(effectId);
  }

  /**
   * Actualiza los parámetros de un efecto global
   */
  public updateGlobalEffect(effectId: string, params: any): void {
    const effectData = this.globalEffects.get(effectId);
    if (!effectData) {
      console.warn(`⚠️ AudioManager: No se encontró efecto global con ID ${effectId}`);
      return;
    }

    try {
      const { effectNode } = effectData;
      console.log(`🎛️ AudioManager: Actualizando parámetros del efecto ${effectId}:`, params);
      
      if (effectNode instanceof Tone.Phaser) {
        // Usar la función de utilidad para actualizar parámetros de manera segura
        Object.keys(params).forEach(paramName => {
          if (params[paramName] !== undefined) {
            console.log(`🎛️ AudioManager: Aplicando ${paramName} ${params[paramName]} al phaser`);
            this.safeUpdateParam(effectNode, paramName, params[paramName]);
          }
        });
        
        // Verificar que los parámetros se aplicaron correctamente
        console.log(`🎛️ AudioManager: Parámetros actuales del phaser:`, {
          frequency: effectNode.frequency?.value || 'N/A',
          octaves: effectNode.octaves || 'N/A',
          baseFrequency: effectNode.baseFrequency || 'N/A'
        });
      } else if (effectNode instanceof Tone.AutoFilter) {
        // Usar la función de utilidad para actualizar parámetros de manera segura
        Object.keys(params).forEach(paramName => {
          if (params[paramName] !== undefined) {
            console.log(`🎛️ AudioManager: Aplicando ${paramName} ${params[paramName]} al autoFilter`);
            // Manejar casos especiales para AutoFilter
            if (paramName === 'filterType' && effectNode.filter) {
              this.safeUpdateParam(effectNode, 'filter.type', params[paramName]);
            } else if (paramName === 'filterQ' && effectNode.filter) {
              this.safeUpdateParam(effectNode, 'filter.Q', params[paramName]);
            } else {
              this.safeUpdateParam(effectNode, paramName, params[paramName]);
            }
          }
        });
        
        // Verificar que los parámetros se aplicaron correctamente
        console.log(`🎛️ AudioManager: Parámetros actuales del autoFilter:`, {
          frequency: effectNode.frequency?.value || 'N/A',
          baseFrequency: effectNode.baseFrequency || 'N/A',
          octaves: effectNode.octaves || 'N/A',
          depth: effectNode.depth?.value || 'N/A',
          filterType: effectNode.filter?.type || 'N/A',
          filterQ: effectNode.filter?.Q?.value || 'N/A',
          lfoType: effectNode.type || 'N/A'
        });
      } else if (effectNode instanceof Tone.AutoWah) {
        // Usar la función de utilidad para actualizar parámetros de manera segura
        Object.keys(params).forEach(paramName => {
          if (params[paramName] !== undefined) {
            console.log(`🎛️ AudioManager: Aplicando ${paramName} ${params[paramName]} al autoWah`);
            this.safeUpdateParam(effectNode, paramName, params[paramName]);
          }
        });
        
        // Verificar que los parámetros se aplicaron correctamente
        console.log(`🎛️ AudioManager: Parámetros actuales del autoWah:`, {
          baseFrequency: effectNode.baseFrequency || 'N/A',
          octaves: effectNode.octaves || 'N/A',
          sensitivity: effectNode.sensitivity || 'N/A'
        });
      } else if (effectNode instanceof Tone.BitCrusher) {
        // Usar la función de utilidad para actualizar parámetros de manera segura
        Object.keys(params).forEach(paramName => {
          if (params[paramName] !== undefined) {
            console.log(`🎛️ AudioManager: Aplicando ${paramName} ${params[paramName]} al bitCrusher`);
            if (paramName === 'bits') {
              console.log(`ℹ️ AudioManager: Los bits del BitCrusher no se pueden cambiar después de la creación`);
            } else {
              this.safeUpdateParam(effectNode, paramName, params[paramName]);
            }
          }
        });
        
        // Verificar que los parámetros se aplicaron correctamente
        console.log(`🎛️ AudioManager: Parámetros actuales del bitCrusher:`, {
          bits: effectNode.bits || 'N/A'
        });
      } else if (effectNode instanceof Tone.Chebyshev) {
        // Usar la función de utilidad para actualizar parámetros de manera segura
        Object.keys(params).forEach(paramName => {
          if (params[paramName] !== undefined) {
            console.log(`🎛️ AudioManager: Aplicando ${paramName} ${params[paramName]} al chebyshev`);
            this.safeUpdateParam(effectNode, paramName, params[paramName]);
          }
        });
        
        // Verificar que los parámetros se aplicaron correctamente
        console.log(`🎛️ AudioManager: Parámetros actuales del chebyshev:`, {
          order: effectNode.order || 'N/A',
          oversample: effectNode.oversample || 'N/A'
        });
      } else if (effectNode instanceof Tone.Chorus) {
        // Usar la función de utilidad para actualizar parámetros de manera segura
        Object.keys(params).forEach(paramName => {
          if (params[paramName] !== undefined) {
            console.log(`🎛️ AudioManager: Aplicando ${paramName} ${params[paramName]} al chorus`);
            // Manejar casos especiales para Chorus
            if (paramName === 'chorusFrequency') {
              this.safeUpdateParam(effectNode, 'frequency', params[paramName]);
            } else if (paramName === 'chorusDepth') {
              this.safeUpdateParam(effectNode, 'depth', params[paramName]);
            } else if (paramName === 'chorusType') {
              this.safeUpdateParam(effectNode, 'type', params[paramName]);
            } else {
              this.safeUpdateParam(effectNode, paramName, params[paramName]);
            }
          }
        });
        
        // Verificar que los parámetros se aplicaron correctamente
        console.log(`🎛️ AudioManager: Parámetros actuales del chorus:`, {
          frequency: effectNode.frequency?.value || 'N/A',
          delayTime: effectNode.delayTime || 'N/A',
          depth: effectNode.depth || 'N/A',
          feedback: effectNode.feedback?.value || 'N/A',
          spread: effectNode.spread || 'N/A',
          type: effectNode.type || 'N/A'
        });
      } else {
        console.warn(`⚠️ AudioManager: El nodo del efecto no es un Tone.Phaser, Tone.AutoFilter, Tone.AutoWah, Tone.BitCrusher, Tone.Chebyshev ni Tone.Chorus:`, effectNode);
      }
      
      // Refrescar el efecto para asegurar que los cambios se apliquen en tiempo real
      this.refreshGlobalEffect(effectId);
      
      // Log adicional para confirmar que los parámetros se aplicaron
      console.log(`✅ AudioManager: Parámetros del efecto ${effectId} actualizados y refrescados`);
      
      // Forzar actualización adicional para parámetros críticos
      Object.keys(params).forEach(paramName => {
        if (params[paramName] !== undefined) {
          this.forceEffectUpdate(effectId, paramName, params[paramName]);
        }
      });
      
    } catch (error) {
      console.error(`❌ AudioManager: Error al actualizar parámetros del efecto:`, error);
    }
  }

  /**
   * Fuerza la actualización de un efecto global reiniciando su oscilador de prueba
   */
  public refreshGlobalEffect(effectId: string): void {
    const effectData = this.globalEffects.get(effectId);
    if (!effectData) {
      console.warn(`⚠️ AudioManager: No se encontró efecto global con ID ${effectId} para refrescar`);
      return;
    }

    try {
      const { effectNode } = effectData;
      const testOsc = this.testOscillators.get(effectId);
      
      if (testOsc) {
        console.log(`🔄 AudioManager: Refrescando efecto ${effectId} (${effectNode.constructor.name})`);
        
        // Estrategias de refresco específicas según el tipo de efecto
        if (effectNode instanceof Tone.Phaser) {
          // Para Phaser: cambiar frecuencia y reiniciar
          testOsc.frequency.rampTo(880, 0.1); // A5
          setTimeout(() => testOsc.frequency.rampTo(440, 0.1), 150); // Volver a A4
        } else if (effectNode instanceof Tone.AutoFilter) {
          // Para AutoFilter: modulación de frecuencia
          testOsc.frequency.rampTo(660, 0.1); // E5
          setTimeout(() => testOsc.frequency.rampTo(440, 0.1), 150); // Volver a A4
        } else if (effectNode instanceof Tone.AutoWah) {
          // Para AutoWah: cambio de frecuencia para activar el wah
          testOsc.frequency.rampTo(110, 0.1); // A2 (frecuencia baja)
          setTimeout(() => testOsc.frequency.rampTo(440, 0.1), 200); // Volver a A4
        } else if (effectNode instanceof Tone.BitCrusher) {
          // Para BitCrusher: cambio de frecuencia para hacer la distorsión más audible
          testOsc.frequency.rampTo(880, 0.1); // A5
          setTimeout(() => testOsc.frequency.rampTo(440, 0.1), 100); // Volver a A4
        } else if (effectNode instanceof Tone.Chebyshev) {
          // Para Chebyshev: cambio de frecuencia para hacer la distorsión más audible
          testOsc.frequency.rampTo(660, 0.1); // E5
          setTimeout(() => testOsc.frequency.rampTo(440, 0.1), 150); // Volver a A4
        } else if (effectNode instanceof Tone.Chorus) {
          // Para Chorus: cambio de frecuencia para hacer el efecto más audible
          testOsc.frequency.rampTo(880, 0.1); // A5
          setTimeout(() => testOsc.frequency.rampTo(440, 0.1), 100); // Volver a A4
        } else {
          // Estrategia genérica para otros efectos
          const currentFreq = testOsc.frequency.value;
          const newFreq = currentFreq === 440 ? 880 : 440;
          testOsc.frequency.rampTo(newFreq, 0.1);
          setTimeout(() => testOsc.frequency.rampTo(440, 0.1), 200);
        }
      }
    } catch (error) {
      console.error(`❌ AudioManager: Error al refrescar efecto global:`, error);
    }
  }

  /**
   * Elimina un efecto global
   */
  public removeGlobalEffect(effectId: string): void {
    const effectData = this.globalEffects.get(effectId);
    if (effectData) {
      try {
        const { effectNode, panner } = effectData;
        
        // Limpiar todas las conexiones a fuentes de sonido antes de eliminar
        this.cleanupEffectSourceConnections(effectId);
        
        // Limpiar el oscilador de prueba si existe
        const testOsc = this.testOscillators.get(effectId);
        if (testOsc) {
          try {
            testOsc.stop();
            testOsc.dispose();
            this.testOscillators.delete(effectId);
            console.log(`🎛️ AudioManager: Oscilador de prueba eliminado para efecto ${effectId}`);
          } catch (oscError) {
            console.error(`❌ AudioManager: Error al limpiar oscilador de prueba:`, oscError);
          }
        }
        
        // Desconectar todas las conexiones antes de disponer
        try {
          effectNode.disconnect();
          panner.disconnect();
        } catch (disconnectError) {
          // Manejo silencioso de errores
        }
        
        effectNode.dispose();
        panner.dispose();
        this.globalEffects.delete(effectId);
      } catch (error) {
        // Manejo silencioso de errores
      }
    }
  }

  /**
   * Fuerza la actualización de todos los efectos globales activos
   */
  public refreshAllGlobalEffects(): void {
    console.log(`🔄 AudioManager: Refrescando todos los efectos globales activos`);
    
    this.globalEffects.forEach((effectData, effectId) => {
      try {
        this.refreshGlobalEffect(effectId);
      } catch (error) {
        console.error(`❌ AudioManager: Error al refrescar efecto ${effectId}:`, error);
      }
    });
  }

  /**
   * Función de utilidad para actualizar parámetros de manera segura
   */
  private safeUpdateParam(effectNode: any, paramPath: string, newValue: any, fallbackValue?: any): boolean {
    try {
      const pathParts = paramPath.split('.');
      let current = effectNode;
      
      // Navegar hasta el penúltimo elemento del path
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (current && current[pathParts[i]]) {
          current = current[pathParts[i]];
        } else {
          console.log(`ℹ️ AudioManager: Path ${paramPath} no válido en ${effectNode.constructor.name}`);
          return false;
        }
      }
      
      const lastPart = pathParts[pathParts.length - 1];
      const target = current[lastPart];
      
      if (target !== undefined) {
        if (typeof target.rampTo === 'function') {
          target.rampTo(newValue, 0.1);
          return true;
        } else if (typeof target.setValueAtTime === 'function') {
          target.setValueAtTime(newValue, effectNode.context.currentTime);
          return true;
        } else if (typeof target === 'number' || typeof target === 'string') {
          current[lastPart] = newValue;
          return true;
        } else {
          console.log(`ℹ️ AudioManager: Parámetro ${paramPath} no es configurable en tiempo real`);
          return false;
        }
      } else {
        console.log(`ℹ️ AudioManager: Parámetro ${paramPath} no encontrado`);
        return false;
      }
    } catch (error) {
      console.log(`ℹ️ AudioManager: Error al actualizar ${paramPath}:`, error);
      return false;
    }
  }

  /**
   * Fuerza la actualización de un efecto específico con estrategias optimizadas
   */
  public forceEffectUpdate(effectId: string, paramName: string, newValue: any): void {
    const effectData = this.globalEffects.get(effectId);
    if (!effectData) {
      console.warn(`⚠️ AudioManager: No se encontró efecto global con ID ${effectId} para forzar actualización`);
      return;
    }

    try {
      const { effectNode } = effectData;
      console.log(`🔄 AudioManager: Forzando actualización del parámetro ${paramName} = ${newValue} en ${effectNode.constructor.name}`);
      
      // Estrategias específicas para parámetros críticos
      if (effectNode instanceof Tone.BitCrusher && paramName === 'bits') {
        // Para BitCrusher, los bits no son configurables en tiempo real
        // Podríamos recrear el efecto si es necesario
        console.log(`ℹ️ AudioManager: Los bits del BitCrusher requieren recreación del efecto`);
        this.refreshGlobalEffect(effectId);
      } else if (effectNode instanceof Tone.Chebyshev && paramName === 'order') {
        // Para Chebyshev, el orden se puede cambiar en tiempo real
        console.log(`✅ AudioManager: Orden de Chebyshev actualizado en tiempo real`);
        this.refreshGlobalEffect(effectId);
      } else {
        // Para otros parámetros, usar el refresco estándar
        this.refreshGlobalEffect(effectId);
      }
      
    } catch (error) {
      console.error(`❌ AudioManager: Error al forzar actualización del efecto:`, error);
    }
  }

  /**
   * Limpia todas las conexiones de una fuente de sonido a efectos específicos
   */
  private cleanupSourceEffectConnections(soundSourceId: string): void {
    try {
      const source = this.soundSources.get(soundSourceId);
      if (!source) return;

      // Limpiar todos los sends de efectos
      source.effectSends.forEach((send, effectId) => {
        try {
          send.disconnect();
        } catch (error) {
          // Manejo silencioso de errores
        }
      });
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Limpia todas las conexiones de un efecto global a fuentes de sonido
   */
  private cleanupEffectSourceConnections(effectId: string): void {
    try {
      // Limpiar todas las conexiones desde fuentes de sonido a este efecto
      this.soundSources.forEach((source, sourceId) => {
        try {
          const effectSend = source.effectSends.get(effectId);
          if (effectSend) {
            effectSend.disconnect();
          }
        } catch (error) {
          // Manejo silencioso de errores
        }
      });
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Controla la cantidad de señal enviada a un efecto específico (REFACTORIZADO para Crossfade)
   */
  public setEffectSendAmount(soundSourceId: string, effectId: string, amount: number): void {
    try {
      const source = this.soundSources.get(soundSourceId);
      if (!source) {
        return;
      }

      const effectData = this.globalEffects.get(effectId);
      if (!effectData) {
        return;
      }

      // Buscar el send de efecto específico
      const effectSend = source.effectSends.get(effectId);
      if (!effectSend) {
        return;
      }

      // VERIFICACIÓN ROBUSTA DEL CONTEXTO DE AUDIO
      if (!effectSend.context || !source.dryGain.context) {
        return;
      }
      
      // Verificar que el contexto esté en estado 'running'
      if (effectSend.context.state !== 'running' || source.dryGain.context.state !== 'running') {
        return;
      }
      
      // Verificar que los nodos no estén dispuestos
      if (effectSend.disposed || source.dryGain.disposed) {
        return;
      }
      
      try {
        // IMPLEMENTAR CROSSFADE INTUITIVO: 
        // - Fuera de la zona: solo señal seca (dryGain = 1, effectSend = 0)
        // - Dentro de la zona: solo señal del efecto (dryGain = 0, effectSend = 1)
        const effectAmount = Math.max(0, Math.min(1, amount)); // Clampear entre 0 y 1
        
        // SOLUCIÓN ROBUSTA: Usar setValueAtTime en lugar de rampTo para cambios inmediatos
        const dryAmount = Math.max(0, Math.min(1, 1 - effectAmount));
        
        // Ajustar el nivel del efecto (señal mojada) - CAMBIO INMEDIATO
        effectSend.gain.setValueAtTime(effectAmount, Tone.now());
        
        // Ajustar el nivel de la señal seca (complementario al efecto) - CAMBIO INMEDIATO
        source.dryGain.gain.setValueAtTime(dryAmount, Tone.now());
        
        // Solo loggear cambios significativos en el send amount (cada 0.1 unidades)
        const currentSendAmount = Math.round(amount * 10) / 10;
        const key = `${soundSourceId}-${effectId}`;
        if (this.lastSendAmounts.get(key) !== currentSendAmount) {
          this.lastSendAmounts.set(key, currentSendAmount);
        }
      } catch (rampError) {
        // Intentar limpieza de emergencia si hay error crítico
        if (rampError instanceof Error && rampError.message.includes('InvalidAccessError')) {
          this.emergencyCleanup();
        }
      }
    } catch (error) {
      // Ejecutar limpieza de emergencia para errores críticos
      this.emergencyCleanup();
    }
  }

  /**
   * Limpieza de emergencia para errores críticos
   */
  public emergencyCleanup(): void {
    try {
      // Limpiar inmediatamente sin verificaciones adicionales
      this.playingSounds.clear();
      this.lastSendAmounts.clear();
      
      // Limpiar osciladores de prueba
      this.testOscillators.forEach((testOsc) => {
        try {
          testOsc.stop();
          testOsc.dispose();
        } catch (error) {
          // Manejo silencioso de errores
        }
      });
      this.testOscillators.clear();
      
      // Forzar limpieza de conexiones
      this.soundSources.clear();
      this.globalEffects.clear();
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Limpia todas las conexiones y recursos del AudioManager
   */
  public cleanup(): void {
    try {
      // Detener todos los sonidos activos
      this.playingSounds.forEach(soundId => {
        try {
          const source = this.soundSources.get(soundId);
          if (source) {
            source.synth.triggerRelease(Tone.now());
          }
        } catch (error) {
          // Manejo silencioso de errores
        }
      });
      this.playingSounds.clear();
      
      // Limpiar todas las conexiones de fuentes de sonido
      this.soundSources.forEach((source, sourceId) => {
        try {
          this.cleanupSourceEffectConnections(sourceId);
        } catch (error) {
          // Manejo silencioso de errores
        }
      });
      
      // Limpiar todas las conexiones de efectos globales
      this.globalEffects.forEach((effectData, effectId) => {
        try {
          this.cleanupEffectSourceConnections(effectId);
        } catch (error) {
          // Manejo silencioso de errores
        }
      });
      
      // Limpiar todos los osciladores de prueba
      this.testOscillators.forEach((testOsc, effectId) => {
        try {
          testOsc.stop();
          testOsc.dispose();
        } catch (error) {
          // Manejo silencioso de errores
        }
      });
      this.testOscillators.clear();
      
      // Limpiar el Map de send amounts
      this.lastSendAmounts.clear();
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Inicia el contexto de audio de Tone.js
   */
  public async startContext(): Promise<boolean> {
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start();
        this.isContextStarted = true;
        
        // Configurar limpieza automática cuando se suspenda el contexto
        Tone.context.on('statechange', (newState) => {
          if (newState === 'suspended') {
            this.cleanup();
          }
        });

        // Configurar limpieza automática cuando se cierre la ventana
        if (typeof window !== 'undefined') {
          window.addEventListener('beforeunload', () => {
            this.cleanup();
          });

          // Limpieza cuando la página pierde el foco (opcional)
          window.addEventListener('blur', () => {
            this.cleanup();
          });
        }
        
        return true;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Crea una nueva fuente de sonido (REFACTORIZADA COMPLETAMENTE)
   */
  public createSoundSource(
    id: string, 
    type: SoundObjectType, 
    params: AudioParams, 
    position: [number, number, number]
  ): void {
    // Verificar si ya existe una fuente con este ID
    if (this.soundSources.has(id)) {
      return;
    }

    try {
      // Crear el sintetizador apropiado según el tipo
      let synth: Tone.AMSynth | Tone.FMSynth | Tone.DuoSynth | Tone.MembraneSynth | Tone.MonoSynth | Tone.MetalSynth | Tone.NoiseSynth | Tone.PluckSynth | Tone.PolySynth | Tone.Sampler;
      
      if (type === 'cube') {
        synth = new Tone.AMSynth({
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
            release: 0.5, // Release más largo para un fade-out suave
          },
        });
        
        // Configurar la amplitud inicial de la portadora para síntesis AM
        (synth as Tone.AMSynth).oscillator.volume.setValueAtTime(Tone.gainToDb(params.volume || 0.05), Tone.now());
      } else if (type === 'sphere') {
        // sphere - FMSynth con configuración completa
        synth = new Tone.FMSynth({
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
      } else if (type === 'cylinder') {
        // cylinder - DuoSynth
        synth = new Tone.DuoSynth({
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
      } else if (type === 'cone') {
        // cone - MembraneSynth para sonidos percusivos
        synth = new Tone.MembraneSynth({
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
      } else if (type === 'pyramid') {
        // pyramid - MonoSynth para sonidos de bajo clásicos
        synth = new Tone.MonoSynth({
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
      } else if (type === 'icosahedron') {
        // icosahedron - MetalSynth para sonidos metálicos y percusivos
        synth = new Tone.MetalSynth({
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
      } else if (type === 'plane') {
        // plane - NoiseSynth para sonidos de ruido percusivos
        synth = new Tone.NoiseSynth({
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
      } else if (type === 'torus') {
        // torus - PluckSynth para sonidos de cuerdas
        synth = new Tone.PluckSynth({
          attackNoise: params.attackNoise || 1,
          dampening: params.dampening || 4000,
          resonance: params.resonance || 0.9,
        });
      } else if (type === 'dodecahedronRing') {
        // dodecahedronRing - PolySynth para acordes polifónicos
        synth = new Tone.PolySynth({
          maxPolyphony: params.polyphony || 4,
          voice: Tone.FMSynth,
          options: {
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
          },
        });
      } else if (type === 'spiral') {
        // spiral - Sampler para reproducción de samples de audio
        try {
          synth = new Tone.Sampler({
            urls: params.urls || { C4: 'C4.mp3' },
            baseUrl: params.baseUrl || '/samples/piano/',
            release: params.release || 1.0,
            attack: params.attack || 0.1,
            onload: () => {
              // Sample cargado exitosamente
            },
            onerror: (error) => {
              // Usar fallback de sintetizador si el Sampler falla
            }
          });
        } catch (samplerError) {
          // Fallback a un sintetizador básico si el Sampler falla
          synth = new Tone.AMSynth({
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
          (synth as any)._isFallback = true;
        }
      } else {
        // Fallback por defecto
        synth = new Tone.AMSynth();
      }

      // --- ARQUITECTURA REFACTORIZADA: ENRUTAMIENTO "SEND/RETURN" CORRECTO ---
      
      // 1. Crear panner 3D para la señal seca (posición del objeto sonoro)
      const panner = new Tone.Panner3D({
        positionX: position[0],
        positionY: position[1],
        positionZ: position[2],
        panningModel: 'HRTF', // Usar HRTF para mejor espacialización 3D
        distanceModel: 'inverse',
        refDistance: 1,
        maxDistance: 100,
        rolloffFactor: 2, // Atenuación más pronunciada con la distancia
        coneInnerAngle: 360, // Ángulo interno del cono (360 = omnidireccional)
        coneOuterAngle: 360, // Ángulo externo del cono
        coneOuterGain: 0, // Ganancia fuera del cono
      });

      // 2. Crear control de volumen para la señal seca (inicialmente a volumen completo)
      const dryGain = new Tone.Gain(1);

      // 3. Crear Map de envíos a efectos
      const effectSends = new Map<string, Tone.Gain>();

      // 4. ENRUTAMIENTO "SEND/RETURN" CORRECTO: Crossfade entre señal seca y efectos
      // CAMINO SECO: synth -> panner -> dryGain -> Destination
      synth.connect(panner);
      panner.connect(dryGain);
      dryGain.connect(Tone.Destination);

      // CAMINO MOJADO: synth -> effectSend -> globalEffect -> Destination
      // El synth se conecta DIRECTAMENTE a cada send (sin splitter)
      this.globalEffects.forEach((effectData, effectId) => {
        const send = new Tone.Gain(0); // Inicialmente silenciado
        effectSends.set(effectId, send);
        
        // CONEXIÓN CORRECTA: synth -> send -> efecto (camino independiente)
        synth.connect(send);
        send.connect(effectData.effectNode);
      });

      // Almacenar en el Map con la nueva estructura
      this.soundSources.set(id, {
        synth,
        panner,
        dryGain,
        effectSends,
      });

      // Configurar parámetros iniciales - asegurar frecuencia segura
      const safeFrequency = Math.max(params.frequency, 20);
      
      // Configurar frecuencia según el tipo de sintetizador
      if (type === 'cube' || type === 'sphere') {
        (synth as Tone.AMSynth | Tone.FMSynth).oscillator.frequency.setValueAtTime(safeFrequency, Tone.now());
      } else if (type === 'cylinder') {
        // Para DuoSynth, la frecuencia se configura en el sintetizador principal
        (synth as Tone.DuoSynth).frequency.setValueAtTime(safeFrequency, Tone.now());
      } else if (type === 'cone') {
        // Para MembraneSynth, la frecuencia se configura en el sintetizador principal
        (synth as Tone.MembraneSynth).frequency.setValueAtTime(safeFrequency, Tone.now());
      } else if (type === 'pyramid') {
        // Para MonoSynth, la frecuencia se configura en el sintetizador principal
        (synth as Tone.MonoSynth).frequency.setValueAtTime(safeFrequency, Tone.now());
      } else if (type === 'icosahedron') {
        // Para MetalSynth, la frecuencia se configura en el sintetizador principal
        (synth as Tone.MetalSynth).frequency.setValueAtTime(safeFrequency, Tone.now());
      } else if (type === 'plane') {
        // Para NoiseSynth, no se configura frecuencia ya que genera ruido
      } else if (type === 'torus') {
        // Para PluckSynth, la frecuencia se configura en el sintetizador principal
        (synth as Tone.PluckSynth).toFrequency(safeFrequency);
      } else if (type === 'dodecahedronRing') {
        // Para PolySynth, no se configura frecuencia individual ya que usa acordes
      } else if (type === 'spiral') {
        // Para Sampler, no se configura frecuencia ya que usa notas musicales
      }
      
      // Configurar la mezcla inicial de efectos basada en la posición
      this.updateSoundEffectMixing(id, position);
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Elimina una fuente de sonido
   */
  public removeSoundSource(id: string): void {
    const source = this.soundSources.get(id);
    if (!source) {
      return;
    }

    try {
      // Detener el sonido si está sonando
      if (this.playingSounds.has(id)) {
        source.synth.triggerRelease(Tone.now());
      }

      // Limpiar todas las conexiones a efectos antes de eliminar
      this.cleanupSourceEffectConnections(id);

      // Desconectar todas las conexiones antes de disponer
      try {
        // Desconectar del panner
        source.panner.disconnect();
        // Desconectar del dryGain
        source.dryGain.disconnect();
        // Desconectar del synth
        source.synth.disconnect();
        
        // Desconectar todos los sends de efectos
        source.effectSends.forEach((send) => {
          try {
            send.disconnect();
          } catch (sendError) {
            // Manejo silencioso de errores
          }
        });
      } catch (disconnectError) {
        // Manejo silencioso de errores
      }

      // Limpiar recursos
      source.synth.dispose();
      source.panner.dispose();
      source.dryGain.dispose(); // Disponer el control de volumen seco
      
      // Disponer todos los sends de efectos
      source.effectSends.forEach((send) => {
        try {
          send.dispose();
        } catch (sendError) {
          // Manejo silencioso de errores
        }
      });

      // Eliminar del Map y limpiar el estado
      this.soundSources.delete(id);
      this.playingSounds.delete(id); // Asegurarse de limpiar el estado
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Inicia el sonido continuo de una fuente (completamente independiente de las interacciones de clic)
   */
  public startContinuousSound(id: string, params: AudioParams): void {
    const source = this.soundSources.get(id);
    if (!source || this.playingSounds.has(id)) {
      return;
    }

    try {
      // Aplicar TODOS los parámetros antes de iniciar
      this.updateSoundParams(id, params);
      
      // Para PolySynth, usar triggerAttack con acordes (sonido continuo)
      if (source.synth instanceof Tone.PolySynth) {
        // Generar acorde basado en la frecuencia base si está disponible
        let chord = params.chord || ["C4", "E4", "G4"];
        
        // Si hay frecuencia base, transponer el acorde
        if (params.frequency && params.frequency > 0) {
          // Convertir frecuencia a nota más cercana
          const baseNote = this.frequencyToNote(params.frequency);
          chord = this.generateChordFromBase(baseNote, params.chord || ["C4", "E4", "G4"]);
        }
        
        source.synth.triggerAttack(chord, this.getUniqueStartTime());
        this.playingSounds.add(id);
        return;
      }
      
      // Para todos los demás sintetizadores, usar triggerAttack para sonido continuo
      // NO usar triggerAttackRelease aquí, solo triggerAttack para mantener el sonido
      try {
        (source.synth as any).triggerAttack(params.frequency, this.getUniqueStartTime());
        this.playingSounds.add(id); // Marcar como sonando
      } catch (error) {
        // Fallback: intentar con triggerAttackRelease si está disponible
        if ('triggerAttackRelease' in source.synth) {
          try {
            const fallbackDuration = 0.5; // Duración corta como fallback
            (source.synth as any).triggerAttackRelease(params.frequency, fallbackDuration, this.getUniqueStartTime());
            this.playingSounds.add(id);
          } catch (fallbackError) {
            // Manejo silencioso de errores
          }
        }
      }
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Inicia el sonido de una fuente (para gate y sonidos temporales)
   */
  public startSound(id: string, params: AudioParams): void {
    const source = this.soundSources.get(id);
    if (!source || this.playingSounds.has(id)) {
      return;
    }

    try {
      // Aplicar TODOS los parámetros antes de iniciar
      this.updateSoundParams(id, params);
      
      // Para PolySynth, usar triggerAttack con acordes
      if (source.synth instanceof Tone.PolySynth) {
        // Generar acorde basado en la frecuencia base si está disponible
        let chord = params.chord || ["C4", "E4", "G4"];
        
        // Si hay frecuencia base, transponer el acorde
        if (params.frequency && params.frequency > 0) {
          // Convertir frecuencia a nota más cercana
          const baseNote = this.frequencyToNote(params.frequency);
          chord = this.generateChordFromBase(baseNote, params.chord || ["C4", "E4", "G4"]);
        }
        
        source.synth.triggerAttack(chord, Tone.now());
        this.playingSounds.add(id);
        return;
      }
      
      // Para MonoSynth y otros sintetizadores, usar triggerAttack para sonido continuo
      // El triggerRelease se llamará cuando se detenga el sonido
      try {
        (source.synth as any).triggerAttack(params.frequency, Tone.now());
        this.playingSounds.add(id); // Marcar como sonando
      } catch (error) {
        // Fallback: intentar con triggerAttackRelease si está disponible
        if ('triggerAttackRelease' in source.synth) {
          try {
            const fallbackDuration = 0.5; // Duración corta como fallback
            (source.synth as any).triggerAttackRelease(params.frequency, fallbackDuration, Tone.now());
            this.playingSounds.add(id);
          } catch (fallbackError) {
            // Manejo silencioso de errores
          }
        }
      }
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Detiene el sonido de una fuente
   */
  public stopSound(id: string): void {
    const source = this.soundSources.get(id);
    if (!source) {
      return;
    }

    // No verificar si está sonando, siempre intentar detener
    try {
      // Para PolySynth, usar releaseAll para detener todas las voces
      if (source.synth instanceof Tone.PolySynth) {
        source.synth.releaseAll(Tone.now());
        this.playingSounds.delete(id);
        return;
      }
      
      // triggerRelease inicia la fase de 'release' de la envolvente.
      // El sintetizador se encargará de detener el oscilador cuando la envolvente llegue a cero.
      source.synth.triggerRelease(Tone.now());
      
      this.playingSounds.delete(id); // Marcar como no sonando
    } catch (error) {
      // Aún así, marcar como no sonando
      this.playingSounds.delete(id);
    }
  }

  /**
   * Dispara una nota percusiva (especialmente para MembraneSynth y Sampler)
   */
  public triggerNoteAttack(id: string, params: AudioParams): void {
    const source = this.soundSources.get(id);
    if (!source) {
      return;
    }

    try {
      // Aplicar parámetros antes de disparar
      this.updateSoundParams(id, params);
      
      // Para Sampler, usar triggerAttackRelease con notas y duración
      if (source.synth instanceof Tone.Sampler) {
        try {
          const notes = params.notes || ["C4"];
          const duration = params.duration || 1.0;
          source.synth.triggerAttackRelease(notes, duration, Tone.now());
          return;
        } catch (samplerError) {
          // Si el Sampler falla, usar el fallback como un sintetizador normal
          const duration = params.duration || 0.5;
          const frequency = this.getNoteFrequency(params.notes?.[0] || "C4");
          (source.synth as any).triggerAttackRelease(frequency, duration, Tone.now());
          return;
        }
      }
      
      // Para sintetizadores de fallback (cuando el Sampler no pudo cargar)
      if ((source.synth as any)._isFallback) {
        const notes = Array.isArray(params.notes) ? params.notes : [params.notes || "C4"];
        const duration = params.duration || 0.5;
        
        // Reproducir cada nota del acorde
        notes.forEach((note: string, index: number) => {
          const frequency = this.getNoteFrequency(note);
          const delay = index * 0.1; // Pequeño delay entre notas para efecto de acorde
          setTimeout(() => {
            try {
              (source.synth as any).triggerAttackRelease(frequency, duration, Tone.now());
            } catch (error) {
              // Manejo silencioso de errores
            }
          }, delay * 1000);
        });
        return;
      }
      
      // Para PluckSynth, usar triggerAttack sin triggerRelease ya que decae naturalmente
      if (source.synth instanceof Tone.PluckSynth) {
        source.synth.triggerAttack(params.frequency, Tone.now());
        return;
      }
      
      // Para todos los demás sintetizadores, usar triggerAttackRelease con duración configurada o triggerAttack para duración infinita
      const duration = params.duration;
      
      if (duration === Infinity) {
        // Duración infinita - usar triggerAttack para sonido continuo
        (source.synth as any).triggerAttack(params.frequency, Tone.now());
      } else if ('triggerAttackRelease' in source.synth) {
        // Duración finita - usar triggerAttackRelease
        const actualDuration = duration || 0.5; // Usar duración configurada o 0.5 por defecto
        (source.synth as any).triggerAttackRelease(params.frequency, actualDuration, Tone.now());
      } else {
        // Fallback para sintetizadores que no soportan triggerAttackRelease
        try {
          (source.synth as any).triggerAttack(params.frequency, Tone.now());
        } catch (fallbackError) {
          // Último recurso: intentar con triggerAttack en el sintetizador principal
          if (typeof (source.synth as any).triggerAttack === 'function') {
            (source.synth as any).triggerAttack(params.frequency, Tone.now());
          }
        }
      }
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Dispara una nota con duración específica (para interacción de clic corto)
   * Este método funciona universalmente con todos los tipos de sintetizadores
   */
  public triggerAttackRelease(id: string, params: AudioParams): void {
    const source = this.soundSources.get(id);
    if (!source) {
      return;
    }

    try {
      // Aplicar parámetros antes de disparar
      this.updateSoundParams(id, params);
      
      // Para PolySynth, usar triggerAttackRelease con acordes
      if (source.synth instanceof Tone.PolySynth) {
        let chord = params.chord || ["C4", "E4", "G4"];
        
        // Si hay frecuencia base, transponer el acorde
        if (params.frequency && params.frequency > 0) {
          const baseNote = this.frequencyToNote(params.frequency);
          chord = this.generateChordFromBase(baseNote, params.chord || ["C4", "E4", "G4"]);
        }
        
        const duration = params.duration || '8n';
        source.synth.triggerAttackRelease(chord, duration, Tone.now());
        return;
      }
      
      // Para Sampler, usar triggerAttackRelease con notas
      if (source.synth instanceof Tone.Sampler) {
        const notes = params.notes || ["C4"];
        const duration = params.duration || '8n';
        source.synth.triggerAttackRelease(notes, duration, Tone.now());
        return;
      }
      
      // Para sintetizadores de fallback
      if ((source.synth as any)._isFallback) {
        const notes = Array.isArray(params.notes) ? params.notes : [params.notes || "C4"];
        const duration = params.duration || '8n';
        
        notes.forEach((note: string, index: number) => {
          const frequency = this.getNoteFrequency(note);
          const delay = index * 0.1;
          setTimeout(() => {
            try {
              (source.synth as any).triggerAttackRelease(frequency, duration, Tone.now());
            } catch (error) {
              // Manejo silencioso de errores
            }
          }, delay * 1000);
        });
        return;
      }
      
      // Para todos los demás sintetizadores, usar triggerAttackRelease universal
      if ('triggerAttackRelease' in source.synth) {
        const frequency = params.frequency;
        const duration = params.duration || '8n';
        
        (source.synth as any).triggerAttackRelease(frequency, duration, Tone.now());
      } else {
        // Fallback: usar triggerAttack con duración manual
        const frequency = params.frequency;
        const duration = params.duration || 0.5;
        
        (source.synth as any).triggerAttack(frequency, Tone.now());
        setTimeout(() => {
          try {
            (source.synth as any).triggerRelease(Tone.now());
          } catch (error) {
            // Manejo silencioso de errores
          }
        }, duration * 1000);
      }
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Dispara un ataque de ruido (especialmente para NoiseSynth)
   */
  public triggerNoiseAttack(id: string, params: AudioParams): void {
    const source = this.soundSources.get(id);
    if (!source) {
      return;
    }

    try {
      // Aplicar parámetros antes de disparar
      this.updateSoundParams(id, params);
      
      // Para NoiseSynth, usar triggerAttackRelease con duración
      if (source.synth instanceof Tone.NoiseSynth) {
        const duration = params.duration || 0.1; // Duración por defecto para ruido
        source.synth.triggerAttackRelease(duration, Tone.now());
      }
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Actualiza los parámetros de sonido de una fuente
   */
  public updateSoundParams(id: string, params: Partial<AudioParams>): void {
    const source = this.soundSources.get(id);
    if (!source) {
      return;
    }

    try {
      // Actualizar parámetros específicos del PolySynth
      if (source.synth instanceof Tone.PolySynth) {
        // Actualizar polyphony si cambia
        if (params.polyphony !== undefined) {
          source.synth.maxPolyphony = params.polyphony;
        }
        
        // Actualizar parámetros de las voces FMSynth
        if (params.harmonicity !== undefined || params.modulationIndex !== undefined || 
            params.attack !== undefined || params.release !== undefined) {
          const voiceOptions: any = {};
          
          if (params.harmonicity !== undefined) {
            voiceOptions.harmonicity = params.harmonicity;
          }
          if (params.modulationIndex !== undefined) {
            voiceOptions.modulationIndex = params.modulationIndex;
          }
          if (params.attack !== undefined || params.release !== undefined) {
            voiceOptions.envelope = {};
            if (params.attack !== undefined) {
              voiceOptions.envelope.attack = params.attack;
            }
            if (params.release !== undefined) {
              voiceOptions.envelope.release = params.release;
            }
          }
          
          source.synth.set(voiceOptions);
        }
      }

      // Actualizar frecuencia si cambia - usar rampTo en la señal de frecuencia del sintetizador
      if (params.frequency !== undefined && !(source.synth instanceof Tone.PolySynth)) {
        // Asegurar que la frecuencia sea al menos 20Hz (límite inferior del oído humano)
        const safeFrequency = Math.max(params.frequency, 20);
        
        // Verificar si el sintetizador tiene la propiedad frequency (NoiseSynth no la tiene)
        if ('frequency' in source.synth && source.synth.frequency) {
          // --- CAMBIO CLAVE: Usar rampTo en la señal de frecuencia del sintetizador ---
          source.synth.frequency.rampTo(safeFrequency, 0.05);
        } else if (source.synth instanceof Tone.PluckSynth) {
          // Para PluckSynth, usar toFrequency
          // Para PluckSynth, usar toFrequency
          (source.synth as Tone.PluckSynth).toFrequency(safeFrequency);
        }
      }

      // Actualizar parámetros específicos del PluckSynth (torus)
      if (source.synth instanceof Tone.PluckSynth) {
        // Es un PluckSynth
        const pluckSynth = source.synth as Tone.PluckSynth;
        
        // Actualizar attackNoise
        if (params.attackNoise !== undefined) {
          pluckSynth.attackNoise = params.attackNoise;
        }
        
        // Actualizar dampening
        if (params.dampening !== undefined) {
          pluckSynth.dampening = params.dampening;
        }
        
        // Actualizar resonance
        if (params.resonance !== undefined) {
          pluckSynth.resonance = params.resonance;
        }
      }

      // Actualizar tipo de onda si cambia
      if (params.waveform !== undefined) {
        // Manejar según el tipo de sintetizador
        if ('oscillator' in source.synth) {
          // AMSynth, FMSynth, MembraneSynth o MonoSynth
          (source.synth as Tone.AMSynth | Tone.FMSynth | Tone.MembraneSynth | Tone.MonoSynth).oscillator.type = params.waveform;
        } else if ('voice0' in source.synth) {
          // DuoSynth
          (source.synth as Tone.DuoSynth).voice0.oscillator.type = params.waveform;
        }
      }

      // Actualizar harmonicity si cambia (para AMSynth, FMSynth y MetalSynth)
      if (params.harmonicity !== undefined && 'harmonicity' in source.synth) {
        try {
          const harmonicity = (source.synth as Tone.AMSynth | Tone.FMSynth | Tone.MetalSynth).harmonicity;
          if (typeof harmonicity === 'object' && 'rampTo' in harmonicity) {
            harmonicity.rampTo(params.harmonicity, 0.05);
          } else {
            (source.synth as any).harmonicity = params.harmonicity;
          }
        } catch (error) {
          // Para MetalSynth, algunas propiedades pueden ser de solo lectura
        }
      }

      // Actualizar modulationIndex si cambia (para FMSynth y MetalSynth)
      if (params.modulationIndex !== undefined && 'modulationIndex' in source.synth) {
        try {
          const modulationIndex = (source.synth as Tone.FMSynth | Tone.MetalSynth).modulationIndex;
          if (typeof modulationIndex === 'object' && 'rampTo' in modulationIndex) {
            modulationIndex.rampTo(params.modulationIndex, 0.05);
          } else {
            (source.synth as any).modulationIndex = params.modulationIndex;
          }
        } catch (error) {
          // Para MetalSynth, algunas propiedades pueden ser de solo lectura
        }
      }

      // Actualizar forma de onda de modulación si cambia (para AMSynth y FMSynth)
      if (params.modulationWaveform !== undefined && 'modulation' in source.synth) {
        (source.synth as Tone.AMSynth | Tone.FMSynth).modulation.type = params.modulationWaveform;
      }

      // Actualizar parámetros específicos del DuoSynth
      if ('voice0' in source.synth) {
        // Es un DuoSynth
        const duoSynth = source.synth as Tone.DuoSynth;
        
        // Actualizar harmonicity
        if (params.harmonicity !== undefined) {
          duoSynth.harmonicity.rampTo(params.harmonicity, 0.05);
        }
        
        // Actualizar vibratoAmount
        if (params.vibratoAmount !== undefined) {
          duoSynth.vibratoAmount.rampTo(params.vibratoAmount, 0.05);
        }
        
        // Actualizar vibratoRate
        if (params.vibratoRate !== undefined) {
          duoSynth.vibratoRate.rampTo(params.vibratoRate, 0.05);
        }
        
        // Actualizar waveform2 (segunda voz)
        if (params.waveform2 !== undefined) {
          duoSynth.voice1.oscillator.type = params.waveform2;
        }
      }

      // Actualizar parámetros específicos del MembraneSynth
      if ('pitchDecay' in source.synth) {
        // Es un MembraneSynth
        const membraneSynth = source.synth as Tone.MembraneSynth;
        
        // Actualizar pitchDecay
        if (params.pitchDecay !== undefined) {
          membraneSynth.pitchDecay = params.pitchDecay;
        }
        
        // Actualizar octaves
        if (params.octaves !== undefined) {
          membraneSynth.octaves = params.octaves;
        }
      }

      // Actualizar parámetros específicos del MonoSynth
      if ('filterEnvelope' in source.synth) {
        // Es un MonoSynth
        const monoSynth = source.synth as Tone.MonoSynth;
        
        // Actualizar envolvente de amplitud
        if (params.ampAttack !== undefined) {
          monoSynth.envelope.attack = params.ampAttack;
        }
        if (params.ampDecay !== undefined) {
          monoSynth.envelope.decay = params.ampDecay;
        }
        if (params.ampSustain !== undefined) {
          monoSynth.envelope.sustain = params.ampSustain;
        }
        if (params.ampRelease !== undefined) {
          monoSynth.envelope.release = params.ampRelease;
        }
        
        // Actualizar envolvente de filtro
        if (params.filterAttack !== undefined) {
          monoSynth.filterEnvelope.attack = params.filterAttack;
        }
        if (params.filterDecay !== undefined) {
          monoSynth.filterEnvelope.decay = params.filterDecay;
        }
        if (params.filterSustain !== undefined) {
          monoSynth.filterEnvelope.sustain = params.filterSustain;
        }
        if (params.filterRelease !== undefined) {
          monoSynth.filterEnvelope.release = params.filterRelease;
        }
        if (params.filterBaseFreq !== undefined) {
          monoSynth.filterEnvelope.baseFrequency = params.filterBaseFreq;
        }
        if (params.filterOctaves !== undefined) {
          monoSynth.filterEnvelope.octaves = params.filterOctaves;
        }
        
        // Actualizar parámetros del filtro
        if (params.filterQ !== undefined) {
          monoSynth.filter.Q.value = params.filterQ;
        }
      }

      // Actualizar parámetros específicos del MetalSynth
      if ('resonance' in source.synth) {
        // Es un MetalSynth
        const metalSynth = source.synth as Tone.MetalSynth;
        
        // Actualizar resonance
        if (params.resonance !== undefined) {
          metalSynth.resonance = params.resonance;
        }
        
        // Actualizar octaves
        if (params.octaves !== undefined) {
          metalSynth.octaves = params.octaves;
        }
      }

      // Actualizar parámetros específicos del NoiseSynth
      if (source.synth instanceof Tone.NoiseSynth) {
        // Es un NoiseSynth
        const noiseSynth = source.synth as Tone.NoiseSynth;
        
        // Actualizar tipo de ruido
        if (params.noiseType !== undefined) {
          noiseSynth.noise.type = params.noiseType;
        }
        
        // Actualizar envolvente
        if (params.attack !== undefined) {
          noiseSynth.envelope.attack = params.attack;
        }
        if (params.decay !== undefined) {
          noiseSynth.envelope.decay = params.decay;
        }
        if (params.sustain !== undefined) {
          noiseSynth.envelope.sustain = params.sustain;
        }
      }

      // Actualizar parámetros específicos del Sampler
      if (source.synth instanceof Tone.Sampler) {
        // Es un Sampler
        const sampler = source.synth as Tone.Sampler;
        
        // Actualizar attack
        if (params.attack !== undefined) {
          // El Sampler hereda de Synth, por lo que tiene envelope
          if ('envelope' in sampler && sampler.envelope) {
            (sampler as any).envelope.attack = params.attack;
          }
        }
        
        // Actualizar release
        if (params.release !== undefined) {
          if ('envelope' in sampler && sampler.envelope) {
            (sampler as any).envelope.release = params.release;
          }
        }
        
        // Actualizar curve
        if (params.curve !== undefined) {
          if ('envelope' in sampler && sampler.envelope) {
            (sampler as any).envelope.curve = params.curve;
          }
        }
      }

      // Actualizar volumen si cambia
      if (params.volume !== undefined) {
        // Para síntesis AM, el volumen debe controlar tanto la amplitud como el volumen general
        if ('modulation' in source.synth) {
          // Es un AMSynth - aplicar volumen a la amplitud de la portadora
          const amplitudeValue = params.volume;
          (source.synth as Tone.AMSynth).oscillator.volume.rampTo(Tone.gainToDb(amplitudeValue), 0.05);
        }
        
        // Aplicar volumen general al sintetizador (control de salida)
        // El rango 0-0.1 se mapea a -Infinity a -20dB para mejor control
        const dbValue = params.volume > 0 ? Tone.gainToDb(params.volume * 10) : -Infinity;
        source.synth.volume.rampTo(dbValue, 0.05);
      }
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Actualiza la posición 3D de una zona de efecto
   */
  public updateEffectZonePosition(id: string, position: [number, number, number]): void {
    const effectData = this.globalEffects.get(id);
    if (!effectData) {
      return;
    }

    try {
      // Actualizar la posición del panner del efecto
      effectData.panner.setPosition(position[0], position[1], position[2]);
      
      // Actualizar la mezcla de efectos para todos los objetos sonoros
      this.soundSources.forEach((source, soundId) => {
        // Obtener la posición actual del objeto sonoro desde su panner
        const soundPosition: [number, number, number] = [
          source.panner.positionX.value,
          source.panner.positionY.value,
          source.panner.positionZ.value
        ];
        
        // Actualizar la mezcla para este objeto sonoro
        this.updateSoundEffectMixing(soundId, soundPosition);
      });
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Actualiza la posición 3D de una fuente de sonido
   */
  public updateSoundPosition(id: string, position: [number, number, number]): void {
    const source = this.soundSources.get(id);
    if (!source) {
      return;
    }

    try {
      // Actualizar la posición del panner
      source.panner.setPosition(position[0], position[1], position[2]);
      
      // Actualizar la mezcla de efectos basada en la nueva posición
      this.updateSoundEffectMixing(id, position);
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Actualiza la mezcla de efectos para una fuente de sonido basada en su posición
   */
  private updateSoundEffectMixing(soundId: string, soundPosition: [number, number, number]): void {
    const source = this.soundSources.get(soundId);
    if (!source) return;

    try {
      // Calcular la mezcla para cada efecto global
      this.globalEffects.forEach((effectData, effectId) => {
        const send = source.effectSends.get(effectId);
        if (!send) return;

        // Obtener la posición del efecto desde su panner
        const effectPosition = [
          effectData.panner.positionX.value,
          effectData.panner.positionY.value,
          effectData.panner.positionZ.value
        ];

        // Calcular distancia entre el sonido y el efecto
        const distance = Math.sqrt(
          Math.pow(soundPosition[0] - effectPosition[0], 2) +
          Math.pow(soundPosition[1] - effectPosition[1], 2) +
          Math.pow(soundPosition[2] - effectPosition[2], 2)
        );

        // Radio de la zona de efecto (ajustar según el tamaño de la zona)
        const effectRadius = 2.0; // Radio de 2 unidades por defecto
        
        // Calcular intensidad del efecto (0 = fuera, 1 = dentro)
        let effectIntensity = 0;
        if (distance <= effectRadius) {
          // Dentro de la zona: intensidad completa
          effectIntensity = 1.0;
        } else if (distance <= effectRadius * 2) {
          // Zona de transición: intensidad gradual
          effectIntensity = 1.0 - ((distance - effectRadius) / effectRadius);
        } else {
          // Fuera de la zona: sin efecto
          effectIntensity = 0.0;
        }

        // Aplicar la intensidad al send del efecto
        send.gain.setValueAtTime(effectIntensity, Tone.now());
        
        // Ajustar el dry gain (seco) inversamente
        const dryIntensity = 1.0 - effectIntensity;
        source.dryGain.gain.setValueAtTime(dryIntensity, Tone.now());

        // Log para debug (solo cuando hay cambios significativos)
        const lastIntensity = this.lastEffectIntensities.get(`${soundId}-${effectId}`) || 0;
        if (Math.abs(effectIntensity - lastIntensity) > 0.1) {
          console.log(`🎛️ AudioManager: Sonido ${soundId} en efecto ${effectId}:`, {
            distance: distance.toFixed(2),
            effectIntensity: effectIntensity.toFixed(2),
            dryIntensity: dryIntensity.toFixed(2),
            position: soundPosition,
            effectPosition: effectPosition
          });
          
          // Actualizar el registro de intensidades
          this.lastEffectIntensities.set(`${soundId}-${effectId}`, effectIntensity);
        }
      });
    } catch (error) {
      console.error(`❌ AudioManager: Error al actualizar mezcla de efectos:`, error);
    }
  }

  /**
   * Actualiza la posición y orientación del oyente global de Tone.js
   */
  public updateListener(position: THREE.Vector3, forward: THREE.Vector3): void {
    try {
      // Actualizar la posición del oyente
      Tone.Listener.positionX.value = position.x;
      Tone.Listener.positionY.value = position.y;
      Tone.Listener.positionZ.value = position.z;
      
      // Actualizar la orientación del oyente (hacia dónde mira)
      Tone.Listener.forwardX.value = forward.x;
      Tone.Listener.forwardY.value = forward.y;
      Tone.Listener.forwardZ.value = forward.z;
      
      // Configurar el vector "arriba" del oyente (normalmente Y positivo)
      Tone.Listener.upX.value = 0;
      Tone.Listener.upY.value = 1;
      Tone.Listener.upZ.value = 0;
      
      // Solo loggear cambios significativos en la posición (cada 0.5 unidades)
      const currentPos = `${Math.round(position.x * 2) / 2},${Math.round(position.y * 2) / 2},${Math.round(position.z * 2) / 2}`;
      if (this.lastListenerPosition !== currentPos) {
        this.lastListenerPosition = currentPos;
      }
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Obtiene el estado de una fuente de sonido
   */
  public getSoundSourceState(id: string): boolean {
    const source = this.soundSources.get(id);
    if (!source) return false;
    
    // Verificar si existe la fuente
    return true;
  }

  /**
   * Verifica si una fuente de sonido está activamente sonando
   */
  public isSoundPlaying(id: string): boolean {
    return this.playingSounds.has(id);
  }

  /**
   * Obtiene información de debug
   */
  public getDebugInfo(): {
    contextState: string;
    soundSourcesCount: number;
    soundSourceIds: string[];
  } {
    return {
      contextState: Tone.context.state,
      soundSourcesCount: this.soundSources.size,
      soundSourceIds: Array.from(this.soundSources.keys()),
    };
  }

  // Helper para convertir nota a frecuencia (ejemplo: "A4" -> 440Hz)
  private getNoteFrequency(note: string): number {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteName = note.replace(/[0-9]/g, '');
    const octave = parseInt(note[note.length - 1]) || 4;
    const noteIndex = notes.indexOf(noteName);
    
    if (noteIndex === -1) {
      return 261.63; // C4
    }
    
    // Calcular frecuencia usando la fórmula A4 = 440Hz como referencia
    const semitonesFromA4 = (octave - 4) * 12 + (noteIndex - 9); // A es el índice 9
    return 440 * Math.pow(2, semitonesFromA4 / 12);
  }

  // Helper para convertir frecuencia a nota (ejemplo: 440Hz -> "A4")
  private frequencyToNote(frequency: number): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(Math.log2(frequency / 440) / 12) + 4; // 440Hz es A4
    const noteIndex = Math.round(12 * Math.log2(frequency / 440)) % 12;
    return notes[noteIndex] + octave;
  }

  // Helper para generar acordes basados en una nota base
  private generateChordFromBase(baseNote: string, chord: string[]): string[] {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const baseNoteIndex = notes.indexOf(baseNote.replace(/[0-9]/g, ''));
    const chordNotes = chord.map(note => {
      const noteName = note.replace(/[0-9]/g, '');
      const noteIndex = notes.indexOf(noteName);
      const semitoneDiff = noteIndex - baseNoteIndex;
      return notes[(semitoneDiff + 12) % 12] + (parseInt(note[note.length - 1]) + 1); // Asegurar octava correcta
    });
    return chordNotes;
  }

  // Helper para obtener un tiempo único para el triggerAttack de sonidos continuos
  private getUniqueStartTime(): number {
    return Tone.now() + 0.001; // Añadir un pequeño offset para evitar conflictos
  }
}

// Exportar una única instancia global
export const audioManager = AudioManager.getInstance();