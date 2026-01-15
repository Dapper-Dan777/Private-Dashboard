export type LearningStep = {
  id: string;
  title: string;
  notes: string;
  timeSpentInSeconds: number;
  createdAt: string;
  tags: string[];
  sessions: TimerSession[];
};

export type TimerSession = {
  id: string;
  stepId: string;
  startAt: string;
  endAt: string;
  durationSeconds: number;
};

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  isError?: boolean;
};

export type AppState = {
  steps: LearningStep[];
  currentStepId: string | null;
  questionsAsked: number;
  totalTimeSeconds: number;
};

export type UiState = {
  isTimerRunning: boolean;
  timerSecondsForCurrentStep: number;
};
