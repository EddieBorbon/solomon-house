import app from '../firebase';
import { ADMIN_EMAIL } from '../adminAuth';

/**
 * Verifica en el servidor que la petición trae el ID token de Firebase del
 * admin (cabecera Authorization: Bearer <idToken>).
 *
 * Usa accounts:lookup de Identity Toolkit: Google valida firma, expiración y
 * revocación del token, sin necesidad de cuenta de servicio del Admin SDK.
 */
export async function isAdminRequest(request: Request): Promise<boolean> {
  const header = request.headers.get('authorization') || '';
  const idToken = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!idToken) return false;

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${app.options.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        cache: 'no-store',
      }
    );
    if (!response.ok) return false;
    const data = await response.json();
    const user = data?.users?.[0];
    return Boolean(user?.emailVerified && user?.email?.toLowerCase() === ADMIN_EMAIL);
  } catch {
    return false;
  }
}
