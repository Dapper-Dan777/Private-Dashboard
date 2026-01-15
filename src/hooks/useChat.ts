import { useEffect, useState } from "react";
import type { ChatMessage } from "../types";
import { loadChatHistory, saveChatHistory } from "../utils/storage";

type UseChatOptions = {
  apiKey: string | null;
  onQuestionAsked?: () => void;
  profile?: "kurz" | "detail" | "quiz";
  maxHistory?: number;
  onError?: (message: string) => void;
};

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const buildSystemPrompt = (
  currentStepTitle?: string,
  profile: UseChatOptions["profile"] = "kurz"
) => {
  const base = `Du bist ein hilfreicher Lernassistent. Aktueller Lernschritt: ${
    currentStepTitle ?? "Allgemeines Lernen"
  }.`;
  if (profile === "detail") {
    return `${base} Antworte ausfuehrlich, strukturiert und mit Beispielen.`;
  }
  if (profile === "quiz") {
    return `${base} Antworte als Quiz-Coach mit Rueckfragen und kurzen Aufgaben.`;
  }
  return `${base} Antworte praegnant und klar.`;
};

export const useChat = ({
  apiKey,
  onQuestionAsked,
  profile = "kurz",
  maxHistory = 6,
  onError,
}: UseChatOptions) => {
  // Kapselt Chat-Persistenz und API-Kommunikation fuer bessere Testbarkeit.
  const historyLimit = Math.max(0, Math.min(20, maxHistory));
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadChatHistory()
  );
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  const sendMessage = async (content: string, currentStepTitle?: string) => {
    if (!apiKey || isSending || !content.trim()) {
      return;
    }

    const history = messages
      .filter((message) => !message.isError)
      .filter((message) => message.role === "user" || message.role === "assistant")
      .slice(-historyLimit)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);

    try {
      const response = await requestWithRetry({
        apiKey,
        content,
        currentStepTitle,
        profile,
        history,
      });
      const data = await response.json();
      const aiContent =
        data?.choices?.[0]?.message?.content ??
        data?.choices?.message?.content ??
        "Keine Antwort erhalten.";

      const assistantMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        content: aiContent,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      onQuestionAsked?.();
    } catch (error) {
      const message = toUserMessage(error);
      const errorMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        content: message,
        createdAt: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      onError?.(message);
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages,
    isSending,
    sendMessage,
    setMessages,
    clearMessages: () => setMessages([]),
  };
};

const requestWithRetry = async (params: {
  apiKey: string;
  content: string;
  currentStepTitle?: string;
  profile: UseChatOptions["profile"];
  history: Array<{ role: "user" | "assistant"; content: string }>;
}) => {
  const { apiKey, content, currentStepTitle, profile, history } = params;
  const maxRetries = 2;
  let attempt = 0;
  while (true) {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(currentStepTitle, profile),
          },
          ...history,
          { role: "user", content },
        ],
        max_tokens: 500,
      }),
    });

    if (response.ok) {
      return response;
    }

    const status = response.status;
    if ((status === 429 || status === 503) && attempt < maxRetries) {
      const retryAfter = response.headers.get("Retry-After");
      const retryMs = retryAfter ? Number(retryAfter) * 1000 : 0;
      const backoff = 600 * Math.pow(2, attempt);
      const delay = Math.max(retryMs, backoff) + Math.random() * 200;
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt += 1;
      continue;
    }

    throw new Error(`${response.status} ${response.statusText}`);
  }
};

const toUserMessage = (error: unknown) => {
  if (!(error instanceof Error)) {
    return "Unbekannter Fehler.";
  }
  if (error.message.includes("401") || error.message.includes("403")) {
    return "Authentifizierung fehlgeschlagen. Bitte API-Key pruefen.";
  }
  if (error.message.includes("429")) {
    return "Rate-Limit erreicht. Bitte kurz warten und erneut versuchen.";
  }
  if (error.message.includes("503")) {
    return "Service temporaer nicht verfuegbar. Bitte spaeter erneut versuchen.";
  }
  return error.message;
};
