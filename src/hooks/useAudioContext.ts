import { useState, useEffect, useCallback } from 'react';
import { audioManager } from '../lib/AudioManager';

export function useAudioContext() {
  const [isAudioContextStarted, setIsAudioContextStarted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [contextState, setContextState] = useState('suspended');

  // Initialize state from AudioManager
  useEffect(() => {
    const updateState = () => {
      setIsAudioContextStarted(audioManager.isContextStarted());
      setContextState(audioManager.getContextState().state);
    };

    updateState();

    // Listen for context state changes
    audioManager.onContextStateChange((newState) => {
      setContextState(newState);
      setIsAudioContextStarted(audioManager.isContextStarted());
    });

    return () => {
      // Cleanup listeners if needed
    };
  }, []);

  const startAudioContext = useCallback(async () => {
    if (isAudioContextStarted || isInitializing) {
      return;
    }

    setIsInitializing(true);
    try {
      const success = await audioManager.startContext();
      if (success) {
        setIsAudioContextStarted(true);
        setContextState('running');
      }
    } catch (error) {
      console.error('Error starting audio context:', error);
    } finally {
      setIsInitializing(false);
    }
  }, [isAudioContextStarted, isInitializing]);

  const checkAudioContextState = useCallback(() => {
    const state = audioManager.getContextState();
    setContextState(state.state);
    setIsAudioContextStarted(audioManager.isContextStarted());
    
    console.log('Audio Context State:', {
      state: state.state,
      isRunning: state.isRunning,
      sampleRate: state.sampleRate,
      latencyHint: state.latencyHint
    });
  }, []);

  const suspendContext = useCallback(async () => {
    try {
      await audioManager.suspendContext();
      setIsAudioContextStarted(false);
      setContextState('suspended');
    } catch (error) {
      console.error('Error suspending audio context:', error);
    }
  }, []);

  const resumeContext = useCallback(async () => {
    try {
      await audioManager.resumeContext();
      setIsAudioContextStarted(true);
      setContextState('running');
    } catch (error) {
      console.error('Error resuming audio context:', error);
    }
  }, []);

  const closeContext = useCallback(async () => {
    try {
      await audioManager.closeContext();
      setIsAudioContextStarted(false);
      setContextState('closed');
    } catch (error) {
      console.error('Error closing audio context:', error);
    }
  }, []);

  return {
    isAudioContextStarted,
    isInitializing,
    contextState,
    startAudioContext,
    checkAudioContextState,
    suspendContext,
    resumeContext,
    closeContext,
    isContextRunning: audioManager.isContextRunning(),
    isContextValid: audioManager.isContextValid()
  };
}
