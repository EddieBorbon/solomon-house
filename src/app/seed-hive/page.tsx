'use client';

import { useEffect, useState } from 'react';
import { firebaseService, type FirebaseProject, type FirebaseGrid } from '../../lib/firebaseService';
import { Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export default function SeedHivePage() {
    const [status, setStatus] = useState('Idle');
    const [projectId, setProjectId] = useState<string | null>(null);

    useEffect(() => {
        const seedHive = async () => {
            setStatus('Creating Moscow Hive Project...');

            try {
                const objects = [];
                const rows = 6;
                const cols = 8;
                const spacing = 1.5;

                // Create a "Wall of Sound" / Hive structure
                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols; j++) {
                        // Randomize position slightly for "organic" hive feel
                        const x = (j - cols / 2) * spacing + (Math.random() * 0.5 - 0.25);
                        const y = i * spacing + 1; // Start above ground
                        const z = (Math.random() * 0.5 - 0.25); // Slight depth variation

                        // Harmonic series base for audio (C major scale-ish)
                        const baseFreq = 65.41; // C2
                        const multiplier = 1 + Math.floor(Math.random() * 8);

                        // Randomize object type for visual noise
                        const types = ['cube', 'cube', 'cube', 'pyramid', 'icosahedron'];
                        const type = types[Math.floor(Math.random() * types.length)];

                        objects.push({
                            id: `hive-cell-${i}-${j}-${uuidv4()}`,
                            type: type,
                            position: [x, y, z],
                            rotation: [Math.random() * 360, Math.random() * 360, 0],
                            scale: [0.8, 0.8, 0.8],
                            audioParams: {
                                frequency: baseFreq * multiplier,
                                waveform: Math.random() > 0.5 ? 'sawtooth' : 'square', // Aggressive texture
                                volume: 0.2 // Lower volume per unit due to density
                            },
                            isSelected: false,
                            audioEnabled: true // Active wall
                        });
                    }
                }

                // Add some "Queen" or central nodes
                objects.push({
                    id: `hive-core-${uuidv4()}`,
                    type: 'dodecahedronRing',
                    position: [0, rows * spacing / 2, 2],
                    rotation: [0, 0, 0],
                    scale: [2, 2, 2],
                    audioParams: { frequency: 55, waveform: 'sine', volume: 0.6 }, // Low drone
                    isSelected: false,
                    audioEnabled: true
                });

                // Define the Grid
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const grid: Omit<FirebaseGrid, 'createdAt' | 'updatedAt'> = {
                    id: 'grid-hive-0-0-0',
                    coordinates: [0, 0, 0],
                    position: [0, 0, 0],
                    objects: objects as any[],
                    mobileObjects: [],
                    effectZones: []
                };

                // Define the Project
                const projectData = {
                    name: 'Moscow Hive: Wall of Sound',
                    description: 'A dense, chaotic structure representing the "Horror Vacui" and "Wall of Sound" from the Moscow session.',
                    grids: [{
                        ...grid,
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now()
                    }] as FirebaseGrid[],
                    activeGridId: 'grid-hive-0-0-0'
                };

                // Save to Firebase
                const newProjectId = await firebaseService.saveProject(projectData);
                setProjectId(newProjectId);
                setStatus('Success! Hive Project Created.');

            } catch (error) {
                console.error(error);
                setStatus('Error: ' + (error as Error).message);
            }
        };

        seedHive();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-mono p-4">
            <h1 className="text-3xl mb-4 text-neon-magenta">Hive Seeder</h1>
            <div className={`p-4 rounded border ${status.includes('Success') ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
                <p className="text-xl mb-2">{status}</p>
                {projectId && (
                    <p className="text-sm opacity-80">Project ID: {projectId}</p>
                )}
            </div>
            <p className="mt-8 text-gray-500 text-sm max-w-md text-center">
                If successful, return to the main Dashboard and load the "Moscow Hive" project.
            </p>
        </div>
    );
}
