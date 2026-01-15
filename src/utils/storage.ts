import type { AppState, ChatMessage, TimerSession } from "../types";

const APP_STATE_KEY_V1 = "learningBoardAppStateV1";
const APP_STATE_KEY_V2 = "learningBoardAppStateV2";
const API_KEY = "perplexityApiKey";
const CHAT_HISTORY_KEY_V1 = "learningBoardChatHistory";
const CHAT_HISTORY_KEY_V2 = "learningBoardChatHistoryV2";

const defaultAppState: AppState = {
  steps: [],
  currentStepId: null,
  questionsAsked: 0,
  totalTimeSeconds: 0,
};

const safeParse = <T>(value: string, fallback: T): T => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const normalizeSessions = (sessions: unknown): TimerSession[] => {
  if (!Array.isArray(sessions)) {
    return [];
  }
  return sessions
    .filter((session) => session && typeof session === "object")
    .map((session) => ({
      id: typeof session.id === "string" ? session.id : "",
      stepId: typeof session.stepId === "string" ? session.stepId : "",
      startAt:
        typeof session.startAt === "string"
          ? session.startAt
          : new Date().toISOString(),
      endAt:
        typeof session.endAt === "string"
          ? session.endAt
          : new Date().toISOString(),
      durationSeconds:
        typeof session.durationSeconds === "number" &&
        Number.isFinite(session.durationSeconds)
          ? Math.max(0, session.durationSeconds)
          : 0,
    }))
    .filter((session) => session.id.length > 0 && session.stepId.length > 0);
};

const normalizeAppState = (value: Partial<AppState> | null): AppState => {
  if (!value) {
    return defaultAppState;
  }
  const steps = Array.isArray(value.steps) ? value.steps : [];
  return {
    steps: steps
      .filter((step) => step && typeof step === "object")
      .map((step) => ({
        id: typeof step.id === "string" ? step.id : "",
        title: typeof step.title === "string" ? step.title : "Unbenannt",
        notes: typeof step.notes === "string" ? step.notes : "",
        timeSpentInSeconds:
          typeof step.timeSpentInSeconds === "number" &&
          Number.isFinite(step.timeSpentInSeconds)
            ? Math.max(0, step.timeSpentInSeconds)
            : 0,
        createdAt:
          typeof step.createdAt === "string"
            ? step.createdAt
            : new Date().toISOString(),
        tags: Array.isArray(step.tags)
          ? step.tags.filter((tag) => typeof tag === "string")
          : [],
        sessions: normalizeSessions(step.sessions),
      }))
      .filter((step) => step.id.length > 0),
    currentStepId:
      typeof value.currentStepId === "string" ? value.currentStepId : null,
    questionsAsked:
      typeof value.questionsAsked === "number" &&
      Number.isFinite(value.questionsAsked)
        ? Math.max(0, value.questionsAsked)
        : 0,
    totalTimeSeconds:
      typeof value.totalTimeSeconds === "number" &&
      Number.isFinite(value.totalTimeSeconds)
        ? Math.max(0, value.totalTimeSeconds)
        : 0,
  };
};

export const loadAppState = (): AppState | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const rawV2 = localStorage.getItem(APP_STATE_KEY_V2);
  if (rawV2) {
    const parsed = safeParse<{ version?: number; data?: AppState }>(
      rawV2,
      {}
    );
    if (parsed && parsed.data) {
      return normalizeAppState(parsed.data);
    }
  }

  const rawV1 = localStorage.getItem(APP_STATE_KEY_V1);
  if (!rawV1) {
    return null;
  }
  const migrated = normalizeAppState(safeParse<AppState>(rawV1, defaultAppState));
  saveAppState(migrated);
  return migrated;
};

export const saveAppState = (state: AppState) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(
      APP_STATE_KEY_V2,
      JSON.stringify({ version: 2, data: state })
    );
  } catch {
    return;
  }
};

export const loadApiKey = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(API_KEY);
};

export const saveApiKey = (key: string) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(API_KEY, key);
  } catch {
    return;
  }
};

export const loadChatHistory = (): ChatMessage[] => {
  if (typeof window === "undefined") {
    return [];
  }
  const rawV2 = localStorage.getItem(CHAT_HISTORY_KEY_V2);
  if (rawV2) {
    const parsed = safeParse<{ version?: number; data?: ChatMessage[] }>(
      rawV2,
      {}
    );
    if (parsed && Array.isArray(parsed.data)) {
      return parsed.data.filter((message) => message && message.id);
    }
  }

  const rawV1 = localStorage.getItem(CHAT_HISTORY_KEY_V1);
  if (!rawV1) {
    return [];
  }
  const migrated = safeParse<ChatMessage[]>(rawV1, []).filter(
    (message) => message && message.id
  );
  saveChatHistory(migrated);
  return migrated;
};

export const saveChatHistory = (messages: ChatMessage[]) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(
      CHAT_HISTORY_KEY_V2,
      JSON.stringify({ version: 2, data: messages })
    );
  } catch {
    return;
  }
};
