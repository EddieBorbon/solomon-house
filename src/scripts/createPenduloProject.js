const { initializeApp } = require('firebase/app');
const { getFirestore, addDoc, collection, Timestamp } = require('firebase/firestore');

// Hardcoded Firebase Config for Node Context execution
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

async function createPenduloProject() {
    console.log('🏗️ Generando "El Péndulo de la Relacionalidad" como PROYECTO...');

    try {
        const objects = [];
        const mobileObjects = [];
        const effectZones = [];

        // 1. Esfera Izquierda - Frecuencia Base
        objects.push({
            id: 'esfera-izq',
            type: 'sphere', // Mapea a FMSynth, pero usemos 'sine' waveform para tonos puros
            position: [-6, 6, 0],
            rotation: [0, 0, 0],
            scale: [4, 4, 4],
            audioEnabled: true,
            isSelected: false,
            audioParams: {
                frequency: 200, // G3 aprox
                waveform: 'sine',
                volume: -8,
                color: "#ff5733", // Naranja cálido
                metalness: 0.8,
                roughness: 0.1,
                opacity: 0.9,
                blendingMode: 'NormalBlending',
                modulationIndex: 0, // Minimizar modulación FM para que suene puro
                harmonicity: 1
            }
        });

        // 2. Esfera Derecha - Frecuencia Ligeramente Desfasada (Batimento de 5Hz)
        objects.push({
            id: 'esfera-der',
            type: 'sphere',
            position: [6, 6, 0],
            rotation: [0, 0, 0],
            scale: [4, 4, 4],
            audioEnabled: true,
            isSelected: false,
            audioParams: {
                frequency: 205, // 5Hz diferencia para batimentos
                waveform: 'sine',
                volume: -8,
                color: "#33bbff", // Azul complementario
                metalness: 0.8,
                roughness: 0.1,
                opacity: 0.9,
                blendingMode: 'NormalBlending',
                modulationIndex: 0,
                harmonicity: 1
            }
        });

        // 3. Objeto Móvil en patrón "figure8"
        mobileObjects.push({
            id: 'pendulo-movil',
            type: 'mobile',
            position: [0, 6, 0],
            rotation: [0, 0, 0],
            scale: [0.8, 0.8, 0.8],
            isSelected: false,
            mobileParams: {
                movementType: 'figure8',
                speed: 1.2,
                radius: 10,
                centerPosition: [0, 6, 0]
            }
        });

        // 4. Zona de Efecto: Chorus masivo para acentuar el movimiento estéreo
        effectZones.push({
            id: 'chorus-pendulo',
            name: 'Coro Proxémico',
            position: [0, 6, 0],
            scale: [24, 15, 10], // Cubre el espacio entre y alrededor de las esferas
            shape: 'box',
            type: 'Chorus',
            color: '#ffffff',
            isSelected: false,
            isLocked: false,
            parameters: {
                frequency: 1.5,
                delayTime: 3.5,
                depth: 0.7,
                spread: 180,
                wet: 0.6
            }
        });

        // Crear Grid
        const gridData = {
            id: 'grid_pendulo_01',
            coordinates: [0, 0, 0],
            position: [0, 0, 0],
            objects: objects,
            mobileObjects: mobileObjects,
            effectZones: effectZones,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        // Crear objeto Project sin el número en el título
        const projectData = {
            name: "El Péndulo de la Relacionalidad (Proxémica Digital)",
            description: "Batimentos binaurales vía desfasaje frecuencial. Objeto en forma de 8 cruza el estéreo.",
            grids: [gridData],
            activeGridId: 'grid_pendulo_01',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, 'projects'), projectData);
        console.log(`✅ Proyecto "El Péndulo" creado con ID: ${docRef.id}`);
        process.exit(0);
    } catch (e) {
        console.error("Error al generar:", e);
        process.exit(1);
    }
}

createPenduloProject();
