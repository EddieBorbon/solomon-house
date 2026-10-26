# Motor de Audio Nativo (Web Audio API) — roadmap 2.1

Migración gradual del motor de síntesis de Tone.js a nodos puros de la
Web Audio API, motivada por la observación del Dr. Hugo Solís García sobre
las limitaciones de Tone.js. La estrategia es de **coexistencia**: ambos
motores comparten el mismo `AudioContext` de baja latencia (2.8) y conviven
hasta completar la transición, de modo que nunca se rompe el audio.

## Conmutación

El motor nativo es **el predeterminado** desde la migración completa
(2026-06-13). Se elige por variable de entorno en tiempo de construcción:

```bash
# Motor nativo (predeterminado) — los 10 tipos de objeto
npm run dev

# Escape al motor Tone.js heredado
NEXT_PUBLIC_AUDIO_ENGINE=tone npm run dev

# Motor experimental Csound WASM (solo cubo, ver ../csound)
NEXT_PUBLIC_AUDIO_ENGINE=csound npm run dev
```

Los 10 tipos de objeto sonoro tienen modelo de síntesis nativo
(`NATIVE_MODEL_BY_TYPE` en `AudioManager.ts`). Las zonas de efectos siguen
en Tone.js: las voces nativas les envían señal (sends post-filtro, 2.1.d),
así que el sistema de efectos completo se conserva.

### Modelos de síntesis por tipo

| Objeto | Modelo nativo | Sustituye a |
|--------|---------------|-------------|
| cubo | `am` | AMSynth |
| esfera | `fm` | FMSynth |
| cilindro | `duo` | DuoSynth (2 osc desafinados) |
| cono | `membrane` | MembraneSynth (caída de tono) |
| pirámide | `mono` | MonoSynth (osc + filtro) |
| icosaedro | `metal` | MetalSynth (parciales inarmónicos) |
| plano | `noise` | NoiseSynth (ruido en bucle) |
| toro | `pluck` | PluckSynth (cuerda, aprox.) |
| anillo | `poly` | PolySynth (acorde mayor 7ª) |
| espiral | `sampler` | Sampler (AudioBufferSource) |

> Fidelidad: `pluck` es una aproximación (triángulo + decaimiento, no
> Karplus-Strong completo) y `sampler` re-pitchea por `playbackRate`
> respecto a C4. Los 10 modelos verificados sin errores en navegador; el
> ajuste fino de timbre frente a los synth de Tone es trabajo futuro.

## Arquitectura

| Tone.js                 | Nativo (`NativeVoice`)                          |
|-------------------------|-------------------------------------------------|
| `Synth.oscillator`      | `OscillatorNode` (type, frequency, detune)      |
| `Synth.envelope`        | `GainNode` + automatización ADSR                |
| `AMSynth`               | portador × (modulador → `GainNode.gain`)        |
| filtro de `MonoSynth`   | `BiquadFilterNode` (lowpass)                    |
| `Panner3D` (HRTF)       | `PannerNode` (panningModel 'HRTF')              |
| `Gain` (dry/sends)      | `GainNode`                                       |
| `Destination`           | `masterGain → AudioContext.destination`         |

Cadena por voz:

```
OscillatorNode ──┐ (modulador AM opcional, a tasa de audio)
                 ▼
GainNode (ADSR) ─► BiquadFilterNode ─┬─► PannerNode(HRTF) ─► dryGain ─► master
                                     └─► GainNode(send) ─► efecto global
```

- `NativeAudioGraph` — contexto compartido, bus maestro y factoría de panners.
- `NativeVoice` — voz completa: ADSR, AM, filtro, HRTF, sends a efectos,
  robo de voces (`getStartTime`) y liberación explícita (2.5).
- `engineBenchmark` — validación A/B (2.1.e).

## Validación A/B (2.1.e)

El monitor de latencia (esquina inferior izquierda) es clicable: muestra el
motor activo y ejecuta `runEngineComparison()`, que mide en el navegador:

- **latencia de hardware** del contexto compartido (base/salida),
- **coste de construcción** de un lote de 24 voces en cada motor (proxy del
  trabajo del hilo principal al poblar una sala densa),
- **nodos por voz** (huella de grafo: ~8 nativos vs ~14 de un AMSynth).

La metodología corre Tone primero y nativo después para no favorecer a
ninguno por calentamiento de caché, y crea las voces en silencio
(volumen 0) liberándolas al terminar, sin interferir con la sesión.

## Estado

- [x] 2.1.a Cimientos · [x] 2.1.b Voz nativa · [x] 2.1.c Integración opt-in
- [x] 2.1.d Paridad de mezcla (sends + VoiceAllocator) · [x] 2.1.e Validación A/B

## Próximos pasos

1. Ajuste fino de timbre por modelo frente a los synth de Tone (validación
   con el oído del compositor): `pluck` con Karplus-Strong real, `metal`
   con más parciales, envolventes ADSR por modelo.
2. Migrar también las zonas de efectos a nodos nativos (`BiquadFilter`,
   `ConvolverNode`, `DelayNode`, `WaveShaperNode`…) para eliminar Tone por
   completo; hoy los efectos siguen en Tone y reciben sends nativos.
3. Considerar AudioWorklets (2.2, ya iniciado con el motor granular) para
   la síntesis más costosa.
