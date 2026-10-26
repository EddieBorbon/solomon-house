/**
 * Modo Local-First / Servidor LAN (roadmap 7.4).
 *
 * Levanta el stack completo de servidores (señalización WebRTC 1.3 y
 * almacenamiento autohospedado 7.2) en una sola orden para redes de área
 * local aisladas de Internet (aulas rurales, residencias, talleres):
 *
 *   node lan-mode.mjs              → arranca servidores + baliza de descubrimiento
 *   node lan-mode.mjs --discover   → busca servidores Casa de Salomón en la LAN
 *
 * Descubrimiento de peers: baliza UDP (puerto 3004). Cualquier nodo de la
 * red puede emitir un broadcast "solomon-house:discover" y recibir un JSON
 * con las URLs de los servicios, sin conocer la IP del servidor de antemano.
 *
 * En el cliente web, el modo LAN se completa con:
 *   NEXT_PUBLIC_LAN_MODE=true                        (WebRTC sin STUN de Internet)
 *   NEXT_PUBLIC_SIGNALING_URL=ws://<ip-lan>:3001
 *   NEXT_PUBLIC_STORAGE_BACKEND=selfhosted
 *   NEXT_PUBLIC_STORAGE_URL=http://<ip-lan>:3003
 */

import dgram from 'node:dgram';
import os from 'node:os';
import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DISCOVERY_PORT = Number(process.env.DISCOVERY_PORT || 3004);
const SIGNALING_PORT = Number(process.env.SIGNALING_PORT || 3001);
const STORAGE_PORT = Number(process.env.STORAGE_PORT || 3003);
const WEB_PORT = Number(process.env.WEB_PORT || 3000);
const DISCOVER_PROBE = 'solomon-house:discover';

/** true si es un rango privado clásico de LAN (RFC 1918). */
function isPrivateLan(address) {
  return (
    address.startsWith('192.168.') ||
    address.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(address)
  );
}

/**
 * IPs IPv4 de la máquina en la red local (excluye loopback), con los
 * rangos privados RFC 1918 primero — las interfaces de VPN/CGNAT
 * (100.64.0.0/10, etc.) no sirven para los participantes del aula.
 */
function lanAddresses() {
  const addresses = [];
  for (const interfaces of Object.values(os.networkInterfaces())) {
    for (const net of interfaces ?? []) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses.sort((a, b) => Number(isPrivateLan(b)) - Number(isPrivateLan(a)));
}

function servicesPayload(host) {
  return {
    service: 'solomon-house',
    host,
    web: `http://${host}:${WEB_PORT}`,
    signaling: `ws://${host}:${SIGNALING_PORT}`,
    storage: `http://${host}:${STORAGE_PORT}`,
  };
}

// ------------------------------------------------------ modo --discover

if (process.argv.includes('--discover')) {
  const socket = dgram.createSocket('udp4');
  const found = new Map();

  socket.on('message', (raw, rinfo) => {
    try {
      const info = JSON.parse(raw.toString());
      if (info.service === 'solomon-house' && !found.has(rinfo.address)) {
        found.set(rinfo.address, info);
        console.log(`✅ Servidor encontrado en ${rinfo.address}:`);
        console.log(`   Web:           ${info.web}`);
        console.log(`   Señalización:  ${info.signaling}`);
        console.log(`   Almacenamiento:${info.storage}`);
      }
    } catch {
      // Datagrama ajeno
    }
  });

  socket.bind(() => {
    socket.setBroadcast(true);
    console.log(`🔍 Buscando servidores Casa de Salomón en la LAN (puerto ${DISCOVERY_PORT})…`);
    socket.send(DISCOVER_PROBE, DISCOVERY_PORT, '255.255.255.255');
  });

  setTimeout(() => {
    if (found.size === 0) {
      console.log('ℹ️ Ningún servidor respondió en 3 segundos.');
    }
    socket.close();
  }, 3000);
} else {
  // --------------------------------------------------- modo servidor

  // 1. Arrancar señalización y almacenamiento como procesos hijos
  const children = [
    fork(join(__dirname, 'signaling-server.mjs'), {
      env: { ...process.env, SIGNALING_PORT: String(SIGNALING_PORT) },
    }),
    fork(join(__dirname, 'storage-server.mjs'), {
      env: { ...process.env, STORAGE_PORT: String(STORAGE_PORT) },
    }),
  ];

  const shutdown = () => {
    children.forEach((child) => child.kill());
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // 2. Baliza de descubrimiento UDP: responde a sondas de la LAN
  const beacon = dgram.createSocket('udp4');
  beacon.on('message', (raw, rinfo) => {
    if (raw.toString() !== DISCOVER_PROBE) return;
    // Responder con la IP LAN del servidor (la primera disponible)
    const host = lanAddresses()[0] || 'localhost';
    beacon.send(JSON.stringify(servicesPayload(host)), rinfo.port, rinfo.address);
  });
  beacon.bind(DISCOVERY_PORT, () => {
    console.log(`📡 Baliza de descubrimiento LAN en puerto UDP ${DISCOVERY_PORT}`);
  });

  // 3. Instrucciones de conexión para los participantes
  setTimeout(() => {
    const hosts = lanAddresses();
    console.log('\n🏠 La Casa de Salomón — Modo LAN (sin Internet)');
    console.log('─'.repeat(56));
    if (hosts.length === 0) {
      console.log('⚠️ No se detectó ninguna interfaz de red local.');
    }
    for (const host of hosts) {
      console.log(`Los participantes entran desde: http://${host}:${WEB_PORT}`);
    }
    console.log('\nVariables para construir/arrancar el cliente web:');
    const host = hosts[0] || 'localhost';
    console.log(`  NEXT_PUBLIC_LAN_MODE=true`);
    console.log(`  NEXT_PUBLIC_SIGNALING_URL=ws://${host}:${SIGNALING_PORT}`);
    console.log(`  NEXT_PUBLIC_STORAGE_BACKEND=selfhosted`);
    console.log(`  NEXT_PUBLIC_STORAGE_URL=http://${host}:${STORAGE_PORT}`);
    console.log('─'.repeat(56));
  }, 600);
}
