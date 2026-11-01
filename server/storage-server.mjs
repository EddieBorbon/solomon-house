/**
 * Servidor de Almacenamiento Autohospedado (roadmap 7.2).
 *
 * Base de datos local de código abierto (SQLite vía node:sqlite, sin
 * dependencias nativas) expuesta como API REST + WebSocket de cambios en
 * tiempo real, con la misma semántica documental que usa la plataforma
 * sobre Firestore: colecciones de documentos JSON y suscripciones.
 *
 * El esquema clave-valor (`documents`) hace trivial sustituir SQLite por
 * PostgreSQL (tabla JSONB) o MongoDB sin tocar el cliente.
 *
 *   GET    /api/:col          → lista (orden updated_at desc)
 *   POST   /api/:col          → crea con id generado, devuelve { id }
 *   GET    /api/:col/:id      → documento o 404
 *   PUT    /api/:col/:id      → reemplaza/crea (upsert)
 *   PATCH  /api/:col/:id      → fusión superficial
 *   DELETE /api/:col/:id      → elimina
 *   WS     /                  → { type:'subscribe', collection, id? }
 *                               recibe { type:'change', collection, id, data|null }
 *
 * Uso: node storage-server.mjs   (STORAGE_PORT=3003, STORAGE_DB=./data/solomon-house.db)
 */

import http from 'node:http';
import crypto from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { WebSocketServer } from 'ws';
import { corsOriginFor, isOriginAllowed, clientIp, createRateLimiter } from './security.mjs';

const PORT = Number(process.env.STORAGE_PORT || 3003);
const DB_PATH = process.env.STORAGE_DB || './data/solomon-house.db';

// Límites anti-abuso
const MAX_BODY_BYTES = Number(process.env.STORAGE_MAX_BODY || 5 * 1024 * 1024); // 5 MB por documento
const MAX_WS_PAYLOAD_BYTES = 16 * 1024;
const NAME_PATTERN = /^[A-Za-z0-9_-]{1,128}$/; // colecciones e ids
// Generosos: un aula tras NAT comparte IP y el mundo global sincroniza cada ~500 ms
const requestLimiter = createRateLimiter({ max: Number(process.env.STORAGE_RATE_REQUESTS || 3000), windowMs: 60_000 }); // por IP
const writeLimiter = createRateLimiter({ max: Number(process.env.STORAGE_RATE_WRITES || 1200), windowMs: 60_000 }); // escrituras por IP

mkdirSync(dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    collection TEXT NOT NULL,
    id         TEXT NOT NULL,
    data       TEXT NOT NULL,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (collection, id)
  );
  CREATE INDEX IF NOT EXISTS idx_documents_updated
    ON documents (collection, updated_at DESC);
