'use client';

import { useState, useEffect } from 'react';
import { persistenceService } from '../../lib/persistenceService';
import { useWorldStore } from '../../state/useWorldStore';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';
import { useTutorialStore } from '../../stores/useTutorialStore';
import type { FirebaseProject } from '../../lib/firebaseService';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

export function PersistencePanel() {
  const { isActive: isTutorialActive, currentStep } = useTutorialStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [projects, setProjects] = useState<FirebaseProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminDialogAction, setAdminDialogAction] = useState<'lock' | 'unlock' | 'delete' | null>(null);
  const [adminDialogProjectId, setAdminDialogProjectId] = useState<string | null>(null);
  const [adminDialogPassword, setAdminDialogPassword] = useState('');

  const { grids, currentProjectId, setCurrentProjectId, isEditingLocked, isAdminAuthenticated, unlockEditing, setGlobalWorldConnected } = useWorldStore();
  const { isConnected } = useRealtimeSync(currentProjectId);
  const { t } = useLanguage();

  // Cargar proyectos al montar el componente
  useEffect(() => {
    loadProjects();
  }, []);

  // Expandir automáticamente el panel de persistencia en el paso 12 del tutorial
  useEffect(() => {
    if (isTutorialActive && currentStep === 11) { // Step 12 is index 11
      setIsExpanded(true);
    }
  }, [isTutorialActive, currentStep]);

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
      alert(t('persistence.noProjectName'));
      return;
    }

    try {
      setIsLoading(true);
      // Desactivar el mundo global antes de guardar el proyecto
      const { setGlobalWorldConnected } = useWorldStore.getState();
      setGlobalWorldConnected(false);
      
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
      alert(t('persistence.errorSaving'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      // Desactivar el mundo global antes de cargar el proyecto
      const { setGlobalWorldConnected } = useWorldStore.getState();
      setGlobalWorldConnected(false);
      
      await persistenceService.loadProject(projectId);
      setCurrentProjectId(projectId);
      setShowLoadDialog(false);
      
    } catch {
      alert(t('persistence.errorLoading'));
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
      alert(t('persistence.errorUpdating'));
    } finally {
      setIsLoading(false);
    }
  };

  // const handleDeleteProject = async (projectId: string) => {
  //   if (!confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
  //     return;
  //   }

  //   try {
  //     setIsLoading(true);
  //     await persistenceService.deleteProject(projectId);
  //     await loadProjects(); // Recargar la lista de proyectos
      
  //     if (currentProjectId === projectId) {
  //       setCurrentProjectId(null);
  //     }
      
  //   } catch {
  //     alert('Error al eliminar el proyecto. Inténtalo de nuevo.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleCreateNewProject = async () => {
    if (!projectName.trim()) {
      alert(t('persistence.noProjectName'));
      return;
    }

    try {
      setIsLoading(true);
      // Desactivar el mundo global antes de crear el proyecto
      setGlobalWorldConnected(false);
      
      // Crear un proyecto vacío (con una cuadrícula vacía)
      const projectId = await persistenceService.createEmptyProject(
        projectName.trim(),
        projectDescription.trim() || undefined
      );
      
      setCurrentProjectId(projectId);
      setShowCreateDialog(false);
      setProjectName('');
      setProjectDescription('');
      await loadProjects(); // Recargar la lista de proyectos
      
      // Cargar el proyecto recién creado
      await persistenceService.loadProject(projectId);
      
    } catch {
      alert(t('persistence.errorCreating'));
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
  
  const handleAdminAction = async () => {
    if (!adminDialogProjectId || !adminDialogAction) return;
    
    try {
      setIsLoading(true);
      let success = false;
      
      if (adminDialogAction === 'lock') {
        success = await persistenceService.lockProject(adminDialogProjectId, adminDialogPassword);
      } else if (adminDialogAction === 'unlock') {
        success = await persistenceService.unlockProject(adminDialogProjectId, adminDialogPassword);
      } else if (adminDialogAction === 'delete') {
        success = await persistenceService.deleteProjectWithPassword(adminDialogProjectId, adminDialogPassword);
      }
      
      if (success) {
        await loadProjects(); // Recargar la lista de proyectos
        
        // Si se eliminó el proyecto y era el actual, limpiar currentProjectId
        if (adminDialogAction === 'delete' && currentProjectId === adminDialogProjectId) {
          setCurrentProjectId(null);
        }
        
        setShowAdminDialog(false);
        setAdminDialogAction(null);
        setAdminDialogProjectId(null);
        setAdminDialogPassword('');
        
        alert(
          adminDialogAction === 'lock' ? 'Proyecto bloqueado correctamente.' :
          adminDialogAction === 'unlock' ? 'Proyecto desbloqueado correctamente.' :
          'Proyecto eliminado correctamente.'
        );
      } else {
        alert('Contraseña incorrecta.');
        setAdminDialogPassword('');
      }
    } catch (error) {
      alert('Error al realizar la acción. Inténtalo de nuevo.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
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
            title={isExpanded ? t('persistence.hideMenu') : t('persistence.showMenu')}
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
                    {isConnected ? t('persistence.syncActive') : t('persistence.noSync')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Botones futuristas */}
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setShowCreateDialog(true)}
              disabled={isLoading}
              className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black disabled:border-gray-600 disabled:text-gray-500 transition-all duration-300 group"
            >
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white group-disabled:border-gray-700 transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider flex items-center justify-center space-x-1">
                <span>➕</span>
                <span>{t('persistence.new')}</span>
              </span>
            </button>

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
                <span>{t('controls.load')}</span>
              </span>
            </button>
          </div>

          {currentProjectId && (
            <>
              <button
                onClick={handleUpdateProject}
                disabled={isLoading || (isEditingLocked && !isAdminAuthenticated)}
                className="relative w-full border border-white px-2 py-1 text-white hover:bg-white hover:text-black disabled:border-gray-600 disabled:text-gray-500 transition-all duration-300 group"
              >
                <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white group-disabled:border-gray-700 transition-colors duration-300"></div>
                <span className="relative text-xs font-mono tracking-wider flex items-center justify-center space-x-1">
                  <span>🔄</span>
                  <span>{t('persistence.update')}</span>
                </span>
              </button>
            </>
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
                    <label className="block text-xs text-gray-400 mb-1 font-mono tracking-wider">{t('persistence.projectName')}</label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full px-2 py-1 bg-black text-white border border-gray-600 focus:border-white focus:outline-none text-sm font-mono"
                      placeholder="MY_PROJECT"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-mono tracking-wider">{t('persistence.description')}</label>
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
                    <span className="relative text-xs font-mono tracking-wider">{t('persistence.cancel')}</span>
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
                
                <h3 className="text-sm font-mono font-bold text-white tracking-wider mb-4">{t('persistence.loadProject')}</h3>
                
                {isLoading ? (
                  <div className="text-center text-gray-400 font-mono tracking-wider">{t('controls.loadingProjects')}</div>
                ) : projects.length === 0 ? (
                  <div className="text-center text-gray-400 font-mono tracking-wider">{t('controls.noSavedProjects')}</div>
                ) : (
                  <div className="space-y-2">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className={`p-3 border transition-colors ${
                          project.isLocked ? 'border-red-600' : 'border-gray-600 hover:border-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="text-white font-mono text-sm tracking-wider">{project.name}</div>
                              {project.isLocked && (
                                <span className="text-xs text-red-400 font-mono">🔒 BLOQUEADO</span>
                              )}
                            </div>
                            {project.description && (
                              <div className="text-xs text-gray-400 font-mono">{project.description}</div>
                            )}
                            <div className="text-xs text-gray-500 font-mono">
                              {project.grids.length} {t('persistence.grids')}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleLoadProject(project.id)}
                              disabled={project.isLocked}
                              className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black disabled:border-gray-600 disabled:text-gray-500 transition-all duration-300 group"
                            >
                              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white group-disabled:border-gray-700 transition-colors duration-300"></div>
                              <span className="relative text-xs font-mono tracking-wider">{t('controls.load')}</span>
                            </button>
                            {/* Botones de admin */}
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setAdminDialogAction(project.isLocked ? 'unlock' : 'lock');
                                  setAdminDialogProjectId(project.id);
                                  setAdminDialogPassword('');
                                  setShowAdminDialog(true);
                                }}
                                className={`relative border px-1 py-0.5 text-xs font-mono tracking-wider transition-all duration-300 group ${
                                  project.isLocked
                                    ? 'border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black'
                                    : 'border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black'
                                }`}
                                title={project.isLocked ? 'Desbloquear proyecto (Admin)' : 'Bloquear proyecto (Admin)'}
                              >
                                <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300 pointer-events-none"></div>
                                <span className="relative z-10">{project.isLocked ? '🔓' : '🔒'}</span>
                              </button>
                              <button
                                onClick={() => {
                                  setAdminDialogAction('delete');
                                  setAdminDialogProjectId(project.id);
                                  setAdminDialogPassword('');
                                  setShowAdminDialog(true);
                                }}
                                className="relative border border-red-500 px-1 py-0.5 text-red-400 hover:bg-red-500 hover:text-black transition-all duration-300 group text-xs"
                                title="Eliminar proyecto (Admin)"
                              >
                                <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300 pointer-events-none"></div>
                                <span className="relative z-10">🗑️</span>
                              </button>
                            </div>
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
                    <span className="relative text-xs font-mono tracking-wider">{t('persistence.close')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Diálogo de crear nuevo proyecto */}
          {showCreateDialog && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="relative bg-black border border-white p-6 w-80">
                {/* Decoraciones de esquina */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white"></div>
                
                <h3 className="text-sm font-mono font-bold text-white tracking-wider mb-4">{t('persistence.createNew')}</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-mono tracking-wider">{t('persistence.projectName')}</label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full px-2 py-1 bg-black text-white border border-gray-600 focus:border-white focus:outline-none text-sm font-mono"
                      placeholder="MY_NEW_PROJECT"
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-mono tracking-wider">{t('persistence.description')}</label>
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
                    onClick={handleCreateNewProject}
                    disabled={isLoading || !projectName.trim()}
                    className="relative flex-1 border border-white px-3 py-2 text-white hover:bg-white hover:text-black disabled:border-gray-600 disabled:text-gray-500 transition-all duration-300 group"
                  >
                    <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white group-disabled:border-gray-700 transition-colors duration-300"></div>
                    <span className="relative text-xs font-mono tracking-wider">
                      {isLoading ? t('persistence.creating') : t('persistence.create')}
                    </span>
                  </button>
                  <button
                    onClick={() => setShowCreateDialog(false)}
                    className="relative flex-1 border border-white px-3 py-2 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                  >
                    <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                    <span className="relative text-xs font-mono tracking-wider">{t('persistence.cancel')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Diálogo para desbloquear edición con contraseña */}
          {showUnlockDialog && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="relative bg-black border border-white p-6 w-80">
                {/* Decoraciones de esquina */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white"></div>
                
                <h3 className="text-sm font-mono font-bold text-white tracking-wider mb-4">DESBLOQUEAR EDICIÓN</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-mono tracking-wider">Contraseña de Administrador</label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const success = unlockEditing(adminPassword);
                          if (success) {
                            setShowUnlockDialog(false);
                            setAdminPassword('');
                            alert('Edición desbloqueada correctamente.');
                          } else {
                            alert('Contraseña incorrecta.');
                            setAdminPassword('');
                          }
                        }
                      }}
                      className="w-full px-2 py-1 bg-black text-white border border-gray-600 focus:border-white focus:outline-none text-sm font-mono"
                      placeholder="Ingresa la contraseña"
                      autoFocus
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const success = unlockEditing(adminPassword);
                        if (success) {
                          setShowUnlockDialog(false);
                          setAdminPassword('');
                          alert('Edición desbloqueada correctamente.');
                        } else {
                          alert('Contraseña incorrecta.');
                          setAdminPassword('');
                        }
                      }}
                      className="relative flex-1 border border-white px-3 py-2 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                    >
                      <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300 pointer-events-none"></div>
                      <span className="relative text-xs font-mono tracking-wider">DESBLOQUEAR</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUnlockDialog(false);
                        setAdminPassword('');
                      }}
                      className="relative flex-1 border border-gray-600 px-3 py-2 text-gray-400 hover:border-white hover:text-white transition-all duration-300 group"
                    >
                      <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300 pointer-events-none"></div>
                      <span className="relative text-xs font-mono tracking-wider">CANCELAR</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Diálogo para acciones de admin (bloquear/desbloquear/eliminar proyecto) */}
          {showAdminDialog && adminDialogAction && adminDialogProjectId && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="relative bg-black border border-white p-6 w-80">
                {/* Decoraciones de esquina */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white"></div>
                
                <h3 className="text-sm font-mono font-bold text-white tracking-wider mb-4">
                  {adminDialogAction === 'lock' && 'BLOQUEAR PROYECTO'}
                  {adminDialogAction === 'unlock' && 'DESBLOQUEAR PROYECTO'}
                  {adminDialogAction === 'delete' && 'ELIMINAR PROYECTO'}
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-mono tracking-wider">
                      Contraseña de Administrador
                    </label>
                    <input
                      type="password"
                      value={adminDialogPassword}
                      onChange={(e) => setAdminDialogPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAdminAction();
                        }
                      }}
                      className="w-full px-2 py-1 bg-black text-white border border-gray-600 focus:border-white focus:outline-none text-sm font-mono"
                      placeholder="Ingresa la contraseña"
                      autoFocus
                    />
                  </div>
                  
                  {adminDialogAction === 'delete' && (
                    <div className="p-2 border border-red-500 bg-red-500/10">
                      <p className="text-xs text-red-400 font-mono">
                        ⚠️ Esta acción eliminará permanentemente el proyecto. No se puede deshacer.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleAdminAction}
                      className={`relative flex-1 border px-3 py-2 text-white hover:bg-white hover:text-black transition-all duration-300 group text-xs font-mono tracking-wider ${
                        adminDialogAction === 'delete' ? 'border-red-500' : 'border-white'
                      }`}
                    >
                      <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300 pointer-events-none"></div>
                      <span className="relative">
                        {adminDialogAction === 'lock' && 'BLOQUEAR'}
                        {adminDialogAction === 'unlock' && 'DESBLOQUEAR'}
                        {adminDialogAction === 'delete' && 'ELIMINAR'}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAdminDialog(false);
                        setAdminDialogAction(null);
                        setAdminDialogProjectId(null);
                        setAdminDialogPassword('');
                      }}
                      className="relative flex-1 border border-gray-600 px-3 py-2 text-gray-400 hover:border-white hover:text-white transition-all duration-300 group text-xs font-mono tracking-wider"
                    >
                      <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300 pointer-events-none"></div>
                      <span className="relative">CANCELAR</span>
                    </button>
                  </div>
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
