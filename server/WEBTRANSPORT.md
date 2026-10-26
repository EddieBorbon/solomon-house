# Relay WebTransport HTTP/3 — roadmap 1.4

Canal de transporte alternativo al WebRTC P2P para clientes detrás de NATs
simétricas complejas, donde el emparejamiento directo entre pares falla.
Implementa la observación del roadmap: *"WebTransport sobre HTTP/3 como
canal de transporte alternativo […] donde WebRTC P2P falle"*.

## Por qué resuelve el problema de NAT simétrica

WebRTC necesita que dos clientes abran un camino directo entre sí; tras una
NAT simétrica eso requiere TURN (relay) o falla. WebTransport es
**cliente↔servidor**: cada cliente abre una única conexión *saliente*
HTTP/3 al relay, que reenvía los datagramas a los demás miembros de la
sala. Una conexión saliente atraviesa cualquier NAT.

## Semántica de transporte

Usa **datagramas** (no flujos): entrega no confiable y sin orden — la misma
semántica UDP que el roadmap 1.6 exige para el flujo de posiciones. Un
datagrama perdido se descarta y el siguiente estado corrige; no hay
bloqueo de cabeza de línea.

## Arranque

HTTP/3 es QUIC sobre TLS 1.3, así que requiere certificado. Para desarrollo
local, genera uno autofirmado:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem \
  -days 14 -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

npm install            # instala @fails-components/webtransport
WT_CERT=./cert.pem WT_KEY=./key.pem WT_PORT=4433 npm run start:webtransport
```

En el cliente web:

```bash
NEXT_PUBLIC_WEBTRANSPORT_URL=https://localhost:4433 npm run dev
```

> Con certificado autofirmado, Chrome exige que el navegador confíe en la
> huella del certificado (flag `--origin-to-force-quic-on` o
> `serverCertificateHashes` en el constructor `WebTransport`). En producción
> se usa un certificado válido (Let's Encrypt) y nada de esto hace falta.

## Coexistencia con WebRTC

`usePeerSync` activa ambos transportes de forma independiente según las
variables de entorno: con WebRTC (`NEXT_PUBLIC_SIGNALING_URL`),
WebTransport (`NEXT_PUBLIC_WEBTRANSPORT_URL`) o ambos. Comparten el formato
`PeerMessage` y la supresión de ecos, así que difundir por los dos a la vez
es seguro (el estado más reciente gana). En despliegue, WebTransport es el
plan B cuando el P2P no logra conectar.

## Nota de entorno

`@fails-components/webtransport` incluye binarios nativos del stack QUIC. La
verificación de extremo a extremo necesita los certificados y un cliente
HTTP/3 real (Chrome reciente); el cliente y la integración están
verificados por tipos y build, y el relay sigue la API `Http3Server`/
`sessionStream` del paquete.
