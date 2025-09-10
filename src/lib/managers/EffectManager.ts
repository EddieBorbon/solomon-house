import * as Tone from 'tone';

// Tipos para efectos
export type EffectType = 'phaser' | 'autoFilter' | 'autoWah' | 'bitCrusher' | 'chebyshev' | 'chorus' | 'distortion' | 'feedbackDelay' | 'freeverb' | 'frequencyShifter' | 'jcReverb' | 'pingPongDelay' | 'pitchShift' | 'reverb' | 'stereoWidener' | 'tremolo' | 'vibrato';

// Estructura de un efecto global
export interface GlobalEffect {
  effectNode: Tone.Phaser | Tone.AutoFilter | Tone.AutoWah | Tone.BitCrusher | Tone.Chebyshev | Tone.Chorus | Tone.Distortion | Tone.FeedbackDelay | Tone.Freeverb | Tone.FrequencyShifter | Tone.JCReverb | Tone.PingPongDelay | Tone.PitchShift | Tone.Reverb | Tone.StereoWidener | Tone.Tremolo | Tone.Vibrato | any;
  panner: Tone.Panner3D;
  position: [number, number, number];
}

export class EffectManager {
  private globalEffects: Map<string, GlobalEffect> = new Map();
  private testOscillators: Map<string, Tone.Oscillator> = new Map();
  private effectZoneRadii: Map<string, number> = new Map();
  private lastEffectIntensities: Map<string, number> = new Map();

