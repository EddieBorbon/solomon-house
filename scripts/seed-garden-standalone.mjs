
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

const firebaseConfig = {
    apiKey: "AIzaSyBxbFqLXt5ir-Vnbl0H_tX-RwiV1v5hTpE",
    authDomain: "solomonhouse-5f528.firebaseapp.com",
    projectId: "solomonhouse-5f528",
    storageBucket: "solomonhouse-5f528.firebasestorage.app",
    messagingSenderId: "479726159678",
    appId: "1:479726159678:web:8ca0239ef048be1b644e6f",
    measurementId: "G-JKEHV8PDEP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedGarden() {
    console.log('🎋 Creating Zen Garden (Nanjing Session) Project...');
    console.log('Spec: High processual complexity. 55% Effect Zones, 35% Sound, 10% Mobile.');

    try {
        const objects = [];
        const mobileObjects = [];
        const effectZones = [];

        // --- 1. Sound Objects (35% approx 7 objects) ---
        // Minimalist placement, bell-like tones
        const soundCount = 7;
        for (let i = 0; i < soundCount; i++) {
            const theta = (i / soundCount) * Math.PI * 2;
            const r = 6;
            objects.push({
                id: `garden-bell-${i}-${uuidv4()}`,
                type: 'sphere',
                position: [Math.cos(theta) * r, 1.5, Math.sin(theta) * r],
                rotation: [0, 0, 0],
                scale: [0.5, 0.5, 0.5],
                audioParams: {
                    frequency: 220 * Math.pow(1.5, i), // Pentatonic-ish stacking or Fifths
                    waveform: 'sine',
                    volume: 0.3,
                    detune: 0
                },
                isSelected: false,
                audioEnabled: true
            });
        }

        // --- 2. Effect Zones (55% approx 11 objects) ---
        // Overlapping zones for complex processing
        const effectCount = 11;
        const effectTypes = ['reverb', 'delay', 'filter', 'reverb', 'distortion', 'delay', 'reverb', 'filter', 'delay', 'reverb', 'distortion'];

        for (let i = 0; i < effectCount; i++) {
            effectZones.push({
                id: `garden-zone-${i}-${uuidv4()}`,
                type: effectTypes[i],
                position: [
                    (Math.random() - 0.5) * 8,
                    2,
                    (Math.random() - 0.5) * 8
                ],
                rotation: [0, 0, 0],
                scale: [5, 5, 5], // Large overlapping zones
                isSelected: false,
                isLocked: true,
                effectParams: {
                    wet: 0.4 + Math.random() * 0.4, // High wetness
                    decay: 3 + Math.random() * 4,
                    feedback: 0.3 + Math.random() * 0.3,
                    frequency: 800 + Math.random() * 1000
                }
            });
        }

        // --- 3. Mobile Objects (10% approx 2 objects) ---
        // Slow, meditative movement
        const mobileCount = 2;
        for (let i = 0; i < mobileCount; i++) {
            mobileObjects.push({
                id: `garden-koi-${i}-${uuidv4()}`,
                type: 'sphere',
                position: [0, 1, 0],
                rotation: [0, 0, 0],
                scale: [0.2, 0.2, 0.2],
                isSelected: false,
                mobileParams: {
                    radius: 2 + i * 3,
                    speed: 0.2 + (i * 0.1), // Slow
                    centerPosition: [0, 1, 0],
                    movementType: 'circular'
                }
            });
        }

        const grid = {
            id: 'grid-garden-0',
            coordinates: [0, 0, 0],
            position: [0, 0, 0],
            objects: objects,
            mobileObjects: mobileObjects,
            effectZones: effectZones
        };

        const projectData = {
            name: 'Nanjing: Zen Garden',
            description: 'A minimalist, contemplative space dominated by effect processing zones, reflecting the Nanjing individual sessions.',
            grids: [{
                ...grid,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            }],
            activeGridId: 'grid-garden-0',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, "projects"), projectData);
        console.log("✅ Success! Zen Garden Project created with ID: ", docRef.id);
        console.log(`Stats: ${objects.length} Sound, ${mobileObjects.length} Mobile, ${effectZones.length} Effect Zones.`);
        process.exit(0);

    } catch (error) {
        console.error("❌ Error adding project: ", error);
        process.exit(1);
    }
}

seedGarden();
