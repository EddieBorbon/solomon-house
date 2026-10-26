/**
 * Red de pares WebRTC — La Casa de Salomón (roadmap 1.2 y 1.6).
 *
 * Establece una malla de conexiones P2P (WebRTC Data Channels) entre los
 * clientes de una misma sala, emparejados a través del servidor de
 * señalización (`server/signaling-server.mjs`, roadmap 1.3).
 *
 * Los canales se configuran en modo NO confiable y desordenado
 * (`ordered: false, maxRetransmits: 0`, roadmap 1.6): un paquete de posición
 * perdido no bloquea a los siguientes (sin Head-of-Line Blocking); el estado
 * más reciente siempre gana.
 */

export interface PeerMessage {
  /** Tipo de mensaje de aplicación (ej. 'object-position'). */
  kind: string;
  [key: string]: unknown;
}

interface SignalPayload {
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

interface PeerEntry {
  connection: RTCPeerConnection;
  channel: RTCDataChannel | null;
}

export interface PeerNetworkOptions {
  signalingUrl: string;
  roomId: string;
  onMessage?: (fromId: string, message: PeerMessage) => void;
  onPeerCountChange?: (count: number) => void;
  iceServers?: RTCIceServer[];
}

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
];

export class PeerNetwork {
  private options: PeerNetworkOptions;
  private socket: WebSocket | null = null;
  private peers: Map<string, PeerEntry> = new Map();
  private myId: string | null = null;
  private closed = false;

  constructor(options: PeerNetworkOptions) {
    this.options = options;
  }

  public connect(): void {
    if (this.closed) return;

    const socket = new WebSocket(this.options.signalingUrl);
    this.socket = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'join', roomId: this.options.roomId }));
    };

    socket.onmessage = (event) => {
      let message: Record<string, unknown>;
      try {
        message = JSON.parse(String(event.data));
      } catch {
        return;
      }
      this.handleSignalingMessage(message);
    };

    socket.onclose = () => {
      // Reintentar la conexión de señalización mientras la red siga activa.
      // Las conexiones P2P ya establecidas sobreviven a la caída del
      // servidor de señalización.
      if (!this.closed) {
        setTimeout(() => this.connect(), 3000);
      }
    };
  }

  private async handleSignalingMessage(message: Record<string, unknown>): Promise<void> {
    switch (message.type) {
      case 'welcome': {
        this.myId = String(message.peerId);
        // El recién llegado inicia la oferta hacia cada par existente
        const peers = (message.peers as string[]) || [];
        for (const peerId of peers) {
          await this.createOffer(peerId);
        }
        break;
      }

      case 'peer-joined':
        // El nuevo par iniciará la oferta; aquí solo se espera.
        break;

      case 'peer-left':
        this.removePeer(String(message.peerId));
        break;

      case 'signal': {
        const fromId = String(message.fromId);
        const payload = message.payload as SignalPayload;
        await this.handleSignal(fromId, payload);
        break;
      }
    }
  }

  private createConnection(peerId: string): RTCPeerConnection {
    const connection = new RTCPeerConnection({
      iceServers: this.options.iceServers ?? DEFAULT_ICE_SERVERS,
    });

    connection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal(peerId, { candidate: event.candidate.toJSON() });
      }
    };

    connection.onconnectionstatechange = () => {
      if (
        connection.connectionState === 'failed' ||
        connection.connectionState === 'closed'
      ) {
        this.removePeer(peerId);
      }
    };

    const entry: PeerEntry = { connection, channel: null };
    this.peers.set(peerId, entry);
    return connection;
  }

  private setupChannel(peerId: string, channel: RTCDataChannel): void {
    const entry = this.peers.get(peerId);
    if (!entry) return;

    entry.channel = channel;

    channel.onopen = () => this.notifyPeerCount();
    channel.onclose = () => this.notifyPeerCount();
    channel.onmessage = (event) => {
      try {
        const message = JSON.parse(String(event.data)) as PeerMessage;
        this.options.onMessage?.(peerId, message);
      } catch {
        // Paquete corrupto: en modo no confiable simplemente se descarta
      }
    };
  }

  private async createOffer(peerId: string): Promise<void> {
    const connection = this.createConnection(peerId);

    // Canal no confiable y desordenado (roadmap 1.6): sin retransmisiones
    // ni orden garantizado, eliminando el bloqueo de cabeza de línea.
    const channel = connection.createDataChannel('state', {
      ordered: false,
      maxRetransmits: 0,
    });
    this.setupChannel(peerId, channel);

    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);
    this.sendSignal(peerId, { sdp: offer });
  }

  private async handleSignal(fromId: string, payload: SignalPayload): Promise<void> {
    let entry = this.peers.get(fromId);

    if (payload.sdp) {
      if (payload.sdp.type === 'offer') {
        if (!entry) {
          const connection = this.createConnection(fromId);
          connection.ondatachannel = (event) => {
            this.setupChannel(fromId, event.channel);
          };
          entry = this.peers.get(fromId);
        }
        const connection = entry!.connection;
        await connection.setRemoteDescription(payload.sdp);
        const answer = await connection.createAnswer();
        await connection.setLocalDescription(answer);
        this.sendSignal(fromId, { sdp: answer });
      } else if (payload.sdp.type === 'answer' && entry) {
        await entry.connection.setRemoteDescription(payload.sdp);
      }
    } else if (payload.candidate && entry) {
      try {
        await entry.connection.addIceCandidate(payload.candidate);
      } catch {
        // Candidatos tardíos tras cerrar la conexión: ignorar
      }
    }
  }

  private sendSignal(targetId: string, payload: SignalPayload): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'signal', targetId, payload }));
    }
  }

  private removePeer(peerId: string): void {
    const entry = this.peers.get(peerId);
    if (entry) {
      try {
        entry.channel?.close();
        entry.connection.close();
      } catch {
        // Conexión ya cerrada
      }
      this.peers.delete(peerId);
      this.notifyPeerCount();
    }
  }

  private notifyPeerCount(): void {
    this.options.onPeerCountChange?.(this.getConnectedPeerCount());
  }

  /** Número de pares con canal de datos abierto. */
  public getConnectedPeerCount(): number {
    let count = 0;
    for (const entry of this.peers.values()) {
      if (entry.channel?.readyState === 'open') count++;
    }
    return count;
  }

  /** Difunde un mensaje a todos los pares conectados. */
  public broadcast(message: PeerMessage): void {
    const data = JSON.stringify(message);
    for (const entry of this.peers.values()) {
      if (entry.channel?.readyState === 'open') {
        try {
          entry.channel.send(data);
        } catch {
          // Buffer lleno o canal cerrándose: el siguiente estado lo corrige
        }
      }
    }
  }

  /** Cierra todas las conexiones y detiene los reintentos. */
  public close(): void {
    this.closed = true;
    for (const peerId of [...this.peers.keys()]) {
      this.removePeer(peerId);
    }
    this.socket?.close();
    this.socket = null;
  }
}
