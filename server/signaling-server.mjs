/**
 * Servidor de Señalización WebRTC — La Casa de Salomón (roadmap 1.3)
 *
 * Servidor ligero en Node.js que empareja a los usuarios de una misma sala
 * para que establezcan conexiones WebRTC peer-to-peer (roadmap 1.2). Solo
 * retransmite mensajes de señalización (offer/answer/ICE); los datos
 * volátiles (posiciones, manipulación) viajan después directamente entre
 * pares, fuera de este servidor.
 *
 * Protocolo (JSON sobre WebSocket):
 *   Cliente -> servidor:
 *     { type: 'join',   roomId }
 *     { type: 'signal', targetId, payload }   // offer | answer | candidate
 *     { type: 'ping' }
 *   Servidor -> cliente:
 *     { type: 'welcome', peerId, peers: [peerId...] }
 *     { type: 'peer-joined', peerId }
 *     { type: 'peer-left',   peerId }
 *     { type: 'signal', fromId, payload }
 *     { type: 'pong' }
 *
 * Ejecución: node server/signaling-server.mjs  (puerto: SIGNALING_PORT, 3001)
 */

import { WebSocketServer } from 'ws';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.SIGNALING_PORT || 3001);

/** roomId -> Map<peerId, ws> */
const rooms = new Map();

const wss = new WebSocketServer({ port: PORT });

function send(ws, message) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function broadcast(roomId, message, exceptId) {
  const room = rooms.get(roomId);
  if (!room) return;
  for (const [peerId, peerWs] of room) {
    if (peerId !== exceptId) {
      send(peerWs, message);
    }
  }
}

function leaveRoom(ws) {
  const { roomId, peerId } = ws;
  if (!roomId || !peerId) return;

  const room = rooms.get(roomId);
  if (room) {
    room.delete(peerId);
    if (room.size === 0) {
      rooms.delete(roomId);
    } else {
      broadcast(roomId, { type: 'peer-left', peerId });
    }
  }
  ws.roomId = null;
}

wss.on('connection', (ws) => {
  ws.peerId = randomUUID();
  ws.isAlive = true;

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (data) => {
    let message;
    try {
      message = JSON.parse(data.toString());
    } catch {
      return;
    }

    switch (message.type) {
      case 'join': {
        if (typeof message.roomId !== 'string' || !message.roomId) return;

        // Salir de la sala anterior si la hubiera
        leaveRoom(ws);

        ws.roomId = message.roomId;
        let room = rooms.get(ws.roomId);
        if (!room) {
          room = new Map();
          rooms.set(ws.roomId, room);
        }

        // Informar al nuevo par de quiénes ya están en la sala;
        // él iniciará las ofertas hacia los existentes.
        send(ws, {
          type: 'welcome',
          peerId: ws.peerId,
          peers: [...room.keys()],
        });

        broadcast(ws.roomId, { type: 'peer-joined', peerId: ws.peerId });
        room.set(ws.peerId, ws);
        break;
      }

      case 'signal': {
        const room = rooms.get(ws.roomId);
        const target = room?.get(message.targetId);
        if (target) {
          send(target, {
            type: 'signal',
            fromId: ws.peerId,
            payload: message.payload,
          });
        }
        break;
      }

      case 'ping':
        // Eco de aplicación para que el cliente mida el RTT (roadmap 1.7)
        send(ws, { type: 'pong', t: message.t });
        break;
    }
  });

  ws.on('close', () => leaveRoom(ws));
  ws.on('error', () => leaveRoom(ws));
});

// Detección de conexiones muertas (NATs/proxies que cortan en silencio)
const heartbeat = setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) {
      ws.terminate();
      continue;
    }
    ws.isAlive = false;
    ws.ping();
  }
}, 30_000);

wss.on('close', () => clearInterval(heartbeat));

console.log(`[signaling] Servidor de señalización escuchando en ws://0.0.0.0:${PORT}`);
