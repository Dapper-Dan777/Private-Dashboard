import { useCallback, useEffect, useRef, useState } from "react";

type UseAmbientAudioOptions = {
  volume?: number;
  preset?: string;
};

type PresetConfig = {
  frequencies: number[];
  type: OscillatorType;
  lfoFreq: number;
  lfoGain: number;
  filterFreq: number;
};

const presets: Record<string, PresetConfig> = {
  cinematic: {
    frequencies: [196, 246.94, 329.63],
    type: "sine",
    lfoFreq: 0.14,
    lfoGain: 0.06,
    filterFreq: 900,
  },
  neon: {
    frequencies: [220, 440, 660],
    type: "triangle",
    lfoFreq: 0.18,
    lfoGain: 0.1,
    filterFreq: 1200,
  },
  minimal: {
    frequencies: [174.61, 233.08],
    type: "sine",
    lfoFreq: 0.08,
    lfoGain: 0.04,
    filterFreq: 650,
  },
  aurora: {
    frequencies: [196, 261.63, 311.13],
    type: "sawtooth",
    lfoFreq: 0.11,
    lfoGain: 0.07,
    filterFreq: 800,
  },
  ocean: {
    frequencies: [110, 220, 330],
    type: "sine",
    lfoFreq: 0.1,
    lfoGain: 0.09,
    filterFreq: 520,
  },
};

export const useAmbientAudio = (options: UseAmbientAudioOptions = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(options.volume ?? 0.2);
  const presetRef = useRef(options.preset ?? "cinematic");
  const contextRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const lfoRef = useRef<OscillatorNode | null>(null);

  const stop = useCallback(() => {
    oscillatorsRef.current.forEach((osc) => osc.stop());
    oscillatorsRef.current = [];
    lfoRef.current?.stop();
    lfoRef.current = null;
    contextRef.current?.close();
    contextRef.current = null;
    gainRef.current = null;
    setIsPlaying(false);
  }, []);

  const build = useCallback(
    (presetId: string) => {
      const config = presets[presetId] ?? presets.cinematic;
      const context = new AudioContext();
      const master = context.createGain();
      master.gain.value = volume;
      master.connect(context.destination);

      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = config.filterFreq;
      filter.connect(master);

      const oscillators = config.frequencies.map((freq) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = config.type;
        osc.frequency.value = freq;
        gain.gain.value = 0.08;
        osc.connect(gain);
        gain.connect(filter);
        osc.start();
        return osc;
      });

      const lfo = context.createOscillator();
      const lfoGain = context.createGain();
      lfo.type = "sine";
      lfo.frequency.value = config.lfoFreq;
      lfoGain.gain.value = config.lfoGain;
      lfo.connect(lfoGain);
      lfoGain.connect(master.gain);
      lfo.start();

      contextRef.current = context;
      gainRef.current = master;
      oscillatorsRef.current = oscillators;
      lfoRef.current = lfo;
      setIsPlaying(true);
    },
    [volume]
  );

  const start = useCallback(() => {
    if (contextRef.current) {
      return;
    }
    build(presetRef.current);
  }, [build]);

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume;
    }
  }, [volume]);

  useEffect(() => () => stop(), [stop]);

  useEffect(() => {
    const nextPreset = options.preset ?? "cinematic";
    presetRef.current = nextPreset;
    if (isPlaying) {
      stop();
      build(nextPreset);
    }
  }, [options.preset, isPlaying, stop, build]);

  return {
    isPlaying,
    volume,
    setVolume,
    start,
    stop,
  };
};
