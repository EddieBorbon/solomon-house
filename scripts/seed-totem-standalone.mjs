
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

async function seedTotem() {
    console.log('🗿 Creating Totem Artifact Project...');

    try {
        // Define the Totem Objects
        const objects = [
            {
                id: `totem-base-${uuidv4()}`,
                type: 'cube',
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: [2, 0.5, 2],
                audioParams: { frequency: 110, waveform: 'square', volume: 0.5 },
                isSelected: false,
                audioEnabled: true
            },
            {
                id: `totem-tier1-${uuidv4()}`,
                type: 'sphere',
                position: [0, 1.5, 0],
                rotation: [0, 0, 0],
                scale: [1.2, 1.2, 1.2],
                audioParams: { frequency: 220, waveform: 'sine', volume: 0.5 },
                isSelected: false,
                audioEnabled: true
            },
            {
                id: `totem-tier2-${uuidv4()}`,
                type: 'cylinder',
                position: [0, 3, 0],
                rotation: [0, 0, 0],
                scale: [1, 2, 1],
                audioParams: { frequency: 330, waveform: 'triangle', volume: 0.5 },
                isSelected: false,
                audioEnabled: true
            },
            {
                id: `totem-top-${uuidv4()}`,
                type: 'pyramid',
                position: [0, 5, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
                audioParams: { frequency: 440, waveform: 'sawtooth', volume: 0.5 },
                isSelected: false,
                audioEnabled: true
            },
            {
                id: `totem-halo-${uuidv4()}`,
                type: 'torus',
                position: [0, 5, 0],
                rotation: [90, 0, 0],
                scale: [0.5, 0.5, 0.5],
                audioParams: { frequency: 880, waveform: 'sine', volume: 0.3 },
                isSelected: false,
                audioEnabled: true
            }
        ];

        // Define the Grid
        const grid = {
            id: 'grid-totem-0-0-0',
            coordinates: [0, 0, 0],
            position: [0, 0, 0],
            objects: objects,
            mobileObjects: [],
            effectZones: []
        };

        // Define the Project
        const projectData = {
            name: 'Totem Artifact',
            description: 'A ritualistic totem structure generated for the thesis documentation.',
            grids: [{
                ...grid,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            }],
            activeGridId: 'grid-totem-0-0-0',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, "projects"), projectData);
        console.log("✅ Success! Totem Project created with ID: ", docRef.id);
        process.exit(0);

    } catch (error) {
        console.error("❌ Error adding project: ", error);
        process.exit(1);
    }
}

seedTotem();
