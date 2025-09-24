'use client';

import React from 'react';

export function NoSelectionMessage() {
  return (
    <div className="futuristic-param-container">
      <h4 className="futuristic-label mb-4 text-white text-center">
        SELECT_OBJECT
      </h4>
      <div className="text-center">
        <p className="text-sm text-white font-mono tracking-wider mb-4 px-4">
          CLICK_ANY_SOUND_OBJECT_OR_EFFECT_ZONE_TO_EDIT
        </p>
        <div className="text-xs text-white font-mono tracking-wider">
          OBJECTS_APPEAR_IN_3D_SCENE
        </div>
      </div>
    </div>
  );
}
