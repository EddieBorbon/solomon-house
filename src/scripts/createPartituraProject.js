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

async function createPartituraTopologicaAsProject() {
    console.log('🏗️ Generando "La Partitura Topológica" como PROYECTO...');

    try {
        const objects = [];
        const effectZones = [];

        // Progresión armónica lenta (Modo Lidio en Do)
        const harmonicProgression = [
            { freq: 130.81, col: "#00a896" }, // C3
            { freq: 146.83, col: "#00b4d8" }, // D3
            { freq: 164.81, col: "#0077b6" }, // E3
            { freq: 185.00, col: "#03045e" }, // F#3
            { freq: 196.00, col: "#48cae4" }, // G3
            { freq: 220.00, col: "#90e0ef" }, // A3
            { freq: 246.94, col: "#ade8f4" }, // B3
            { freq: 261.63, col: "#caf0f8" }  // C4
        ];

        const hallwayLength = 40;
        const spacing = hallwayLength / harmonicProgression.length;

        for (let i = 0; i < harmonicProgression.length; i++) {
            const station = harmonicProgression[i];
            const zPos = -20 + (i * spacing);

            // Columna Izquierda
            objects.push({
                id: `cyl-left-${i}`,
                type: 'cylinder',
                position: [-4, 2, zPos],
                rotation: [Math.PI / 2, 0, 0],
                scale: [1, 0.5, 1],
                audioEnabled: true,
                isSelected: false,
                audioParams: { frequency: station.freq, waveform: 'sawtooth', volume: -12, color: station.col, metalness: 0.8, roughness: 0.2, opacity: 0.9, blendingMode: 'NormalBlending', harmonicity: 1.5 + (i * 0.1), vibratoAmount: 0.2, vibratoRate: 3 }
            });

            // Columna Derecha
            objects.push({
                id: `cyl-right-${i}`,
                type: 'cylinder',
                position: [4, 2, zPos],
                rotation: [Math.PI / 2, 0, 0],
                scale: [1, 0.5, 1],
                audioEnabled: true,
                isSelected: false,
                audioParams: { frequency: station.freq * 1.01, waveform: 'triangle', volume: -12, color: station.col, metalness: 0.8, roughness: 0.2, opacity: 0.9, blendingMode: 'NormalBlending', harmonicity: 1.5 + (i * 0.1), vibratoAmount: 0.2, vibratoRate: 3.1 }
            });

            // Cono Central Arriba
            objects.push({
                id: `cone-top-${i}`,
                type: 'cone',
                position: [0, 8, zPos],
                rotation: [Math.PI, 0, 0],
                scale: [1, 2, 1],
                audioEnabled: true,
                isSelected: false,
                audioParams: { frequency: station.freq * 2, waveform: 'sine', volume: -18, color: '#ffffff', metalness: 1, roughness: 0, opacity: 0.5, blendingMode: 'AdditiveBlending' }
            });

            // Zonas de Efecto
            const filterTypes = ['lowpass', 'highpass', 'bandpass'];
            effectZones.push({
                id: `filter-${i}`,
                name: `Filtro Estación ${i + 1}`,
                position: [0, 2, zPos + (spacing / 2)],
                scale: [12, 10, spacing],
                shape: 'box',
                type: 'AutoFilter',
                color: station.col,
                isSelected: false,
                isLocked: false,
                parameters: { frequency: 1 + (i * 0.5), baseFrequency: 200 * (i + 1), octaves: 2 + (i % 3), filterType: filterTypes[i % 3], Q: 2 + i, wet: 0.8 }
            });
        }

        // Tremolo Global
        effectZones.push({
            id: 'global-tremolo',
            name: "Pulso del Laberinto",
            position: [0, 2, 0],
            scale: [20, 10, 50],
            shape: 'box',
            type: 'Tremolo',
            color: '#ff00ff',
            isSelected: false,
            isLocked: false,
            parameters: { frequency: 0.5, depth: 0.6, spread: 180, wet: 0.5 }
        });

        // Crear Grid inicial compatible con FirebaseGrid
        const gridData = {
            id: 'grid_partitura_01',
            coordinates: [0, 0, 0],
            position: [0, 0, 0],
            objects: objects,
            mobileObjects: [],
            effectZones: effectZones,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        // Crear objeto Project
        const projectData = {
            name: "3. La Partitura Topologica",
            description: "Mundo Laberinto: Progresión armónica C Lydian con AutoFilters",
            grids: [gridData],
            activeGridId: 'grid_partitura_01',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, 'projects'), projectData);
        console.log(`✅ Proyecto "La Partitura Topológica" creado con ID: ${docRef.id}`);
        process.exit(0);
    } catch (e) {
        console.error("Error al generar:", e);
        process.exit(1);
    }
}

createPartituraTopologicaAsProject();
