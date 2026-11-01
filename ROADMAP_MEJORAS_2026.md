# Roadmap de mejoras — La Casa de Salomón (nov 2026)

Complementa a [ROADMAP_DESARROLLO_FUTURO.md](ROADMAP_DESARROLLO_FUTURO.md). Aquel mide **features** (92 %); este mide **calidad, seguridad y mantenibilidad**, que es donde está la deuda real.

## Diagnóstico (2026-11-01)

**Bien:** `tsc --noEmit` 0 errores · ESLint 0 avisos · stack moderno (Next 15.5, React 19, R3F 9, Tone 15) · AGPL · docs técnicas extensas.

| # | Problema | Dónde |
|---|---|---|
| 1 | Contraseña de admin hardcodeada en el bundle del cliente, presente en el historial git desde `da9d19b` | `src/state/useAdminAuthStore.ts` |
| 2 | `GET /api/generate-sculptures` escribe en Firestore sin autenticación | `src/app/api/generate-sculptures/route.ts` |
| 3 | Reglas de Firestore/Storage no versionadas | raíz |
| 4 | `storage-server` con CORS `*` y sin auth; señalización/WebTransport sin token ni límites | `server/` |
| 5 | Cero tests, sin CI (≈55k líneas) | — |
| 6 | Código muerto: `AudioManagerNew`, `EffectManagerNew`, `SceneContentNew`, `ParameterEditorNew` (solo re-exportados), dos `ParameterValidator` sin uso | `src/lib/*` |
| 7 | Dos sistemas de estado: `src/state/useWorldStore` (1156 l, 142 archivos) vs `src/stores/*` (8) — migración a medias | `src/state`, `src/stores` |
| 8 | Archivos gigantes: `AudioManager.ts` 1288, `CodeEditor` 1069, `SceneContent` 822, `SoundPlaybackManager` 807 | — |
| 9 | Muchos ítems "completos" son prototipos tras flags (motor nativo solo cubre AMSynth). 2 motores de audio, 2 backends, 3 transportes sin camino principal | env flags |
| 10 | Deps sin uso en `src` (`translate-google`, `@vitalets/google-translate-api`), 3 scripts `limpiar-firestore*` en raíz, `next lint` obsoleto, commits "x" | raíz |

## Fase 0 — Seguridad (urgente, 1 semana)

- [x] Admin con Firebase Auth (Google): `eddieyogar@gmail.com` con email verificado (`src/lib/adminAuth.ts`). Eliminada toda contraseña del código; ya no hay secreto que rotar
- [x] `generate-sculptures`: POST + `Authorization: Bearer <idToken>` del admin, verificado en servidor (`src/lib/server/verifyAdmin.ts`) (GET → 405, sin token → 401)
- [x] `firestore.rules` + `firebase.json` versionados **y desplegados** (2026-11-01). Bloquear/desbloquear, editar proyectos bloqueados y borrar: solo admin. Visitantes de galería solo suman +1 visita. Colecciones desconocidas cerradas; `worlds` escritura solo admin; mundo global no borrable. Storage de Firebase no se usa → sin `storage.rules`
- [x] Servidores: `server/security.mjs` con `ALLOWED_ORIGINS`, límites de tasa y de conexiones; señalización con `maxPayload` 64 KB, límite de pares por sala; storage con CORS por allowlist, body ≤ 5 MB (413), validación de nombres
- [ ] **(Eddie)** Desplegar el nuevo código del sitio: el sitio en producción aún tiene la UI vieja, así que lock/unlock/borrar fallarán ahí hasta redeploy
- [ ] **(Eddie)** Añadir el dominio de producción en Firebase Console → Authentication → Settings → Authorized domains (localhost ya viene)
- [ ] Tests de reglas con emulador (`@firebase/rules-unit-testing`) en CI — requiere Java

## Fase 1 — Higiene y red de seguridad (2–4 semanas)

- [ ] CI (GitHub Actions): `tsc`, ESLint, `next build`
- [ ] Vitest para lógica pura: `network/interpolation`, `mapping/*`, `score/*`, `VoiceAllocator`, `pedagogy/parametricLevels`
- [ ] Smoke test Playwright: cargar escena → crear objeto → sin errores de consola
- [ ] Borrar código muerto (`*New`, `*Refactored`, validadores duplicados), deps sin uso, mover/borrar scripts de raíz
- [ ] Migrar a ESLint CLI; preparar Next 16
- [ ] Conventional Commits

## Fase 2 — Consolidación de arquitectura (1–2 meses)

- [ ] Un solo sistema de estado (terminar migración o revertir)
- [ ] Partir `AudioManager` (grafo / voces / espacialización)
- [ ] Decidir motor de audio: completar nativo para todos los synths, o Tone principal + nativo experimental
- [ ] Interfaz `StorageAdapter` única (Firebase | self-hosted) con tests de contrato
- [ ] Documentar qué flags son estables y cuáles experimentales

## Fase 3 — Producto y difusión (en paralelo a Fase 2)

- [ ] Demo pública estable con mundo de ejemplo precargado
- [ ] Presupuesto de rendimiento móvil/Quest (FPS, voces) medido en CI
- [ ] Revisión de onboarding/tutorial con 3–5 usuarios reales
- [ ] README corto separado de la documentación de tesis (`docs/`, carpeta "No necesarios")

## Fase 4 — Investigación (pendientes del roadmap original)

Elegir **una** a la vez:
- 6.2 ONNX en navegador / 6.4 RAVE timbre transfer — mayor impacto artístico/académico
- 3.4 anclas passthrough · 7.3 federación (ActivityPub) — largo plazo

## Bitácora

- 2026-11-01 — Diagnóstico y roadmap creados.
- 2026-11-01 — Admin migrado a Firebase Auth (Google); sesión por contraseña eliminada. Reglas desplegadas y verificadas en producción con peticiones anónimas: lectura 200; crear proyecto bloqueado, borrar proyecto, escribir `worlds` o colección desconocida → 403.
- 2026-11-01 — Fase 0 implementada (salvo pasos manuales marcados con **(Eddie)**). Verificado: `tsc` y ESLint limpios; API de sesión probada (401/200/cookie/firma alterada); `generate-sculptures` 405/401; servidores probados (origen ajeno 403, nombre inválido 400, body grande 413).
