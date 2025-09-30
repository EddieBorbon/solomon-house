'use client';

import { useState, useEffect } from 'react';
import { persistenceService } from '../../lib/persistenceService';
import { useWorldStore } from '../../state/useWorldStore';
import { useGridStore } from '../../stores/useGridStore';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';
import type { FirebaseProject } from '../../lib/firebaseService';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

export function PersistencePanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [projects, setProjects] = useState<FirebaseProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  const { currentProjectId, setCurrentProjectId } = useWorldStore();
  const { grids } = useGridStore();
  const { isConnected } = useRealtimeSync(currentProjectId);
  const { t } = useLanguage();

  // Cargar proyectos al montar el componente
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const loadedProjects = await persistenceService.loadAllProjects();
      setProjects(loadedProjects);
    } catch {
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
      
    } catch {
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
      
    } catch {
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
      
    } catch {
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
      
    } catch {
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
    <div className="mb-4 relative">
      {/* Contenedor con borde complejo */}
      <div className="relative border border-white p-3">
        {/* Decoraciones de esquina */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
        
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-2">
            <CloudArrowUpIcon className="w-3 h-3" />
            {t('controls.persistence')}
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
            title={isExpanded ? "Ocultar menú" : "Mostrar menú"}
          >
            <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
            <span className="relative text-xs font-mono tracking-wider">
                {isExpanded ? t('controls.hide') : t('controls.show')}
            </span>
          </button>
        </div>
      
      {isExpanded && (
        <div className="space-y-2">
          {/* Información compacta del estado actual */}
          <div className="p-2 border border-gray-600 text-xs text-gray-300 font-mono">
            <div className="space-y-1">
              <p><span className="text-white">{t('controls.gridsCount')}</span> {getGridCount()}</p>
              <p><span className="text-white">{t('controls.objectsCount')}</span> {getObjectCount()}</p>
              {currentProjectId && (
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    isConnected ? 'bg-white animate-pulse' : 'bg-gray-500'
                  }`} />
                  <span className="text-xs font-mono tracking-wider">
                    {isConnected ? 'SYNC_ACTIVE' : 'NO_SYNC'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Botones futuristas */}
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setShowSaveDialog(true)}
              disabled={isLoading}
              className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black disabled:border-gray-600 disabled:text-gray-500 transition-all duration-300 group"
            >
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white group-disabled:border-gray-700 transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider flex items-center justify-center space-x-1">
                <CloudArrowUpIcon className="w-3 h-3" />
                <span>{t('controls.save')}</span>
              </span>
            </button>

            <button
              onClick={() => setShowLoadDialog(true)}
              disabled={isLoading}
              className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black disabled:border-gray-600 disabled:text-gray-500 transition-all duration-300 group"
            >
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white group-disabled:border-gray-700 transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider flex items-center justify-center space-x-1">
                <span>📂</span>
                <span>LOAD</span>
              </span>
            </button>
          </div>

          {currentProjectId && (
            <button
              onClick={handleUpdateProject}
              disabled={isLoading}
              className="relative w-full border border-white px-2 py-1 text-white hover:bg-white hover:text-black disabled:border-gray-600 disabled:text-gray-500 transition-all duration-300 group"
            >
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white group-disabled:border-gray-700 transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider flex items-center justify-center space-x-1">
                <span>🔄</span>
                <span>UPDATE_PROJECT</span>
              </span>
            </button>
          )}

          {/* Diálogo de guardar */}
          {showSaveDialog && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="relative bg-black border border-white p-6 w-80">
                {/* Decoraciones de esquina */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white"></div>
                
                <h3 className="text-sm font-mono font-bold text-white tracking-wider mb-4">{t('controls.saveProject')}</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-mono tracking-wider">PROJECT_NAME</label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full px-2 py-1 bg-black text-white border border-gray-600 focus:border-white focus:outline-none text-sm font-mono"
                      placeholder="MY_PROJECT"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-mono tracking-wider">DESCRIPTION</label>
                    <textarea
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      className="w-full px-2 py-1 bg-black text-white border border-gray-600 focus:border-white focus:outline-none text-sm font-mono"
                      placeholder="PROJECT_DESCRIPTION..."
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={handleSaveProject}
                    disabled={isLoading || !projectName.trim()}
                    className="relative flex-1 border border-white px-3 py-2 text-white hover:bg-white hover:text-black disabled:border-gray-600 disabled:text-gray-500 transition-all duration-300 group"
                  >
                    <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white group-disabled:border-gray-700 transition-colors duration-300"></div>
                    <span className="relative text-xs font-mono tracking-wider">
                      {isLoading ? t('controls.saving') : t('controls.save')}
                    </span>
                  </button>
                  <button
                    onClick={() => setShowSaveDialog(false)}
                    className="relative flex-1 border border-white px-3 py-2 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                  >
                    <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                    <span className="relative text-xs font-mono tracking-wider">CANCEL</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Diálogo de cargar */}
          {showLoadDialog && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="relative bg-black border border-white p-6 w-96 max-h-96 overflow-y-auto">
                {/* Decoraciones de esquina */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white"></div>
                
                <h3 className="text-sm font-mono font-bold text-white tracking-wider mb-4">LOAD_PROJECT</h3>
                
                {isLoading ? (
                  <div className="text-center text-gray-400 font-mono tracking-wider">{t('controls.loadingProjects')}</div>
                ) : projects.length === 0 ? (
                  <div className="text-center text-gray-400 font-mono tracking-wider">{t('controls.noSavedProjects')}</div>
                ) : (
                  <div className="space-y-2">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="p-3 border border-gray-600 hover:border-white transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-white font-mono text-sm tracking-wider">{project.name}</div>
                            {project.description && (
                              <div className="text-xs text-gray-400 font-mono">{project.description}</div>
                            )}
                            <div className="text-xs text-gray-500 font-mono">
                              {project.grids.length} GRIDS
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleLoadProject(project.id)}
                              className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                            >
                              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                              <span className="relative text-xs font-mono tracking-wider">LOAD</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                            >
                              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                              <span className="relative text-xs font-mono tracking-wider">DELETE</span>
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
                    className="relative border border-white px-4 py-2 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                  >
                    <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                    <span className="relative text-xs font-mono tracking-wider">CLOSE</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
