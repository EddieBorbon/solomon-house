/**
 * Despachador Dinámico de Voces (roadmap 2.4).
 *
 * Limita activamente el número de voces sonando de forma simultánea según
 * la capacidad de cómputo del dispositivo del cliente. Cuando se solicita
 * una voz nueva y el presupuesto está agotado, se aplica robo de voces
 * (Voice Stealing): se libera la voz activa más antigua para ceder su
 * lugar, evitando la saturación del hilo de audio (glitches, dropouts).
 */

export interface VoiceAllocatorConfig {
  /** Límite máximo absoluto de voces simultáneas. */
  maxVoices: number;
}

/** Voz activa candidata al robo. */
export interface ActiveVoice {
  id: string;
  startTime: number;
}

/**
 * Estima el presupuesto de voces según el hardware del cliente.
 * Heurística: ~6 voces por núcleo lógico, acotado a [8, 48].
 * En servidores (SSR) devuelve el mínimo.
 */
export function estimateVoiceBudget(): number {
  if (typeof navigator === 'undefined') return 8;
  const cores = navigator.hardwareConcurrency || 4;
  return Math.max(8, Math.min(48, cores * 6));
}

export class VoiceAllocator {
  private config: VoiceAllocatorConfig;
  private stolenCount = 0;

  constructor(config?: Partial<VoiceAllocatorConfig>) {
    this.config = {
      maxVoices: config?.maxVoices ?? estimateVoiceBudget(),
    };
  }

  /**
   * Decide qué voces deben robarse para admitir una voz nueva.
   * Devuelve los IDs a liberar (las más antiguas primero); el llamador es
   * responsable de detenerlas antes de iniciar la nueva voz.
   */
  public requestVoice(activeVoices: ActiveVoice[]): string[] {
    if (activeVoices.length < this.config.maxVoices) {
      return [];
    }

    const surplus = activeVoices.length - this.config.maxVoices + 1;
    const oldestFirst = [...activeVoices].sort((a, b) => a.startTime - b.startTime);
    const toSteal = oldestFirst.slice(0, surplus).map((voice) => voice.id);

    this.stolenCount += toSteal.length;
    return toSteal;
  }

  public updateConfig(config: Partial<VoiceAllocatorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): VoiceAllocatorConfig {
    return { ...this.config };
  }

  public getDebugInfo(): { maxVoices: number; stolenCount: number } {
    return { maxVoices: this.config.maxVoices, stolenCount: this.stolenCount };
  }
}
