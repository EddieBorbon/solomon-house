import React from 'react';
import { 
  EffectType, 
  SoundObjectType, 
  EffectZoneEntity, 
  SoundObjectEntity, 
  MobileObjectEntity,
  IParameterComponentFactory 
} from './types';

// Importar componentes de efectos
import { AutoFilterParams } from '../../components/ui/effect-editor/AutoFilterParams';
import { AutoWahParams } from '../../components/ui/effect-editor/AutoWahParams';
import { BitCrusherParams } from '../../components/ui/effect-editor/BitCrusherParams';
import { ChebyshevParams } from '../../components/ui/effect-editor/ChebyshevParams';
import { DistortionParams } from '../../components/ui/effect-editor/DistortionParams';
import { FrequencyShifterParams } from '../../components/ui/effect-editor/FrequencyShifterParams';
import { JCReverbParams } from '../../components/ui/effect-editor/JCReverbParams';
import { FeedbackDelayParams } from '../../components/ui/effect-editor/FeedbackDelayParams';
import { FreeverbParams } from '../../components/ui/effect-editor/FreeverbParams';
import { StereoWidenerParams } from '../../components/ui/effect-editor/StereoWidenerParams';
import { ReverbParams } from '../../components/ui/effect-editor/ReverbParams';
import { TremoloParams } from '../../components/ui/effect-editor/TremoloParams';
import { VibratoParams } from '../../components/ui/effect-editor/VibratoParams';
import { ChorusParams } from '../../components/ui/effect-editor/ChorusParams';
import { PingPongDelayParams } from '../../components/ui/effect-editor/PingPongDelayParams';
import { PitchShiftParams } from '../../components/ui/effect-editor/PitchShiftParams';

// Importar componentes de objetos de sonido
import { AdvancedSynthParameters } from '../../components/ui/sound-editor/AdvancedSynthParameters';
import { MonoSynthParameters } from '../../components/ui/sound-editor/MonoSynthParameters';
import { MetalSynthParameters } from '../../components/ui/sound-editor/MetalSynthParameters';
import { NoiseSynthParameters } from '../../components/ui/sound-editor/NoiseSynthParameters';
import { PluckSynthParameters } from '../../components/ui/sound-editor/PluckSynthParameters';
import { PolySynthParameters } from '../../components/ui/sound-editor/PolySynthParameters';
import { SamplerParameters } from '../../components/ui/sound-editor/SamplerParameters';

// Importar componente de objetos móviles
import { MobileObjectEditor } from '../../components/ui/MobileObjectEditor';

/**
 * Factory Pattern para crear componentes de parámetros
 * Resuelve el switch gigante del ParameterEditor original
 */
export class ParameterComponentFactory implements IParameterComponentFactory {
  private static instance: ParameterComponentFactory;
  
  private constructor() {
    // Constructor privado para Singleton
  }

  public static getInstance(): ParameterComponentFactory {
    if (!ParameterComponentFactory.instance) {
      ParameterComponentFactory.instance = new ParameterComponentFactory();
    }
    return ParameterComponentFactory.instance;
  }