`);

// Nota: se prepara por llamada — en el node:sqlite experimental (22.x) los
// statements cacheados pueden finalizarse espontáneamente entre usos.
function getDocument(collection, id) {
  const row = db
    .prepare('SELECT data FROM documents WHERE collection = ? AND id = ?')
    .get(collection, id);
  return row ? JSON.parse(row.data) : null;
}

function listDocuments(collection) {
  return db
    .prepare('SELECT id, data FROM documents WHERE collection = ? ORDER BY updated_at DESC')
    .all(collection)
    .map((row) => ({ id: row.id, ...JSON.parse(row.data) }));
}

function putDocument(collection, id, data) {
  db.prepare(
    `INSERT INTO documents (collection, id, data, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT (collection, id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`
  ).run(collection, id, JSON.stringify({ ...data, id }), Date.now());
  broadcast(collection, id, { ...data, id });
}

function deleteDocument(collection, id) {
  db.prepare('DELETE FROM documents WHERE collection = ? AND id = ?').run(collection, id);
  broadcast(collection, id, null);
}

// ---------------------------------------------------------------- WebSocket

const server = http.createServer(handleRequest);
const wss = new WebSocketServer({
  server,
  maxPayload: MAX_WS_PAYLOAD_BYTES,
  verifyClient: ({ origin }) => isOriginAllowed(origin),
});

/** ws → Set<"col" | "col/id"> */
const subscriptions = new Map();

wss.on('connection', (socket) => {
  subscriptions.set(socket, new Set());

  socket.on('message', (raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      return;
    }
    if (!NAME_PATTERN.test(message.collection) || (message.id && !NAME_PATTERN.test(message.id))) {
      return;
    }
    if (message.type === 'subscribe' && typeof message.collection === 'string') {
      const key = message.id ? `${message.collection}/${message.id}` : message.collection;
      subscriptions.get(socket)?.add(key);
      // Instantánea inicial para que el suscriptor arranque sincronizado
      if (message.id) {
        socket.send(
          JSON.stringify({
            type: 'change',
            collection: message.collection,
            id: message.id,
            data: getDocument(message.collection, message.id),
          })
        );
      } else {
        socket.send(
          JSON.stringify({
            type: 'collection',
            collection: message.collection,
            documents: listDocuments(message.collection),
          })
        );
      }
    }
    if (message.type === 'unsubscribe' && typeof message.collection === 'string') {
      const key = message.id ? `${message.collection}/${message.id}` : message.collection;
      subscriptions.get(socket)?.delete(key);
    }
  });

  socket.on('close', () => subscriptions.delete(socket));
});

function broadcast(collection, id, data) {
  const payload = JSON.stringify({ type: 'change', collection, id, data });
  for (const [socket, keys] of subscriptions) {
    if (keys.has(collection) || keys.has(`${collection}/${id}`)) {
      try {
        socket.send(payload);
      } catch {
        // El socket se cerró entre el for y el send
      }
    }
  }
}

// --------------------------------------------------------------------- HTTP

function corsHeaders(req) {
  const allowOrigin = corsOriginFor(req.headers.origin);
  if (!allowOrigin) return {};
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function sendJson(req, res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...corsHeaders(req) });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        // Descartar el resto sin cortar el socket, para poder responder 413
        req.removeAllListeners('data');
        req.resume();
        reject(Object.assign(new Error('Documento demasiado grande'), { status: 413 }));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders(req));
    res.end();
    return;
  }

  // Con ALLOWED_ORIGINS definido, el navegador de otros orígenes queda fuera
  if (req.headers.origin && !isOriginAllowed(req.headers.origin)) {
    sendJson(req, res, 403, { error: 'Origen no permitido' });
    return;
  }

  const ip = clientIp(req);
  const isWrite = req.method !== 'GET';
  if (!requestLimiter.hit(ip) || (isWrite && !writeLimiter.hit(ip))) {
    sendJson(req, res, 429, { error: 'Demasiadas peticiones' });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split('/').filter(Boolean); // ['api', col, id?]

  if (parts[0] !== 'api' || parts.length < 2 || parts.length > 3) {
    sendJson(req, res, 404, { error: 'Ruta no encontrada' });
    return;
  }

  const [, collection, id] = parts;
  if (!NAME_PATTERN.test(collection) || (id !== undefined && !NAME_PATTERN.test(id))) {
    sendJson(req, res, 400, { error: 'Nombre de colección o id no válido' });
    return;
  }

  try {
    if (req.method === 'GET' && !id) {
      sendJson(req, res, 200, listDocuments(collection));
    } else if (req.method === 'GET') {
      const data = getDocument(collection, id);
      if (data) sendJson(req, res, 200, data);
      else sendJson(req, res, 404, { error: 'Documento no encontrado' });
    } else if (req.method === 'POST' && !id) {
      const body = await readBody(req);
      const newId = crypto.randomUUID();
      putDocument(collection, newId, body);
      sendJson(req, res, 201, { id: newId });
    } else if (req.method === 'PUT' && id) {
      const body = await readBody(req);
      putDocument(collection, id, body);
      sendJson(req, res, 200, { ok: true });
    } else if (req.method === 'PATCH' && id) {
      const body = await readBody(req);
      const current = getDocument(collection, id);
      if (!current) {
        sendJson(req, res, 404, { error: 'Documento no encontrado' });
        return;
      }
      putDocument(collection, id, { ...current, ...body });
      sendJson(req, res, 200, { ok: true });
    } else if (req.method === 'DELETE' && id) {
      deleteDocument(collection, id);
      sendJson(req, res, 200, { ok: true });
    } else {
      sendJson(req, res, 405, { error: 'Método no permitido' });
    }
  } catch (error) {
    sendJson(req, res, error?.status || 400, { error: String(error?.message || error) });
  }
}

server.listen(PORT, () => {
  console.log(`💾 Almacenamiento autohospedado en http://localhost:${PORT} (BD: ${DB_PATH})`);
});
