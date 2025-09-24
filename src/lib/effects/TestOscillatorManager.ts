import * as Tone from 'tone';
import { EffectNode, TestOscillatorConfig } from './types';

export class TestOscillatorManager {
  private testOscillators: Map<string, Tone.Oscillator> = new Map();

  /**
   * Crea un oscilador de prueba para escuchar los efectos
   */
  public createTestOscillatorForEffect(
    effectId: string, 
    effectNode: EffectNode, 
    config: TestOscillatorConfig
  ): void {
    try {
      console.log(`🎛️ TestOscillatorManager: Creando oscilador de prueba para ${effectId}`);
      
      // Crear un oscilador de prueba optimizado para el tipo de efecto
      const testOsc = new Tone.Oscillator({
        frequency: config.frequency,
        type: config.type,
        volume: config.volume,
      });
      
      // Conectar el oscilador directamente al efecto
      testOsc.connect(effectNode);
      
      // Iniciar el oscilador
      testOsc.start();
      
      console.log(`🎛️ TestOscillatorManager: Oscilador de prueba creado para ${effectNode.constructor.name} (${effectId}) - Frecuencia: ${config.frequency}Hz, Tipo: ${config.type}, Volumen: ${config.volume}dB`);
      
      // Almacenar el oscilador para poder limpiarlo después
      this.testOscillators.set(effectId, testOsc);
      
    } catch (error) {
      console.error(`❌ TestOscillatorManager: Error al crear oscilador de prueba:`, error);
    }
  }

  /**
   * Detiene y elimina un oscilador de prueba
   */
  public removeTestOscillator(effectId: string): void {
    const testOsc = this.testOscillators.get(effectId);
    if (testOsc) {
      try {
        testOsc.stop();
        testOsc.disconnect();
        this.testOscillators.delete(effectId);
        console.log(`🎛️ TestOscillatorManager: Oscilador de prueba ${effectId} eliminado`);
      } catch (error) {
        console.error(`❌ TestOscillatorManager: Error al eliminar oscilador de prueba:`, error);
      }
    }
  }

  /**
   * Obtiene un oscilador de prueba por ID
   */
  public getTestOscillator(effectId: string): Tone.Oscillator | undefined {
    return this.testOscillators.get(effectId);
  }

  /**
   * Obtiene todos los osciladores de prueba
   */
  public getAllTestOscillators(): Map<string, Tone.Oscillator> {
    return this.testOscillators;
  }

  /**
   * Detiene todos los osciladores de prueba
   */
  public stopAllTestOscillators(): void {
    this.testOscillators.forEach((testOsc, effectId) => {
      try {
        testOsc.stop();
        console.log(`🎛️ TestOscillatorManager: Oscilador de prueba ${effectId} detenido`);
      } catch (error) {
        console.error(`❌ TestOscillatorManager: Error al detener oscilador ${effectId}:`, error);
      }
    });
  }

  /**
   * Limpia todos los osciladores de prueba
   */
  public clearAllTestOscillators(): void {
    this.testOscillators.forEach((testOsc, effectId) => {
      this.removeTestOscillator(effectId);
    });
    console.log(`🎛️ TestOscillatorManager: Todos los osciladores de prueba eliminados`);
  }

  /**
   * Actualiza la frecuencia de un oscilador de prueba
   */
  public updateTestOscillatorFrequency(effectId: string, frequency: number): void {
    const testOsc = this.testOscillators.get(effectId);
    if (testOsc) {
      try {
        testOsc.frequency.value = frequency;
        console.log(`🎛️ TestOscillatorManager: Frecuencia del oscilador ${effectId} actualizada a ${frequency}Hz`);
      } catch (error) {
        console.error(`❌ TestOscillatorManager: Error al actualizar frecuencia:`, error);
      }
    }
  }

  /**
   * Actualiza el volumen de un oscilador de prueba
   */
  public updateTestOscillatorVolume(effectId: string, volume: number): void {
    const testOsc = this.testOscillators.get(effectId);
    if (testOsc) {
      try {
        testOsc.volume.value = volume;
        console.log(`🎛️ TestOscillatorManager: Volumen del oscilador ${effectId} actualizado a ${volume}dB`);
      } catch (error) {
        console.error(`❌ TestOscillatorManager: Error al actualizar volumen:`, error);
      }
    }
  }

  /**
   * Actualiza el tipo de onda de un oscilador de prueba
   */
  public updateTestOscillatorType(effectId: string, type: OscillatorType): void {
    const testOsc = this.testOscillators.get(effectId);
    if (testOsc) {
      try {
        testOsc.type = type;
        console.log(`🎛️ TestOscillatorManager: Tipo de onda del oscilador ${effectId} actualizado a ${type}`);
      } catch (error) {
        console.error(`❌ TestOscillatorManager: Error al actualizar tipo de onda:`, error);
      }
    }
  }

  /**
   * Obtiene información de un oscilador de prueba
   */
  public getTestOscillatorInfo(effectId: string): {
    frequency: number;
    volume: number;
    type: OscillatorType;
    isPlaying: boolean;
  } | null {
    const testOsc = this.testOscillators.get(effectId);
    if (!testOsc) {
      return null;
    }

    return {
      frequency: testOsc.frequency.value,
      volume: testOsc.volume.value,
      type: testOsc.type,
      isPlaying: testOsc.state === 'started'
    };
  }

  /**
   * Obtiene estadísticas de todos los osciladores de prueba
   */
  public getTestOscillatorStats(): {
    totalOscillators: number;
    playingOscillators: number;
    stoppedOscillators: number;
  } {
    let playingCount = 0;
    let stoppedCount = 0;

    this.testOscillators.forEach(testOsc => {
      if (testOsc.state === 'started') {
        playingCount++;
      } else {
        stoppedCount++;
      }
    });

    return {
      totalOscillators: this.testOscillators.size,
      playingOscillators: playingCount,
      stoppedOscillators: stoppedCount
    };
  }
}
