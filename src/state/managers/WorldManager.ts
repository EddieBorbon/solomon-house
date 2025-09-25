/**
 * Manager para manejar mundos
 * Responsabilidad única: Gestión completa de mundos
 */
export class WorldManager {
  private worlds: Array<{ id: string; name: string }> = [];
  private currentWorldId: string | null = null;

  constructor() {
    // Inicializar con el mundo por defecto
    this.worlds = [{ id: 'default', name: 'Default World' }];
    this.currentWorldId = 'default';
  }

  /**
   * Crea un nuevo mundo
   */
  public createWorld(name: string): { id: string; name: string } {
    const newWorld = {
      id: `world_${Date.now()}`,
      name: name
    };
    
    this.worlds.push(newWorld);
    this.currentWorldId = newWorld.id;
    
    return newWorld;
  }

  /**
   * Elimina un mundo
   */
  public deleteWorld(id: string): boolean {
    if (id === 'default') {
      return false; // No se puede eliminar el mundo por defecto
    }
    
    const initialLength = this.worlds.length;
    this.worlds = this.worlds.filter(w => w.id !== id);
    
    // Si se eliminó el mundo actual, cambiar al mundo por defecto
    if (this.currentWorldId === id) {
      this.currentWorldId = 'default';
    }
    
    return this.worlds.length < initialLength;
  }

  /**
   * Cambia al mundo especificado
   */
  public switchWorld(id: string): boolean {
    const world = this.worlds.find(w => w.id === id);
    
    if (world) {
      this.currentWorldId = id;
      return true;
    }
    
    return false;
  }

  /**
   * Obtiene el mundo actual
   */
  public getCurrentWorld(): { id: string; name: string } | null {
    return this.worlds.find(w => w.id === this.currentWorldId) || null;
  }

  /**
   * Obtiene todos los mundos
   */
  public getAllWorlds(): Array<{ id: string; name: string }> {
    return [...this.worlds];
  }

  /**
   * Obtiene un mundo por ID
   */
  public getWorldById(id: string): { id: string; name: string } | null {
    return this.worlds.find(w => w.id === id) || null;
  }

  /**
   * Obtiene el ID del mundo actual
   */
  public getCurrentWorldId(): string | null {
    return this.currentWorldId;
  }

  /**
   * Valida si un nombre de mundo es válido
   */
  public validateWorldName(name: string): boolean {
    return (
      typeof name === 'string' &&
      name.trim().length > 0 &&
      name.trim().length <= 50 &&
      !this.worlds.some(w => w.name.toLowerCase() === name.toLowerCase())
    );
  }

  /**
   * Renombra un mundo
   */
  public renameWorld(id: string, newName: string): boolean {
    if (!this.validateWorldName(newName)) {
      return false;
    }
    
    const world = this.worlds.find(w => w.id === id);
    if (world) {
      world.name = newName.trim();
      return true;
    }
    
    return false;
  }

  /**
   * Duplica un mundo
   */
  public duplicateWorld(id: string, newName?: string): { id: string; name: string } | null {
    const world = this.worlds.find(w => w.id === id);
    if (!world) {
      return null;
    }
    
    const duplicateName = newName || `${world.name} (Copy)`;
    return this.createWorld(duplicateName);
  }

  /**
   * Exporta la configuración de un mundo
   */
  public exportWorld(id: string): string | null {
    const world = this.worlds.find(w => w.id === id);
    if (!world) {
      return null;
    }
    
    return JSON.stringify({
      id: world.id,
      name: world.name,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  /**
   * Importa la configuración de un mundo
   */
  public importWorld(worldData: string): { id: string; name: string } | null {
    try {
      const data = JSON.parse(worldData);
      
      if (!data.name || typeof data.name !== 'string') {
        return null;
      }
      
      return this.createWorld(data.name);
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtiene estadísticas de mundos
   */
  public getWorldStats(): {
    totalWorlds: number;
    currentWorldName: string;
    defaultWorldExists: boolean;
  } {
    const currentWorld = this.getCurrentWorld();
    
    return {
      totalWorlds: this.worlds.length,
      currentWorldName: currentWorld?.name || 'Unknown',
      defaultWorldExists: this.worlds.some(w => w.id === 'default')
    };
  }

  /**
   * Limpia todos los mundos excepto el por defecto
   */
  public clearAllWorlds(): void {
    this.worlds = [{ id: 'default', name: 'Default World' }];
    this.currentWorldId = 'default';
  }

  /**
   * Verifica si un mundo existe
   */
  public worldExists(id: string): boolean {
    return this.worlds.some(w => w.id === id);
  }

  /**
   * Obtiene el siguiente mundo disponible
   */
  public getNextWorld(): { id: string; name: string } | null {
    const currentIndex = this.worlds.findIndex(w => w.id === this.currentWorldId);
    const nextIndex = (currentIndex + 1) % this.worlds.length;
    
    return this.worlds[nextIndex] || null;
  }

  /**
   * Obtiene el mundo anterior
   */
  public getPreviousWorld(): { id: string; name: string } | null {
    const currentIndex = this.worlds.findIndex(w => w.id === this.currentWorldId);
    const previousIndex = currentIndex === 0 ? this.worlds.length - 1 : currentIndex - 1;
    
    return this.worlds[previousIndex] || null;
  }
}
