/**
 * Relay WebTransport sobre HTTP/3 (roadmap 1.4).
 *
 * Canal de transporte alternativo al WebRTC P2P para clientes detrás de
 * NATs simétricas complejas. A diferencia de la señalización (1.3, que solo
 * empareja), este servidor **reenvía** el flujo de posiciones entre los
 * miembros de una sala: cada cliente abre una única conexión saliente
 * HTTP/3 al relay, lo que atraviesa cualquier NAT.
 *
 * Usa datagramas (entrega no confiable, semántica UDP del roadmap 1.6): un
 * datagrama perdido se descarta y el siguiente estado de posición corrige.
 *
 * Requiere certificado TLS (HTTP/3 = QUIC sobre TLS 1.3). Para desarrollo
 * local, genera uno autofirmado (ver README) y expórtalo:
 *   WT_CERT=./cert.pem WT_KEY=./key.pem WT_PORT=4433 node webtransport-server.mjs
 *
 * En el cliente: NEXT_PUBLIC_WEBTRANSPORT_URL=https://localhost:4433
 */

import { readFileSync } from 'node:fs';
import { Http3Server } from '@fails-components/webtransport';

const PORT = Number(process.env.WT_PORT || 4433);
const HOST = process.env.WT_HOST || '0.0.0.0';
const CERT_PATH = process.env.WT_CERT || './cert.pem';
const KEY_PATH = process.env.WT_KEY || './key.pem';

let cert;
let privKey;
try {
  cert = readFileSync(CERT_PATH);
  privKey = readFileSync(KEY_PATH);
} catch {
  console.error(
    `❌ WebTransport: no se encontraron el certificado (${CERT_PATH}) y la clave (${KEY_PATH}).\n` +
      '   Genera uno autofirmado para desarrollo (ver README) y exporta WT_CERT / WT_KEY.'
  );
  process.exit(1);
}

const server = new Http3Server({
  port: PORT,
  host: HOST,
  secret: 'solomon-house-webtransport',
  cert,
  privKey,
});

/** room → Set<WebTransportSession> */
const rooms = new Map();
/** session → { room, writer } */
const sessionInfo = new Map();

const decoder = new TextDecoder();

function joinRoom(session, room, writer) {
  if (!rooms.has(room)) rooms.set(room, new Set());
  rooms.get(room).add(session);
  sessionInfo.set(session, { room, writer });
  console.log(`🚀 WebTransport: sesión unida a sala "${room}" (${rooms.get(room).size} miembros)`);
}

function leaveRoom(session) {
  const info = sessionInfo.get(session);
  if (!info) return;
  rooms.get(info.room)?.delete(session);
  sessionInfo.delete(session);
}

/** Reenvía un datagrama a los demás miembros de la sala. */
function relay(fromSession, payload) {
  const info = sessionInfo.get(fromSession);
  if (!info) return;
  const members = rooms.get(info.room);
  if (!members) return;
  for (const member of members) {
    if (member === fromSession) continue;
    const target = sessionInfo.get(member);
    target?.writer.write(payload).catch(() => {
      // Datagrama no entregado: semántica no confiable (1.6)
    });
  }
}

async function handleSession(session) {
  await session.ready;
  const writer = session.datagrams.writable.getWriter();
  const reader = session.datagrams.readable.getReader();

  session.closed.finally(() => leaveRoom(session)).catch(() => {});

  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      if (!value) continue;

      // El primer datagrama "join" registra la sala; los demás se reenvían
      let parsed = null;
      try {
        parsed = JSON.parse(decoder.decode(value));
      } catch {
        // No es JSON legible: reenviar tal cual
      }

      if (parsed && parsed.kind === 'join' && typeof parsed.room === 'string') {
        joinRoom(session, parsed.room, writer);
        continue;
      }

      if (!sessionInfo.has(session)) {
        // Aún sin sala: ignorar hasta el join
        continue;
      }
      relay(session, value);
    }
  } catch {
    // Conexión cerrada durante la lectura
  } finally {
    leaveRoom(session);
    try {
      writer.releaseLock();
    } catch {
      // Ya liberado
    }
  }
}

async function main() {
  server.startServer();
  await server.ready;
  console.log(`📡 Relay WebTransport HTTP/3 escuchando en https://${HOST}:${PORT}`);

  const sessionStream = server.sessionStream('/');
  const sessionReader = sessionStream.getReader();

  for (;;) {
    const { value: session, done } = await sessionReader.read();
    if (done) break;
    if (session) handleSession(session);
  }
}

main().catch((error) => {
  console.error('❌ WebTransport: error fatal', error);
  process.exit(1);
});
