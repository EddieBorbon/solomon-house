import { firebaseService, type FirebaseProject, type GalleryMetadata } from '../firebaseService';
import { persistenceService } from '../persistenceService';
import { useWorldStore } from '../../state/useWorldStore';
import { useAdminAuthStore } from '../../state/useAdminAuthStore';

/**
 * Plantilla de Despliegue para Residencias Artísticas Virtuales (roadmap 8.5).
 *
 * Arquitectura de cuartos persistentes: un artista invitado publica su
 * lienzo como "galería de esculturas sonoras" (proyecto persistente con
 * metadatos de autoría y declaración artística), visitable por el público
 * de forma asíncrona en `/galeria/<id>` — modo solo-escucha: el mundo
 * global se desconecta, la edición queda bloqueada y se contabiliza la
 * visita.
 */

/** Publica el lienzo actual como galería persistente; devuelve su id. */
export async function publishCurrentWorldAsGallery(
  title: string,
  artist: string,
  statement: string
): Promise<string> {
  const projectId = await persistenceService.saveCurrentWorldAsProject(
    title,
    `Galería de ${artist}`
  );

  const gallery: GalleryMetadata = {
    artist,
    statement,
    publishedAt: new Date().toISOString(),
    visits: 0,
  };
  await firebaseService.updateProject(projectId, { gallery });

  return projectId;
}

/** Lista los cuartos publicados como galería (más recientes primero). */
export async function listGalleries(): Promise<FirebaseProject[]> {
  const projects = await firebaseService.loadAllProjects();
  return projects.filter((project) => project.gallery);
}

/**
 * Entra a una galería en modo visitante: carga el cuarto persistente,
 * desconecta el lienzo colaborativo y bloquea la edición. Devuelve el
 * proyecto con sus metadatos de galería.
 */
export async function visitGallery(projectId: string): Promise<FirebaseProject> {
  const project = await firebaseService.loadProject(projectId);
  if (!project || !project.gallery) {
    throw new Error('La galería no existe o fue retirada');
  }

  // Modo visitante: sin mundo global y sin edición
  useWorldStore.getState().setGlobalWorldConnected(false);
  await persistenceService.loadProject(projectId);
  useAdminAuthStore.getState().lockEditing();

  // Registrar la visita (mejor esfuerzo: no bloquear la experiencia)
  firebaseService
    .updateProject(projectId, {
      gallery: { ...project.gallery, visits: (project.gallery.visits || 0) + 1 },
    })
    .catch(() => {});

  return project;
}
