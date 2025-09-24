'use client';

import React from 'react';

interface SoundObjectContainerProps {
  children: React.ReactNode;
}

export function SoundObjectContainer({ children }: SoundObjectContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl p-6 max-w-sm max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
