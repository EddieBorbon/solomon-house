import { Timestamp } from 'firebase/firestore';
import type { FirebaseProject, FirebaseGrid, GlobalWorldDoc } from '../firebaseService';
import { type SoundObject, type MobileObject, type EffectZone, type Grid } from '../../state/useWorldStore';

/**
 * Backend de almacenamiento autohospedado (roadmap 7.2).
 *
 * Implementa la misma interfaz pública que `FirebaseService` contra el
 * servidor local de código abierto (`server/storage-server.mjs`, SQLite),
 * de modo que toda la plataforma funciona sin ningún servicio corporativo:
 * REST para lecturas/escrituras y WebSocket para las suscripciones en
 * tiempo real. Se activa con:
 *
 *   NEXT_PUBLIC_STORAGE_BACKEND=selfhosted
 *   NEXT_PUBLIC_STORAGE_URL=http://localhost:3003
 */

const GLOBAL_COLLECTION = 'globalWorldState';
const GLOBAL_ID = 'main';
const RECONNECT_MS = 3000;

type ChangeMessage = {
  type: string;
  collection?: string;
  id?: string;
  data?: unknown;
  documents?: unknown[];
};

/** Revive objetos {seconds, nanoseconds} serializados como Timestamp reales. */
function reviveTimestamps<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => reviveTimestamps(item)) as T;
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record);
    if (
      keys.length === 2 &&
      typeof record.seconds === 'number' &&
      typeof record.nanoseconds === 'number'
    ) {
      return new Timestamp(record.seconds as number, record.nanoseconds as number) as T;
    }
    const out: Record<string, unknown> = {};
    for (const key of keys) {
      out[key] = reviveTimestamps(record[key]);
    }
    return out as T;
  }
  return value;
}

export class SelfHostedService {
  private baseUrl: string;
  private socket: WebSocket | null = null;
  private socketReady = false;
  /** clave "col" o "col/id" → callbacks */
  private subscribers = new Map<string, Set<(message: ChangeMessage) => void>>();

  constructor(baseUrl?: string) {
    this.baseUrl = (
      baseUrl ||
      process.env.NEXT_PUBLIC_STORAGE_URL ||
      'http://localhost:3003'
    ).replace(/\/$/, '');
  }

