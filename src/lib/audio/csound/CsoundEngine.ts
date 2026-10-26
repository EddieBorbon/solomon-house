import { SOLOMON_ORCHESTRA, channelName } from './orchestra';

/**
 * Motor de síntesis Csound WebAssembly (roadmap 2.3.b).
 *
 * Cargador de Csound WASM (`@csound/browser`) que compila la orquesta de
 * la plataforma (2.3.a) y expone una API por voz: cada objeto sonoro
 * recibe un slot y se controla por canales con nombre (`setControlChannel`)
 * vinculados a su frecuencia y posición 3D.
 *
 * Csound gestiona su propio `AudioContext` nativo y se autoconecta a la
 * salida del dispositivo. No comparte el contexto de Tone porque Tone v15
 * usa `standardized-audio-context` (un envoltorio que no es un
 * `BaseAudioContext` nativo, requisito del AudioWorkletNode de Csound); la
 * coexistencia ocurre a nivel del dispositivo de salida, no del grafo. La
 * espacialización va embebida en la orquesta (pan2 + brillo por posición).
 *
 * Carga perezosa y opt-in: el módulo de ~6 MB solo se importa cuando se
 * solicita la primera voz Csound (`NEXT_PUBLIC_AUDIO_ENGINE=csound`), de
 * modo que el bundle y el runtime por defecto quedan intactos.
 */

// Tipado mínimo del objeto Csound que usamos (el paquete es beta).
interface CsoundObj {
  setOption: (option: string) => Promise<number>;
  compileOrc: (orc: string) => Promise<number>;
  readScore: (score: string) => Promise<undefined>;
  setControlChannel: (name: string, value: number) => Promise<undefined>;
  getAudioContext: () => Promise<AudioContext | OfflineAudioContext | undefined>;
  start: () => Promise<number>;
  stop: () => Promise<undefined>;
  destroy: () => Promise<undefined>;
}

export class CsoundEngine {
  private static instance: CsoundEngine | null = null;
  private csound: CsoundObj | null = null;
  private loadingPromise: Promise<boolean> | null = null;
  private slots = new Map<string, number>();
  private freeSlots: number[] = [];
  private nextSlot = 1;

  public static getInstance(): CsoundEngine {
    if (!CsoundEngine.instance) {
      CsoundEngine.instance = new CsoundEngine();
    }
    return CsoundEngine.instance;
  }

  public isReady(): boolean {
    return this.csound !== null;
  }

  /**
   * Inicializa Csound una sola vez: importa el módulo, comparte el contexto
   * de Tone, compila la orquesta y conecta la salida al master nativo.
   */
  public async init(): Promise<boolean> {
    if (this.csound) return true;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = (async () => {
      try {
        const { Csound } = await import('@csound/browser');

        // Csound crea y gestiona su propio AudioContext nativo (autoConnect
        // a la salida); ver nota de la cabecera sobre standardized-audio-context.
        const csound = (await Csound({
          autoConnect: true,
        })) as unknown as CsoundObj | undefined;

        if (!csound) {
          console.error('❌ Csound: la fábrica devolvió undefined');
          return false;
        }

        await csound.setOption('-odac');
        await csound.setOption('-d'); // sin ventana de mensajes
        await csound.compileOrc(SOLOMON_ORCHESTRA);
        await csound.start();

        // Asegurar que el contexto propio de Csound está corriendo
        const ctx = await csound.getAudioContext();
        if (ctx && ctx.state === 'suspended' && 'resume' in ctx) {
          await (ctx as AudioContext).resume();
        }

        this.csound = csound;
        console.log('🎛️ Csound WASM: motor listo, orquesta compilada');
        return true;
      } catch (error) {
        console.error('❌ Csound: error inicializando', error);
        return false;
      }
    })();

    return this.loadingPromise;
  }

  private acquireSlot(id: string): number {
    let slot = this.slots.get(id);
    if (slot !== undefined) return slot;
    slot = this.freeSlots.pop() ?? this.nextSlot++;
    this.slots.set(id, slot);
    return slot;
  }

  private releaseSlot(id: string): number | undefined {
    const slot = this.slots.get(id);
    if (slot !== undefined) {
      this.slots.delete(id);
      this.freeSlots.push(slot);
    }
    return slot;
  }

  /** Fija un canal de control de una voz (no-op si Csound no está listo). */
  private async setChannel(param: string, slot: number, value: number): Promise<void> {
    if (!this.csound) return;
    try {
      await this.csound.setControlChannel(channelName(param, slot), value);
    } catch {
      // Csound en proceso de carga o destruido
    }
  }

  /**
   * Crea (o reusa) una voz Csound para un objeto: fija sus canales iniciales
   * e instancia el instrumento perpetuo `i 1.<slot>`.
   */
  public async createVoice(
    id: string,
    params: { frequency: number; volume: number; harmonicity?: number; cutoff?: number },
    position: [number, number, number]
  ): Promise<void> {
    if (!(await this.init())) return;
    const slot = this.acquireSlot(id);

    await this.setChannel('freq', slot, params.frequency || 440);
    await this.setChannel('amp', slot, params.volume ?? 0.5);
    await this.setChannel('harm', slot, params.harmonicity ?? 1.5);
    await this.setChannel('cutoff', slot, params.cutoff ?? 8000);
    await this.setChannel('x', slot, position[0]);
    await this.setChannel('y', slot, position[1]);
    await this.setChannel('gate', slot, 0);

    // Instancia perpetua (p3 = -1) con p1 fraccional = slot
    const p1 = 1 + slot / 1000;
    try {
      await this.csound!.readScore(`i ${p1.toFixed(3)} 0 -1`);
    } catch {
      // Instancia ya activa
    }
  }

  public async start(id: string): Promise<void> {
    const slot = this.slots.get(id);
    if (slot === undefined) return;
    await this.setChannel('gate', slot, 1);
  }

  public async stop(id: string): Promise<void> {
    const slot = this.slots.get(id);
    if (slot === undefined) return;
    await this.setChannel('gate', slot, 0);
  }

  public async updateParams(
    id: string,
    params: { frequency?: number; volume?: number; harmonicity?: number; cutoff?: number }
  ): Promise<void> {
    const slot = this.slots.get(id);
    if (slot === undefined) return;
    if (params.frequency !== undefined) await this.setChannel('freq', slot, params.frequency);
    if (params.volume !== undefined) await this.setChannel('amp', slot, params.volume);
    if (params.harmonicity !== undefined) await this.setChannel('harm', slot, params.harmonicity);
    if (params.cutoff !== undefined) await this.setChannel('cutoff', slot, params.cutoff);
  }

  public async setPosition(id: string, position: [number, number, number]): Promise<void> {
    const slot = this.slots.get(id);
    if (slot === undefined) return;
    await this.setChannel('x', slot, position[0]);
    await this.setChannel('y', slot, position[1]);
  }

  /** Silencia y libera el slot de una voz (la instancia perpetua queda muda). */
  public async removeVoice(id: string): Promise<void> {
    const slot = this.releaseSlot(id);
    if (slot === undefined || !this.csound) return;
    await this.setChannel('gate', slot, 0);
    try {
      // Detener la instancia perpetua de ese slot
      await this.csound.readScore(`i -${(1 + slot / 1000).toFixed(3)} 0 0`);
    } catch {
      // Instancia ya detenida
    }
  }

  public hasVoice(id: string): boolean {
    return this.slots.has(id);
  }
}

export const csoundEngine = CsoundEngine.getInstance();
