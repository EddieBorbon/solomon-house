'use client';

import { useState, useEffect } from 'react';
import { useTutorialStore } from '../stores/useTutorialStore';
import { useIsMobile } from './useIsMobile';

export function useTutorialUIEffects() {
  const { isActive: isTutorialActive, currentStep } = useTutorialStore();
  const isMobile = useIsMobile();
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [isAddMenuExpanded, setIsAddMenuExpanded] = useState(false);
  const [isEffectsExpanded, setIsEffectsExpanded] = useState(false);
  const [isMobileObjectExpanded, setIsMobileObjectExpanded] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setIsPanelExpanded(false);
      return;
    }

    if (!isTutorialActive) {
      setIsPanelExpanded(true);
    }
  }, [isMobile, isTutorialActive]);

  // Colapsar panel automáticamente cuando inicia el tutorial (excepto paso 5, 6, 10, 11 y 12)
  useEffect(() => {
    if (isTutorialActive && currentStep !== 4 && currentStep !== 5 && currentStep !== 9 && currentStep !== 10 && currentStep !== 11) { // Paso 5 es index 4, paso 6 es index 5, paso 10 es index 9, paso 11 es index 10, paso 12 es index 11
      setIsPanelExpanded(false);
    } else if (isTutorialActive && (currentStep === 4 || currentStep === 5 || currentStep === 9 || currentStep === 10 || currentStep === 11)) {
      // En los pasos 5, 6, 10, 11 y 12, mantener el panel expandido
      setIsPanelExpanded(true);
    }
  }, [isTutorialActive, currentStep]);

  // Expandir automáticamente el menú de objetos sonoros en el paso 5 del tutorial
  useEffect(() => {
    if (isTutorialActive && currentStep === 4) {
      setIsAddMenuExpanded(true);
    }
  }, [isTutorialActive, currentStep]);

  // Expandir automáticamente la sección de zonas de efectos en el paso 10 del tutorial
  useEffect(() => {
    if (isTutorialActive && currentStep === 9) {
      setIsEffectsExpanded(true);
    }
  }, [isTutorialActive, currentStep]);

  // Expandir automáticamente la sección de objetos móviles en el paso 11 del tutorial
  useEffect(() => {
    if (isTutorialActive && currentStep === 10) {
      setIsMobileObjectExpanded(true);
    }
  }, [isTutorialActive, currentStep]);

  // Expandir automáticamente la sección de objetos sonoros en el paso 11 del tutorial
  useEffect(() => {
    if (isTutorialActive && currentStep === 10) {
      setIsAddMenuExpanded(true);
    }
  }, [isTutorialActive, currentStep]);

  // Colapsar la sección de zonas de efectos en el paso 11 del tutorial
  useEffect(() => {
    if (isTutorialActive && currentStep === 10) {
      setIsEffectsExpanded(false);
    }
  }, [isTutorialActive, currentStep]);

  // Colapsar objetos sonoros y zonas de efectos en el paso 12 del tutorial
  useEffect(() => {
    if (isTutorialActive && currentStep === 11) {
      setIsAddMenuExpanded(false);
      setIsEffectsExpanded(false);
    }
  }, [isTutorialActive, currentStep]);

  return {
    isPanelExpanded,
    setIsPanelExpanded,
    isAddMenuExpanded,
    setIsAddMenuExpanded,
    isEffectsExpanded,
    setIsEffectsExpanded,
    isMobileObjectExpanded,
    setIsMobileObjectExpanded,
    isTutorialActive,
    currentStep
  };
}
