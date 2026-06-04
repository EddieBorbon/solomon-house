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

async function createAutosonificacionProject() {
    console.log('🏗️ Generando "Autosonificación" como PROYECTO...');

    try {
        const objects = [];
        const mobileObjects = [];
        const effectZones = [];

        // 1. Campo Denso de "Hierba" (Pirámides pequeñas mapeadas a MonoSynth)
        // Generaremos un grid de 5x5 con pequeñas variaciones de altura y escala
        const fieldSize = 5;
        const spacing = 3;
        const colorPalette = ["#8fbc8f", "#9acd32", "#6b8e23", "#556b2f", "#2e8b57"]; // Tonos verdes herbáceos

        let objCounter = 0;
        for (let x = -fieldSize; x <= fieldSize; x += spacing) {
            for (let z = -fieldSize; z <= fieldSize; z += spacing) {
                const randomOffset = (Math.random() - 0.5) * 1.5;
                const height = 0.5 + Math.random() * 1.5;
                const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];

                // Distribución estocástica de afinaciones para simular materialidad crujiente
                // MonoSynth es bueno para ataques percusivos si se configura bien, pero aquí la base será un dron muy agudo y tenue.
                const freq = 600 + (Math.random() * 1000); // 600Hz a 1600Hz

                objects.push({
                    id: `hierba-${objCounter++}`,
                    type: 'pyramid', // MonoSynth
                    position: [x + randomOffset, height / 2, z + randomOffset],
                    rotation: [0, Math.random() * Math.PI, 0],
                    scale: [0.3, height, 0.3], // Formas puntiagudas como hierba
                    audioEnabled: true, // Audio base encendido pero muy bajo
                    isSelected: false,
                    audioParams: {
                        frequency: freq,
                        waveform: 'sawtooth',
                        volume: -30, // Dron base casi inaudible (como viento)
                        color: color,
                        metalness: 0.1,
                        roughness: 0.9, // Material áspero
                        opacity: 0.9,
                        blendingMode: 'NormalBlending'
                    }
                });
            }
        }

        // 2. Enjambre de Objetos Móviles caóticos (como insectos/chispas reaccionando a la presencia)
        for (let i = 0; i < 6; i++) {
            mobileObjects.push({
                id: `enjambre-${i}`,
                type: 'mobile',
                position: [(Math.random() - 0.5) * 8, 1, (Math.random() - 0.5) * 8],
                rotation: [0, 0, 0],
                scale: [0.2, 0.2, 0.2],
                isSelected: false,
                mobileParams: {
                    movementType: 'random',
                    speed: 4 + Math.random() * 3, // Muy rápidos
                    radius: 8, // Se mantienen dentro del campo 5x5 (aprox 10x10)
                    centerPosition: [0, 1, 0]
                }
            });
        }

        // 3. Múltiples Zonas de PingPongDelay pequeñas para que el usuario active "ráfagas" espacializadas
        const delayPositions = [
            [-3, 1, -3], [3, 1, 3], [-3, 1, 3], [3, 1, -3], [0, 1, 0]
        ];

        delayPositions.forEach((pos, idx) => {
            effectZones.push({
                id: `delay-zone-${idx}`,
                name: `Eco Herbáceo ${idx + 1}`,
                position: pos,
                scale: [5, 4, 5], // Zonas intersecantes
                shape: 'sphere',
                type: 'PingPongDelay',
                color: '#ffeb3b', // Amarillo polen / luz
                isSelected: false,
                isLocked: false,
                parameters: {
                    delayTime: 0.15 + (Math.random() * 0.2), // Delays muy cortos y nerviosos
                    feedback: 0.5 + (Math.random() * 0.3), // Muchas repeticiones
                    wet: 0.7
                }
            });
        });

        // Crear Grid
        const gridData = {
            id: 'grid_autosonificacion_01',
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
            name: "Autosonificación (La Presencia Material)",
            description: "Campo denso iterativo con enjambre caótico y micro-delays (PingPong).",
            grids: [gridData],
            activeGridId: 'grid_autosonificacion_01',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, 'projects'), projectData);
        console.log(`✅ Proyecto "Autosonificación" creado con ID: ${docRef.id}`);
        process.exit(0);
    } catch (e) {
        console.error("Error al generar:", e);
        process.exit(1);
    }
}

createAutosonificacionProject();
