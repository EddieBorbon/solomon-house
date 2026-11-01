/**
 * Utilidades de endurecimiento compartidas por los servidores autohospedados.
 *
 * ALLOWED_ORIGINS: lista separada por comas de orígenes del navegador
 * autorizados (p. ej. "https://casa-salomon.org,http://localhost:3000").
 * Vacía = se acepta cualquier origen (cómodo en desarrollo/LAN, no en internet).
 */

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export function isOriginAllowed(origin) {
  if (allowedOrigins.length === 0) return true;
  // Clientes sin cabecera Origin (curl, scripts) se rechazan si hay allowlist
  return typeof origin === 'string' && allowedOrigins.includes(origin);
}

/** Valor para Access-Control-Allow-Origin, o null si el origen no está permitido. */
export function corsOriginFor(origin) {
  if (allowedOrigins.length === 0) return '*';
  return isOriginAllowed(origin) ? origin : null;
}

/** IP del cliente, respetando X-Forwarded-For cuando hay proxy delante. */
export function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

/**
 * Limitador de tasa de ventana fija por clave (IP, socket…).
 * hit(key) devuelve false cuando la clave superó `max` eventos en `windowMs`.
 */
export function createRateLimiter({ max, windowMs }) {
  const buckets = new Map();

  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now - bucket.start > windowMs) buckets.delete(key);
    }
  }, windowMs);
  sweep.unref?.();

  return {
    hit(key) {
      const now = Date.now();
      const bucket = buckets.get(key);
      if (!bucket || now - bucket.start > windowMs) {
        buckets.set(key, { start: now, count: 1 });
        return true;
      }
      bucket.count++;
      return bucket.count <= max;
    },
  };
}
