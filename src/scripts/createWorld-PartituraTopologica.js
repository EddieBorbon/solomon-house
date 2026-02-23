import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Use the correct world ID (must be the one currently active or create a new one)
// We will generate the 3rd sculpture in a new world ID just for it
const WORLD_ID = "partitura-topologica-003";

async function clearWorld() {
    console.log(`Clearing existing data for ${WORLD_ID}...`);
    const objectsRef = collection(db, 'worlds', WORLD_ID, 'objects');
    const objectsSnap = await getDocs(objectsRef);
    const deletePromises = [];
    objectsSnap.forEach(doc => {
        deletePromises.push(deleteDoc(doc.ref));
    });

    const mobileObjectsRef = collection(db, 'worlds', WORLD_ID, 'mobileObjects');
    const mobileObjectsSnap = await getDocs(mobileObjectsRef);
    mobileObjectsSnap.forEach(doc => {
        deletePromises.push(deleteDoc(doc.ref));
    });

    const effectZonesRef = collection(db, 'worlds', WORLD_ID, 'effectZones');
    const effectZonesSnap = await getDocs(effectZonesRef);
    effectZonesSnap.forEach(doc => {
        deletePromises.push(deleteDoc(doc.ref));
    });

    await Promise.all(deletePromises);
    console.log('Cleanup complete.');
}

async function createPartituraTopologica() {
    console.log('Creating "La Partitura Topologica"...');

    // Create world doc
    await setDoc(doc(db, 'worlds', WORLD_ID), {
        name: "3. La Partitura Topológica",
        createdAt: Date.now(),
        lastModified: Date.now()
    });

    const objectsRef = collection(db, 'worlds', WORLD_ID, 'objects');
    const effectZonesRef = collection(db, 'worlds', WORLD_ID, 'effectZones');

    // CONCEPTO: "La Forma-Laberinto" y el "Tiempo Espacializado". El usuario compone al caminar.
    // ESTRUCTURA: Un pasillo largo o una secuencia de estaciones que el usuario debe atravesar físicamente.
    // BASE SONORA: Diferentes SoundCylinders a lo largo del camino, afinados en una progresión.

    // Progresión armónica lenta (Ej: Modo Lidio en Do: C, D, E, F#, G, A, B)
    // Usaremos frecuencias bajas y ricas.
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

    const hallwayLength = 40; // Largo del pasillo
    const spacing = hallwayLength / harmonicProgression.length;

    // Crear cilindros (Estaciones del pasillo)
    for (let i = 0; i < harmonicProgression.length; i++) {
        const station = harmonicProgression[i];
        const zPos = -20 + (i * spacing); // Distribuir a lo largo del eje Z (-20 a +20)

        // Pila de anillos o columnas a cada lado del camino
        // Lado Izquierdo
        await addDoc(objectsRef, {
            type: 'cylinder',
            position: [-4, 2, zPos],
            rotation: [Math.PI / 2, 0, 0], // Orientacion como anillos
            scale: [1, 0.5, 1], // Discos
            audioEnabled: true,
            audioParams: {
                frequency: station.freq,
                waveform: 'sawtooth',
                volume: -12,
                color: station.col,
                metalness: 0.8,
                roughness: 0.2,
                opacity: 0.9,
                blendingMode: 'NormalBlending',
                harmonicity: 1.5 + (i * 0.1),
                vibratoAmount: 0.2,
                vibratoRate: 3
            },
            gridId: '0,0,0',
            createdAt: Date.now(),
            lastModified: Date.now()
        });

        // Lado Derecho
        await addDoc(objectsRef, {
            type: 'cylinder',
            position: [4, 2, zPos],
            rotation: [Math.PI / 2, 0, 0], // Orientacion como anillos
            scale: [1, 0.5, 1],
            audioEnabled: true,
            audioParams: {
                frequency: station.freq * 1.01, // Ligeramente desafinado para stereo spread
                waveform: 'triangle',
                volume: -12,
                color: station.col,
                metalness: 0.8,
                roughness: 0.2,
                opacity: 0.9,
                blendingMode: 'NormalBlending',
                harmonicity: 1.5 + (i * 0.1),
                vibratoAmount: 0.2,
                vibratoRate: 3.1
            },
            gridId: '0,0,0',
            createdAt: Date.now(),
            lastModified: Date.now()
        });

        // Añadir conos decorativos por encima del camino en cada estación
        await addDoc(objectsRef, {
            type: 'cone',
            position: [0, 8, zPos],
            rotation: [Math.PI, 0, 0], // Apuntando hacia abajo
            scale: [1, 2, 1],
            audioEnabled: true,
            audioParams: {
                frequency: station.freq * 2, // Una octava arriba
                waveform: 'sine',
                volume: -18,
                color: '#ffffff',
                metalness: 1,
                roughness: 0,
                opacity: 0.5,
                blendingMode: 'AdditiveBlending'
            },
            gridId: '0,0,0',
            createdAt: Date.now(),
            lastModified: Date.now()
        });

        // Crear Zona de Efecto (AutoFilter) intersecando cada tramo
        // De manera que el usuario camina a través de diferentes cortes de filtro
        const filterTypes = ['lowpass', 'highpass', 'bandpass'];
        await addDoc(effectZonesRef, {
            name: `Filtro Estación ${i + 1}`,
            position: [0, 2, zPos + (spacing / 2)], // Entre cada columna
            scale: [12, 10, spacing], // Cubre el pasillo transversalmente
            shape: 'box',
            type: 'AutoFilter',
            color: station.col,
            parameters: {
                frequency: 1 + (i * 0.5), // LFO de filtro más rápido conforme avanzas
                baseFrequency: 200 * (i + 1), // Rango sube
                octaves: 2 + (i % 3),
                filterType: filterTypes[i % 3], // Alternar baja/alta
                Q: 2 + i,
                wet: 0.8
            }
        });
    }

    // Effect Zone adicional: Un 'Tremolo' largo para todo el pasillo para dar pulso unificado
    await addDoc(effectZonesRef, {
        name: "Pulso del Laberinto",
        position: [0, 2, 0],
        scale: [20, 10, 50], // Cubre todo el pasillo
        shape: 'box',
        type: 'Tremolo',
        color: '#ff00ff',
        parameters: {
            frequency: 0.5,
            depth: 0.6,
            spread: 180,
            wet: 0.5
        }
    });

    console.log('"La Partitura Topológica" created successfully!');
    process.exit(0);
}

clearWorld().then(createPartituraTopologica).catch(console.error);
