'use client';

import { useEffect, useRef, useState } from 'react';
import { useWorldStore, type Grid } from '../state/useWorldStore';
import { useGridStore } from '../stores/useGridStore';
import { audioManager } from '../lib/AudioManager';
import { PeerNetwork, type PeerMessage } from '../lib/network/PeerNetwork';
import { WebTransportClient } from '../lib/network/WebTransportClient';

/**
 * Sincronización P2P de baja latencia (roadmap 1.1 y 1.2).
 *
 * Arquitectura híbrida: Firebase Firestore conserva la autenticación, los
 * metadatos y la persistencia del estado (carga inicial, cambios
 * estructurales), mientras que el flujo continuo de posiciones viaja por
 * WebRTC Data Channels directamente entre los clientes de la sala,
 * evitando el viaje cliente→Firestore→cliente y su latencia TCP.
 *
 * El hook es opcional: solo se activa si NEXT_PUBLIC_SIGNALING_URL está
 * definida (ej. ws://localhost:3001, el servicio `signaling` del compose).
 * Sin ella, la plataforma sigue funcionando solo con Firebase.
 */

const BROADCAST_INTERVAL_MS = 66; // ~15 Hz
const ROOM_ID = 'global-world';

function positionKey(position: [number, number, number]): string {
  return `${position[0].toFixed(3)},${position[1].toFixed(3)},${position[2].toFixed(3)}`;
}

/**
 * Aplica una posición recibida por P2P directamente al estado local y al
 * motor de audio, sin escribir en Firestore: la persistencia es
 * responsabilidad exclusiva del cliente que originó el movimiento.
 */
function applyRemotePosition(objectId: string, position: [number, number, number]): void {
  useWorldStore.setState((state) => {
    const newGrids = new Map<string, Grid>(state.grids);
    for (const [gridId, grid] of newGrids) {
      const index = grid.objects.findIndex((obj) => obj.id === objectId);
      if (index !== -1) {
        const objects = [...grid.objects];
        objects[index] = { ...objects[index], position };
        newGrids.set(gridId, { ...grid, objects });
        useGridStore.setState({ grids: newGrids });
        audioManager.updateSoundPosition(objectId, position);
        return { grids: newGrids };
      }
    }
    return state;
  });
}

export function usePeerSync(): { peerCount: number; isP2PEnabled: boolean } {
  const [peerCount, setPeerCount] = useState(0);
  const signalingUrl = process.env.NEXT_PUBLIC_SIGNALING_URL;
  // Transporte alternativo WebTransport/HTTP/3 (roadmap 1.4), para NAT
  // simétrica donde el WebRTC P2P falla. Opt-in e independiente.
  const webTransportUrl = process.env.NEXT_PUBLIC_WEBTRANSPORT_URL;

  // Última posición enviada por objeto, para difundir solo cambios
  const lastSentRef = useRef(new Map<string, string>());
  // Última posición recibida por objeto, para no re-difundir ecos
  const lastReceivedRef = useRef(new Map<string, string>());

  useEffect(() => {
    if (!signalingUrl && !webTransportUrl) return;

    // Modo LAN (roadmap 7.4): sin servidores STUN de Internet — en redes
    // locales los candidatos host de WebRTC bastan para conectar peers.
    const lanMode = process.env.NEXT_PUBLIC_LAN_MODE === 'true';

    // Manejador común de posiciones entrantes (de cualquier transporte)
    const handleIncoming = (message: PeerMessage) => {
      if (message.kind === 'object-position') {
        const id = String(message.id);
        const position = message.position as [number, number, number];
        if (!Array.isArray(position) || position.length !== 3) return;

        lastReceivedRef.current.set(id, positionKey(position));
        applyRemotePosition(id, position);
      }
    };

    // Transporte WebRTC P2P (1.2), si hay señalización
    const network = signalingUrl
      ? new PeerNetwork({
          signalingUrl,
          roomId: ROOM_ID,
          ...(lanMode ? { iceServers: [] } : {}),
          onPeerCountChange: (count) => setPeerCount(count + (wtClient?.getConnectedPeerCount() ?? 0)),
          onMessage: (_fromId, message) => handleIncoming(message),
        })
      : null;

    // Transporte WebTransport/HTTP/3 alternativo (1.4), si está configurado
    const wtClient = webTransportUrl
      ? new WebTransportClient({
          url: webTransportUrl,
          roomId: ROOM_ID,
          onMessage: handleIncoming,
          onStateChange: () =>
            setPeerCount(
              (network?.getConnectedPeerCount() ?? 0) + (wtClient?.getConnectedPeerCount() ?? 0)
            ),
        })
      : null;

    network?.connect();
    wtClient?.connect();

    // Bucle de difusión: detecta cambios de posición locales y los emite
    // a ~15 Hz por todos los transportes activos (canales no confiables).
    const interval = setInterval(() => {
      const activePeers =
        (network?.getConnectedPeerCount() ?? 0) + (wtClient?.getConnectedPeerCount() ?? 0);
      if (activePeers === 0) return;

      const { grids } = useWorldStore.getState();
      for (const grid of grids.values()) {
        for (const obj of grid.objects) {
          const key = positionKey(obj.position);

          // No re-difundir posiciones que acaban de llegar por la red
          if (lastReceivedRef.current.get(obj.id) === key) continue;
          if (lastSentRef.current.get(obj.id) === key) continue;

          lastSentRef.current.set(obj.id, key);
          const message: PeerMessage = {
            kind: 'object-position',
            id: obj.id,
            position: obj.position,
          };
          network?.broadcast(message);
          wtClient?.broadcast(message);
        }
      }
    }, BROADCAST_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      network?.close();
      wtClient?.close();
    };
  }, [signalingUrl, webTransportUrl]);

  return { peerCount, isP2PEnabled: Boolean(signalingUrl || webTransportUrl) };
}
