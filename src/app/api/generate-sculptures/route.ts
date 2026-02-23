import { NextResponse } from 'next/server';
import { firebaseService } from '../../../lib/firebaseService';
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase/firestore';
import type { FirebaseProject, FirebaseGrid } from '../../../lib/firebaseService';
import type { SoundObject, MobileObject, EffectZone } from '../../../state/useWorldStore';

export async function GET() {
    try {
        // Escultura 2: El Aleph Acusmático
        const objects: SoundObject[] = [];
        const mobileObjects: MobileObject[] = [];
        const effectZones: EffectZone[] = [];

        // 1. Objeto Central Complejo (Icosahedron)
        objects.push({
            id: uuidv4(),
            type: 'icosahedron',
            position: [0, 2, 0],
            rotation: [0, 0, 0],
            scale: [2, 2, 2],
            isSelected: false,
            audioEnabled: true,
            audioParams: {
                frequency: 110, // A2, base profunda
                waveform: 'sine', // Fallback a onda básica soportada, modificando param para simular FM desde el engine real luego si es posible
                volume: 0.6,
                color: '#ffcc00', // Dorado/Divino
                emissiveColor: '#ffffff',
                emissiveIntensity: 0.8,
                metalness: 1.0,
                roughness: 0.1
            }
        });

        // 2. Objetos Móviles Orbitando (Lunas)
        for (let i = 0; i < 2; i++) {
            mobileObjects.push({
                id: uuidv4(),
                type: 'mobile',
                position: [0, 2, 0],
                rotation: [0, 0, 0],
                scale: [0.5, 0.5, 0.5],
                isSelected: false,
                mobileParams: {
                    movementType: 'polar',
                    radius: 5 + i * 2, // Radio base
                    speed: 0.5 + i * 0.2,
                    height: 2,
                    randomSeed: i * 42,
                    isActive: true,
                    centerPosition: [0, 2, 0],
                    direction: [1, 0, 0],
                    axis: [0, 1, 0],
                    amplitude: 5, // Oscilación del radio severa para chocar con el centro
                    frequency: 2, // 2 veces por ciclo chocará
                    proximityThreshold: 4, // Umbral grande dado el tamaño de Icosaedro
                    heightSpeed: 1
                }
            });
        }

        // 3. Zona de Efecto (Freeverb Masivo)
        effectZones.push({
            id: uuidv4(),
            position: [0, 2, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            isSelected: false,
            isLocked: false,
            type: 'freeverb',
            shape: 'sphere',
            effectParams: {
                roomSize: 0.95, // Reverb muy expansivo
                dampening: 1000,
                radius: 15 // Cubre un área enorme
            }
        });

        // Guardar en Firebase
        const gridId = uuidv4();
        const gridData: FirebaseGrid = {
            id: gridId,
            coordinates: [0, 0, 0],
            position: [0, 0, 0],
            objects,
            mobileObjects,
            effectZones,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        const projectData = {
            name: "El Aleph Acusmático",
            description: "Generado estructuralmente - 2. El Objeto Sonoro Digital Híbrido",
            grids: [gridData],
            activeGridId: gridId,
            isLocked: false,
        };

        const projectId = await firebaseService.saveProject(projectData);

        return NextResponse.json({ success: true, projectId, message: "Escultura 'El Aleph Acusmático' generada exitosamente." });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
