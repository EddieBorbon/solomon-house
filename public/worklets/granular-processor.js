/**
 * Granular Processor — La Casa de Salomón (roadmap 2.2 y 2.6).
 *
 * AudioWorkletProcessor de síntesis granular que corre en el hilo de audio
 * dedicado, fuera del hilo principal del navegador: la generación de granos
 * no compite con el render 3D ni con React.
 *
 * Espacialización por grano (roadmap 2.6): el processor expone VARIAS
 * salidas mono y asigna cada grano a una salida aleatoria. El hilo
 * principal conecta cada salida a su propio PannerNode 3D colocado en un
 * sub-rango tridimensional alrededor del objeto visual, de modo que la
 * nube de granos envuelve espacialmente al oyente.
 *
 * Protocolo de mensajes (port):
 *   { type: 'buffer', channelData: Float32Array, sampleRate }  carga el sample
 *   { type: 'start' } / { type: 'stop' }
 *
 * AudioParams (k-rate):
 *   grainSize  segundos de cada grano               [0.01 .. 0.5]
 *   density    granos por segundo                   [1 .. 100]
 *   playbackRate  transposición                     [0.25 .. 4]
 *   position   posición normalizada de lectura      [0 .. 1]
 *   spray      jitter aleatorio de lectura (0..1 del buffer)
 */

const MAX_GRAINS = 64;

class GranularProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'grainSize', defaultValue: 0.09, minValue: 0.01, maxValue: 0.5 },
      { name: 'density', defaultValue: 20, minValue: 1, maxValue: 100 },
      { name: 'playbackRate', defaultValue: 1, minValue: 0.25, maxValue: 4 },
      { name: 'position', defaultValue: 0.5, minValue: 0, maxValue: 1 },
      { name: 'spray', defaultValue: 0.05, minValue: 0, maxValue: 1 },
      { name: 'gain', defaultValue: 0.8, minValue: 0, maxValue: 1 },
    ];
  }

  constructor() {
    super();
    this.buffer = null; // Float32Array mono
    this.bufferSampleRate = sampleRate;
    this.running = false;
    this.grains = []; // { readIndex, step, length, age, output }
    this.samplesUntilNextGrain = 0;

    this.port.onmessage = (event) => {
      const message = event.data;
      if (message.type === 'buffer') {
        this.buffer = message.channelData;
        this.bufferSampleRate = message.sampleRate || sampleRate;
      } else if (message.type === 'start') {
        this.running = true;
      } else if (message.type === 'stop') {
        this.running = false;
        this.grains = [];
      }
    };
  }

  spawnGrain(parameters, outputCount) {
    if (this.grains.length >= MAX_GRAINS || !this.buffer) return;

    const grainSize = parameters.grainSize[0];
    const playbackRate = parameters.playbackRate[0];
    const positionParam = parameters.position[0];
    const spray = parameters.spray[0];

    const lengthSamples = Math.max(16, Math.floor(grainSize * sampleRate));
    const sprayOffset = (Math.random() * 2 - 1) * spray * this.buffer.length;
    let start = positionParam * this.buffer.length + sprayOffset;
    start = Math.max(0, Math.min(this.buffer.length - 2, start));

    this.grains.push({
      readIndex: start,
      step: (this.bufferSampleRate / sampleRate) * playbackRate,
      length: lengthSamples,
      age: 0,
      // Asignación espacial: cada grano vive en una de las salidas,
      // que el hilo principal posiciona en 3D alrededor del objeto.
      output: Math.floor(Math.random() * outputCount),
    });
  }

  process(_inputs, outputs, parameters) {
    const blockSize = outputs[0][0].length;
    const outputCount = outputs.length;

    // Silenciar todas las salidas antes de acumular granos
    for (let o = 0; o < outputCount; o++) {
      outputs[o][0].fill(0);
    }

    if (!this.running || !this.buffer) {
      return true;
    }

    const density = parameters.density[0];
    const gain = parameters.gain[0];
    const samplesPerGrain = sampleRate / Math.max(0.1, density);

    for (let i = 0; i < blockSize; i++) {
      // Programar granos nuevos según la densidad
      this.samplesUntilNextGrain -= 1;
      if (this.samplesUntilNextGrain <= 0) {
        this.spawnGrain(parameters, outputCount);
        // Jitter temporal del 30% para evitar trenes periódicos audibles
        this.samplesUntilNextGrain = samplesPerGrain * (0.85 + Math.random() * 0.3);
      }

      // Renderizar granos vivos
      for (let g = this.grains.length - 1; g >= 0; g--) {
        const grain = this.grains[g];

        // Envolvente Hann sobre la vida del grano
        const phase = grain.age / grain.length;
        const window = 0.5 * (1 - Math.cos(2 * Math.PI * phase));

        const index = Math.floor(grain.readIndex);
        if (index >= 0 && index < this.buffer.length - 1) {
          // Interpolación lineal de lectura
          const frac = grain.readIndex - index;
          const sample =
            this.buffer[index] * (1 - frac) + this.buffer[index + 1] * frac;
          outputs[grain.output][0][i] += sample * window * gain;
        }

        grain.readIndex += grain.step;
        grain.age += 1;
        if (grain.age >= grain.length || grain.readIndex >= this.buffer.length - 1) {
          this.grains.splice(g, 1);
        }
      }
    }

    return true;
  }
}

registerProcessor('granular-processor', GranularProcessor);
