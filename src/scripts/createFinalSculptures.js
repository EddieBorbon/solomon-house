const { initializeApp } = require('firebase/app');
const { getFirestore, addDoc, collection, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyBxbFqLXt5ir-Vnbl0H_tX-RwiV1v5hTpE",
    authDomain: "solomonhouse-5f528.firebaseapp.com",
    projectId: "solomonhouse-5f528",
    storageBucket: "solomonhouse-5f528.firebasestorage.app",
    messagingSenderId: "479726159678",
    appId: "1:479726159678:web:8ca0239ef048be1b644e6f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function injectProject(projectData) {
    try {
        const docRef = await addDoc(collection(db, 'projects'), {
            ...projectData,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        console.log(`✅ Proyecto "${projectData.name}" inyectado con ID: ${docRef.id}`);
    } catch (e) {
        console.error(`❌ Error inyectando ${projectData.name}:`, e);
    }
}

async function createFinalSculptures() {
    console.log('🚀 Iniciando inyección masiva de esculturas 6-10...');

    // --- 6. LA MÁQUINA DIALÓGICA ---
    const machineObjects = [];
    const machineMobile = [];

    // Núcleo Central (Torus - PluckSynth/Bass)
    machineObjects.push({
        id: 'nucleo-dialógico',
        type: 'torus',
        position: [0, 5, 100], // Ubicado al fondo del eje Z
        rotation: [Math.PI / 2, 0, 0],
        scale: [6, 6, 2],
        audioEnabled: true,
        audioParams: {
            frequency: 40, // Sub-bass
            volume: 1.0,
            color: "#ff0000",
            metalness: 1,
            roughness: 0,
            opacity: 1,
            autoTrigger: true,
            autoTriggerMode: 'fixed',
            autoTriggerInterval: 2
        }
    });

    // Satélites en espiral
    for (let i = 0; i < 8; i++) {
        machineMobile.push({
            id: `dial-mobile-${i}`,
            type: 'mobile',
            position: [0, 5, 100],
            mobileParams: {
                movementType: 'spiral',
                speed: 0.5 + (i * 0.1),
                radius: 5 + (i * 2),
                centerPosition: [0, 5, 100]
            }
        });
    }

    const machineProject = {
        name: "La Máquina Dialógica (Performance Intersubjetiva)",
        description: "Núcleo de sub-graves rodeado por una espiral de interacción móvil.",
        grids: [{
            id: 'grid_dial_01',
            coordinates: [0, 0, 5],
            position: [0, 0, 100],
            objects: machineObjects,
            mobileObjects: machineMobile,
            effectZones: [{
                id: 'tremolo-dial',
                type: 'Tremolo',
                position: [0, 5, 100],
                scale: [40, 40, 40],
                shape: 'sphere',
                parameters: { frequency: 5, depth: 0.8, wet: 1 }
            }]
        }],
        activeGridId: 'grid_dial_01'
    };

    // --- 7. EL ARCHIVO GEOLÓGICO ---
    const geoObjects = [];
    for (let h = 0; h < 5; h++) {
        geoObjects.push({
            id: `estrato-${h}`,
            type: 'cylinder',
            position: [0, h * 4, -100],
            scale: [10 - h * 2, 2, 10 - h * 2],
            audioEnabled: true,
            audioParams: {
                frequency: 100 + (h * 50),
                volume: 1.0,
                color: "#8b4513",
                duration: 5 + h,
                opacity: 0.8
            }
        });
    }

    const geoProject = {
        name: "El Archivo Geológico (Acumulación Temporal)",
        description: "Estructura estratificada con drones de larga evolución vertical.",
        grids: [{
            id: 'grid_geo_01',
            coordinates: [0, 0, -5],
            position: [0, 0, -100],
            objects: geoObjects,
            mobileObjects: [{
                id: 'geo-elevator',
                type: 'mobile',
                position: [0, 0, -100],
                mobileParams: { movementType: 'circular', speed: 0.2, radius: 12, centerPosition: [0, 10, -100] }
            }],
            effectZones: []
        }],
        activeGridId: 'grid_geo_01'
    };

    // --- 8. EL NODO FEDERADO ---
    const nodeObjects = [];
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        nodeObjects.push({
            id: `nodo-${i}`,
            type: 'sphere',
            position: [Math.cos(angle) * 15, 10 + Math.sin(angle) * 5, 200],
            scale: [1.5, 1.5, 1.5],
            audioEnabled: true,
            audioParams: { frequency: 220 * (1 + (i % 3)), volume: 1.0, color: "#00ff00", autoTrigger: true, autoTriggerMode: 'random', autoTriggerMin: 1, autoTriggerMax: 5 }
        });
    }

    const nodeProject = {
        name: "El Nodo Federado (Sistema Descentralizado)",
        description: "Red dispersa de nodos resonantes con delay de realimentación.",
        grids: [{
            id: 'grid_node_01',
            coordinates: [0, 0, 10],
            position: [0, 0, 200],
            objects: nodeObjects,
            mobileObjects: [],
            effectZones: [{
                id: 'feedback-node',
                type: 'FeedbackDelay',
                position: [0, 10, 200],
                scale: [50, 50, 50],
                shape: 'box',
                parameters: { delayTime: 0.4, feedback: 0.8, wet: 0.5 }
            }]
        }],
        activeGridId: 'grid_node_01'
    };

    // --- 9. JARDÍN ESTOCÁSTICO ---
    const gardenObjects = [];
    for (let i = 0; i < 20; i++) {
        gardenObjects.push({
            id: `planta-${i}`,
            type: 'cone',
            position: [(Math.random() - 0.5) * 40, 0, -200 + (Math.random() - 0.5) * 40],
            scale: [0.5, 2 + Math.random() * 3, 0.5],
            audioEnabled: true,
            audioParams: { frequency: 440 + Math.random() * 880, volume: 1.0, color: "#ff00ff", waveform: 'triangle' }
        });
    }

    const gardenProject = {
        name: "Jardín Estocástico (Pedagogía Gamificada)",
        description: "Entorno floreciente que reacciona a la proximidad con filtros dinámicos.",
        grids: [{
            id: 'grid_garden_01',
            coordinates: [0, 0, -10],
            position: [0, 0, -200],
            objects: gardenObjects,
            mobileObjects: [],
            effectZones: [{
                id: 'autowah-garden',
                type: 'AutoFilter',
                position: [0, 0, -200],
                scale: [60, 20, 60],
                shape: 'box',
                parameters: { frequency: 2, baseFrequency: 200, octaves: 4, wet: 1 }
            }]
        }],
        activeGridId: 'grid_garden_01'
    };

    // --- 10. SILENCIO TOPOLÓGICO ---
    const silenceProject = {
        name: "Silencio Topológico (El Ma Digital)",
        description: "Vastedad minimalista. El sonido es el espacio.",
        grids: [{
            id: 'grid_silence_01',
            coordinates: [0, 0, 0],
            position: [0, 0, 500],
            objects: [{
                id: 'monolito-silencio',
                type: 'cube',
                position: [0, 25, 500],
                scale: [5, 50, 5],
                audioEnabled: true,
                audioParams: { frequency: 30, volume: 0.8, color: "#ffffff", opacity: 0.1 }
            }],
            mobileObjects: [{
                id: 'silence-drifter',
                type: 'mobile',
                position: [100, 50, 500],
                mobileParams: { movementType: 'circular', speed: 0.01, radius: 200, centerPosition: [0, 50, 500] }
            }],
            effectZones: []
        }],
        activeGridId: 'grid_silence_01'
    };

    // Inyectar todos
    await injectProject(machineProject);
    await injectProject(geoProject);
    await injectProject(nodeProject);
    await injectProject(gardenProject);
    await injectProject(silenceProject);

    console.log('🏁 Inyección finalizada.');
    process.exit(0);
}

createFinalSculptures();
