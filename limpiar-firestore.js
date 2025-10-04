// SCRIPT SIMPLE PARA LIMPIAR FIRESTORE
// Copia y pega esto en la consola del navegador

console.log('🚀 Iniciando limpieza de Firestore...');

// Función para limpiar usando la instancia de Firebase ya cargada
async function limpiarFirestore() {
  try {
    // Usar la instancia de Firebase que ya está cargada en la página
    const { doc, updateDoc, collection, getDocs, deleteDoc } = await import('firebase/firestore');
    
    // Obtener la instancia de db desde el módulo firebase
    const { db } = await import('./src/lib/firebase.ts');
    
    console.log('📡 Conectado a Firestore');
    
    // Limpiar mundo global
    try {
      const globalRef = doc(db, 'globalWorldState', 'main');
      await updateDoc(globalRef, {
        objects: [],
        effectZones: [],
        mobileObjects: [],
        grids: [],
        activeGridId: null
      });
      console.log('✅ Mundo global limpiado');
    } catch (e) {
      console.log('ℹ️ Mundo global ya limpio');
    }
    
    // Limpiar proyectos
    try {
      const projectsRef = collection(db, 'projects');
      const projects = await getDocs(projectsRef);
      for (const project of projects.docs) {
        await deleteDoc(project.ref);
      }
      console.log(`✅ ${projects.size} proyectos eliminados`);
    } catch (e) {
      console.log('ℹ️ Proyectos ya limpios');
    }
    
    // Limpiar cuadrículas
    try {
      const gridsRef = collection(db, 'grids');
      const grids = await getDocs(gridsRef);
      for (const grid of grids.docs) {
        await deleteDoc(grid.ref);
      }
      console.log(`✅ ${grids.size} cuadrículas eliminadas`);
    } catch (e) {
      console.log('ℹ️ Cuadrículas ya limpias');
    }
    
    console.log('🎉 ¡LIMPIEZA COMPLETADA!');
    console.log('💡 Recarga la página ahora');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar la limpieza
limpiarFirestore();



