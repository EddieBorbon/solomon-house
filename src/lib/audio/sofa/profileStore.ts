/**
 * Persistencia local del perfil acústico SOFA (roadmap 4.3).
 *
 * Los archivos .sofa pesan entre cientos de KB y varios MB, por lo que se
 * guardan en IndexedDB (localStorage no admite binarios de ese tamaño).
 * El perfil nunca sale del navegador del usuario.
 */

const DB_NAME = 'solomon-house-hrtf';
const STORE_NAME = 'profiles';
const ACTIVE_KEY = 'active';

export interface StoredHrtfProfile {
  name: string;
  buffer: ArrayBuffer;
  savedAt: number;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveActiveProfile(name: string, buffer: ArrayBuffer): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const profile: StoredHrtfProfile = { name, buffer, savedAt: Date.now() };
    tx.objectStore(STORE_NAME).put(profile, ACTIVE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadActiveProfile(): Promise<StoredHrtfProfile | null> {
  const db = await openDatabase();
  const profile = await new Promise<StoredHrtfProfile | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(ACTIVE_KEY);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return profile;
}

export async function clearActiveProfile(): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(ACTIVE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
