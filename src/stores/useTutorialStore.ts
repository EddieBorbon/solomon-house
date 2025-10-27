import { create } from 'zustand';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    type: 'click' | 'create' | 'move' | 'configure' | 'info' | 'rotate' | 'zoom' | 'shift' | 'playback' | 'transform';
    message?: string;
  };
  verification?: {
    check: () => boolean;
    successMessage: string;
    failureMessage: string;
  };
  hints?: string[];
  estimatedTime: number; // segundos
  skipAllowed: boolean;
}

export interface TutorialProgress {
  completedSteps: string[];
  skippedSteps: string[];
  currentStep: number;
  isActive: boolean;
  startedAt?: Date;
  completedAt?: Date;
}

interface TutorialStore extends TutorialProgress {
  cameraPositionHistory: Array<{ x: number; y: number; z: number; timestamp: number }>; // Historial de posiciones de cámara para paso 7
  addCameraPosition: (x: number, y: number, z: number) => void;
  resetCameraHistory: () => void;
  setCurrentStep: (step: number) => void;
  completeStep: (stepId: string) => void;
  skipStep: (stepId: string) => void;
  startTutorial: () => void;
  stopTutorial: () => void;
  resetTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
}

export const useTutorialStore = create<TutorialStore>((set) => ({
  // Initial state
  completedSteps: [],
  skippedSteps: [],
  currentStep: 0,
  isActive: false,
  startedAt: undefined,
  completedAt: undefined,
  cameraPositionHistory: [],

  // Actions
  addCameraPosition: (x: number, y: number, z: number) =>
    set((state) => {
      const now = Date.now();
      const newHistory = [...state.cameraPositionHistory, { x, y, z, timestamp: now }];
      // Mantener solo las últimas 50 posiciones para no llenar memoria
      return { cameraPositionHistory: newHistory.slice(-50) };
    }),
  resetCameraHistory: () => set({ cameraPositionHistory: [] }),
  setCurrentStep: (step: number) => set({ currentStep: step }),

  completeStep: (stepId: string) =>
    set((state) => ({
      completedSteps: [...state.completedSteps, stepId],
    })),

  skipStep: (stepId: string) =>
    set((state) => ({
      skippedSteps: [...state.skippedSteps, stepId],
    })),

  startTutorial: () =>
    set({
      isActive: true,
      currentStep: 0,
      startedAt: new Date(),
    }),

  stopTutorial: () =>
    set({
      isActive: false,
      completedAt: new Date(),
    }),

  resetTutorial: () =>
    set({
      completedSteps: [],
      skippedSteps: [],
      currentStep: 0,
      isActive: false,
      startedAt: undefined,
      completedAt: undefined,
    }),

  nextStep: () =>
    set((state) => ({
      currentStep: state.currentStep + 1,
      cameraPositionHistory: [], // Reset historial al cambiar de paso
    })),

  previousStep: () =>
    set((state) => ({
      currentStep: Math.max(0, state.currentStep - 1),
      cameraPositionHistory: [], // Reset historial al retroceder
    })),
}));

