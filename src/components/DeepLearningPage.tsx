import { useMemo, useState } from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useI18n } from "../context/I18nContext";

export type ThemeId = "cinematic" | "neon" | "minimal" | "aurora" | "ocean";

const THEME_KEY = "learningBoardDeepTheme";

const themeConfigs: Record<
  ThemeId,
  { id: ThemeId; labelKey: string; gradient: string; video: string; audio: string }
> = {
  cinematic: {
    id: "cinematic",
    labelKey: "deep.theme.cinematic",
    gradient: "linear-gradient(160deg, #0f172a 0%, #2d1b69 45%, #f97316 100%)",
    video: "/media/cinematic.mp4",
    audio: "/media/cinematic.mp3",
  },
  neon: {
    id: "neon",
    labelKey: "deep.theme.neon",
    gradient: "linear-gradient(160deg, #0b102a 0%, #1f1a3d 45%, #00d4ff 100%)",
    video: "/media/neon.mp4",
    audio: "/media/neon.mp3",
  },
  minimal: {
    id: "minimal",
    labelKey: "deep.theme.minimal",
    gradient: "linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #334155 100%)",
    video: "/media/minimal.mp4",
    audio: "/media/minimal.mp3",
  },
  aurora: {
    id: "aurora",
    labelKey: "deep.theme.aurora",
    gradient: "linear-gradient(160deg, #0b1120 0%, #1e1b4b 55%, #10b981 100%)",
    video: "/media/aurora.mp4",
    audio: "/media/aurora.mp3",
  },
  ocean: {
    id: "ocean",
    labelKey: "deep.theme.ocean",
    gradient: "linear-gradient(160deg, #0f172a 0%, #0f766e 55%, #22d3ee 100%)",
    video: "/media/ocean.mp4",
    audio: "/media/ocean.mp3",
  },
};

type DeepLearningPageProps = {
  onPlayAmbient: (name: ThemeId, volume: number) => void;
  onPauseAmbient: () => void;
  isAmbientPlaying: boolean;
  ambientVolume: number;
  onVolumeChange: (value: number) => void;
};

export const DeepLearningPage = ({
  onPlayAmbient,
  onPauseAmbient,
  isAmbientPlaying,
  ambientVolume,
  onVolumeChange,
}: DeepLearningPageProps) => {
  const { t } = useI18n();
  const [theme, setTheme] = useLocalStorage<ThemeId>(THEME_KEY, "cinematic");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  const gradientStyle = useMemo(
    () => ({ backgroundImage: themeConfigs[theme].gradient }),
    [theme]
  );

  return (
    <div className="grid gap-4 w-full">
      <Card className="p-6 bg-surface/95 dark:bg-surface-dark/90 border border-border/60 dark:border-border-dark/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              {t("deep.title")}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {t("deep.subtitle")}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-surface-muted/80 dark:bg-surface-mutedDark/80 px-3 py-2 rounded-xl border border-border/50 dark:border-border-dark/50 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t("deep.music")}
            </span>
            <Button
              variant={isAmbientPlaying ? "secondary" : "primary"}
              onClick={() =>
                isAmbientPlaying
                  ? onPauseAmbient()
                  : onPlayAmbient(theme, ambientVolume)
              }
            >
              {isAmbientPlaying ? t("deep.pause") : t("deep.play")}
            </Button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={ambientVolume}
              onChange={(event) => onVolumeChange(Number(event.target.value))}
              className="w-28 accent-primary"
              aria-label={t("deep.volume")}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(true)}
            >
              {t("deep.fullscreen")}
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.values(themeConfigs).map((config) => (
            <Button
              key={config.id}
              variant={theme === config.id ? "primary" : "ghost"}
              onClick={() => setTheme(config.id)}
              className="rounded-pill px-4"
            >
              {t(config.labelKey)}
            </Button>
          ))}
        </div>
        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {t("deep.note")}
        </div>
      </Card>

      <Card className="p-0 overflow-hidden bg-surface/80 dark:bg-surface-dark/80 border border-border/60 dark:border-border-dark/60">
        <div className="dl-scene" style={gradientStyle}>
          <video
            className="dl-video"
            src={themeConfigs[theme].video}
            autoPlay
            loop
            muted
            playsInline
            crossOrigin="anonymous"
            onCanPlay={() => setVideoReady(true)}
            onError={() =>
              setVideoError(
                "Video konnte nicht geladen werden. Bitte lege die Datei in /public/media/ ab."
              )
            }
          />
          {!videoReady && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-white/80 bg-black/40">
              {videoError ?? "Lade Video..."}
            </div>
          )}
          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-white bg-black/40">
              {videoError}
            </div>
          )}
          <div className="dl-vignette" />
        </div>
      </Card>

      {isFullscreen && (
        <div className="dl-fullscreen">
          <div className="dl-fullscreen-inner">
            <video
              className="dl-video"
              src={themeConfigs[theme].video}
              autoPlay
              loop
              muted
              playsInline
              crossOrigin="anonymous"
            />
            <Button
              variant="secondary"
              size="sm"
              className="dl-close"
              onClick={() => setIsFullscreen(false)}
            >
              {t("deep.exitFullscreen")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
