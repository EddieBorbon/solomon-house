'use client';

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame, RootState } from '@react-three/fiber';
import * as THREE from 'three';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { ParticleSystemObject } from '../../state/useWorldStore';
import * as Tone from 'tone';

// Singleton Manager for Hand Tracking to avoid multiple webcam streams
class HandTrackingManager {
    private static instance: HandTrackingManager;
    public landmarker: HandLandmarker | null = null;
    public video: HTMLVideoElement | null = null;
    public lastVideoTime: number = -1;
    public results: any = null;
    public isInitializing: boolean = false;
    public listeners: Set<string> = new Set();
    public lastDetectionTime: number = 0;

    private constructor() { }

    public static getInstance(): HandTrackingManager {
        if (!HandTrackingManager.instance) {
            HandTrackingManager.instance = new HandTrackingManager();
        }
        return HandTrackingManager.instance;
    }

    public async init() {
        if (this.landmarker || this.isInitializing) return;
        this.isInitializing = true;

        try {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
            );
            this.landmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 2
            });

            this.video = document.createElement("video");
            this.video.autoplay = true;
            this.video.playsInline = true;

            // Make video visible for user feedback
            this.video.style.position = 'fixed';
            this.video.style.bottom = '20px';
            this.video.style.right = '20px';
            this.video.style.width = '240px';
            this.video.style.height = 'auto';
            this.video.style.zIndex = '1000';
            this.video.style.transform = 'scaleX(-1)';
            this.video.style.borderRadius = '12px';
            this.video.style.border = '2px solid rgba(255,255,255,0.3)';
            this.video.style.pointerEvents = 'none'; // Don't block clicks
            document.body.appendChild(this.video);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            this.video.srcObject = stream;

            // Wait for video to load
            await new Promise<void>((resolve) => {
                if (this.video) {
                    this.video.onloadeddata = () => resolve();
                }
            });

        } catch (err) {
            console.error("HandTrackingManager initialization failed:", err);
        } finally {
            this.isInitializing = false;
        }
    }

    public detect(time: number) {
        // Limit detection frequency if needed, but for now run every frame if video changed
        if (this.landmarker && this.video && this.video.currentTime !== this.lastVideoTime) {
            if (this.video.videoWidth > 0 && this.video.videoHeight > 0) {
                this.lastVideoTime = this.video.currentTime;
                this.results = this.landmarker.detectForVideo(this.video, time);
                this.lastDetectionTime = time;
            }
        }
    }

    public dispose() {
        // Cleanup if needed when all listeners are gone
        if (this.listeners.size === 0) {
            if (this.video) {
                if (this.video.parentNode) {
                    this.video.parentNode.removeChild(this.video);
                }
                if (this.video.srcObject) {
                    const tracks = (this.video.srcObject as MediaStream).getTracks();
                    tracks.forEach(t => t.stop());
                }
            }
            this.landmarker?.close();
            this.landmarker = null;
            this.video = null;
            HandTrackingManager.instance = undefined as any;
        }
    }
}

interface ParticleSystemProps {
    data: ParticleSystemObject;
}

