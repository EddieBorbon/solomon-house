'use client';

import { useState } from 'react';
import { useWorldStore } from '../state/useWorldStore';

export function useParameterHandlers() {
  const [isUpdatingParams, setIsUpdatingParams] = useState(false);
  const [lastUpdatedParam, setLastUpdatedParam] = useState<string | null>(null);

  return {
    isUpdatingParams,
    lastUpdatedParam,
    setIsUpdatingParams,
    setLastUpdatedParam,
  };
}
