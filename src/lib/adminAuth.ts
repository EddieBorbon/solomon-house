import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth } from './firebase';

/**
 * Administración con Firebase Auth (Google).
 *
 * El admin es una cuenta concreta; firestore.rules aplica la misma
 * comprobación en el servidor, así que esto en el cliente solo decide qué
 * mostrar: la protección real (bloquear/desbloquear/borrar proyectos) la
 * hacen las reglas.
 */
export const ADMIN_EMAIL = 'eddieyogar@gmail.com';

export function isAdminUser(user: User | null): boolean {
  return Boolean(user && user.emailVerified && user.email?.toLowerCase() === ADMIN_EMAIL);
}

/** Abre el login de Google si hace falta. Resuelve true si quedó autenticado el admin. */
export async function signInAsAdmin(): Promise<boolean> {
  if (isAdminUser(auth.currentUser)) return true;
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ login_hint: ADMIN_EMAIL, prompt: 'select_account' });
    const { user } = await signInWithPopup(auth, provider);
    if (isAdminUser(user)) return true;
    // Cuenta equivocada: no dejar sesiones de no-admin abiertas
    await signOut(auth);
    return false;
  } catch {
    return false;
  }
}

export async function signOutAdmin(): Promise<void> {
  if (auth.currentUser) await signOut(auth);
}

/** ID token del admin para rutas protegidas del servidor (Authorization: Bearer). */
export async function getAdminIdToken(): Promise<string | null> {
  return isAdminUser(auth.currentUser) ? auth.currentUser!.getIdToken() : null;
}

export function onAdminChange(callback: (isAdmin: boolean) => void): () => void {
  return onAuthStateChanged(auth, (user) => callback(isAdminUser(user)));
}
