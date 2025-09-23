'use client';

import { type EffectZone } from '../../../state/useWorldStore';
import { EffectParametersSection } from '../EffectParametersSection';
import { EffectSpecificParameters } from '../EffectSpecificParameters';
import { EffectZoneHeaderComponent } from './EffectZoneHeader';
import { EffectBasicParameters } from './EffectBasicParameters';
import { EffectShapeSelector } from './EffectShapeSelector';
import { EffectTransformSection } from './EffectTransformSection';

interface EffectZoneEditorProps {
  zone: EffectZone;
  isRefreshingEffects: boolean;
  isUpdatingParams: boolean;
  lastUpdatedParam: string | null;
  onRemove: (id: string) => void;
  onToggleLock: (id: string) => void;
  onRefresh: () => void;
  onEffectParamChange: (param: string, value: number | string) => void;
  onUpdateEffectZone: (id: string, updates: Partial<EffectZone>) => void;
  roundToDecimals: (value: number) => number;
}

export function EffectZoneEditor({
  zone,
  isRefreshingEffects,
  isUpdatingParams,
  lastUpdatedParam,
  onRemove,
  onToggleLock,
  onRefresh,
  onEffectParamChange,
  onUpdateEffectZone,
  roundToDecimals
}: EffectZoneEditorProps) {
  return (
    <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-4 max-w-xs max-h-[75vh] overflow-y-auto">
      {/* Efecto de brillo interior */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-2xl pointer-events-none"></div>
      
      {/* Header con información de la zona de efecto */}
      <EffectZoneHeaderComponent 
        zone={zone}
        isRefreshingEffects={isRefreshingEffects}
        onRemove={onRemove}
        onToggleLock={onToggleLock}
        onRefresh={onRefresh}
      />

      {/* Controles de parámetros del efecto */}
      <div className="space-y-4">
        <EffectParametersSection 
          zone={zone}
          isUpdatingParams={isUpdatingParams}
          lastUpdatedParam={lastUpdatedParam}
          onEffectParamChange={onEffectParamChange}
        />
        
        {/* Parámetros específicos del efecto */}
        <EffectSpecificParameters 
          zone={zone}
          onEffectParamChange={onEffectParamChange}
        />
        
        {/* Parámetros básicos del efecto */}
        <EffectBasicParameters 
          zone={zone}
          onEffectParamChange={onEffectParamChange}
        />
      </div>

      {/* Selector de forma */}
      <EffectShapeSelector 
        zone={zone}
        onShapeChange={(shape) => onUpdateEffectZone(zone?.id, { shape })}
      />

      {/* Sección de Posición y Tamaño para Zonas de Efectos */}
      <EffectTransformSection 
        zone={zone}
        onUpdateEffectZone={onUpdateEffectZone}
        roundToDecimals={roundToDecimals}
      />

      {/* Información adicional */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="p-3 bg-purple-900/20 border border-purple-700/50 rounded-lg">
          <p className="text-xs text-purple-300 text-center">
            💡 Los objetos sonoros dentro de esta zona se procesarán automáticamente con el efecto Phaser
          </p>
        </div>
      </div>
    </div>
  );
}
