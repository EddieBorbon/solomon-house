'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWorldStore } from '../../state/useWorldStore';
import { X } from 'lucide-react';

export function ParticleControlPanel() {
    const { showParticlePanel, setShowParticlePanel, addParticleSystem, updateParticleSystem, activeGridId, selectedEntityId, grids } = useWorldStore();
    const [selectedShape, setSelectedShape] = useState('star');
    const [selectedColor, setSelectedColor] = useState('#ffffff');

    // Find selected particle system
    const selectedSystem = useMemo(() => {
        if (!activeGridId || !selectedEntityId) return null;
        const grid = grids.get(activeGridId);
        return grid?.particleSystems?.find(ps => ps.id === selectedEntityId);
    }, [grids, activeGridId, selectedEntityId]);

    // Sync state with selection
    useEffect(() => {
        if (selectedSystem) {
            setSelectedShape(selectedSystem.particleParams.shape);
            setSelectedColor(selectedSystem.particleParams.color);
        }
    }, [selectedSystem?.id]); // Only when ID changes, to avoid loops if we update param

    // Live update if selected
    useEffect(() => {
        if (selectedSystem) {
            if (selectedSystem.particleParams.shape !== selectedShape || selectedSystem.particleParams.color !== selectedColor) {
                updateParticleSystem(selectedSystem.id, {
                    particleParams: {
                        ...selectedSystem.particleParams,
                        shape: selectedShape as any,
                        color: selectedColor
                    }
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedShape, selectedColor, updateParticleSystem]);

    if (!showParticlePanel) return null;

    const shapes = [
        { id: 'star', icon: '⭐', label: 'Star' },
        { id: 'diamond', icon: '💎', label: 'Diamond' },
        { id: 'heart', icon: '❤️', label: 'Heart' },
        { id: 'note', icon: '🎵', label: 'Note' },
        { id: 'lightning', icon: '⚡', label: 'Bolt' },
        { id: 'moon', icon: '🌙', label: 'Moon' },
        { id: 'sun', icon: '☀️', label: 'Sun' }
    ];

    const colors = [
        '#FF0055', '#00FF55', '#5500FF', '#FF5500', '#0055FF', '#FFFFFF'
    ];

    const handleCreate = () => {
        if (!activeGridId) return;
        addParticleSystem([0, 5, 0], {
            shape: selectedShape as any,
            color: selectedColor,
            count: 2000,
            handInteractionEnabled: true,
            synthesisEnabled: true
        });
    };

    return (
        <div className="fixed top-24 left-24 z-[60] bg-black/90 backdrop-blur-xl border border-cyan-500/30 p-6 rounded-2xl w-[320px] text-white font-mono animate-in fade-in slide-in-from-left-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <h2 className="text-lg font-bold tracking-[0.2em] text-cyan-400">PARTICLE FLOW</h2>
                </div>
                <button
                    onClick={() => setShowParticlePanel(false)}
                    className="hover:bg-white/10 p-1 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
            </div>

            {/* Shapes */}
            <div className="mb-6">
                <h3 className="text-[10px] text-cyan-400/70 mb-3 tracking-widest font-bold">SELECT SHAPE</h3>
                <div className="grid grid-cols-4 gap-2">
                    {shapes.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setSelectedShape(s.id)}
                            className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all duration-300 group ${selectedShape === s.id
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                                : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'
                                }`}
                        >
                            <span className="text-xl group-hover:scale-110 transition-transform">{s.icon}</span>
                            <span className="text-[9px] uppercase">{s.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Colors */}
            <div className="mb-8">
                <h3 className="text-[10px] text-cyan-400/70 mb-3 tracking-widest font-bold">SELECT COLOR</h3>
                <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                    {colors.map(c => (
                        <button
                            key={c}
                            onClick={() => setSelectedColor(c)}
                            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 relative ${selectedColor === c
                                ? 'border-white scale-110 shadow-[0_0_15px_currentColor]'
                                : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                            style={{ backgroundColor: c, color: c }}
                        >
                            {selectedColor === c && (
                                <div className="absolute inset-0 rounded-full animate-ping opacity-50 bg-inherit" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={handleCreate}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold tracking-[0.2em] text-sm hover:brightness-110 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 border border-white/10 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10">{selectedSystem ? 'ADD NEW SYSTEM' : 'INITIALIZE SYSTEM'}</span>
            </button>

            <div className="mt-4 text-center">
                <p className="text-[10px] text-gray-500 tracking-wider">
                    {selectedSystem ? `EDITING: ${selectedSystem.id.slice(0, 8)}` : 'SYSTEM_STATUS: READY'}
                </p>
            </div>
        </div>
    );
}
