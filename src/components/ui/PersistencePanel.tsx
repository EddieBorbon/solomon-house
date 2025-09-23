'use client';

import { useState, useEffect } from 'react';
import { persistenceService } from '../../lib/persistenceService';
import { useWorldStore } from '../../state/useWorldStore';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';
import type { FirebaseProject } from '../../lib/firebaseService';

export function PersistencePanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [projects, setProjects] = useState<FirebaseProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  const { grids, currentProjectId, setCurrentProjectId } = useWorldStore();
  const { isConnected, isSyncing, lastSyncTime, error } = useRealtimeSync(currentProjectId);

  // Cargar proyectos al montar el componente
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const loadedProjects = await persistenceService.loadAllProjects();
      setProjects(loadedProjects);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      alert('Por favor ingresa un nombre para el proyecto');
      return;
    }

    try {
      setIsLoading(true);
      const projectId = await persistenceService.saveCurrentWorldAsProject(
        projectName.trim(),
        projectDescription.trim() || undefined
      );
      
      setCurrentProjectId(projectId);
      setShowSaveDialog(false);
      setProjectName('');
      setProjectDescription('');
      await loadProjects(); // Recargar la lista de proyectos
      
      console.log('✅ Proyecto guardado exitosamente');
    } catch (error) {
      console.error('Error al guardar proyecto:', error);
      alert('Error al guardar el proyecto. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      await persistenceService.loadProject(projectId);
      setCurrentProjectId(projectId);
      setShowLoadDialog(false);
      
      console.log('✅ Proyecto cargado exitosamente');
    } catch (error) {
      console.error('Error al cargar proyecto:', error);
      alert('Error al cargar el proyecto. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProject = async () => {
    if (!currentProjectId) return;

    try {
      setIsLoading(true);
      await persistenceService.updateProject(
        currentProjectId,
        projectName.trim() || undefined,
        projectDescription.trim() || undefined
      );
      
      await loadProjects(); // Recargar la lista de proyectos
      
      console.log('✅ Proyecto actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
      alert('Error al actualizar el proyecto. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      return;
    }

    try {
      setIsLoading(true);
      await persistenceService.deleteProject(projectId);
      await loadProjects(); // Recargar la lista de proyectos
      
      if (currentProjectId === projectId) {
        setCurrentProjectId(null);
      }
      
      console.log('✅ Proyecto eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      alert('Error al eliminar el proyecto. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const getGridCount = () => {
    return grids.size;
  };

  const getObjectCount = () => {
    let totalObjects = 0;
    for (const [, grid] of grids) {
      totalObjects += grid.objects.length + grid.mobileObjects.length + grid.effectZones.length;
    }
    return totalObjects;
  };

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-white flex items-center gap-1">
          <span className="text-sm">💾</span>
          Persistencia
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:scale-110 p-1 rounded-lg hover:bg-cyan-500/20"
          title={isExpanded ? "Ocultar menú" : "Mostrar menú"}
        >
          {isExpanded ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>
      
      {isExpanded && (
        <div className="space-y-1">
          {/* Información compacta del estado actual */}
          <div className="p-2 bg-gray-800/50 border border-gray-600/50 rounded text-xs text-gray-300">
            <div>{getGridCount()} cuadrículas, {getObjectCount()} objetos</div>
            {currentProjectId && (
              <div className="flex items-center gap-1 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-xs">
                  {isConnected ? 'Sync activa' : 'Sin sync'}
                </span>
              </div>
            )}
          </div>

          {/* Botones compactos */}
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setShowSaveDialog(true)}
              disabled={isLoading}
              className="px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-xs transition-colors"
            >
              💾 Guardar
            </button>

            <button
              onClick={() => setShowLoadDialog(true)}
              disabled={isLoading}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-xs transition-colors"
            >
              📂 Cargar
            </button>
          </div>

          {currentProjectId && (
            <button
              onClick={handleUpdateProject}
              disabled={isLoading}
              className="w-full px-2 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded text-xs transition-colors"
            >
              🔄 Actualizar
            </button>
          )}

          {/* Diálogo de guardar */}
          {showSaveDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-600 w-80">
                <h3 className="text-sm font-semibold text-white mb-3">Guardar Proyecto</h3>
                
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-300 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-cyan-500 focus:outline-none text-sm"
                      placeholder="Mi Proyecto"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-300 mb-1">Descripción</label>
                    <textarea
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-cyan-500 focus:outline-none text-sm"
                      placeholder="Descripción..."
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex space-x-1 mt-3">
                  <button
                    onClick={handleSaveProject}
                    disabled={isLoading || !projectName.trim()}
                    className="flex-1 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm transition-colors"
                  >
                    {isLoading ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => setShowSaveDialog(false)}
                    className="flex-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Diálogo de cargar */}
          {showLoadDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-600 w-96 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-semibold text-white mb-4">Cargar Proyecto</h3>
                
                {isLoading ? (
                  <div className="text-center text-gray-400">Cargando proyectos...</div>
                ) : projects.length === 0 ? (
                  <div className="text-center text-gray-400">No hay proyectos guardados</div>
                ) : (
                  <div className="space-y-2">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="p-3 bg-gray-700 rounded border border-gray-600 hover:border-cyan-500 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-white font-medium">{project.name}</div>
                            {project.description && (
                              <div className="text-sm text-gray-400">{project.description}</div>
                            )}
                            <div className="text-xs text-gray-500">
                              {project.grids.length} cuadrículas
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleLoadProject(project.id)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                            >
                              Cargar
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setShowLoadDialog(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