  /**
   * Crea un efecto global con espacialización independiente
   */
  public createGlobalEffect(effectId: string, type: EffectType, position: [number, number, number]): void {
    try {
      console.log(`🎛️ EffectManager: Creando efecto global ${type} con ID ${effectId} en posición [${position.join(', ')}]`);
      
      const effectNode = this.createEffectNode(type);
      
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
        console.log(`🎛️ EffectManager: Efecto conectado a la cadena de audio`);
        
        // Almacenar tanto el nodo del efecto como su panner y posición
        this.globalEffects.set(effectId, { effectNode, panner: effectPanner, position: position });
        console.log(`🎛️ EffectManager: Efecto almacenado en globalEffects. Total de efectos: ${this.globalEffects.size}`);
        
        // Configurar radio inicial para la zona de efectos
        this.setEffectZoneRadius(effectId, 2.0);
        console.log(`🎛️ EffectManager: Radio inicial configurado para zona de efecto ${effectId}: 2.0 unidades`);
        
        // Crear un oscilador de prueba para escuchar los efectos
        this.createTestOscillatorForEffect(effectId, effectNode);
      }
    } catch (error) {
      console.error(`❌ EffectManager: Error al crear efecto global:`, error);
    }
  }

  /**
   * Crea el nodo de efecto según el tipo
   */
  private createEffectNode(type: EffectType): any {
    switch (type) {
      case 'phaser':
        return this.createPhaser();
      case 'autoFilter':
        return this.createAutoFilter();
      case 'autoWah':
        return this.createAutoWah();
      case 'bitCrusher':
        return this.createBitCrusher();
      case 'chebyshev':
        return this.createChebyshev();
      case 'chorus':
        return this.createChorus();
      case 'distortion':
        return this.createDistortion();
      case 'feedbackDelay':
        return this.createFeedbackDelay();
      case 'freeverb':
        return this.createFreeverb();
      case 'frequencyShifter':
        return this.createFrequencyShifter();
      case 'jcReverb':
        return this.createJCReverb();
      case 'pingPongDelay':
        return this.createPingPongDelay();
      case 'pitchShift':
        return this.createPitchShift();
      case 'reverb':
        return this.createReverb();
      case 'stereoWidener':
        return this.createStereoWidener();
      case 'tremolo':
        return this.createTremolo();
      case 'vibrato':
        return this.createVibrato();
      default:
        throw new Error(`Tipo de efecto no soportado: ${type}`);
    }
  }

  private createPhaser(): Tone.Phaser {
    const effectNode = new Tone.Phaser({
      frequency: 0.5,
      octaves: 2.2,
      baseFrequency: 1000,
    });
    console.log(`🎛️ EffectManager: Phaser creado con parámetros iniciales:`, {
      frequency: effectNode.frequency.value,
      octaves: effectNode.octaves,
      baseFrequency: effectNode.baseFrequency
    });
    return effectNode;
  }

  private createAutoFilter(): Tone.AutoFilter {
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
    console.log(`🎛️ EffectManager: AutoFilter creado con parámetros iniciales:`, {
      frequency: effectNode.frequency.value,
      baseFrequency: effectNode.baseFrequency,
      octaves: effectNode.octaves,
      depth: effectNode.depth.value,
      filterType: effectNode.filter.type,
      filterQ: effectNode.filter.Q.value
    });
    return effectNode;
  }

  private createAutoWah(): Tone.AutoWah {
    const effectNode = new Tone.AutoWah({
      baseFrequency: 200,
      octaves: 2.6,
      sensitivity: 0.5,
    });
    console.log(`🎛️ EffectManager: AutoWah creado con parámetros iniciales:`, {
      baseFrequency: effectNode.baseFrequency,
      octaves: effectNode.octaves,
      sensitivity: effectNode.sensitivity
    });
    return effectNode;
  }

  private createBitCrusher(): Tone.BitCrusher {
    const effectNode = new Tone.BitCrusher(4);
    console.log(`🎛️ EffectManager: BitCrusher creado con parámetros iniciales:`, {
      bits: effectNode.bits
    });
    return effectNode;
  }

  private createChebyshev(): Tone.Chebyshev {
    const effectNode = new Tone.Chebyshev(50);
    effectNode.oversample = 'none';
    console.log(`🎛️ EffectManager: Chebyshev creado con parámetros iniciales:`, {
      order: effectNode.order,
      oversample: effectNode.oversample
    });
    return effectNode;
  }

  private createChorus(): Tone.Chorus {
    const effectNode = new Tone.Chorus(1.5, 3.5, 0.7);
    try {
      effectNode.feedback.setValueAtTime(0, effectNode.context.currentTime);
      effectNode.spread = 180;
      effectNode.type = 'sine';
    } catch (error) {
      console.log(`ℹ️ EffectManager: Algunos parámetros del Chorus no se pudieron configurar inicialmente:`, error);
    }
    effectNode.start();
    console.log(`🎛️ EffectManager: Chorus creado con parámetros iniciales:`, {
      frequency: effectNode.frequency.value,
      delayTime: effectNode.delayTime,
      depth: effectNode.depth,
      feedback: effectNode.feedback.value,
      spread: effectNode.spread,
      type: effectNode.type
    });
    return effectNode;
  }

  private createDistortion(): Tone.Distortion {
    const effectNode = new Tone.Distortion(0.4);
    try {
      effectNode.oversample = 'none';
    } catch (error) {
      // Ignorar
    }
    console.log(`🎛️ EffectManager: Distortion creado con parámetros iniciales:`, {
      distortion: effectNode.distortion,
      oversample: effectNode.oversample
    });
    return effectNode;
  }

  private createFeedbackDelay(): Tone.FeedbackDelay {
    const effectNode = new Tone.FeedbackDelay('8n', 0.5);
    console.log(`🎛️ EffectManager: FeedbackDelay creado con parámetros iniciales:`, {
      delayTime: effectNode.delayTime,
      feedback: effectNode.feedback
    });
    return effectNode;
  }

  private createFreeverb(): Tone.Freeverb {
    const effectNode = new Tone.Freeverb({ roomSize: 0.7, dampening: 3000 });
    console.log(`🎛️ EffectManager: Freeverb creado con parámetros iniciales:`, {
      roomSize: effectNode.roomSize,
      dampening: effectNode.dampening
    });
    return effectNode;
  }

  private createFrequencyShifter(): Tone.FrequencyShifter {
    const effectNode = new Tone.FrequencyShifter(0);
    console.log(`🎛️ EffectManager: FrequencyShifter creado con parámetros iniciales:`, {
      frequency: effectNode.frequency
    });
    return effectNode;
  }

  private createJCReverb(): Tone.JCReverb {
    const effectNode = new Tone.JCReverb({ roomSize: 0.5 });
    console.log(`🎛️ EffectManager: JCReverb creado con parámetros iniciales:`, {
      roomSize: effectNode.roomSize
    });
    return effectNode;
  }

  private createPingPongDelay(): Tone.PingPongDelay {
    const effectNode = new Tone.PingPongDelay({
      delayTime: '4n',
      feedback: 0.2,
      maxDelay: 1
    });
    console.log(`🎛️ EffectManager: PingPongDelay creado con parámetros iniciales:`, {
      delayTime: effectNode.delayTime.value,
      feedback: effectNode.feedback.value,
      maxDelay: effectNode.maxDelay
    });
    return effectNode;
  }

  private createPitchShift(): Tone.PitchShift {
    const effectNode = new Tone.PitchShift({
      pitch: 0,
      windowSize: 0.1,
      delayTime: 0,
      feedback: 0
    });
    console.log(`🎛️ EffectManager: PitchShift creado con parámetros iniciales:`, {
      pitch: effectNode.pitch,
      windowSize: effectNode.windowSize,
      delayTime: effectNode.delayTime.value,
      feedback: effectNode.feedback.value
    });
    return effectNode;
  }

  private createReverb(): Tone.Reverb {
    const effectNode = new Tone.Reverb({
      decay: 1.5,
      preDelay: 0.01
    });
    console.log(`🎛️ EffectManager: Reverb creado con parámetros iniciales:`, {
      decay: effectNode.decay,
      preDelay: effectNode.preDelay,
      wet: effectNode.wet.value
    });
    return effectNode;
  }

  private createStereoWidener(): Tone.StereoWidener {
    const effectNode = new Tone.StereoWidener({
      width: 0.5
    });
    console.log(`🎛️ EffectManager: StereoWidener creado con parámetros iniciales:`, {
      width: effectNode.width.value,
      wet: effectNode.wet.value
    });
    return effectNode;
  }

  private createTremolo(): Tone.Tremolo {
    const effectNode = new Tone.Tremolo({
      frequency: 10,
      depth: 0.5,
      type: 'sine',
      spread: 180
    });
    console.log(`🎛️ EffectManager: Tremolo creado con parámetros iniciales:`, {
      frequency: effectNode.frequency.value,
      depth: effectNode.depth.value,
      type: effectNode.type,
      spread: effectNode.spread
    });
    return effectNode;
  }

  private createVibrato(): Tone.Vibrato {
    const effectNode = new Tone.Vibrato({
      frequency: 5,
      depth: 0.1,
      type: 'sine',
      maxDelay: 0.005
    });
    console.log(`🎛️ EffectManager: Vibrato creado con parámetros iniciales:`, {
      frequency: effectNode.frequency.value,
      depth: effectNode.depth.value,
      type: effectNode.type,
      maxDelay: 0.005
    });
    return effectNode;
  }

  /**
   * Crea un oscilador de prueba para escuchar los efectos
   */
  private createTestOscillatorForEffect(effectId: string, effectNode: any): void {
    try {
      // Configurar el oscilador según el tipo de efecto para mejor audibilidad
      let frequency = 440;
      let volume = -30;
      let type: OscillatorType = 'sine';
      
      if (effectNode instanceof Tone.Phaser) {
        frequency = 440;
        volume = -25;
      } else if (effectNode instanceof Tone.AutoFilter) {
        frequency = 440;
        volume = -25;
      } else if (effectNode instanceof Tone.AutoWah) {
        frequency = 220;
        volume = -25;
      } else if (effectNode instanceof Tone.BitCrusher) {
        frequency = 880;
        volume = -20;
        type = 'square';
      } else if (effectNode instanceof Tone.Chebyshev) {
        frequency = 660;
        volume = -20;
        type = 'sawtooth';
      } else if (effectNode instanceof Tone.Chorus) {
        frequency = 440;
        volume = -25;
        type = 'sine';
      } else if (effectNode instanceof Tone.Distortion) {
        frequency = 440;
        volume = -20;
        type = 'sawtooth';
      } else if (effectNode instanceof Tone.FeedbackDelay) {
        frequency = 220;
        volume = -24;
        type = 'sine';
      } else if (effectNode instanceof Tone.Freeverb) {
        frequency = 440;
        volume = -28;
        type = 'sine';
      } else if (effectNode instanceof Tone.FrequencyShifter) {
        frequency = 330;
        volume = -24;
        type = 'sine';
      } else if (effectNode instanceof Tone.JCReverb) {
        frequency = 520;
        volume = -28;
        type = 'sine';
      } else if (effectNode instanceof Tone.PingPongDelay) {
        frequency = 220;
        volume = -24;
        type = 'sine';
      } else if (effectNode instanceof Tone.PitchShift) {
        frequency = 440;
        volume = -22;
        type = 'sine';
      } else if (effectNode instanceof Tone.Reverb) {
        frequency = 330;
        volume = -20;
        type = 'sine';
      } else if (effectNode instanceof Tone.StereoWidener) {
        frequency = 550;
        volume = -18;
        type = 'sine';
      } else if (effectNode instanceof Tone.Tremolo) {
        frequency = 440;
        volume = -20;
        type = 'sine';
      } else if (effectNode instanceof Tone.Vibrato) {
        frequency = 440;
        volume = -20;
        type = 'sine';
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
      
      console.log(`🎛️ EffectManager: Oscilador de prueba optimizado creado para ${effectNode.constructor.name} (${effectId}) - Frecuencia: ${frequency}Hz, Tipo: ${type}, Volumen: ${volume}dB`);
      
      // Almacenar el oscilador para poder limpiarlo después
      this.testOscillators.set(effectId, testOsc);
      
    } catch (error) {
      console.error(`❌ EffectManager: Error al crear oscilador de prueba:`, error);
    }
  }

  /**
   * Obtiene un efecto global por ID
   */
  public getGlobalEffect(effectId: string): GlobalEffect | undefined {
    return this.globalEffects.get(effectId);
  }

  /**
   * Actualiza los parámetros de un efecto global
   */
  public updateGlobalEffect(effectId: string, params: any): void {
    const effectData = this.globalEffects.get(effectId);
    if (!effectData) {
      console.warn(`⚠️ EffectManager: No se encontró efecto global con ID ${effectId}`);
      return;
    }

    try {
      const { effectNode } = effectData;
      console.log(`🎛️ EffectManager: Actualizando parámetros del efecto ${effectId}:`, params);
      
      if (effectNode instanceof Tone.Phaser) {
        this.updatePhaserParams(effectNode, params);
      } else if (effectNode instanceof Tone.AutoFilter) {
        this.updateAutoFilterParams(effectNode, params);
      } else if (effectNode instanceof Tone.AutoWah) {
        this.updateAutoWahParams(effectNode, params);
      } else if (effectNode instanceof Tone.BitCrusher) {
        this.updateBitCrusherParams(effectNode, params);
      } else if (effectNode instanceof Tone.Chebyshev) {
        this.updateChebyshevParams(effectNode, params);
      } else if (effectNode instanceof Tone.Chorus) {
        this.updateChorusParams(effectNode, params);
      } else if (effectNode instanceof Tone.Distortion) {
        this.updateDistortionParams(effectNode, params);
      } else if (effectNode instanceof Tone.FeedbackDelay) {
        this.updateFeedbackDelayParams(effectNode, params);
      } else if (effectNode instanceof Tone.Freeverb) {
        this.updateFreeverbParams(effectNode, params);
      } else if (effectNode instanceof Tone.FrequencyShifter) {
        this.updateFrequencyShifterParams(effectNode, params);
      } else if (effectNode instanceof Tone.JCReverb) {
        this.updateJCReverbParams(effectNode, params);
      } else if (effectNode instanceof Tone.PingPongDelay) {
        this.updatePingPongDelayParams(effectNode, params);
      } else if (effectNode instanceof Tone.PitchShift) {
        this.updatePitchShiftParams(effectNode, params);
      } else if (effectNode instanceof Tone.Reverb) {
        this.updateReverbParams(effectNode, params);
      } else if (effectNode instanceof Tone.StereoWidener) {
        this.updateStereoWidenerParams(effectNode, params);
      } else if (effectNode instanceof Tone.Tremolo) {
        this.updateTremoloParams(effectNode, params);
      } else if (effectNode instanceof Tone.Vibrato) {
        this.updateVibratoParams(effectNode, params);
      } else {
        console.warn(`⚠️ EffectManager: El nodo del efecto no es un tipo reconocido:`, effectNode);
      }
      
      // Refrescar el efecto para asegurar que los cambios se apliquen en tiempo real
      this.refreshGlobalEffect(effectId);
      
      // Log adicional para confirmar que los parámetros se aplicaron
      console.log(`✅ EffectManager: Parámetros del efecto ${effectId} actualizados y refrescados`);
      
      // Forzar actualización adicional para parámetros críticos
      Object.keys(params).forEach(paramName => {
        if (params[paramName] !== undefined) {
          this.forceEffectUpdate(effectId, paramName, params[paramName]);
        }
      });
      
    } catch (error) {
      console.error(`❌ EffectManager: Error al actualizar parámetros del efecto:`, error);
    }
  }

  private updatePhaserParams(effectNode: Tone.Phaser, params: any): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ EffectManager: Aplicando ${paramName} ${params[paramName]} al phaser`);
        this.safeUpdateParam(effectNode, paramName, params[paramName]);
      }
    });
    
    console.log(`🎛️ EffectManager: Parámetros actuales del phaser:`, {
      frequency: effectNode.frequency?.value || 'N/A',
      octaves: effectNode.octaves || 'N/A',
      baseFrequency: effectNode.baseFrequency || 'N/A'
    });
  }

  private updateAutoFilterParams(effectNode: Tone.AutoFilter, params: any): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ EffectManager: Aplicando ${paramName} ${params[paramName]} al autoFilter`);
        if (paramName === 'filterType' && effectNode.filter) {
          this.safeUpdateParam(effectNode, 'filter.type', params[paramName]);
        } else if (paramName === 'filterQ' && effectNode.filter) {
          this.safeUpdateParam(effectNode, 'filter.Q', params[paramName]);
        } else {
          this.safeUpdateParam(effectNode, paramName, params[paramName]);
        }
      }
    });
    
    console.log(`🎛️ EffectManager: Parámetros actuales del autoFilter:`, {
      frequency: effectNode.frequency?.value || 'N/A',
      baseFrequency: effectNode.baseFrequency || 'N/A',
      octaves: effectNode.octaves || 'N/A',
      depth: effectNode.depth?.value || 'N/A',
      filterType: effectNode.filter?.type || 'N/A',
      filterQ: effectNode.filter?.Q?.value || 'N/A',
      lfoType: effectNode.type || 'N/A'
    });
  }

  private updateAutoWahParams(effectNode: Tone.AutoWah, params: any): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ EffectManager: Aplicando ${paramName} ${params[paramName]} al autoWah`);
        this.safeUpdateParam(effectNode, paramName, params[paramName]);
      }
    });
    
    console.log(`🎛️ EffectManager: Parámetros actuales del autoWah:`, {
      baseFrequency: effectNode.baseFrequency || 'N/A',
      octaves: effectNode.octaves || 'N/A',
      sensitivity: effectNode.sensitivity || 'N/A'
    });
  }

  private updateBitCrusherParams(effectNode: Tone.BitCrusher, params: any): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ EffectManager: Aplicando ${paramName} ${params[paramName]} al bitCrusher`);
        if (paramName === 'bits') {
          console.log(`ℹ️ EffectManager: Los bits del BitCrusher no se pueden cambiar después de la creación`);
        } else {
          this.safeUpdateParam(effectNode, paramName, params[paramName]);
        }
      }
    });
    
    console.log(`🎛️ EffectManager: Parámetros actuales del bitCrusher:`, {
      bits: effectNode.bits || 'N/A'
    });
  }

  private updateChebyshevParams(effectNode: Tone.Chebyshev, params: any): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ EffectManager: Aplicando ${paramName} ${params[paramName]} al chebyshev`);
        this.safeUpdateParam(effectNode, paramName, params[paramName]);
      }
    });
    
    console.log(`🎛️ EffectManager: Parámetros actuales del chebyshev:`, {
      order: effectNode.order || 'N/A',
      oversample: effectNode.oversample || 'N/A'
    });
  }

  private updateChorusParams(effectNode: Tone.Chorus, params: any): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ EffectManager: Aplicando ${paramName} ${params[paramName]} al chorus`);
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
    
    console.log(`🎛️ EffectManager: Parámetros actuales del chorus:`, {
      frequency: effectNode.frequency?.value || 'N/A',
      delayTime: effectNode.delayTime || 'N/A',
      depth: effectNode.depth || 'N/A',
      feedback: effectNode.feedback?.value || 'N/A',
      spread: effectNode.spread || 'N/A',
      type: effectNode.type || 'N/A'
    });
  }

  private updateDistortionParams(effectNode: Tone.Distortion, params: any): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ EffectManager: Aplicando ${paramName} ${params[paramName]} al distortion`);
        if (paramName === 'distortion') {
          this.safeUpdateParam(effectNode, 'distortion', params[paramName]);
        } else if (paramName === 'oversample') {
          this.safeUpdateParam(effectNode, 'oversample', params[paramName]);
        } else {
          this.safeUpdateParam(effectNode, paramName, params[paramName]);
        }
      }
    });
    console.log(`🎛️ EffectManager: Parámetros actuales del distortion:`, {
      distortion: effectNode.distortion,
      oversample: effectNode.oversample
    });
  }

  private updateFreeverbParams(effectNode: Tone.Freeverb, params: any): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ EffectManager: Aplicando ${paramName} ${params[paramName]} a freeverb`);
        if (paramName === 'roomSize') {
          this.safeUpdateParam(effectNode, 'roomSize', params[paramName]);
        } else if (paramName === 'dampening') {
          this.safeUpdateParam(effectNode, 'dampening', params[paramName]);
        } else {
          this.safeUpdateParam(effectNode, paramName, params[paramName]);
        }
      }
    });
    console.log(`🎛️ EffectManager: Parámetros actuales del freeverb:`, {
      roomSize: effectNode.roomSize,
      dampening: effectNode.dampening
    });
  }

  private updateFrequencyShifterParams(effectNode: Tone.FrequencyShifter, params: any): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ EffectManager: Aplicando ${paramName} ${params[paramName]} a frequencyShifter`);
        if (paramName === 'frequencyShift' || paramName === 'frequency') {
          this.safeUpdateParam(effectNode, 'frequency', params[paramName]);
        } else {
          this.safeUpdateParam(effectNode, paramName, params[paramName]);
        }
      }
    });
    console.log(`🎛️ EffectManager: Parámetros actuales del frequencyShifter:`, {
      frequency: effectNode.frequency
    });
  }

  private updateJCReverbParams(effectNode: Tone.JCReverb, params: any): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ EffectManager: Aplicando ${paramName} ${params[paramName]} a jcReverb`);
        if (paramName === 'roomSize') {
          this.safeUpdateParam(effectNode, 'roomSize', params[paramName]);
        } else {
          this.safeUpdateParam(effectNode, paramName, params[paramName]);
        }
      }
    });
    console.log(`🎛️ EffectManager: Parámetros actuales del jcReverb:`, {
      roomSize: effectNode.roomSize
    });
  }

  private updatePingPongDelayParams(effectNode: Tone.PingPongDelay, params: any): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ EffectManager: Aplicando ${paramName} ${params[paramName]} a pingPongDelay`);
        
        // Mapear parámetros del store a parámetros del efecto
        if (paramName === 'pingPongDelayTime' || paramName === 'delayTime') {
          this.safeUpdateParam(effectNode, 'delayTime', params[paramName]);
        } else if (paramName === 'pingPongFeedback' || paramName === 'feedback') {
          this.safeUpdateParam(effectNode, 'feedback', params[paramName]);
        } else if (paramName === 'maxDelay') {
          this.safeUpdateParam(effectNode, 'maxDelay', params[paramName]);
        } else if (paramName === 'wet') {
          this.safeUpdateParam(effectNode, 'wet', params[paramName]);
        } else {
          this.safeUpdateParam(effectNode, paramName, params[paramName]);
        }
      }
    });
    console.log(`🎛️ EffectManager: Parámetros actuales del pingPongDelay:`, {
      delayTime: effectNode.delayTime?.value || 'N/A',
      feedback: effectNode.feedback?.value || 'N/A',
      maxDelay: effectNode.maxDelay || 'N/A',
      wet: effectNode.wet?.value || 'N/A'
    });
  }

  private updatePitchShiftParams(effectNode: Tone.PitchShift, params: any): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ EffectManager: Aplicando ${paramName} ${params[paramName]} a pitchShift`);
        
        // Mapear parámetros del store a parámetros del efecto
        if (paramName === 'pitchShift' || paramName === 'pitch') {
          this.safeUpdateParam(effectNode, 'pitch', params[paramName]);
        } else if (paramName === 'windowSize') {
          this.safeUpdateParam(effectNode, 'windowSize', params[paramName]);
        } else if (paramName === 'delayTime') {
          this.safeUpdateParam(effectNode, 'delayTime', params[paramName]);
        } else if (paramName === 'feedback') {
          this.safeUpdateParam(effectNode, 'feedback', params[paramName]);
        } else if (paramName === 'wet') {
          this.safeUpdateParam(effectNode, 'wet', params[paramName]);
        } else {
          this.safeUpdateParam(effectNode, paramName, params[paramName]);
        }
      }
    });
    console.log(`🎛️ EffectManager: Parámetros actuales del pitchShift:`, {
      pitch: effectNode.pitch || 'N/A',
      windowSize: effectNode.windowSize || 'N/A',
      delayTime: effectNode.delayTime?.value || 'N/A',
      feedback: effectNode.feedback?.value || 'N/A',
      wet: effectNode.wet?.value || 'N/A'
    });
  }

  private updateReverbParams(effectNode: Tone.Reverb, params: any): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ EffectManager: Aplicando ${paramName} ${params[paramName]} a reverb`);
        
        // Mapear parámetros del store a parámetros del efecto
        if (paramName === 'decay') {
          this.safeUpdateParam(effectNode, 'decay', params[paramName]);
        } else if (paramName === 'preDelay') {
          this.safeUpdateParam(effectNode, 'preDelay', params[paramName]);
        } else if (paramName === 'wet') {
          this.safeUpdateParam(effectNode, 'wet', params[paramName]);
        } else {
          this.safeUpdateParam(effectNode, paramName, params[paramName]);
        }
      }
    });
    console.log(`🎛️ EffectManager: Parámetros actuales del reverb:`, {
      decay: effectNode.decay || 'N/A',
      preDelay: effectNode.preDelay || 'N/A',
      wet: effectNode.wet?.value || 'N/A'
    });
  }

  private updateStereoWidenerParams(effectNode: Tone.StereoWidener, params: any): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ EffectManager: Aplicando ${paramName} ${params[paramName]} a stereoWidener`);
        
        // Mapear parámetros del store a parámetros del efecto
        if (paramName === 'width') {
          this.safeUpdateParam(effectNode, 'width', params[paramName]);
        } else if (paramName === 'wet') {
          this.safeUpdateParam(effectNode, 'wet', params[paramName]);
        } else {
          this.safeUpdateParam(effectNode, paramName, params[paramName]);
        }
      }
    });
    console.log(`🎛️ EffectManager: Parámetros actuales del stereoWidener:`, {
      width: effectNode.width?.value || 'N/A',
      wet: effectNode.wet?.value || 'N/A'
    });
  }

  private updateTremoloParams(effectNode: Tone.Tremolo, params: any): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ EffectManager: Aplicando ${paramName} ${params[paramName]} a tremolo`);
        
        // Mapear parámetros del store a parámetros del efecto
        if (paramName === 'tremoloFrequency') {
          this.safeUpdateParam(effectNode, 'frequency', params[paramName]);
        } else if (paramName === 'tremoloDepth') {
          this.safeUpdateParam(effectNode, 'depth', params[paramName]);
        } else if (paramName === 'wet') {
          this.safeUpdateParam(effectNode, 'wet', params[paramName]);
        } else if (paramName === 'tremoloSpread') {
          effectNode.spread = params[paramName];
        } else if (paramName === 'tremoloType') {
          effectNode.type = params[paramName];
        } else {
          console.warn(`⚠️ EffectManager: Parámetro ${paramName} no reconocido para Tremolo`);
        }
      }
    });
    console.log(`🎛️ EffectManager: Parámetros actuales del tremolo:`, {
      frequency: effectNode.frequency?.value || 'N/A',
      depth: effectNode.depth?.value || 'N/A',
      wet: effectNode.wet?.value || 'N/A',
      spread: effectNode.spread || 'N/A',
      type: effectNode.type || 'N/A'
    });
  }

  private updateVibratoParams(effectNode: Tone.Vibrato, params: any): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ EffectManager: Aplicando ${paramName} ${params[paramName]} a vibrato`);
        
        // Mapear parámetros del store a parámetros del efecto
        if (paramName === 'vibratoFrequency') {
          this.safeUpdateParam(effectNode, 'frequency', params[paramName]);
        } else if (paramName === 'vibratoDepth') {
          this.safeUpdateParam(effectNode, 'depth', params[paramName]);
        } else if (paramName === 'wet') {
          this.safeUpdateParam(effectNode, 'wet', params[paramName]);
        } else if (paramName === 'vibratoType') {
          effectNode.type = params[paramName];
        } else if (paramName === 'vibratoMaxDelay') {
          // maxDelay no es un parámetro que se pueda cambiar en tiempo real
          console.log(`ℹ️ EffectManager: maxDelay no se puede cambiar en tiempo real para Vibrato`);
        } else {
          console.warn(`⚠️ EffectManager: Parámetro ${paramName} no reconocido para Vibrato`);
        }
      }
    });
    console.log(`🎛️ EffectManager: Parámetros actuales del vibrato:`, {
      frequency: effectNode.frequency?.value || 'N/A',
      depth: effectNode.depth?.value || 'N/A',
      wet: effectNode.wet?.value || 'N/A',
      type: effectNode.type || 'N/A'
    });
  }

  private updateFeedbackDelayParams(effectNode: Tone.FeedbackDelay, params: any): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        console.log(`🎛️ EffectManager: Aplicando ${paramName} ${params[paramName]} a feedbackDelay`);
        if (paramName === 'feedback') {
          this.safeUpdateParam(effectNode, 'feedback', params[paramName]);
        } else if (paramName === 'delayTime') {
          this.safeUpdateParam(effectNode, 'delayTime', params[paramName]);
        } else {
          this.safeUpdateParam(effectNode, paramName, params[paramName]);
        }
      }
    });
    console.log(`🎛️ EffectManager: Parámetros actuales del feedbackDelay:`, {
      delayTime: effectNode.delayTime,
      feedback: effectNode.feedback
    });
  }

  /**
   * Fuerza la actualización de un efecto global reiniciando su oscilador de prueba
   */
  public refreshGlobalEffect(effectId: string): void {
    const effectData = this.globalEffects.get(effectId);
    if (!effectData) {
      console.warn(`⚠️ EffectManager: No se encontró efecto global con ID ${effectId} para refrescar`);
      return;
    }

    try {
      const { effectNode } = effectData;
      const testOsc = this.testOscillators.get(effectId);
      
      if (testOsc) {
        console.log(`🔄 EffectManager: Refrescando efecto ${effectId} (${effectNode.constructor.name})`);
        
        // Estrategias de refresco específicas según el tipo de efecto
        if (effectNode instanceof Tone.Phaser) {
          testOsc.frequency.rampTo(880, 0.1);
          setTimeout(() => testOsc.frequency.rampTo(440, 0.1), 150);
        } else if (effectNode instanceof Tone.AutoFilter) {
          testOsc.frequency.rampTo(660, 0.1);
          setTimeout(() => testOsc.frequency.rampTo(440, 0.1), 150);
        } else if (effectNode instanceof Tone.AutoWah) {
          testOsc.frequency.rampTo(110, 0.1);
          setTimeout(() => testOsc.frequency.rampTo(440, 0.1), 200);
        } else if (effectNode instanceof Tone.BitCrusher) {
          testOsc.frequency.rampTo(880, 0.1);
          setTimeout(() => testOsc.frequency.rampTo(440, 0.1), 100);
        } else if (effectNode instanceof Tone.Chebyshev) {
          testOsc.frequency.rampTo(660, 0.1);
          setTimeout(() => testOsc.frequency.rampTo(440, 0.1), 150);
        } else if (effectNode instanceof Tone.Chorus) {
          testOsc.frequency.rampTo(880, 0.1);
          setTimeout(() => testOsc.frequency.rampTo(440, 0.1), 100);
        } else if (effectNode instanceof Tone.FeedbackDelay) {
          testOsc.frequency.rampTo(330, 0.05);
          setTimeout(() => testOsc.frequency.rampTo(440, 0.05), 120);
        } else if (effectNode instanceof Tone.Freeverb) {
          testOsc.frequency.rampTo(550, 0.05);
          setTimeout(() => testOsc.frequency.rampTo(440, 0.05), 120);
        } else if (effectNode instanceof Tone.Distortion) {
          testOsc.frequency.rampTo(880, 0.05);
          setTimeout(() => testOsc.frequency.rampTo(440, 0.05), 120);
        } else if (effectNode instanceof Tone.FrequencyShifter) {
          testOsc.frequency.rampTo(330, 0.05);
          setTimeout(() => testOsc.frequency.rampTo(440, 0.05), 120);
        } else if (effectNode instanceof Tone.JCReverb) {
          testOsc.frequency.rampTo(520, 0.05);
          setTimeout(() => testOsc.frequency.rampTo(440, 0.05), 120);
        } else if (effectNode instanceof Tone.PingPongDelay) {
          testOsc.frequency.rampTo(330, 0.05);
          setTimeout(() => testOsc.frequency.rampTo(440, 0.05), 120);
        } else if (effectNode instanceof Tone.PitchShift) {
          testOsc.frequency.rampTo(880, 0.05);
          setTimeout(() => testOsc.frequency.rampTo(440, 0.05), 120);
        } else if (effectNode instanceof Tone.Reverb) {
          testOsc.frequency.rampTo(660, 0.1);
          setTimeout(() => testOsc.frequency.rampTo(330, 0.1), 200);
        } else if (effectNode instanceof Tone.StereoWidener) {
          testOsc.frequency.rampTo(1100, 0.05);
          setTimeout(() => testOsc.frequency.rampTo(550, 0.05), 100);
        } else if (effectNode instanceof Tone.Tremolo) {
          testOsc.frequency.rampTo(880, 0.1);
          setTimeout(() => testOsc.frequency.rampTo(440, 0.1), 200);
        } else if (effectNode instanceof Tone.Vibrato) {
          testOsc.frequency.rampTo(880, 0.1);
          setTimeout(() => testOsc.frequency.rampTo(440, 0.1), 200);
        } else {
          const currentFreq = testOsc.frequency.value;
          const newFreq = currentFreq === 440 ? 880 : 440;
          testOsc.frequency.rampTo(newFreq, 0.1);
          setTimeout(() => testOsc.frequency.rampTo(440, 0.1), 200);
        }
      }
    } catch (error) {
      console.error(`❌ EffectManager: Error al refrescar efecto global:`, error);
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
        
        // Limpiar el oscilador de prueba si existe
        const testOsc = this.testOscillators.get(effectId);
        if (testOsc) {
          try {
            testOsc.stop();
            testOsc.dispose();
            this.testOscillators.delete(effectId);
            console.log(`🎛️ EffectManager: Oscilador de prueba eliminado para efecto ${effectId}`);
          } catch (oscError) {
            console.error(`❌ EffectManager: Error al limpiar oscilador de prueba:`, oscError);
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
        this.effectZoneRadii.delete(effectId);
        this.lastEffectIntensities.delete(effectId);
        
        console.log(`🎛️ EffectManager: Efecto ${effectId} eliminado completamente`);
      } catch (error) {
        console.error(`❌ EffectManager: Error al eliminar efecto:`, error);
      }
    }
  }

  /**
   * Fuerza la actualización de todos los efectos globales activos
   */
  public refreshAllGlobalEffects(): void {
    console.log(`🔄 EffectManager: Refrescando todos los efectos globales activos`);
    
    this.globalEffects.forEach((effectData, effectId) => {
      try {
        this.refreshGlobalEffect(effectId);
      } catch (error) {
        console.error(`❌ EffectManager: Error al refrescar efecto ${effectId}:`, error);
      }
    });
  }

  /**
   * Fuerza la actualización de un efecto específico con estrategias optimizadas
   */
  public forceEffectUpdate(effectId: string, paramName: string, newValue: any): void {
    const effectData = this.globalEffects.get(effectId);
    if (!effectData) {
      console.warn(`⚠️ EffectManager: No se encontró efecto global con ID ${effectId} para forzar actualización`);
      return;
    }

    try {
      const { effectNode } = effectData;
      console.log(`🔄 EffectManager: Forzando actualización del parámetro ${paramName} = ${newValue} en ${effectNode.constructor.name}`);
      
      // Estrategias específicas para parámetros críticos
      if (effectNode instanceof Tone.BitCrusher && paramName === 'bits') {
        console.log(`ℹ️ EffectManager: Los bits del BitCrusher requieren recreación del efecto`);
        this.refreshGlobalEffect(effectId);
      } else if (effectNode instanceof Tone.Chebyshev && paramName === 'order') {
        console.log(`✅ EffectManager: Orden de Chebyshev actualizado en tiempo real`);
        this.refreshGlobalEffect(effectId);
      } else {
        this.refreshGlobalEffect(effectId);
      }
      
    } catch (error) {
      console.error(`❌ EffectManager: Error al forzar actualización del efecto:`, error);
    }
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
          console.log(`ℹ️ EffectManager: Path ${paramPath} no válido en ${effectNode.constructor.name}`);
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
          console.log(`ℹ️ EffectManager: Parámetro ${paramPath} no es configurable en tiempo real`);
          return false;
        }
      } else {
        console.log(`ℹ️ EffectManager: Parámetro ${paramPath} no encontrado`);
        return false;
      }
    } catch (error) {
      console.log(`ℹ️ EffectManager: Error al actualizar ${paramPath}:`, error);
      return false;
    }
  }

  /**
   * Configura el radio de una zona de efectos
   */
  public setEffectZoneRadius(effectId: string, radius: number): void {
    this.effectZoneRadii.set(effectId, radius);
    console.log(`🎛️ EffectManager: Radio de zona de efecto ${effectId} configurado a ${radius} unidades`);
  }

  /**
   * Obtiene el radio de una zona de efectos
   */
  public getEffectZoneRadius(effectId: string): number {
    const radius = this.effectZoneRadii.get(effectId) || 2.0;
    console.log(`📏 EffectManager: Radio para zona de efecto ${effectId}: ${radius} unidades`);
    return radius;
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
      console.log(`📍 EffectManager: Actualizando posición de zona de efecto ${id} a [${position.join(', ')}]`);
      
      // Actualizar la posición del panner del efecto
      effectData.panner.setPosition(position[0], position[1], position[2]);
      
      // Actualizar la posición almacenada en el efecto
      effectData.position = position;
      
      console.log(`✅ EffectManager: Posición de zona de efecto ${id} actualizada`);
    } catch (error) {
      console.error(`❌ EffectManager: Error al actualizar posición de zona de efecto:`, error);
    }
  }

  /**
   * Obtiene todos los efectos globales
   */
  public getAllGlobalEffects(): Map<string, GlobalEffect> {
    return this.globalEffects;
  }

  /**
   * Limpia todos los recursos del EffectManager
   */
  public cleanup(): void {
    try {
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
      
      // Limpiar todos los efectos globales
      this.globalEffects.forEach((effectData, effectId) => {
        try {
          this.removeGlobalEffect(effectId);
        } catch (error) {
          // Manejo silencioso de errores
        }
      });
      
      // Limpiar Maps
      this.effectZoneRadii.clear();
      this.lastEffectIntensities.clear();
      
      console.log(`🧹 EffectManager: Limpieza completada`);
    } catch (error) {
      console.error(`❌ EffectManager: Error durante la limpieza:`, error);
    }
  }
}
