'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { MobileObjectEditor } from './MobileObjectEditor';
import { type MobileObject } from '../../state/useWorldStore';
import { useIsMobile } from '../../hooks/useIsMobile';

interface MobileObjectEditorWrapperProps {
  mobileObject: MobileObject;
  onRemove: (id: string) => void;
}

export function MobileObjectEditorWrapper({ 
  mobileObject,
  onRemove
}: MobileObjectEditorWrapperProps) {
  const isMobile = useIsMobile();
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setIsPanelExpanded(false);
      return;
    }

    setIsPanelExpanded(true);
  }, [isMobile]);

  const panelWidth = useMemo(() => {
    if (!isPanelExpanded) {
      return '0px';
    }

    return isMobile ? 'min(95vw, 26rem)' : '30rem';
  }, [isPanelExpanded, isMobile]);

  return (
    <div className="fixed right-0 top-0 h-full z-50 flex">
      {/* Panel principal futurista */}
      <div
        className="relative bg-black border border-white transition-all duration-300 overflow-hidden"
        style={{ width: panelWidth }}
      >
        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Scanner line effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div 
              className="absolute w-full h-1 bg-white shadow-lg shadow-white/80"
              style={{
                animation: 'scanner 2s linear infinite',
                top: '-8px'
              }}
            ></div>
          </div>
        </div>
        
        <div className="p-3 h-full overflow-y-auto relative z-10">
          {isPanelExpanded && (
            <MobileObjectEditor
              mobileObject={mobileObject}
              onRemove={onRemove}
            />
          )}
        </div>
      </div>

      {/* Botón de toggle futurista */}
      <button
        onClick={() => setIsPanelExpanded(prev => !prev)}
        className="relative bg-black border border-white p-3 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 group"
        title={isPanelExpanded ? "Contraer panel" : "Expandir panel"}
      >
        {/* Decoraciones de esquina */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
        
        {isPanelExpanded ? (
          <svg className="w-4 h-4 text-white group-hover:text-black transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-white group-hover:text-black transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>
    </div>
  );
}
