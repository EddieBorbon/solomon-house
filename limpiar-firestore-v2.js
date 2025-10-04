// SCRIPT CORREGIDO PARA LIMPIAR FIRESTORE
// Este script usa la instancia de Firebase que ya está cargada en la página

console.log('🚀 Iniciando limpieza de Firestore...');

// Función para limpiar usando la instancia global de Firebase
async function limpiarFirestore() {
  try {
    // Buscar la instancia de Firebase en el objeto global
    let firebaseApp = null;
    let db = null;
    
    // Intentar diferentes formas de acceder a Firebase
    if (window.firebase) {
      firebaseApp = window.firebase;
      db = firebaseApp.firestore();
    } else if (window.firebaseApp) {
      firebaseApp = window.firebaseApp;
      db = firebaseApp.firestore();
    } else {
      // Buscar en el objeto global
      for (const key in window) {
        if (window[key] && typeof window[key] === 'object' && window[key].firestore) {
          firebaseApp = window[key];
          db = firebaseApp.firestore();
          break;
        }
      }
    }
    
    if (!db) {
      console.error('❌ No se pudo encontrar la instancia de Firebase');
      console.log('🔧 Solución alternativa: Ve a https://console.firebase.google.com/');
      console.log('   1. Selecciona tu proyecto solomonhouse-5f528');
      console.log('   2. Ve a Firestore Database');
      console.log('   3. Elimina manualmente las colecciones: globalWorldState, projects, grids');
      return;
    }
    
    console.log('📡 Conectado a Firestore');
    
    // Limpiar mundo global
    try {
      const globalRef = db.collection('globalWorldState').doc('main');
      await globalRef.update({
        objects: [],
        effectZones: [],
        mobileObjects: [],
        grids: [],
        activeGridId: null
      });
      console.log('✅ Mundo global limpiado');
    } catch (e) {
      console.log('ℹ️ Mundo global ya limpio o no existe');
    }
    
    // Limpiar proyectos
    try {
      const projectsSnapshot = await db.collection('projects').get();
      if (!projectsSnapshot.empty) {
        const batch = db.batch();
        projectsSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`✅ ${projectsSnapshot.size} proyectos eliminados`);
      } else {
        console.log('ℹ️ No hay proyectos para eliminar');
      }
    } catch (e) {
      console.log('ℹ️ Error limpiando proyectos:', e.message);
    }
    
    // Limpiar cuadrículas
    try {
      const gridsSnapshot = await db.collection('grids').get();
      if (!gridsSnapshot.empty) {
        const batch = db.batch();
        gridsSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`✅ ${gridsSnapshot.size} cuadrículas eliminadas`);
      } else {
        console.log('ℹ️ No hay cuadrículas para eliminar');
      }
    } catch (e) {
      console.log('ℹ️ Error limpiando cuadrículas:', e.message);
    }
    
    console.log('🎉 ¡LIMPIEZA COMPLETADA!');
    console.log('💡 Recarga la página ahora');
    
    // Crear botón para recargar
    const reloadBtn = document.createElement('button');
    reloadBtn.textContent = '🔄 Recargar Página';
    reloadBtn.style.cssText = `
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
    reloadBtn.onclick = () => window.location.reload();
    document.body.appendChild(reloadBtn);
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('🔧 Solución alternativa: Ve a https://console.firebase.google.com/');
    console.log('   1. Selecciona tu proyecto solomonhouse-5f528');
    console.log('   2. Ve a Firestore Database');
    console.log('   3. Elimina manualmente las colecciones: globalWorldState, projects, grids');
  }
}

// Ejecutar la limpieza
limpiarFirestore();



