import { type PeerMessage } from './PeerNetwork';

/**
 * Cliente WebTransport sobre HTTP/3 (roadmap 1.4).
 *
 * Transporte alternativo al WebRTC P2P para clientes detrás de NATs
 * simétricas complejas, donde el emparejamiento directo entre pares falla.
 * A diferencia de WebRTC (peer-to-peer), WebTransport es cliente↔servidor:
 * un relay HTTP/3 reenvía los mensajes entre los miembros de la sala, lo
 * que **siempre funciona** tras NAT simétrica porque cada cliente solo abre
 * una conexión saliente al servidor.
 *
 * Usa **datagramas** (no flujos): entrega no confiable y sin orden, la
 * semántica UDP que el roadmap 1.6 exige para el flujo de posiciones
 * (descarta paquetes perdidos, el estado más reciente corrige). Comparte
 * el formato de mensaje `PeerMessage` con `PeerNetwork`, de modo que
 * `usePeerSync` puede usar ambos transportes indistintamente.
 *
 * Opt-in: solo se activa con `NEXT_PUBLIC_WEBTRANSPORT_URL`
 * (ej. https://localhost:4433, el servicio `webtransport` del compose).
 */

export interface WebTransportClientOptions {
  url: string;
  roomId: string;
  onMessage: (message: PeerMessage) => void;
  onStateChange?: (connected: boolean) => void;
}

const RECONNECT_MS = 3000;

export class WebTransportClient {
  private transport: WebTransport | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private encoder = new TextEncoder();
  private decoder = new TextDecoder();
  private connected = false;
  private closedByUser = false;

  constructor(private options: WebTransportClientOptions) {}

  public isConnected(): boolean {
    return this.connected;
  }

  /** Reporta 1 si el relay está conectado (el servidor cuenta como "peer"). */
  public getConnectedPeerCount(): number {
    return this.connected ? 1 : 0;
  }

  public async connect(): Promise<void> {
    if (typeof window === 'undefined' || typeof WebTransport === 'undefined') {
      console.warn('⚠️ WebTransport no soportado por este navegador');
      return;
    }
    this.closedByUser = false;
    try {
      const transport = new WebTransport(this.options.url);
      this.transport = transport;
      await transport.ready;

      this.writer = transport.datagrams.writable.getWriter();
      this.connected = true;
      this.options.onStateChange?.(true);

      // Anunciar la sala al relay para que sepa a quién reenviar
      await this.send({ kind: 'join', room: this.options.roomId } as unknown as PeerMessage);

      this.readLoop();
      this.watchClosed();
      console.log('🚀 WebTransport: conectado al relay HTTP/3');
    } catch (error) {
      console.warn('⚠️ WebTransport: fallo de conexión', error);
      this.connected = false;
      this.options.onStateChange?.(false);
      this.scheduleReconnect();
    }
  }

  /** Bucle de lectura de datagramas entrantes (reenviados por el relay). */
  private async readLoop(): Promise<void> {
    if (!this.transport) return;
    const reader = this.transport.datagrams.readable.getReader();
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!value) continue;
        try {
          const message = JSON.parse(this.decoder.decode(value)) as PeerMessage;
          this.options.onMessage(message);
        } catch {
          // Datagrama corrupto: descartar (semántica no confiable, 1.6)
        }
      }
    } catch {
      // La conexión se cerró durante la lectura
    } finally {
      reader.releaseLock();
    }
  }

  private async watchClosed(): Promise<void> {
    if (!this.transport) return;
    try {
      await this.transport.closed;
    } catch {
      // Cierre con error
    }
    this.connected = false;
    this.options.onStateChange?.(false);
    if (!this.closedByUser) this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.closedByUser) return;
    setTimeout(() => {
      if (!this.closedByUser) this.connect();
    }, RECONNECT_MS);
  }

  /** Envía un mensaje como datagrama (no confiable, sin orden). */
  public async send(message: PeerMessage | { kind: string; room: string }): Promise<void> {
    if (!this.writer || !this.connected) return;
    try {
      await this.writer.write(this.encoder.encode(JSON.stringify(message)));
    } catch {
      // Datagrama no enviado: el siguiente estado corrige (1.6)
    }
  }

  /** Difunde un mensaje a la sala (el relay lo reenvía a los demás). */
  public broadcast(message: PeerMessage): void {
    void this.send(message);
  }

  public close(): void {
    this.closedByUser = true;
    this.connected = false;
    try {
      this.writer?.releaseLock();
      this.transport?.close();
    } catch {
      // Ya cerrado
    }
    this.transport = null;
    this.writer = null;
  }
}
