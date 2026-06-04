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

async function createAlephAcusmaticoProject() {
    console.log('🏗️ Regenerando "El Aleph Acusmático" como PROYECTO...');

    try {
        const objects = [];
        const mobileObjects = [];
        const effectZones = [];

        // 1. Objeto Central: Icosaedro (FM Synth)
        objects.push({
            id: 'icosaedro-central',
            type: 'icosahedron', // El Icosahedro se mapea a Tone.MetalSynth percusivo en SoundSourceFactory
            position: [0, 5, 0],
            rotation: [0, 0, 0],
            scale: [4, 4, 4],
            audioEnabled: true,
            isSelected: false,
            audioParams: {
                frequency: 110, // A2
                waveform: 'sine',
                volume: -6,
                color: "#ff00ff", // Magenta intenso
                metalness: 0.9,
                roughness: 0.1,
                opacity: 0.85,
                blendingMode: 'AdditiveBlending',
                harmonicity: 5.1,
                modulationIndex: 64 // Altos índices para FM rica
            }
        });

        // Para añadir profundidad FM, agregaremos Dodecahedros Rings concéntricos
        objects.push({
            id: 'ring-interior',
            type: 'dodecahedronRing',
            position: [0, 5, 0],
            rotation: [Math.PI / 4, 0, 0],
            scale: [6, 6, 6],
            audioEnabled: true,
            isSelected: false,
            audioParams: {
                frequency: 220, // A3
                waveform: 'triangle',
                volume: -10,
                color: "#00ffff", // Cyan
                metalness: 0.5,
                roughness: 0.5,
                opacity: 0.5,
                blendingMode: 'AdditiveBlending'
            }
        });

        objects.push({
            id: 'ring-exterior',
            type: 'dodecahedronRing',
            position: [0, 5, 0],
            rotation: [-Math.PI / 4, Math.PI / 2, 0],
            scale: [8, 8, 8],
            audioEnabled: true,
            isSelected: false,
            audioParams: {
                frequency: 55, // A1
                waveform: 'square',
                volume: -14,
                color: "#4a00e0", // Violeta profundo
                metalness: 0.2,
                roughness: 0.8,
                opacity: 0.3,
                blendingMode: 'AdditiveBlending'
            }
        });

        // 2. Objetos Móviles orbitando en patrón Polar
        mobileObjects.push({
            id: 'luna-1',
            type: 'mobile',
            position: [10, 5, 0], // Starting pos
            rotation: [0, 0, 0],
            scale: [0.5, 0.5, 0.5],
            isSelected: false,
            mobileParams: {
                movementType: 'polar',
                speed: 1.5,
                radius: 12, // Orbita ancha
                centerPosition: [0, 5, 0]
            }
        });

        mobileObjects.push({
            id: 'luna-2',
            type: 'mobile',
            position: [-8, 7, 0],
            rotation: [0, 0, 0],
            scale: [0.8, 0.8, 0.8],
            isSelected: false,
            mobileParams: {
                movementType: 'polar',
                speed: 0.8, // Velocidad asíncrona
                radius: 10,
                centerPosition: [0, 5, 0]
            }
        });

        // 3. Zona de Efecto: Freeverb Masivo
        effectZones.push({
            id: 'aleph-reverb',
            name: 'Reverberación Divina',
            position: [0, 5, 0],
            scale: [30, 30, 30], // Cubre toda el área orbital
            shape: 'sphere',
            type: 'Freeverb',
            color: '#8e2de2',
            isSelected: false,
            isLocked: false,
            parameters: {
                roomSize: 0.95, // Reverb inmenso
                dampening: 2000,
                wet: 0.8
            }
        });

        // Crear Grid
        const gridData = {
            id: 'grid_aleph_01',
            coordinates: [0, 0, 0],
            position: [0, 0, 0],
            objects: objects,
            mobileObjects: mobileObjects,
            effectZones: effectZones,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        // Crear objeto Project
        const projectData = {
            name: "2. El Aleph Acusmatico",
            description: "La No-separación: Objeto Sonoro Digital Híbrido orbitado por lunas.",
            grids: [gridData],
            activeGridId: 'grid_aleph_01',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, 'projects'), projectData);
        console.log(`✅ Proyecto "El Aleph Acusmático" RE-CREADO con ID: ${docRef.id}`);
        process.exit(0);
    } catch (e) {
        console.error("Error al generar:", e);
        process.exit(1);
    }
}

createAlephAcusmaticoProject();