  /**
   * Crea un componente de parámetros para un efecto específico
   */
  public createEffectComponent(effectType: EffectType, zone: EffectZoneEntity): React.ReactElement | null {
    const commonProps = {
      zone: zone as any, // Cast necesario por compatibilidad
      onEffectParamChange: (param: string, value: any) => {
        console.log(`🎛️ ParameterComponentFactory: Actualizando parámetro ${param} del efecto ${effectType}`);
      }
    };

    try {
      switch (effectType) {
        case 'autoFilter':
          return <AutoFilterParams {...commonProps} />;

        case 'autoWah':
          return <AutoWahParams {...commonProps} />;

        case 'bitCrusher':
          return <BitCrusherParams {...commonProps} />;

        case 'chebyshev':
          return <ChebyshevParams {...commonProps} />;

        case 'chorus':
          return <ChorusParams {...commonProps} />;

        case 'distortion':
          return <DistortionParams {...commonProps} />;

        case 'feedbackDelay':
          return <FeedbackDelayParams {...commonProps} />;

        case 'freeverb':
          return <FreeverbParams {...commonProps} />;

        case 'frequencyShifter':
          return <FrequencyShifterParams {...commonProps} />;

        case 'jcReverb':
          return <JCReverbParams {...commonProps} />;

        case 'pingPongDelay':
          return <PingPongDelayParams {...commonProps} />;

        case 'pitchShift':
          return <PitchShiftParams {...commonProps} />;

        case 'reverb':
          return <ReverbParams {...commonProps} />;

        case 'stereoWidener':
          return <StereoWidenerParams {...commonProps} />;

        case 'tremolo':
          return <TremoloParams {...commonProps} />;

        case 'vibrato':
          return <VibratoParams {...commonProps} />;

        default:
          console.warn(`🎛️ ParameterComponentFactory: Tipo de efecto no soportado: ${effectType}`);
          return null;
      }
    } catch (error) {
      console.error(`❌ ParameterComponentFactory: Error creando componente de efecto ${effectType}:`, error);
      return null;
    }
  }

  /**
   * Crea un componente de parámetros para un objeto de sonido específico
   */
  public createSoundObjectComponent(objectType: SoundObjectType, object: SoundObjectEntity): React.ReactElement | null {
    const commonProps = {
      object: object as any, // Cast necesario por compatibilidad
      onParamChange: (param: string, value: any) => {
        console.log(`🎵 ParameterComponentFactory: Actualizando parámetro ${param} del objeto ${objectType}`);
      }
    };

    try {
      switch (objectType) {
        case 'cube':
        case 'sphere':
        case 'cylinder':
        case 'cone':
        case 'pyramid':
        case 'icosahedron':
        case 'plane':
        case 'torus':
        case 'dodecahedronRing':
        case 'spiral':
          // Para objetos básicos, usar parámetros avanzados de sintetizador
          return <AdvancedSynthParameters {...commonProps} />;

        default:
          console.warn(`🎵 ParameterComponentFactory: Tipo de objeto no soportado: ${objectType}`);
          return null;
      }
    } catch (error) {
      console.error(`❌ ParameterComponentFactory: Error creando componente de objeto ${objectType}:`, error);
      return null;
    }
  }

  /**
   * Crea un componente de parámetros para un objeto móvil
   */
  public createMobileObjectComponent(object: MobileObjectEntity): React.ReactElement | null {
    try {
      return (
        <MobileObjectEditor
          mobileObject={object as any} // Cast necesario por compatibilidad
          onRemove={(id: string) => {
            console.log(`🚀 ParameterComponentFactory: Eliminando objeto móvil ${id}`);
          }}
        />
      );
    } catch (error) {
      console.error(`❌ ParameterComponentFactory: Error creando componente de objeto móvil:`, error);
      return null;
    }
  }

  /**
   * Obtiene la lista de tipos de efectos soportados
   */
  public getSupportedEffectTypes(): EffectType[] {
    return [
      'autoFilter',
      'autoWah',
      'bitCrusher',
      'chebyshev',
      'chorus',
      'distortion',
      'feedbackDelay',
      'freeverb',
      'frequencyShifter',
      'jcReverb',
      'pingPongDelay',
      'pitchShift',
      'reverb',
      'stereoWidener',
      'tremolo',
      'vibrato'
    ];
  }

  /**
   * Obtiene la lista de tipos de objetos de sonido soportados
   */
  public getSupportedSoundObjectTypes(): SoundObjectType[] {
    return [
      'cube',
      'sphere',
      'cylinder',
      'cone',
      'pyramid',
      'icosahedron',
      'plane',
      'torus',
      'dodecahedronRing',
      'spiral'
    ];
  }