export function ParticleSystem({ data }: ParticleSystemProps) {
    const pointsRef = useRef<THREE.Points>(null);
    const { particleParams } = data;
    const { shape, color, count, handInteractionEnabled } = particleParams;
    const manager = useMemo(() => HandTrackingManager.getInstance(), []);

    // Audio synths
    const synthRef = useRef<Tone.PolySynth | null>(null);
    const filterRef = useRef<Tone.Filter | null>(null);

    // Initialize Audio
    useEffect(() => {
        if (!data.particleParams.synthesisEnabled) return;

        const filter = new Tone.Filter(1000, "lowpass").toDestination();
        const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "fatsawtooth" },
            envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 }
        }).connect(filter);

        synthRef.current = synth;
        filterRef.current = filter;

        return () => {
            synth.dispose();
            filter.dispose();
        };
    }, [data.particleParams.synthesisEnabled]);

    // Register with Manager
    useEffect(() => {
        if (!handInteractionEnabled) return;
        manager.listeners.add(data.id);
        manager.init();

        return () => {
            manager.listeners.delete(data.id);
        };
    }, [handInteractionEnabled, data.id, manager]);

    // Generate Particles
    const particles = useMemo(() => {
        const temp = [];
        const numParticles = count || 2000;

        for (let i = 0; i < numParticles; i++) {
            let x = 0, y = 0, z = 0;

            switch (shape) {
                case 'star':
                    // 5-point Star (2D extruded)
                    const branch = Math.floor(Math.random() * 5);
                    const distS = Math.random() * 3;
                    // Add spread
                    const widthS = (Math.random() - 0.5) * 0.5;
                    const angleS = (branch / 5) * Math.PI * 2 + widthS;
                    x = distS * Math.cos(angleS);
                    y = distS * Math.sin(angleS);
                    z = (Math.random() - 0.5) * 1;
                    break;
                case 'diamond':
                    // Octahedron/Diamond
                    // x + y + z <= R
                    const d1 = (Math.random() - 0.5) * 3;
                    const d2 = (Math.random() - 0.5) * 3;
                    const d3 = (Math.random() - 0.5) * 3;
                    if (Math.abs(d1) + Math.abs(d2) + Math.abs(d3) <= 2) {
                        x = d1; y = d2; z = d3;
                    } else {
                        // Project to surface
                        const norm = Math.abs(d1) + Math.abs(d2) + Math.abs(d3);
                        x = d1 / norm * 2;
                        y = d2 / norm * 2;
                        z = d3 / norm * 2;
                    }
                    break;
                case 'heart':
                    // Heart curve
                    let t = Math.random() * Math.PI * 2;
                    let scaleH = 0.15;
                    // Simple parametric
                    x = scaleH * (16 * Math.pow(Math.sin(t), 3));
                    y = scaleH * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
                    z = (Math.random() - 0.5) * 2;
                    // Add volume
                    x += (Math.random() - 0.5) * 0.2;
                    y += (Math.random() - 0.5) * 0.2;
                    break;
                case 'note':
                    // Eighth note shape
                    if (Math.random() > 0.3) {
                        // Stem
                        x = 1 + (Math.random() - 0.5) * 0.2;
                        y = (Math.random() * 3) - 1;
                        z = (Math.random() - 0.5) * 0.2;
                    } else {
                        // Head
                        const thetaN = Math.random() * Math.PI * 2;
                        const radN = Math.random() * 0.7;
                        x = radN * Math.cos(thetaN);
                        y = radN * Math.sin(thetaN) - 1;
                        z = (Math.random() - 0.5) * 0.5;
                    }
                    break;
                case 'lightning':
                    // Zigzag
                    y = (Math.random() * 5) - 2.5;
                    // x zigzags based on y
                    const zig = Math.abs((y * 2) % 2 - 1); // Triangle wave approx
                    x = (zig * 1.5) - 0.75 + (Math.random() - 0.5) * 0.3;
                    z = (Math.random() - 0.5) * 0.5;
                    break;
                case 'moon':
                    // Crescent
                    const rM = 2;
                    const thetaM = Math.random() * Math.PI * 2;
                    const rawX = rM * Math.cos(thetaM);
                    const rawY = rM * Math.sin(thetaM);
                    // Cutout
                    const cutX = 1;
                    const cutY = 0;
                    if (Math.hypot(rawX - cutX, rawY - cutY) > 1.5) {
                        x = rawX; y = rawY; z = (Math.random() - 0.5);
                    } else {
                        // Retry simplified: Just an arc
                        const arc = (Math.random() * Math.PI) + Math.PI / 2;
                        x = 2 * Math.cos(arc);
                        y = 2 * Math.sin(arc);
                        z = (Math.random() - 0.5);
                    }
                    break;
                case 'sun':
                    // Sphere + Rays
                    if (Math.random() > 0.3) {
                        // Core
                        const rSun = 1.5 * Math.cbrt(Math.random());
                        const tSun = Math.random() * 2 * Math.PI;
                        const pSun = Math.acos(2 * Math.random() - 1);
                        x = rSun * Math.sin(pSun) * Math.cos(tSun);
                        y = rSun * Math.sin(pSun) * Math.sin(tSun);
                        z = rSun * Math.cos(pSun);
                    } else {
                        // Rays
                        const rRay = 2 + Math.random() * 2;
                        const tRay = Math.random() * 2 * Math.PI;
                        const pRay = Math.acos(2 * Math.random() - 1);
                        x = rRay * Math.sin(pRay) * Math.cos(tRay);
                        y = rRay * Math.sin(pRay) * Math.sin(tRay);
                        z = rRay * Math.cos(pRay);
                    }
                    break;
                case 'sphere':
                case 'saturn':
                case 'vortex':
                case 'cube':
                case 'tornado':
                default:
                    // Fallback to simple cloud
                    x = (Math.random() - 0.5) * 4;
                    y = (Math.random() - 0.5) * 4;
                    z = (Math.random() - 0.5) * 4;
                    break;
            }

            temp.push(x, y, z);
        }
        return new Float32Array(temp);
    }, [shape, count]);

    // Update loop
    useFrame((state: RootState, delta: number) => {
        if (!pointsRef.current) return;

        if (handInteractionEnabled) {
            manager.detect(performance.now());
        }

        const results = manager.results;

        if (results && results.landmarks && results.landmarks.length > 0) {
            const hand = results.landmarks[0];
            const handX = (0.5 - hand[9].x) * 10;
            const handY = (0.5 - hand[9].y) * 8;
            const handZ = 0;

            if (synthRef.current && filterRef.current) {
                const freq = THREE.MathUtils.mapLinear(handY, -4, 4, 100, 2000);
                filterRef.current.frequency.rampTo(freq, 0.1);
            }

            // Calculate Hand Openness
            // We sum the distance from the Wrist (0) to each Finger Tip (4, 8, 12, 16, 20)
            const wrist = hand[0];
            const tips = [4, 8, 12, 16, 20];
            let totalTipDist = 0;

            for (const tipIdx of tips) {
                const tip = hand[tipIdx];
                const dx = tip.x - wrist.x;
                const dy = tip.y - wrist.y;
                const dz = tip.z - wrist.z;
                totalTipDist += Math.sqrt(dx * dx + dy * dy + dz * dz);
            }

            // Map openness to Scale Factor
            // 0.5 (Closed) -> 1.0 Scale (Original Size)
            // 1.5 (Open)   -> 1.8 Scale (Max limit to prevent sparsity)
            const clampedOpenness = THREE.MathUtils.clamp(totalTipDist, 0.4, 1.5);
            const targetScale = THREE.MathUtils.mapLinear(clampedOpenness, 0.4, 1.5, 1.0, 1.8);

            const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

            for (let i = 0; i < positions.length; i += 3) {
                const ox = particles[i];
                const oy = particles[i + 1];
                const oz = particles[i + 2];

                // Scaling Logic: Preserves the shape perfectly
                // Only expands the distance between particles from the center (0,0,0)
                let tx = ox * targetScale;
                let ty = oy * targetScale;
                let tz = oz * targetScale;

                // Add slight noise for organic feel if expanded
                if (targetScale > 1.1) {
                    tx += (Math.random() - 0.5) * 0.1 * (targetScale - 1);
                    ty += (Math.random() - 0.5) * 0.1 * (targetScale - 1);
                    tz += (Math.random() - 0.5) * 0.1 * (targetScale - 1);
                }

                // Smoothly interpolate towards scaled shape
                positions[i] += (tx - positions[i]) * 0.1;
                positions[i + 1] += (ty - positions[i + 1]) * 0.1;
                positions[i + 2] += (tz - positions[i + 2]) * 0.1;
            }
            pointsRef.current.geometry.attributes.position.needsUpdate = true;
        } else {
            // If no hand detected, return to original positions slowly
            if (pointsRef.current) {
                const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
                let needsUpdate = false;
                // Optimization: Check first particle or just run loop? Loop is cheap for 2000.
                // We can damp to sleep, but simple lerp is fine.
                for (let i = 0; i < positions.length; i += 3) {
                    const diffX = particles[i] - positions[i];
                    const diffY = particles[i + 1] - positions[i + 1];
                    const diffZ = particles[i + 2] - positions[i + 2]; // Original Z vs Current Z

                    // Only update if not practically there
                    if (Math.abs(diffX) > 0.001 || Math.abs(diffY) > 0.001 || Math.abs(diffZ) > 0.001) {
                        positions[i] += diffX * 0.05;
                        positions[i + 1] += diffY * 0.05;
                        positions[i + 2] += diffZ * 0.05;
                        needsUpdate = true;
                    }
                }
                if (needsUpdate) {
                    pointsRef.current.geometry.attributes.position.needsUpdate = true;
                }
            }
        }

        pointsRef.current.rotation.y += delta * 0.1;
    });

    return (
        <group position={data.position} rotation={data.rotation} scale={data.scale}>
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[particles, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.25}
                    color={color}
                    sizeAttenuation={true}
                    transparent={true}
                    opacity={0.9}
                    blending={THREE.NormalBlending}
                    depthWrite={false}
                />
            </points>
            {data.isSelected && (
                <mesh visible={false}>
                    <boxGeometry args={[5, 5, 5]} />
                    <meshBasicMaterial wireframe color="yellow" />
                </mesh>
            )}
        </group>
    );
}
