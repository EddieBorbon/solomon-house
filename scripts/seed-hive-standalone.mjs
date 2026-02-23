
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

async function seedHive() {
    console.log('🐝 Creating Moscow Hive Project (Corrected Specification v3 FINAL)...');
    console.log('Spec: 118 Total -> 88 Sound (75%), 24 Mobile (20%), 6 Effect (5%)');

    try {
        const objects = [];
        const mobileObjects = [];
        const effectZones = [];

        // --- 1. Sound Objects (75% = 88 objects) ---
        const soundCount = 88;

        // Create a dense cloud centered at 0,5,0
        for (let i = 0; i < soundCount; i++) {
            // Spiral distribution
            const theta = i * 0.5;
            const phi = Math.acos(1 - 2 * (i + 0.5) / soundCount);
            const r = 4 + Math.random() * 2;

            objects.push({
                id: `hive-cell-${i}-${uuidv4()}`,
                type: Math.random() > 0.5 ? 'cube' : 'pyramid',
                position: [
                    Math.sin(phi) * Math.cos(theta) * r,
                    5 + Math.sin(phi) * Math.sin(theta) * r,
                    Math.cos(phi) * r
                ],
                rotation: [Math.random() * 360, Math.random() * 360, 0],
                scale: [0.8, 0.8, 0.8],
                audioParams: {
                    frequency: 65.41 * (1 + Math.floor(Math.random() * 6)), // Harmonic series C2
                    waveform: Math.random() > 0.6 ? 'sawtooth' : 'square',
                    volume: 0.4, // Increased volume
                    detune: Math.random() * 10 - 5
                },
                isSelected: false,
                audioEnabled: true // Explicitly enabled
            });
        }

        // --- 2. Mobile Objects (20% = 24 objects) ---
        const mobileCount = 24;
        for (let i = 0; i < mobileCount; i++) {
            // Ensure accurate types and valid mobileParams
            mobileObjects.push({
                id: `hive-drone-${i}-${uuidv4()}`,
                type: 'sphere', // Simple geometry for movement
                position: [0, 5, 0], // Start at center
                rotation: [0, 0, 0],
                scale: [0.4, 0.4, 0.4],
                isSelected: false,
                mobileParams: {
                    radius: 4 + Math.random() * 8, // Varied orbital radius
                    speed: 0.2 + Math.random() * 0.8, // Varied speed
                    centerPosition: [0, 5, 0],
                    movementType: 'circular'
                }
            });
        }

        // --- 3. Effect Zones (5% = 6 objects) ---
        const effectTypes = ['reverb', 'delay', 'distortion', 'filter', 'reverb', 'delay'];
        const effectCount = 6;

        for (let i = 0; i < effectCount; i++) {
            effectZones.push({
                id: `hive-zone-${i}-${uuidv4()}`,
                type: effectTypes[i], // guaranteed variety
                position: [
                    (Math.random() - 0.5) * 12,
                    2 + Math.random() * 6,
                    (Math.random() - 0.5) * 12
                ],
                rotation: [0, 0, 0],
                scale: [3, 3, 3],
                isSelected: false,
                isLocked: true,
                effectParams: {
                    wet: 0.6,
                    decay: 2.5, // Reverb
                    feedback: 0.4, // Delay
                    distortion: 0.5, // Distortion
                    frequency: 1000 // Filter
                }
            });
        }

        const grid = {
            id: 'grid-hive-v3-final',
            coordinates: [0, 0, 0],
            position: [0, 0, 0],
            objects: objects,
            mobileObjects: mobileObjects,
            effectZones: effectZones
        };

        const projectData = {
            name: 'Moscow Hive: Final V3',
            description: 'Final Moscow session reconstruction. 118 Objects: 88 Sound (Audible), 24 Mobile (Visible Orbits), 6 Varied Effect Zones.',
            grids: [{
                ...grid,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            }],
            activeGridId: 'grid-hive-v3-final',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, "projects"), projectData);
        console.log("✅ Success! Hive Project V3 created with ID: ", docRef.id);
        console.log(`Stats: ${objects.length} Sound, ${mobileObjects.length} Mobile, ${effectZones.length} Effect Zones.`);
        process.exit(0);

    } catch (error) {
        console.error("❌ Error adding project: ", error);
        process.exit(1);
    }
}

seedHive();
