# Motor Csound WebAssembly — roadmap 2.3

Integración de Csound (motor de síntesis maduro) compilado a WebAssembly
vía `@csound/browser`, en respuesta a la sugerencia del Dr. Hugo Solís
García. Tercer motor opt-in junto a Tone.js y el motor nativo (2.1).

## Conmutación

```bash
NEXT_PUBLIC_AUDIO_ENGINE=csound npm run dev
```

Hoy los tipos en `CSOUND_ENGINE_TYPES` (solo `cube`) se sintetizan con la
orquesta de Csound; el resto sigue en Tone. Sin la bandera, Csound nunca
se importa (carga perezosa de ~6 MB) — bundle y runtime por defecto intactos.

## Componentes

- **`orchestra.ts`** — la orquesta `.orc` de la plataforma: un instrumento
  FM de 2 operadores con filtro Moog (`moogladder`) y paneo estéreo.
  Cada voz lee canales de control con nombre por *slot* (`freq_<n>`,
  `amp_<n>`, `cutoff_<n>`, `harm_<n>`, `x_<n>`, `y_<n>`, `gate_<n>`), de modo
  que múltiples instancias del mismo instrumento son independientes.
- **`CsoundEngine.ts`** — cargador singleton: importa Csound dinámicamente,
  compila la orquesta, asigna un slot por objeto, instancia el instrumento
  perpetuo `i 1.<slot>` y traduce frecuencia/posición a `setControlChannel`.

## Canales de control ↔ entorno 3D

| Canal        | Origen                          |
|--------------|---------------------------------|
| `freq_<n>`   | frecuencia del objeto sonoro    |
| `amp_<n>`    | volumen                         |
| `harm_<n>`   | armonicidad (relación FM)       |
| `cutoff_<n>` | corte del filtro                |
| `x_<n>`      | posición X → paneo estéreo      |
| `y_<n>`      | posición Y (altura) → brillo    |
| `gate_<n>`   | 1 = sostener, 0 = silenciar     |

## Nota de contexto de audio

Csound gestiona su **propio `AudioContext` nativo** y se autoconecta a la
salida del dispositivo. No comparte el contexto de Tone porque Tone v15 usa
`standardized-audio-context`, un envoltorio que no es un `BaseAudioContext`
nativo y rompe la construcción del `AudioWorkletNode` de Csound
(`TypeError: parameter 1 is not of type 'BaseAudioContext'`). La
coexistencia ocurre a nivel del dispositivo de salida; por eso la
espacialización va embebida en la orquesta (`pan2` + brillo por altura) en
lugar de delegarse al PannerNode HRTF compartido. La síntesis monohilo
(`useWorker:false`) evita el requisito de cabeceras COOP/COEP.

## Estado y próximos pasos

- [x] 2.3.a Orquesta · [x] 2.3.b Loader · [x] 2.3.c Integración opt-in
- [x] Verificado en navegador (Csound 7.0 carga, compila y crea voces)

Siguiente: ampliar `CSOUND_ENGINE_TYPES`, añadir instrumentos de la orquesta
para otros tipos de objeto, y exponer un puente de espacialización si en el
futuro Tone migra fuera de standardized-audio-context (permitiría compartir
contexto y enrutar Csound por el HRTF/efectos comunes).
