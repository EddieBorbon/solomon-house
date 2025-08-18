'use client';

import { useState, useEffect } from 'react';

export function FPSDisplay() {
  const [fps, setFps] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [lastTime, setLastTime] = useState(performance.now());

  useEffect(() => {
    let animationId: number;

    const updateFPS = (currentTime: number) => {
      setFrameCount(prev => prev + 1);
      
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        setFrameCount(0);
        setLastTime(currentTime);
      }
      
      animationId = requestAnimationFrame(updateFPS);
    };

    animationId = requestAnimationFrame(updateFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [frameCount, lastTime]);

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 z-50 font-mono text-sm">
      <div className="text-green-400 font-bold">
        {fps} FPS
      </div>
    </div>
  );
}
