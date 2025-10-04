/**
 * SCRIPT DE LIMPIEZA DE FIRESTORE
 * 
 * INSTRUCCIONES:
 * 1. Abre la aplicación en el navegador
 * 2. Abre la consola del navegador (F12 → Console)
 * 3. Copia y pega TODO este código
 * 4. Presiona Enter para ejecutar
 * 5. Espera a que aparezca "✅ Limpieza completada"
 * 6. Recarga la página
 */

(async function cleanupFirestore() {
  console.log('🚀 Iniciando limpieza de Firestore...');
  
  try {
    // Importar funciones de Firebase
    const { doc, updateDoc, collection, getDocs, deleteDoc } = await import('firebase/firestore');
    
    // Obtener la instancia de Firestore
    const { db } = await import('./src/lib/firebase.ts');
    
    console.log('📡 Conectado a Firestore');
    
    // 1. Limpiar mundo global
    console.log('🧹 Limpiando mundo global...');
    try {
      const globalWorldRef = doc(db, 'globalWorldState', 'main');
      await updateDoc(globalWorldRef, {
        objects: [],
        effectZones: [],
        mobileObjects: [],
        grids: [],
        activeGridId: null
      });
      console.log('✅ Mundo global limpiado');
    } catch (error) {
      console.log('ℹ️ Mundo global ya estaba limpio o no existe');
    }
    
    // 2. Limpiar proyectos
    console.log('🧹 Limpiando proyectos...');
    try {
      const projectsRef = collection(db, 'projects');
      const projectsSnapshot = await getDocs(projectsRef);
      
      if (projectsSnapshot.size > 0) {
        console.log(`📦 Eliminando ${projectsSnapshot.size} proyectos...`);
        const deletePromises = projectsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        console.log('✅ Proyectos eliminados');
      } else {
        console.log('ℹ️ No hay proyectos para eliminar');
      }
    } catch (error) {
      console.log('ℹ️ Error limpiando proyectos:', error.message);
    }
    
    // 3. Limpiar cuadrículas
    console.log('🧹 Limpiando cuadrículas...');
    try {
      const gridsRef = collection(db, 'grids');
      const gridsSnapshot = await getDocs(gridsRef);
      
      if (gridsSnapshot.size > 0) {
        console.log(`📦 Eliminando ${gridsSnapshot.size} cuadrículas...`);
        const deletePromises = gridsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        console.log('✅ Cuadrículas eliminadas');
      } else {
        console.log('ℹ️ No hay cuadrículas para eliminar');
      }
    } catch (error) {
      console.log('ℹ️ Error limpiando cuadrículas:', error.message);
    }
    
    console.log('🎉 ¡LIMPIEZA COMPLETADA EXITOSAMENTE!');
    console.log('💡 Ahora recarga la página para continuar');
    
    // Mostrar botón para recargar
    const reloadButton = document.createElement('button');
    reloadButton.textContent = '🔄 Recargar Página';
    reloadButton.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #4CAF50;
      color: white;
      border: none;
      padding: 15px 30px;
      font-size: 16px;
      border-radius: 8px;
      cursor: pointer;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    reloadButton.onclick = () => window.location.reload();
    document.body.appendChild(reloadButton);
    
    // Auto-remover el botón después de 10 segundos
    setTimeout(() => {
      if (reloadButton.parentNode) {
        reloadButton.parentNode.removeChild(reloadButton);
      }
    }, 10000);
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    console.log('🔧 Soluciones alternativas:');
    console.log('1. Ve a https://console.firebase.google.com/');
    console.log('2. Selecciona tu proyecto solomonhouse-5f528');
    console.log('3. Ve a Firestore Database');
    console.log('4. Elimina manualmente las colecciones: globalWorldState, projects, grids');
  }
})();



