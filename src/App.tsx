import { useEffect, useMemo, useRef, useState } from "react";
import { ChatSidebar } from "./components/ChatSidebar";
import { SidebarSteps } from "./components/SidebarSteps";
import { StatsBar } from "./components/StatsBar";
import { StepDetail } from "./components/StepDetail";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";
import { CommandPalette } from "./components/CommandPalette";
import { BurgerMenu } from "./components/BurgerMenu";
import { DashboardOverview } from "./components/DashboardOverview";
import { DeepLearningPage } from "./components/DeepLearningPage";
import { AmbientPlayer } from "./components/AmbientPlayer";
import { StatsHeatmap } from "./components/StatsHeatmap";
import { ImportPreviewDialog } from "./components/modals/ImportPreviewDialog";
import { NewStepDialog } from "./components/modals/NewStepDialog";
import { I18nProvider, createTranslator } from "./context/I18nContext";
import { useChat } from "./hooks/useChat";
import { useTimer } from "./hooks/useTimer";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { AppState, LearningStep } from "./types";
import {
  loadApiKey,
  loadAppState,
  saveApiKey,
  saveAppState,
} from "./utils/storage";

const defaultAppState: AppState = {
  steps: [],
  currentStepId: null,
  questionsAsked: 0,
  totalTimeSeconds: 0,
};

const THEME_KEY = "learningBoardTheme";
const SECTION_KEY = "learningBoardSection";
const PROFILE_KEY = "learningBoardPromptProfile";
const HISTORY_KEY = "learningBoardChatHistoryLimit";
const LANGUAGE_KEY = "learningBoardLanguage";
const BACKUP_KEY = "learningBoardAutoBackup";
const BACKUP_INTERVAL_KEY = "learningBoardBackupIntervalMinutes";
const QUICK_NOTES_KEY = "learningBoardQuickNotes";
const SEARCH_KEY = "learningBoardSearch";
const SAMPLE_KEY = "learningBoardSampleSeeded";

type ThemeId = "cinematic" | "neon" | "minimal" | "aurora" | "ocean";

type SectionId =
  | "dashboard"
  | "steps"
  | "focus"
  | "chat"
  | "stats"
  | "settings"
  | "deep";

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const createSampleState = (): AppState => {
  const stepId = `sample-${Date.now()}`;
  const now = new Date();
  const start1 = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const end1 = new Date(start1.getTime() + 45 * 60 * 1000);
  const start2 = new Date(now.getTime() - 40 * 60 * 1000);
  const end2 = new Date(start2.getTime() + 25 * 60 * 1000);
  const sessions = [
    {
      id: `session-${Date.now()}-1`,
      stepId,
      startAt: start1.toISOString(),
      endAt: end1.toISOString(),
      durationSeconds: 2700,
    },
    {
      id: `session-${Date.now()}-2`,
      stepId,
      startAt: start2.toISOString(),
      endAt: end2.toISOString(),
      durationSeconds: 1500,
    },
  ];
  const total = sessions.reduce((acc, session) => acc + session.durationSeconds, 0);
  return {
    steps: [
      {
        id: stepId,
        title: "Mathe: Quadratische Gleichungen",
        notes:
          "Heute die pq-Formel geuebt und Beispiele geloest.\nWichtig: Vorzeichen von p und q richtig einsetzen.",
        timeSpentInSeconds: total,
        createdAt: now.toISOString(),
        tags: ["Mathe", "Pruefung", "Grundlagen"],
        sessions,
      },
    ],
    currentStepId: stepId,
    questionsAsked: 2,
    totalTimeSeconds: total,
  };
};

