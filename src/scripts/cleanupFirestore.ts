/**
 * Script para limpiar datos de Firestore y liberar cuota
 * Ejecutar en la consola del navegador o como script independiente
 */

import { firebaseService } from '../lib/firebaseService';

export async function cleanupFirestore() {
  try {
    console.log('🧹 Iniciando limpieza de Firestore...');
    
    // Limpiar el mundo global
    await firebaseService.updateGlobalWorldState({
      objects: [],
      effectZones: [],
      mobileObjects: [],
      grids: [],
      activeGridId: null
    });
    
    console.log('✅ Mundo global limpiado');
    
    // Obtener todos los proyectos y eliminarlos
    const projects = await firebaseService.loadAllProjects();
    console.log(`📦 Encontrados ${projects.length} proyectos`);
    
    for (const project of projects) {
      await firebaseService.deleteProject(project.id);
      console.log(`🗑️ Proyecto eliminado: ${project.name}`);
    }
    
    console.log('✅ Limpieza completada');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  }
}

// Función para ejecutar desde la consola del navegador
(window as any).cleanupFirestore = cleanupFirestore;



