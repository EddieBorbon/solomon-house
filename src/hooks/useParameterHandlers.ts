'use client';

import { useState } from 'react';

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
