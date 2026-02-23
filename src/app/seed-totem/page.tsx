'use client';

import { useEffect, useState } from 'react';
import { firebaseService, type FirebaseProject, type FirebaseGrid } from '../../lib/firebaseService';
import { Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export default function SeedTotemPage() {
    const [status, setStatus] = useState('Idle');
    const [projectId, setProjectId] = useState<string | null>(null);

    useEffect(() => {
        const seedTotem = async () => {
            setStatus('Creating Totem Project...');

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
                        type: 'cylinder', // Assuming cylinder exists or fallback to cube if handled by renderer
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
                        scale: [0.5, 0.5, 0.5], // Scale might need adjustment for torus radius
                        audioParams: { frequency: 880, waveform: 'sine', volume: 0.3 },
                        isSelected: false,
                        audioEnabled: true
                    }
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ] as any[];

                // Define the Grid
                const grid: Omit<FirebaseGrid, 'createdAt' | 'updatedAt'> = {
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
                    }] as FirebaseGrid[],
                    activeGridId: 'grid-totem-0-0-0'
                };

                // Save to Firebase
                const newProjectId = await firebaseService.saveProject(projectData);
                setProjectId(newProjectId);
                setStatus('Success! Totem Project Created.');

            } catch (error) {
                console.error(error);
                setStatus('Error: ' + (error as Error).message);
            }
        };

        seedTotem();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-mono p-4">
            <h1 className="text-3xl mb-4 text-neon-cyan">Totem Seeder</h1>
            <div className={`p-4 rounded border ${status.includes('Success') ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
                <p className="text-xl mb-2">{status}</p>
                {projectId && (
                    <p className="text-sm opacity-80">Project ID: {projectId}</p>
                )}
            </div>
            <p className="mt-8 text-gray-500 text-sm max-w-md text-center">
                If successful, return to the main Dashboard and load the "Totem Artifact" project.
            </p>
        </div>
    );
}
