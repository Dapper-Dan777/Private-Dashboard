import { useEffect, useRef, useState } from "react";

type UseAudioTrackOptions = {
  src: string | null;
  volume?: number; // 0..1
  loop?: boolean;
  autoPlay?: boolean;
};

/**
 * Spielt eine einzelne Audio-Quelle (z. B. Ambient-Musik) ab.
 * Wechselt die Quelle sauber bei src-Change und haelt Playback-Status bei.
 */
export const useAudioTrack = ({
  src,
  volume = 0.25,
  loop = true,
  autoPlay = false,
}: UseAudioTrackOptions) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVolume, setCurrentVolume] = useState(volume);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!src) {
      stop();
      return;
    }
    // Neues Element je Quelle
    const audio = new Audio();
    audio.src = src;
    audio.loop = loop;
    audio.volume = currentVolume;
    audioRef.current = audio;
    setError(null);

    const handleError = () =>
      setError("Audio konnte nicht geladen werden. Bitte pruefe die Quelle.");
    audio.addEventListener("error", handleError);

    if (autoPlay) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
          // Autoplay kann blockiert werden; Nutzer muss dann manuell starten.
        });
    }

    return () => {
      audio.pause();
      audio.removeEventListener("error", handleError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, loop]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      setCurrentVolume(volume);
    }
  }, [volume]);

  const play = () => {
    if (!audioRef.current) return;
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        setIsPlaying(false);
      });
  };

  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  return {
    isPlaying,
    error,
    volume: currentVolume,
    play,
    pause,
    stop,
    setVolume: (v: number) => {
      if (audioRef.current) {
        const clamped = Math.max(0, Math.min(1, v));
        audioRef.current.volume = clamped;
        setCurrentVolume(clamped);
      }
    },
  };
};
