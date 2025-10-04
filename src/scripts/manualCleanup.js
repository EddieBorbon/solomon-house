/**
 * Script para limpiar manualmente los datos de Firestore
 * Ejecutar en la consola del navegador cuando estés en la aplicación
 */

// Función para limpiar el mundo global
async function cleanupGlobalWorld() {
  try {
    console.log('🧹 Iniciando limpieza del mundo global...');
    
    // Obtener referencia al documento del mundo global
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('../lib/firebase.ts');
    
    const globalWorldRef = doc(db, 'globalWorldState', 'main');
    
    // Limpiar todos los arrays
    await updateDoc(globalWorldRef, {
      objects: [],
      effectZones: [],
      mobileObjects: [],
      grids: [],
      activeGridId: null
    });
    
    console.log('✅ Mundo global limpiado exitosamente');
    
  } catch (error) {
    console.error('❌ Error limpiando mundo global:', error);
  }
}

// Función para limpiar proyectos
async function cleanupProjects() {
  try {
    console.log('🧹 Iniciando limpieza de proyectos...');
    
    const { collection, getDocs, deleteDoc } = await import('firebase/firestore');
    const { db } = await import('../lib/firebase.ts');
    
    const projectsRef = collection(db, 'projects');
    const snapshot = await getDocs(projectsRef);
    
    console.log(`📦 Encontrados ${snapshot.size} proyectos`);
    
    const deletePromises = [];
    snapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    
    console.log('✅ Todos los proyectos eliminados');
    
  } catch (error) {
    console.error('❌ Error limpiando proyectos:', error);
  }
}

// Función para limpiar cuadrículas
async function cleanupGrids() {
  try {
    console.log('🧹 Iniciando limpieza de cuadrículas...');
    
    const { collection, getDocs, deleteDoc } = await import('firebase/firestore');
    const { db } = await import('../lib/firebase.ts');
    
    const gridsRef = collection(db, 'grids');
    const snapshot = await getDocs(gridsRef);
    
    console.log(`📦 Encontradas ${snapshot.size} cuadrículas`);
    
    const deletePromises = [];
    snapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    
    console.log('✅ Todas las cuadrículas eliminadas');
    
  } catch (error) {
    console.error('❌ Error limpiando cuadrículas:', error);
  }
}

// Función principal de limpieza
async function fullCleanup() {
  console.log('🚀 Iniciando limpieza completa de Firestore...');
  
  await cleanupGlobalWorld();
  await cleanupProjects();
  await cleanupGrids();
  
  console.log('🎉 Limpieza completa finalizada');
  console.log('💡 Recarga la página para ver los cambios');
}

// Hacer las funciones disponibles globalmente
window.cleanupGlobalWorld = cleanupGlobalWorld;
window.cleanupProjects = cleanupProjects;
window.cleanupGrids = cleanupGrids;
window.fullCleanup = fullCleanup;

console.log('🔧 Scripts de limpieza cargados. Usa:');
console.log('  - fullCleanup() para limpieza completa');
console.log('  - cleanupGlobalWorld() para limpiar solo el mundo global');
console.log('  - cleanupProjects() para limpiar solo proyectos');
console.log('  - cleanupGrids() para limpiar solo cuadrículas');



