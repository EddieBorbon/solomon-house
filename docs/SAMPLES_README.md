# Configuración de Samples de Audio

## Problema Actual

El proyecto está configurado para usar un `Sampler` de Tone.js que requiere archivos de audio reales para funcionar correctamente. Actualmente, los archivos en `public/samples/piano/` son placeholders que no contienen audio real.

## Solución Temporal

El código ha sido modificado para incluir un fallback automático: si el Sampler falla al cargar los samples, automáticamente se usa un sintetizador AMSynth como respaldo.

## Para Usar Samples Reales

### Opción 1: Samples de Piano Gratuitos

1. Descarga samples de piano gratuitos de sitios como:
   - [Freesound.org](https://freesound.org/)
   - [Piano Samples](https://github.com/gleitz/midi-js-soundfonts)
   - [Musopen](https://musopen.org/)

2. Convierte los archivos a formato MP3 o WAV
3. Nombra los archivos según las notas musicales:
   - `C4.mp3` - Do central (261.63 Hz)
   - `Ds4.mp3` - Re# (311.13 Hz)
   - `Fs4.mp3` - Fa# (369.99 Hz)
   - `A4.mp3` - La (440.00 Hz)

4. Coloca los archivos en `public/samples/piano/`

### Opción 2: Generar Samples Sintéticos

Puedes usar herramientas como:
- [Audacity](https://www.audacityteam.org/) para generar tonos puros
- [Online Tone Generator](https://www.szynalski.com/tone-generator/)
- Scripts de Python con libros como `librosa` o `scipy`

### Opción 3: Usar Web Audio API

Modificar el código para generar tonos en tiempo real en lugar de usar samples pre-cargados.

## Estructura de Archivos Esperada

```
public/
  samples/
    piano/
      C4.mp3      # Do central
      Ds4.mp3     # Re#
      Fs4.mp3     # Fa#
      A4.mp3      # La
      # Agregar más notas según sea necesario
```

## Notas Técnicas

- Los archivos deben ser accesibles vía HTTP desde el navegador
- Formatos soportados: MP3, WAV, OGG
- Tamaño recomendado: < 1MB por archivo para carga rápida
- Frecuencias de referencia:
  - A4 = 440 Hz (estándar internacional)
  - C4 = 261.63 Hz (Do central)

## Fallback Automático

Si no se pueden cargar los samples, el sistema automáticamente:
1. Detecta el error de carga
2. Crea un AMSynth como respaldo
3. Convierte las notas musicales a frecuencias
4. Reproduce el sonido usando el sintetizador

Esto asegura que la aplicación funcione incluso sin samples de audio.
