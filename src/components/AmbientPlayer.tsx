"use client";

import { useEffect, useRef } from "react";

type AmbientPlayerProps = {
  src: string | null;
  volume: number; // 0..1
  isPlaying: boolean;
};

/**
 * Global Audio-Player, der eine MP3 im Loop abspielt und auf User-Interaction
 * gestartet werden kann, um Autoplay-Restriktionen zu umgehen.
 */
export const AmbientPlayer = ({ src, volume, isPlaying }: AmbientPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);

  // User-Interaction Handler, um Autoplay zu erlauben
  useEffect(() => {
    const ensureStart = () => {
      startedRef.current = true;
      if (isPlaying) {
        audioRef.current?.play().catch(() => {});
      }
    };
    window.addEventListener("pointerdown", ensureStart, { once: true });
    window.addEventListener("click", ensureStart, { once: true });
    return () => {
      window.removeEventListener("pointerdown", ensureStart);
      window.removeEventListener("click", ensureStart);
    };
  }, [isPlaying]);

  // Quelle und Volume setzen
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
      if (src && audioRef.current.src !== window.location.origin + src) {
        audioRef.current.src = src;
      }
    }
  }, [src, volume]);

  // Play/Pause steuern
  useEffect(() => {
    if (!audioRef.current) return;
    if (!src) {
      audioRef.current.pause();
      return;
    }
    if (isPlaying) {
      audioRef.current
        .play()
        .then(() => {})
        .catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, src]);

  return (
    <audio ref={audioRef} loop preload="auto" hidden />
  );
};
