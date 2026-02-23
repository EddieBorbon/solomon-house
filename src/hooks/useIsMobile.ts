import { useEffect, useState } from 'react';

const DEFAULT_BREAKPOINT = 768;

export function useIsMobile(breakpoint: number = DEFAULT_BREAKPOINT) {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.innerWidth <= breakpoint;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const updateIsMobile = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    updateIsMobile();

    window.addEventListener('resize', updateIsMobile);
    window.addEventListener('orientationchange', updateIsMobile);

    return () => {
      window.removeEventListener('resize', updateIsMobile);
      window.removeEventListener('orientationchange', updateIsMobile);
    };
  }, [breakpoint]);

  return isMobile;
}