  // ------------------------------------------------------------- HTTP

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}/api${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok && response.status !== 404) {
      throw new Error(`Almacenamiento autohospedado: ${method} ${path} → ${response.status}`);
    }
    if (response.status === 404) return null as T;
    return reviveTimestamps(await response.json()) as T;
  }

  // -------------------------------------------------------- WebSocket

  private ensureSocket(): void {
    if (typeof window === 'undefined' || this.socket) return;

    const wsUrl = this.baseUrl.replace(/^http/, 'ws');
    const socket = new WebSocket(wsUrl);
    this.socket = socket;

    socket.onopen = () => {
      this.socketReady = true;
      // Re-suscribir todo lo registrado (primera conexión o reconexión)
      for (const key of this.subscribers.keys()) {
        this.sendSubscribe(key);
      }
    };

    socket.onmessage = (event) => {
      let message: ChangeMessage;
      try {
        message = JSON.parse(event.data as string);
      } catch {
        return;
      }
      if (!message.collection) return;
      const keys = [message.collection, message.id ? `${message.collection}/${message.id}` : null];
      for (const key of keys) {
        if (!key) continue;
        this.subscribers.get(key)?.forEach((callback) => callback(message));
      }
    };

    socket.onclose = () => {
      this.socket = null;
      this.socketReady = false;
      if (this.subscribers.size > 0) {
        setTimeout(() => this.ensureSocket(), RECONNECT_MS);
      }
    };

    socket.onerror = () => socket.close();
  }

  private sendSubscribe(key: string): void {
    if (!this.socket || !this.socketReady) return;
    const [collection, id] = key.split('/');
    this.socket.send(JSON.stringify({ type: 'subscribe', collection, id }));
  }

  private subscribe(key: string, callback: (message: ChangeMessage) => void): () => void {
    if (!this.subscribers.has(key)) this.subscribers.set(key, new Set());
    this.subscribers.get(key)!.add(callback);
    this.ensureSocket();
    this.sendSubscribe(key);

    return () => {
      const set = this.subscribers.get(key);
      set?.delete(callback);
      if (set && set.size === 0) this.subscribers.delete(key);
    };
  }

  // ---------------------------------------------------------- Proyectos

  async saveProject(
    projectData: Omit<FirebaseProject, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const now = Timestamp.now();
    const { id } = await this.request<{ id: string }>('POST', '/projects', {
      ...projectData,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  }

  async updateProject(projectId: string, projectData: Partial<FirebaseProject>): Promise<void> {
    await this.request('PATCH', `/projects/${projectId}`, {
      ...projectData,
      updatedAt: Timestamp.now(),
    });
  }

  async loadProject(projectId: string): Promise<FirebaseProject | null> {
    return this.request<FirebaseProject | null>('GET', `/projects/${projectId}`);
  }

  async loadAllProjects(): Promise<FirebaseProject[]> {
    return (await this.request<FirebaseProject[]>('GET', '/projects')) ?? [];
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.request('DELETE', `/projects/${projectId}`);
  }

  subscribeToProject(
    projectId: string,
    callback: (project: FirebaseProject | null) => void
  ): () => void {
    return this.subscribe(`projects/${projectId}`, (message) => {
      callback(message.data ? (reviveTimestamps(message.data) as FirebaseProject) : null);
    });
  }

  // --------------------------------------------------------- Cuadrículas

  async saveGrid(gridData: Omit<FirebaseGrid, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const { id } = await this.request<{ id: string }>('POST', '/grids', {
      ...gridData,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  }

  async updateGrid(gridId: string, gridData: Partial<FirebaseGrid>): Promise<void> {
    await this.request('PATCH', `/grids/${gridId}`, {
      ...gridData,
      updatedAt: Timestamp.now(),
    });
  }

  async loadGrid(gridId: string): Promise<FirebaseGrid | null> {
    return this.request<FirebaseGrid | null>('GET', `/grids/${gridId}`);
  }

  async deleteGrid(gridId: string): Promise<void> {
    await this.request('DELETE', `/grids/${gridId}`);
  }

  subscribeToGrids(callback: (grids: FirebaseGrid[]) => void): () => void {
    let known: FirebaseGrid[] = [];
    return this.subscribe('grids', (message) => {
      if (message.type === 'collection' && Array.isArray(message.documents)) {
        known = reviveTimestamps(message.documents) as FirebaseGrid[];
      } else if (message.type === 'change' && message.id) {
        known = known.filter((grid) => grid.id !== message.id);
        if (message.data) {
          known = [...known, reviveTimestamps(message.data) as FirebaseGrid];
        }
      }
      callback(known);
    });
  }

  // -------------------------------------------------------- Mundo global

  private async getGlobalDoc(): Promise<GlobalWorldDoc | null> {
    return this.request<GlobalWorldDoc | null>('GET', `/${GLOBAL_COLLECTION}/${GLOBAL_ID}`);
  }

  private async putGlobalDoc(doc: Partial<GlobalWorldDoc>): Promise<void> {
    await this.request('PUT', `/${GLOBAL_COLLECTION}/${GLOBAL_ID}`, doc);
  }

  /** Lee-modifica-escribe el documento global con marca de tiempo y versión. */
  private async mutateGlobal(
    mutate: (current: GlobalWorldDoc) => Partial<GlobalWorldDoc>
  ): Promise<void> {
    const current =
      (await this.getGlobalDoc()) ??
      ({
        objects: [],
        effectZones: [],
        mobileObjects: [],
        grids: [],
        activeGridId: null,
        lastUpdated: Timestamp.now(),
        version: 0,
      } as GlobalWorldDoc);

    await this.putGlobalDoc({
      ...current,
      ...mutate(current),
      lastUpdated: Timestamp.now(),
      version: (Number(current.version) || 0) + 1,
    });
  }

  async initializeGlobalWorldState(initialState: Partial<GlobalWorldDoc> = {}): Promise<void> {
    const existing = await this.getGlobalDoc();
    if (existing) return;
    await this.putGlobalDoc({
      objects: [],
      effectZones: [],
      mobileObjects: [],
      grids: [],
      activeGridId: null,
      ...initialState,
      lastUpdated: Timestamp.now(),
      version: 1,
    });
  }

  async updateGlobalWorldState(
    updates: Partial<Omit<GlobalWorldDoc, 'version' | 'lastUpdated'>>
  ): Promise<void> {
    await this.mutateGlobal(() => updates);
  }

  async addGlobalSoundObject(object: SoundObject): Promise<void> {
    await this.mutateGlobal((current) => ({
      objects: [...current.objects.filter((obj) => obj.id !== object.id), object],
    }));
  }

  async updateGlobalSoundObject(objectId: string, updatedObject: SoundObject): Promise<void> {
    await this.mutateGlobal((current) => ({
      objects: current.objects.map((obj) => (obj.id === objectId ? updatedObject : obj)),
    }));
  }

  async removeGlobalSoundObject(objectId: string): Promise<void> {
    await this.mutateGlobal((current) => ({
      objects: current.objects.filter((obj) => obj.id !== objectId),
    }));
  }

  async addGlobalEffectZone(effectZone: EffectZone): Promise<void> {
    await this.mutateGlobal((current) => ({
      effectZones: [...current.effectZones.filter((zone) => zone.id !== effectZone.id), effectZone],
    }));
  }

  async updateGlobalEffectZone(zoneId: string, updatedZone: EffectZone): Promise<void> {
    await this.mutateGlobal((current) => ({
      effectZones: current.effectZones.map((zone) => (zone.id === zoneId ? updatedZone : zone)),
    }));
  }

  async removeGlobalEffectZone(zoneId: string): Promise<void> {
    await this.mutateGlobal((current) => ({
      effectZones: current.effectZones.filter((zone) => zone.id !== zoneId),
    }));
  }

  async addGlobalMobileObject(mobileObject: MobileObject): Promise<void> {
    await this.mutateGlobal((current) => ({
      mobileObjects: [
        ...current.mobileObjects.filter((mobile) => mobile.id !== mobileObject.id),
        mobileObject,
      ],
    }));
  }

  async updateGlobalMobileObject(objectId: string, updatedObject: MobileObject): Promise<void> {
    await this.mutateGlobal((current) => ({
      mobileObjects: current.mobileObjects.map((mobile) =>
        mobile.id === objectId ? updatedObject : mobile
      ),
    }));
  }

  async removeGlobalMobileObject(objectId: string): Promise<void> {
    await this.mutateGlobal((current) => ({
      mobileObjects: current.mobileObjects.filter((mobile) => mobile.id !== objectId),
    }));
  }

  async updateGlobalGrids(grids: Grid[]): Promise<void> {
    await this.mutateGlobal(() => ({ grids }));
  }

  async updateGlobalActiveGrid(activeGridId: string | null): Promise<void> {
    await this.mutateGlobal(() => ({ activeGridId }));
  }

  subscribeToGlobalWorld(callback: (state: GlobalWorldDoc | null) => void): () => void {
    return this.subscribe(`${GLOBAL_COLLECTION}/${GLOBAL_ID}`, (message) => {
      callback(message.data ? (reviveTimestamps(message.data) as GlobalWorldDoc) : null);
    });
  }

  async getGlobalWorldState(): Promise<GlobalWorldDoc | null> {
    return this.getGlobalDoc();
  }
}
