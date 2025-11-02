'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
  className?: string;
}

export function InfoTooltip({ content, className = '' }: InfoTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-white/30 hover:border-white bg-black/50 hover:bg-black/80 cursor-help transition-all duration-200 ml-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Info className="w-3 h-3 text-white/70 hover:text-white" />
      </div>
      
      {isHovered && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-2 w-72 p-3 bg-black/95 border border-white/30 backdrop-blur-xl shadow-2xl pointer-events-none">
          {/* Esquinas decorativas */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white/30"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white/30"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white/30"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white/30"></div>
          
          <p className="text-xs font-mono text-white/90 leading-relaxed tracking-wide break-words">
            {content}
          </p>
          
          {/* Flecha apuntando al ícono */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 -translate-y-full">
            <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-white/30"></div>
          </div>
        </div>
      )}
    </div>
  );
}

