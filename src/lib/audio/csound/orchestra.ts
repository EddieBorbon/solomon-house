/**
 * Orquesta Csound (roadmap 2.3.a).
 *
 * Encapsula un motor de síntesis maduro (FM de 2 operadores con envolvente
 * y filtro pasa-bajos) como instrumento de Csound, controlado en tiempo
 * real desde las posiciones 3D del entorno vía canales de control con
 * nombre por voz (`chnget`).
 *
 * Cada objeto sonoro recibe un *slot* entero y se instancia como
 * `i 1.<slot>` (instancia perpetua, p3 = -1). El instrumento deriva su slot
 * de la parte fraccionaria de p1 y lee sus canales `freq_<slot>`,
 * `amp_<slot>`, `cutoff_<slot>` y la posición `x/y/z_<slot>`, de modo que
 * cada voz es independiente pese a compartir la definición.
 *
 * La espacialización fina la sigue aplicando el grafo nativo (PannerNode
 * HRTF) sobre la salida de Csound; aquí la posición modula además el
 * paneo estéreo interno y el brillo, para coherencia audible.
 */

export const SOLOMON_ORCHESTRA = `
sr = 48000
ksmps = 64
nchnls = 2
0dbfs = 1

; Instrumento 1: FM espacial controlado por canales con nombre por voz.
; p1 fraccional = slot de voz (i 1.005 -> slot 5).
instr 1
  islot = round(frac(p1) * 1000)
  Sfreq   sprintf "freq_%d", islot
  Samp    sprintf "amp_%d", islot
  Scut    sprintf "cutoff_%d", islot
  Sharm   sprintf "harm_%d", islot
  Sx      sprintf "x_%d", islot
  Sy      sprintf "y_%d", islot
  Sgate   sprintf "gate_%d", islot

  kfreq   chnget Sfreq
  kamp    chnget Samp
  kcut    chnget Scut
  kharm   chnget Sharm
  kx      chnget Sx
  ky      chnget Sy
  kgate   chnget Sgate

  kfreq   limit kfreq, 20, 12000
  kharm   limit kharm, 0.25, 12
  kcut    limit kcut, 100, 18000

  ; Envolvente de amplitud gobernada por el canal gate (1 = sostener)
  kenv    portk kgate * kamp, 0.05

  ; FM de 2 operadores: portadora kfreq, moduladora kfreq*kharm
  amod    oscili kfreq * 2, kfreq * kharm
  acar    oscili kenv, kfreq + amod

  ; Filtro pasa-bajos (la altura Y abre el brillo, coherencia visual-sonora)
  kbright limit kcut + ky * 400, 100, 18000
  aflt    moogladder acar, kbright, 0.2

  ; Paneo estéreo por la posición X (refuerza el HRTF externo)
  kpan    = (kx + 10) / 20
  kpan    limit kpan, 0, 1
  aL, aR  pan2 aflt, kpan
  outs aL, aR
endin
`;

/** Construye el nombre de canal de un parámetro para un slot dado. */
export function channelName(param: string, slot: number): string {
  return `${param}_${slot}`;
}
