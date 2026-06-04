const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');

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

const WORLD_ID = "partitura-topologica-003";

async function createPartituraTopologica() {
    console.log('🏗️ Generando "La Partitura Topológica" en el mundo actual...');

    try {
        await setDoc(doc(db, 'worlds', WORLD_ID), {
            name: "3. La Partitura Topológica",
            createdAt: Date.now(),
            lastModified: Date.now()
        });

        const objectsRef = collection(db, 'worlds', WORLD_ID, 'objects');
        const effectZonesRef = collection(db, 'worlds', WORLD_ID, 'effectZones');

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
            await addDoc(objectsRef, {
                type: 'cylinder',
                position: [-4, 2, zPos],
                rotation: [Math.PI / 2, 0, 0],
                scale: [1, 0.5, 1],
                audioEnabled: true,
                audioParams: { frequency: station.freq, waveform: 'sawtooth', volume: -12, color: station.col, metalness: 0.8, roughness: 0.2, opacity: 0.9, blendingMode: 'NormalBlending', harmonicity: 1.5 + (i * 0.1), vibratoAmount: 0.2, vibratoRate: 3 },
                gridId: '0,0,0', createdAt: Date.now(), lastModified: Date.now()
            });

            // Columna Derecha
            await addDoc(objectsRef, {
                type: 'cylinder',
                position: [4, 2, zPos],
                rotation: [Math.PI / 2, 0, 0],
                scale: [1, 0.5, 1],
                audioEnabled: true,
                audioParams: { frequency: station.freq * 1.01, waveform: 'triangle', volume: -12, color: station.col, metalness: 0.8, roughness: 0.2, opacity: 0.9, blendingMode: 'NormalBlending', harmonicity: 1.5 + (i * 0.1), vibratoAmount: 0.2, vibratoRate: 3.1 },
                gridId: '0,0,0', createdAt: Date.now(), lastModified: Date.now()
            });

            // Cono Central Arriba
            await addDoc(objectsRef, {
                type: 'cone',
                position: [0, 8, zPos],
                rotation: [Math.PI, 0, 0],
                scale: [1, 2, 1],
                audioEnabled: true,
                audioParams: { frequency: station.freq * 2, waveform: 'sine', volume: -18, color: '#ffffff', metalness: 1, roughness: 0, opacity: 0.5, blendingMode: 'AdditiveBlending' },
                gridId: '0,0,0', createdAt: Date.now(), lastModified: Date.now()
            });

            // Zonas de Efecto
            const filterTypes = ['lowpass', 'highpass', 'bandpass'];
            await addDoc(effectZonesRef, {
                name: `Filtro Estación ${i + 1}`, position: [0, 2, zPos + (spacing / 2)], scale: [12, 10, spacing], shape: 'box', type: 'AutoFilter', color: station.col,
                parameters: { frequency: 1 + (i * 0.5), baseFrequency: 200 * (i + 1), octaves: 2 + (i % 3), filterType: filterTypes[i % 3], Q: 2 + i, wet: 0.8 }
            });
        }

        // Tremolo Global
        await addDoc(effectZonesRef, {
            name: "Pulso del Laberinto", position: [0, 2, 0], scale: [20, 10, 50], shape: 'box', type: 'Tremolo', color: '#ff00ff',
            parameters: { frequency: 0.5, depth: 0.6, spread: 180, wet: 0.5 }
        });

        console.log('✅ "La Partitura Topológica" generada exitosamente en Firebase.');
        process.exit(0);
    } catch (e) {
        console.error("Error al generar:", e);
        process.exit(1);
    }
}

createPartituraTopologica();
