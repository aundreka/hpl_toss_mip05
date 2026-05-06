import { useCallback, useEffect, useRef } from "react";

export const useSound = (src, volume = 0.7, onPlay) => {
  const audioRef = useRef(null);
  const onPlayRef = useRef(onPlay);

  useEffect(() => {
    onPlayRef.current = onPlay;
  }, [onPlay]);

  useEffect(() => {
    const audio = new Audio(src);
    audio.volume = volume;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [src, volume]);

  const play = useCallback(() => {
    if (!audioRef.current) return;
    onPlayRef.current?.();
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }, []);

  return play;
};