  /**
   * Valida si un tipo de efecto es soportado
   */
  public isEffectTypeSupported(type: string): type is EffectType {
    return this.getSupportedEffectTypes().includes(type as EffectType);
  }

  /**
   * Valida si un tipo de objeto de sonido es soportado
   */
  public isSoundObjectTypeSupported(type: string): type is SoundObjectType {
    return this.getSupportedSoundObjectTypes().includes(type as SoundObjectType);
  }

  /**
   * Obtiene información sobre un tipo de efecto
   */
  public getEffectTypeInfo(effectType: EffectType): {
    name: string;
    description: string;
    category: 'filter' | 'modulation' | 'delay' | 'reverb' | 'distortion' | 'pitch' | 'spatial';
    parameters: string[];
  } {
    const effectInfo = {
      autoFilter: {
        name: 'Auto Filter',
        description: 'Automated filter with LFO modulation',
        category: 'filter' as const,
        parameters: ['frequency', 'depth', 'rate', 'type']
      },
      autoWah: {
        name: 'Auto Wah',
        description: 'Automated wah-wah effect',
        category: 'filter' as const,
        parameters: ['baseFrequency', 'octaves', 'sensitivity', 'Q']
      },
      bitCrusher: {
        name: 'Bit Crusher',
        description: 'Digital bit reduction effect',
        category: 'distortion' as const,
        parameters: ['bits', 'frequency']
      },
      chebyshev: {
        name: 'Chebyshev',
        description: 'Harmonic distortion effect',
        category: 'distortion' as const,
        parameters: ['order', 'oversample']
      },
      chorus: {
        name: 'Chorus',
        description: 'Chorus effect with modulation',
        category: 'modulation' as const,
        parameters: ['frequency', 'delayTime', 'depth', 'type']
      },
      distortion: {
        name: 'Distortion',
        description: 'Non-linear distortion effect',
        category: 'distortion' as const,
        parameters: ['distortion', 'oversample']
      },
      feedbackDelay: {
        name: 'Feedback Delay',
        description: 'Delay with feedback control',
        category: 'delay' as const,
        parameters: ['delayTime', 'feedback', 'wet']
      },
      freeverb: {
        name: 'Freeverb',
        description: 'Freeverb reverb algorithm',
        category: 'reverb' as const,
        parameters: ['roomSize', 'damping', 'wet']
      },
      frequencyShifter: {
        name: 'Frequency Shifter',
        description: 'Frequency shifting effect',
        category: 'pitch' as const,
        parameters: ['frequency', 'wet']
      },
      jcReverb: {
        name: 'JC Reverb',
        description: 'JCReverb reverb algorithm',
        category: 'reverb' as const,
        parameters: ['roomSize', 'damping', 'wet']
      },
      pingPongDelay: {
        name: 'Ping Pong Delay',
        description: 'Stereo ping-pong delay',
        category: 'delay' as const,
        parameters: ['delayTime', 'feedback', 'wet']
      },
      pitchShift: {
        name: 'Pitch Shift',
        description: 'Pitch shifting effect',
        category: 'pitch' as const,
        parameters: ['pitch', 'windowSize', 'overlap', 'wet']
      },
      reverb: {
        name: 'Reverb',
        description: 'Convolution reverb effect',
        category: 'reverb' as const,
        parameters: ['roomSize', 'damping', 'wet']
      },
      stereoWidener: {
        name: 'Stereo Widener',
        description: 'Stereo width enhancement',
        category: 'spatial' as const,
        parameters: ['width', 'wet']
      },
      tremolo: {
        name: 'Tremolo',
        description: 'Amplitude modulation effect',
        category: 'modulation' as const,
        parameters: ['frequency', 'depth', 'type']
      },
      vibrato: {
        name: 'Vibrato',
        description: 'Frequency modulation effect',
        category: 'modulation' as const,
        parameters: ['frequency', 'depth', 'type']
      }
    };

    return effectInfo[effectType] || {
      name: 'Unknown',
      description: 'Unknown effect type',
      category: 'distortion',
      parameters: []
    };
  }