const App = () => {
  const [appState, setAppState] = useState<AppState>(() => {
    return loadAppState() ?? defaultAppState;
  });
  const [apiKey, setApiKey] = useState<string | null>(() => {
    const storedKey = loadApiKey();
    return storedKey && storedKey.trim().length > 0 ? storedKey : null;
  });
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => {
    const storedKey = loadApiKey();
    return storedKey && storedKey.trim().length > 0 ? storedKey : "";
  });
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      return stored === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [language, setLanguage] = useLocalStorage<"de" | "en">(
    LANGUAGE_KEY,
    "de"
  );
  const t = useMemo(() => createTranslator(language), [language]);
  const [section, setSection] = useLocalStorage<SectionId>(
    SECTION_KEY,
    "dashboard"
  );
  const [promptProfile, setPromptProfile] = useLocalStorage<
    "kurz" | "detail" | "quiz"
  >(PROFILE_KEY, "kurz");
  const [historyLimit, setHistoryLimit] = useLocalStorage<number>(
    HISTORY_KEY,
    6
  );
  const [searchQuery, setSearchQuery] = useLocalStorage<string>(
    SEARCH_KEY,
    ""
  );
  const [backupIntervalMinutes, setBackupIntervalMinutes] =
    useLocalStorage<number>(BACKUP_INTERVAL_KEY, 10);
  const [quickNotes, setQuickNotes] = useLocalStorage<
    Record<string, string[]>
  >(QUICK_NOTES_KEY, {});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNewStepOpen, setIsNewStepOpen] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [ambientTrack, setAmbientTrack] = useState<{
    name: ThemeId | null;
    volume: number;
    playing: boolean;
  }>({ name: null, volume: 0.28, playing: false });
  const [ambientMuted, setAmbientMuted] = useState(false);
  const [frontendVersion, setFrontendVersion] = useState<string | null>(null);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    appState?: AppState;
    chatHistory?: typeof messages;
    settings?: {
      theme?: "light" | "dark";
      promptProfile?: "kurz" | "detail" | "quiz";
      historyLimit?: number;
    };
  } | null>(null);
  const sessionRef = useRef<{ stepId: string; startAt: string } | null>(null);

  const currentStep = useMemo(() => {
    return (
      appState.steps.find((step) => step.id === appState.currentStepId) ?? null
    );
  }, [appState.currentStepId, appState.steps]);

  const currentQuickNotes = useMemo(() => {
    if (!currentStep) {
      return [];
    }
    return quickNotes[currentStep.id] ?? [];
  }, [currentStep, quickNotes]);

  useEffect(() => {
    // Persistiere App-State lokal fuer Offline/Local-First Verhalten.
    saveAppState(appState);
  }, [appState]);

  useEffect(() => {
    if (appState.steps.length > 0) {
      return;
    }
    try {
      const seeded = localStorage.getItem(SAMPLE_KEY);
      if (seeded) {
        return;
      }
      const sample = createSampleState();
      setAppState(sample);
      setQuickNotes({
        [sample.currentStepId ?? ""]: [
          "pq-Formel einmal sauber herleiten",
          "5 Aufgaben ohne Rechner loesen",
        ],
      });
      localStorage.setItem(SAMPLE_KEY, "true");
    } catch {
      return;
    }
  }, [appState.steps.length, setQuickNotes]);

  const timer = useTimer({
    isActive: !!appState.currentStepId,
    onTick: (deltaSeconds) => {
      setAppState((prev) => ({
        ...prev,
        totalTimeSeconds: prev.totalTimeSeconds + deltaSeconds,
      }));
    },
  });

  const { messages, isSending, sendMessage, setMessages, clearMessages } =
    useChat({
      apiKey,
      profile: promptProfile,
      maxHistory: historyLimit,
      onError: (message) => setGlobalError(message),
      onQuestionAsked: () =>
        setAppState((prev) => ({
          ...prev,
          questionsAsked: prev.questionsAsked + 1,
        })),
    });

  // Lade API-Key aus URL (wenn von GitHub Pages mit Parameter geladen)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const apiKeyParam = urlParams.get("apiKey");
    if (apiKeyParam) {
      try {
        // Base64-decode
        const decoded = atob(decodeURIComponent(apiKeyParam));
        if (decoded && decoded.trim().length > 0) {
          saveApiKey(decoded);
          setApiKey(decoded);
          setApiKeyInput(decoded);
          // Entferne Parameter aus URL
          urlParams.delete("apiKey");
          const newUrl = window.location.pathname + (urlParams.toString() ? "?" + urlParams.toString() : "");
          window.history.replaceState({}, "", newUrl);
        }
      } catch (e) {
        console.warn("Could not decode API key from URL:", e);
      }
    }
    
    // Versuche auch, API-Key von Tauri zu laden (falls verfügbar)
    (async () => {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const localKey = loadApiKey();
        const tauriKey = await invoke<string | null>("get_api_key");
        
        if (localKey && localKey.trim().length > 0) {
          // Synchronisiere localStorage -> Tauri Storage
          if (!tauriKey || tauriKey !== localKey) {
            await invoke("set_api_key", { key: localKey });
          }
        } else if (tauriKey && tauriKey.trim().length > 0) {
          // Synchronisiere Tauri Storage -> localStorage
          saveApiKey(tauriKey);
          setApiKey(tauriKey);
          setApiKeyInput(tauriKey);
        }
      } catch {
        // Tauri nicht verfügbar - ignoriere
      }
    })();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      return;
    }
  }, [theme]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!appState.currentStepId) {
      sessionRef.current = null;
      timer.reset();
    }
  }, [appState.currentStepId]);

  useEffect(() => {
    // Lade Frontend-Version
    fetch("/frontend-version.json")
      .then((res) => res.json())
      .then((data) => {
        setFrontendVersion(data.version || "unknown");
        // Prüfe auf Updates
        fetch("https://dapper-dan777.github.io/Private-Dashboard/frontend-version.json")
          .then((res) => res.json())
          .then((remote) => {
            if (remote.version && remote.version !== data.version) {
              setHasUpdate(true);
            }
          })
          .catch(() => {});
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!globalError) {
      return;
    }
    const timeout = window.setTimeout(() => setGlobalError(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [globalError]);

  const handleAddStep = (title: string) => {
    const newStep: LearningStep = {
      id: createId(),
      title,
      notes: "",
      timeSpentInSeconds: 0,
      createdAt: new Date().toISOString(),
      tags: [],
      sessions: [],
    };
    setAppState((prev) => ({
      ...prev,
      steps: [newStep, ...prev.steps],
      currentStepId: prev.currentStepId ?? newStep.id,
    }));
  };

  const commitCurrentStepTime = (stepId: string, seconds: number) => {
    if (!stepId || seconds <= 0) {
      return;
    }
    setAppState((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              timeSpentInSeconds: step.timeSpentInSeconds + seconds,
            }
          : step
      ),
    }));
  };

  const appendSession = (
    stepId: string,
    startAt: string,
    endAt: string,
    durationSeconds: number
  ) => {
    if (durationSeconds <= 0) {
      return;
    }
    setAppState((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              sessions: [
                ...step.sessions,
                {
                  id: createId(),
                  stepId,
                  startAt,
                  endAt,
                  durationSeconds,
                },
              ],
            }
          : step
      ),
    }));
  };

  const finalizeActiveSession = () => {
    const active = sessionRef.current;
    if (!active) {
      return;
    }
    const durationSeconds = timer.seconds;
    const endAt = new Date().toISOString();
    commitCurrentStepTime(active.stepId, durationSeconds);
    appendSession(active.stepId, active.startAt, endAt, durationSeconds);
    sessionRef.current = null;
  };

  const handleSelectStep = (id: string) => {
    if (id === appState.currentStepId) {
      return;
    }
    finalizeActiveSession();
    timer.reset();
    setAppState((prev) => ({
      ...prev,
      currentStepId: id,
    }));
  };

  const handleDeleteStep = (id: string) => {
    if (appState.currentStepId === id) {
      finalizeActiveSession();
      timer.reset();
    }
    setAppState((prev) => ({
      ...prev,
      steps: prev.steps.filter((step) => step.id !== id),
      currentStepId: prev.currentStepId === id ? null : prev.currentStepId,
    }));
  };

  const handleChangeNotes = (notes: string) => {
    if (!appState.currentStepId) {
      return;
    }
    setAppState((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === prev.currentStepId ? { ...step, notes } : step
      ),
    }));
  };

  const handleChangeTags = (tags: string[]) => {
    if (!appState.currentStepId) {
      return;
    }
    setAppState((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === prev.currentStepId ? { ...step, tags } : step
      ),
    }));
  };

  const handleAddQuickNote = (note: string) => {
    const stepId = appState.currentStepId;
    if (!stepId) {
      return;
    }
    const trimmed = note.trim();
    if (!trimmed) {
      return;
    }
    const existing = quickNotes[stepId] ?? [];
    setQuickNotes((prev) => ({
      ...prev,
      [stepId]: [...existing, trimmed],
    }));
  };

  const handleRemoveQuickNote = (index: number) => {
    const stepId = appState.currentStepId;
    if (!stepId) {
      return;
    }
    const existing = quickNotes[stepId] ?? [];
    setQuickNotes((prev) => ({
      ...prev,
      [stepId]: existing.filter((note: string, idx: number) => idx !== index),
    }));
  };

  const handleStartTimer = () => {
    if (!appState.currentStepId) {
      return;
    }
    if (!sessionRef.current) {
      sessionRef.current = {
        stepId: appState.currentStepId,
        startAt: new Date().toISOString(),
      };
    }
    timer.start();
  };

  const handlePauseTimer = () => {
    finalizeActiveSession();
    timer.reset();
  };

  const handleResetTimer = () => {
    timer.reset();
  };

  const handleSetPreset = (seconds: number) => {
    timer.setSeconds(seconds);
  };

  const handleSaveApiKey = async (key: string) => {
    const trimmed = key.trim();
    saveApiKey(trimmed);
    setApiKey(trimmed.length > 0 ? trimmed : null);
    setApiKeyInput(trimmed);
    
    // Speichere auch in Tauri's Storage (falls verfügbar)
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("set_api_key", { key: trimmed.length > 0 ? trimmed : null });
    } catch {
      // Tauri nicht verfügbar (z.B. im Browser) - ignoriere
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const saveBackup = () => {
    try {
      const payload = {
        savedAt: new Date().toISOString(),
        appState,
        chatHistory: messages,
        settings: {
          theme,
          promptProfile,
          historyLimit,
          language,
        },
      };
      localStorage.setItem(BACKUP_KEY, JSON.stringify(payload));
    } catch {
      return;
    }
  };

  useEffect(() => {
    if (backupIntervalMinutes <= 0) {
      return;
    }
    saveBackup();
    const interval = window.setInterval(
      saveBackup,
      backupIntervalMinutes * 60 * 1000
    );
    return () => window.clearInterval(interval);
  }, [
    backupIntervalMinutes,
    appState,
    messages,
    theme,
    promptProfile,
    historyLimit,
    language,
  ]);

  const exportMarkdown = () => {
    const lines = [
      "# Learning Board Export",
      "",
      `Exportiert: ${new Date().toLocaleString("de-DE")}`,
      "",
    ];
    appState.steps.forEach((step) => {
      lines.push(`## ${step.title}`);
      if (step.tags.length > 0) {
        lines.push(`Tags: ${step.tags.join(", ")}`);
      }
      lines.push(
        `Zeit: ${Math.round(step.timeSpentInSeconds / 60)} Minuten`,
        ""
      );
      lines.push(step.notes || "_Keine Notizen_", "");
    });
    downloadFile(lines.join("\n"), "learning-board.md", "text/markdown");
  };

  const exportJson = () => {
    const payload = {
      version: 1,
      appState,
      chatHistory: messages,
      settings: {
        theme,
        promptProfile,
        historyLimit,
      },
    };
    downloadFile(JSON.stringify(payload, null, 2), "learning-board.json", "application/json");
  };

  const exportChat = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      chatHistory: messages,
    };
    downloadFile(
      JSON.stringify(payload, null, 2),
      "learning-board-chat.json",
      "application/json"
    );
  };

  const downloadBackup = () => {
    const backup = localStorage.getItem(BACKUP_KEY);
    if (!backup) {
      return;
    }
    downloadFile(backup, "learning-board-backup.json", "application/json");
  };

  const handleImport = async (file: File | null) => {
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as {
        appState?: AppState;
        chatHistory?: typeof messages;
        settings?: {
          theme?: "light" | "dark";
          promptProfile?: "kurz" | "detail" | "quiz";
          historyLimit?: number;
        };
      };
      setImportPreview(parsed);
    } catch {
      return;
    }
  };

  const confirmImport = (payload: {
    appState?: AppState;
    chatHistory?: typeof messages;
    settings?: {
      theme?: "light" | "dark";
      promptProfile?: "kurz" | "detail" | "quiz";
      historyLimit?: number;
    };
  }) => {
    if (payload.appState) {
      const normalized = {
        ...payload.appState,
        steps: (payload.appState.steps ?? []).map((step) => ({
          ...step,
          tags: Array.isArray(step.tags) ? step.tags : [],
          sessions: Array.isArray(step.sessions) ? step.sessions : [],
        })),
      };
      setAppState(normalized);
    }
    if (Array.isArray(payload.chatHistory)) {
      setMessages(payload.chatHistory);
    }
    if (payload.settings?.theme) {
      setTheme(payload.settings.theme);
    }
    if (payload.settings?.promptProfile) {
      setPromptProfile(payload.settings.promptProfile);
    }
    if (
      typeof payload.settings?.historyLimit === "number" &&
      Number.isFinite(payload.settings.historyLimit)
    ) {
      setHistoryLimit(payload.settings.historyLimit);
    }
    setImportPreview(null);
  };

  const sections: Array<{ id: SectionId; label: string }> = useMemo(
    () => [
      { id: "dashboard", label: t("nav.dashboard") },
      { id: "steps", label: t("nav.steps") },
      { id: "focus", label: t("nav.focus") },
      { id: "chat", label: t("nav.chat") },
      { id: "stats", label: t("nav.stats") },
      { id: "deep", label: t("nav.deep") },
      { id: "settings", label: t("nav.settings") },
    ],
    [t]
  );

  const actions = useMemo(
    () => [
      {
        id: "new-step",
        label: t("dialog.newStepTitle"),
        run: () => setIsNewStepOpen(true),
      },
      {
        id: "start-timer",
        label: `${t("focus.start")} (Timer)`,
        run: () => handleStartTimer(),
      },
      {
        id: "pause-timer",
        label: `${t("focus.pause")} (Timer)`,
        run: () => handlePauseTimer(),
      },
      {
        id: "reset-timer",
        label: `${t("focus.reset")} (Timer)`,
        run: () => handleResetTimer(),
      },
      {
        id: "toggle-theme",
        label: t("app.toggleTheme"),
        run: () => setTheme((prev) => (prev === "dark" ? "light" : "dark")),
      },
      {
        id: "go-dashboard",
        label: t("nav.dashboard"),
        run: () => setSection("dashboard"),
      },
      { id: "go-chat", label: t("nav.chat"), run: () => setSection("chat") },
      { id: "go-focus", label: t("nav.focus"), run: () => setSection("focus") },
      { id: "go-stats", label: t("nav.stats"), run: () => setSection("stats") },
      { id: "go-deep", label: t("nav.deep"), run: () => setSection("deep") },
      {
        id: "go-settings",
        label: t("nav.settings"),
        run: () => setSection("settings"),
      },
    ],
    [t, handleStartTimer, handlePauseTimer, handleResetTimer, setSection]
  );

  const isConnected = !!apiKey;

  const renderSection = () => {
    if (section === "dashboard") {
      return (
        <DashboardOverview
          appState={appState}
          currentStep={currentStep}
          onOpenSection={(id) => setSection(id as SectionId)}
        />
      );
    }
    if (section === "steps") {
      return (
        <SidebarSteps
          steps={appState.steps}
          currentStepId={appState.currentStepId}
          onAddStep={handleAddStep}
          onSelectStep={handleSelectStep}
          onDeleteStep={handleDeleteStep}
          globalQuery={searchQuery}
        />
      );
    }
    if (section === "focus") {
      return (
        <StepDetail
          step={currentStep}
          isTimerRunning={timer.isRunning}
          timerSeconds={timer.seconds}
          onStart={handleStartTimer}
          onPause={handlePauseTimer}
          onReset={handleResetTimer}
          onSetPreset={handleSetPreset}
          onChangeNotes={handleChangeNotes}
          onChangeTags={handleChangeTags}
          quickNotes={currentQuickNotes}
          onAddQuickNote={handleAddQuickNote}
          onRemoveQuickNote={handleRemoveQuickNote}
        />
      );
    }
    if (section === "chat") {
      return (
        <ChatSidebar
          apiKey={apiKey}
          onSaveApiKey={handleSaveApiKey}
          messages={messages}
          onSendMessage={(content) =>
            sendMessage(content, currentStep?.title ?? undefined)
          }
          isSending={isSending}
          currentStepTitle={currentStep?.title ?? null}
        />
      );
    }
    if (section === "stats") {
      return (
        <div className="grid gap-4">
          <StatsBar
            totalSteps={appState.steps.length}
            totalTimeSeconds={appState.totalTimeSeconds}
            questionsAsked={appState.questionsAsked}
          />
          <StatsHeatmap steps={appState.steps} />
        </div>
      );
    }
    if (section === "deep") {
      return (
        <div className="h-full overflow-auto scrollbar">
          <DeepLearningPage
            onPlayAmbient={(name, volume) =>
              setAmbientTrack({ name, volume, playing: true })
            }
            onPauseAmbient={() =>
              setAmbientTrack((prev) => ({ ...prev, playing: false }))
            }
            isAmbientPlaying={ambientTrack.playing}
            ambientVolume={ambientTrack.volume}
            onVolumeChange={(value) =>
              setAmbientTrack((prev) => ({
                ...prev,
                volume: Math.max(0, Math.min(1, value)),
              }))
            }
          />
        </div>
      );
    }
    return (
          <Card className="p-6 flex flex-col gap-6 max-h-full overflow-auto scrollbar bg-surface/95 dark:bg-surface-dark/90 border border-border/60 dark:border-border-dark/60">
        <div className="text-xl font-semibold">{t("settings.title")}</div>
        <div>
          <div className="text-lg font-semibold">{t("settings.apiKey")}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {t("settings.apiKeyHint")}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-2xl border border-border/70 dark:border-border-dark/70 bg-white/80 dark:bg-surface-mutedDark/70 px-3 py-2">
              <input
                type={showApiKey ? "text" : "password"}
                    className="w-64 bg-transparent text-sm text-slate-700 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                placeholder="Perplexity API-Key"
                value={apiKeyInput}
                onChange={(event) => setApiKeyInput(event.target.value)}
              />
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleSaveApiKey(apiKeyInput)}
              >
                {t("settings.save")}
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowApiKey((prev) => !prev)}
            >
              {showApiKey ? t("settings.hide") : t("settings.show")}
            </Button>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                isConnected
                  ? "bg-success/15 text-success"
                  : "bg-slate-100/70 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400"
              }`}
            >
              {isConnected ? t("app.connected") : t("app.notConnected")}
            </span>
            {apiKeyInput !== (apiKey ?? "") && (
              <span className="text-amber-600 dark:text-amber-400 text-xs">
                {t("settings.unsaved")}
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="text-lg font-semibold">{t("settings.profile")}</div>
          <div className="mt-2 flex items-center gap-3">
            <select
                  className="rounded-xl border border-border/70 dark:border-border-dark/70 bg-white/90 dark:bg-surface-mutedDark/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              value={promptProfile}
              onChange={(event) =>
                setPromptProfile(event.target.value as "kurz" | "detail" | "quiz")
              }
            >
              <option value="kurz">{t("settings.profileShort")}</option>
              <option value="detail">{t("settings.profileDetail")}</option>
              <option value="quiz">{t("settings.profileQuiz")}</option>
            </select>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t("settings.profileHint")}
            </div>
          </div>
        </div>

        <div>
          <div className="text-lg font-semibold">{t("settings.context")}</div>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={20}
                  className="w-24 rounded-xl border border-border/70 dark:border-border-dark/70 bg-white/90 dark:bg-surface-mutedDark/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              value={historyLimit}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (!Number.isFinite(value)) {
                  setHistoryLimit(0);
                  return;
                }
                setHistoryLimit(Math.max(0, Math.min(20, value)));
              }}
            />
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t("settings.contextHint")}
            </div>
          </div>
        </div>

        <div>
          <div className="text-lg font-semibold">{t("settings.exportImport")}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button variant="primary" onClick={exportJson}>
              {t("settings.exportJson")}
            </Button>
            <Button variant="secondary" onClick={exportMarkdown}>
              {t("settings.exportMd")}
            </Button>
            <Button variant="secondary" onClick={exportChat}>
              {t("settings.exportChat")}
            </Button>
            <label className="text-sm text-slate-600 dark:text-slate-300">
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(event) => handleImport(event.target.files?.[0] ?? null)}
              />
              <span className="cursor-pointer rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 px-3 py-2 inline-block">
                {t("settings.importJson")}
              </span>
            </label>
          </div>
        </div>

        <div>
          <div className="text-lg font-semibold">{t("settings.backup")}</div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <input
              type="number"
              min={1}
              max={120}
                  className="w-24 rounded-xl border border-border/70 dark:border-border-dark/70 bg-white/90 dark:bg-surface-mutedDark/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              value={backupIntervalMinutes}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (!Number.isFinite(value)) {
                  return;
                }
                setBackupIntervalMinutes(Math.max(1, Math.min(120, value)));
              }}
            />
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t("settings.backupHint")}
            </div>
            <Button variant="ghost" onClick={downloadBackup}>
              {t("settings.backupDownload")}
            </Button>
          </div>
        </div>

        <div>
          <div className="text-lg font-semibold">{t("settings.language")}</div>
          <div className="mt-2 flex items-center gap-3">
            <select
                  className="rounded-xl border border-border/70 dark:border-border-dark/70 bg-white/90 dark:bg-surface-mutedDark/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              value={language}
              onChange={(event) => setLanguage(event.target.value as "de" | "en")}
            >
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div>
          <div className="text-lg font-semibold">{t("settings.chatHistory")}</div>
          <div className="mt-2 flex items-center gap-2">
            <Button variant="danger" onClick={clearMessages}>
              {t("settings.chatClear")}
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <I18nProvider language={language}>
      <AmbientPlayer
        src={ambientTrack.name ? `/media/${ambientTrack.name}.mp3` : null}
        volume={ambientMuted ? 0 : ambientTrack.volume}
        isPlaying={ambientTrack.playing}
      />
      <div className="h-screen p-4 text-slate-800 dark:text-slate-100">
        <BurgerMenu
          isOpen={isMenuOpen}
          sections={sections}
          currentSectionId={section}
          onClose={() => setIsMenuOpen(false)}
          onSelect={(id) => {
            setSection(id as SectionId);
            setIsMenuOpen(false);
          }}
        />
        <CommandPalette
          isOpen={isCommandOpen}
          onClose={() => setIsCommandOpen(false)}
          actions={actions}
        />
        <NewStepDialog
          isOpen={isNewStepOpen}
          onClose={() => setIsNewStepOpen(false)}
          onCreate={(title) => {
            handleAddStep(title);
            setSection("steps");
          }}
        />
        <ImportPreviewDialog
          isOpen={!!importPreview}
          payload={importPreview}
          onClose={() => setImportPreview(null)}
          onConfirm={(payload) => confirmImport(payload)}
        />
        {globalError && (
          <div className="fixed top-4 right-4 z-50 rounded-xl bg-danger/90 px-4 py-2 text-sm text-white shadow-soft">
            {globalError}
          </div>
        )}
        <div className="flex flex-col h-full gap-4 w-full max-w-none">
          <Card className="px-4 py-3 flex items-center justify-between gap-4 bg-white/70 dark:bg-surface-dark/70 border border-primary/10 dark:border-primary/15 shadow-soft backdrop-blur">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Menue oeffnen"
              >
                ☰
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                    🎓 {t("app.title")}
                  </div>
                  {frontendVersion && (
                    <span className="rounded-pill px-2 py-0.5 text-xs font-mono bg-primary/10 text-primary border border-primary/30">
                      v{frontendVersion.slice(-6)}
                    </span>
                  )}
                  {hasUpdate && (
                    <span className="rounded-pill px-2 py-0.5 text-xs font-semibold bg-accent/20 text-accent border border-accent/40 animate-pulse">
                      ✨ Update verfügbar
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {t("app.currentView")}: {sections.find((s) => s.id === section)?.label}
                </div>
              </div>
            </div>
            <input
              className="hidden md:block flex-1 max-w-[360px] rounded-xl border border-border/70 dark:border-border-dark/70 bg-white/85 dark:bg-surface-mutedDark/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
              placeholder={t("steps.filterPlaceholder")}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => setSection("steps")}
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsNewStepOpen(true)}
              >
                {t("app.newStep")}
              </Button>
              <span
                className={`rounded-pill px-3 py-1 text-xs font-semibold transition border ${
                  isConnected
                    ? "bg-success/20 text-success border-success/50"
                    : "bg-surface-muted/80 dark:bg-surface-mutedDark/80 text-slate-500 dark:text-slate-400 border-border/70 dark:border-border-dark/70"
                }`}
              >
                {isConnected ? t("app.connected") : t("app.notConnected")}
              </span>
              <span
                className={`rounded-pill px-3 py-1 text-xs font-semibold transition border flex items-center gap-1 ${
                  ambientTrack.playing && !ambientMuted
                    ? "bg-primary/15 text-primary border-primary/40"
                    : "bg-surface-muted/70 dark:bg-surface-mutedDark/70 text-slate-500 dark:text-slate-400 border-border/60 dark:border-border-dark/60"
                }`}
              >
                <span aria-hidden>🎧</span>
                {ambientTrack.playing && !ambientMuted ? "Ambient läuft" : "Ambient aus"}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAmbientMuted((prev) => !prev)}
              >
                {ambientMuted ? "🔇" : "🔊"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setTheme((prev) => (prev === "dark" ? "light" : "dark"))
                }
                aria-label="Theme umschalten"
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </Button>
            </div>
          </Card>
          {/* Hinweisbox entfernt, um Chat nach oben zu ziehen */}
          <div className="flex-1 min-h-0 overflow-hidden">{renderSection()}</div>
        </div>
      </div>
    </I18nProvider>
  );
};

export default App;
