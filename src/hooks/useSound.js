import { useCallback, useEffect, useRef } from "react";

let sharedAudioContext = null;
const audioBufferCache = new Map();

const getAudioContext = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContextClass({ latencyHint: "interactive" });
  }

  return sharedAudioContext;
};

const loadAudioBuffer = async (src) => {
  if (audioBufferCache.has(src)) {
    return audioBufferCache.get(src);
  }

  const context = getAudioContext();

  if (!context) {
    return null;
  }

  const bufferPromise = fetch(src)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => context.decodeAudioData(arrayBuffer.slice(0)))
    .catch((error) => {
      audioBufferCache.delete(src);
      throw error;
    });

  audioBufferCache.set(src, bufferPromise);

  return bufferPromise;
};

export const useSound = (src, volume = 0.7, onPlay) => {
  const onPlayRef = useRef(onPlay);
  const bufferRef = useRef(null);
  const htmlAudioRef = useRef(null);

  useEffect(() => {
    onPlayRef.current = onPlay;
  }, [onPlay]);

  useEffect(() => {
    let isDisposed = false;

    bufferRef.current = null;
    htmlAudioRef.current = null;

    loadAudioBuffer(src)
      .then((buffer) => {
        if (!isDisposed) {
          bufferRef.current = buffer;
        }
      })
      .catch(() => {
        if (isDisposed) {
          return;
        }

        const fallbackAudio = new Audio(src);
        fallbackAudio.preload = "auto";
        fallbackAudio.load();
        htmlAudioRef.current = fallbackAudio;
      });

    return () => {
      isDisposed = true;

      if (htmlAudioRef.current) {
        htmlAudioRef.current.pause();
      }
    };
  }, [src]);

  const play = useCallback(() => {
    onPlayRef.current?.();

    const context = getAudioContext();
    const buffer = bufferRef.current;

    if (context && buffer) {
      if (context.state === "suspended") {
        context.resume().catch(() => {});
      }

      const source = context.createBufferSource();
      const gainNode = context.createGain();

      gainNode.gain.value = volume;
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(context.destination);
      source.start(0);

      return;
    }

    const fallbackAudio = htmlAudioRef.current;

    if (!fallbackAudio) {
      return;
    }

    fallbackAudio.currentTime = 0;
    fallbackAudio.volume = volume;
    fallbackAudio.play().catch(() => {});
  }, [volume]);

  return play;
};