  /**
   * Obtiene información sobre un tipo de objeto de sonido
   */
  public getSoundObjectTypeInfo(objectType: SoundObjectType): {
    name: string;
    description: string;
    category: 'basic' | 'advanced' | 'special';
    audioBehavior: 'continuous' | 'percussive' | 'hybrid';
    parameters: string[];
  } {
    const objectInfo = {
      cube: {
        name: 'Cube',
        description: 'Basic cubic sound object',
        category: 'basic' as const,
        audioBehavior: 'percussive' as const,
        parameters: ['frequency', 'volume', 'waveform']
      },
      sphere: {
        name: 'Sphere',
        description: 'Spherical sound object with FM synthesis',
        category: 'basic' as const,
        audioBehavior: 'percussive' as const,
        parameters: ['frequency', 'volume', 'waveform', 'harmonicity', 'modulationIndex']
      },
      cylinder: {
        name: 'Cylinder',
        description: 'Cylindrical sound object with vibrato',
        category: 'basic' as const,
        audioBehavior: 'continuous' as const,
        parameters: ['frequency', 'volume', 'waveform', 'vibratoAmount', 'vibratoRate']
      },
      cone: {
        name: 'Cone',
        description: 'Conical bass sound object',
        category: 'basic' as const,
        audioBehavior: 'continuous' as const,
        parameters: ['frequency', 'volume', 'waveform', 'pitchDecay', 'octaves']
      },
      pyramid: {
        name: 'Pyramid',
        description: 'Pyramidal pluck sound object',
        category: 'basic' as const,
        audioBehavior: 'percussive' as const,
        parameters: ['frequency', 'volume', 'waveform', 'ampAttack', 'ampDecay', 'filterAttack', 'filterDecay']
      },
      icosahedron: {
        name: 'Icosahedron',
        description: 'Complex geometric sound object',
        category: 'advanced' as const,
        audioBehavior: 'percussive' as const,
        parameters: ['frequency', 'volume', 'waveform', 'harmonicity', 'modulationIndex', 'resonance']
      },
      plane: {
        name: 'Plane',
        description: 'Flat plane sound object',
        category: 'basic' as const,
        audioBehavior: 'percussive' as const,
        parameters: ['frequency', 'volume', 'waveform']
      },
      torus: {
        name: 'Torus',
        description: 'Torus-shaped sound object',
        category: 'advanced' as const,
        audioBehavior: 'percussive' as const,
        parameters: ['frequency', 'volume', 'waveform']
      },
      dodecahedronRing: {
        name: 'Dodecahedron Ring',
        description: 'Ring of dodecahedrons',
        category: 'special' as const,
        audioBehavior: 'continuous' as const,
        parameters: ['frequency', 'volume', 'waveform']
      },
      spiral: {
        name: 'Spiral',
        description: 'Spiral-shaped sound object',
        category: 'special' as const,
        audioBehavior: 'percussive' as const,
        parameters: ['frequency', 'volume', 'waveform']
      }
    };

    return objectInfo[objectType] || {
      name: 'Unknown',
      description: 'Unknown object type',
      category: 'basic',
      audioBehavior: 'percussive',
      parameters: []
    };
  }

  /**
   * Obtiene estadísticas del factory
   */
  public getFactoryStats(): {
    supportedEffectTypes: number;
    supportedSoundObjectTypes: number;
    totalComponents: number;
    errorCount: number;
  } {
    return {
      supportedEffectTypes: this.getSupportedEffectTypes().length,
      supportedSoundObjectTypes: this.getSupportedSoundObjectTypes().length,
      totalComponents: 0, // En una implementación real, llevarías un contador
      errorCount: 0      // En una implementación real, llevarías un contador de errores
    };
  }
}
