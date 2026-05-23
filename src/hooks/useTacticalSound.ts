import { useEffect, useCallback } from 'react';

export function useTacticalSound() {
  useEffect(() => {
    // Keep the hook structure to prevent breaking components, but disable all sounds
  }, []);

  const playClick = useCallback(() => {}, []);
  const playHover = useCallback(() => {}, []);
  const startHum = useCallback(() => {
    return () => {};
  }, []);
  const startFilmReel = useCallback(() => {
    return () => {};
  }, []);

  return { playClick, playHover, startHum, startFilmReel };
}
