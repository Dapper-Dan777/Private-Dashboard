import { useEffect, useRef, useState } from "react";
import katex from "katex";
import type { ChatMessage } from "../types";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { useI18n } from "../context/I18nContext";

type ChatSidebarProps = {
  apiKey: string | null;
  onSaveApiKey: (key: string) => void;
  messages: ReadonlyArray<ChatMessage>;
  onSendMessage: (content: string) => Promise<void>;
  isSending: boolean;
  currentStepTitle: string | null;
};

export const ChatSidebar = ({
  apiKey,
  onSaveApiKey,
  messages,
  onSendMessage,
  isSending,
  currentStepTitle,
}: ChatSidebarProps) => {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const isAtBottomRef = useRef(true);
  const prevMessageCountRef = useRef(messages.length);
  const sanitizeContent = (content: string) => {
    const cleaned = content
      .replace(/\[\d+\]/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    const lines = cleaned.split(/\r?\n/).map((line) => line.trim());
    const output: string[] = [];
    lines.forEach((line) => {
      if (!line) {
        return;
      }
      if (line.startsWith("- ") || line.startsWith("• ")) {
        output.push(`• ${line.replace(/^[-•]\s+/, "")}`);
        return;
      }
      output.push(line);
    });

    return output.join("\n");
  };

  const renderMathContent = (content: string) => {
    const cleaned = sanitizeContent(content);
    const nodes: Array<JSX.Element> = [];
    const regex = /\\\((.+?)\\\)|\\\[(.+?)\\\]/gs;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(cleaned))) {
      const [fullMatch, inlineMath, blockMath] = match;
      const matchIndex = match.index;
      const textBefore = cleaned.slice(lastIndex, matchIndex);
      if (textBefore) {
        nodes.push(
          <span key={`text-${matchIndex}`}>{textBefore}</span>
        );
      }
      const expression = inlineMath ?? blockMath ?? "";
      const isBlock = Boolean(blockMath);
      const html = katex.renderToString(expression, {
        throwOnError: false,
        displayMode: isBlock,
      });
      nodes.push(
        <span
          key={`math-${matchIndex}`}
          className={isBlock ? "block my-2" : "inline-block"}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
      lastIndex = matchIndex + fullMatch.length;
    }

    const tail = cleaned.slice(lastIndex);
    if (tail) {
      nodes.push(<span key={`text-tail`}>{tail}</span>);
    }

    return nodes;
  };

  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      if (isAtBottomRef.current) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) {
      return;
    }
    setInput("");
    await onSendMessage(trimmed);
  };

  return (
    <Card className="p-4 h-full min-h-0 flex flex-col gap-3 overflow-hidden bg-surface/95 dark:bg-surface-dark/90 border border-border/60 dark:border-border-dark/60">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {t("chat.title")}
          </h3>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {t("chat.context")}: {currentStepTitle ?? t("chat.general")}
          </div>
        </div>
      </div>

      <div
        ref={listRef}
        onScroll={(event) => {
          const target = event.currentTarget;
          const threshold = 32;
          const atBottom =
            target.scrollTop + target.clientHeight >=
            target.scrollHeight - threshold;
          isAtBottomRef.current = atBottom;
          setIsAtBottom(atBottom);
        }}
        className="flex-1 min-h-0 overflow-auto space-y-3 pr-1 scrollbar overscroll-none"
      >
        {messages.length === 0 && (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {t("chat.empty")}
          </div>
        )}
        {messages.map((message) => {
          const isUser = message.role === "user";
          const renderedContent =
            isUser || message.isError
              ? message.content
              : renderMathContent(message.content);
          return (
            <div
              key={message.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in-up`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm border transition ${
                  isUser
                    ? "bg-primary text-primary-foreground border-primary/50"
                    : message.isError
                    ? "bg-danger/12 text-danger border-danger/30"
                    : "bg-surface-muted/90 dark:bg-surface-mutedDark/80 text-slate-800 dark:text-slate-100 border-border/60 dark:border-border-dark/60"
                }`}
              >
                {message.isError ? (
                  <span className="flex items-center gap-2">
                    <span aria-hidden>⚠️</span>
                    <span>Fehler: {message.content}</span>
                  </span>
                ) : (
                  <span className="whitespace-pre-wrap leading-relaxed">
                    {renderedContent}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {isSending && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm border bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-200 border-slate-200/70 dark:border-slate-700/70">
              <div className="flex items-center gap-2">
                <span>{t("chat.loading")}</span>
                <span className="loading-dots text-slate-400 dark:text-slate-500">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {!isAtBottom && (
        <div className="mt-2 flex justify-center">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              isAtBottomRef.current = true;
              bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {t("chat.jumpToEnd")}
          </Button>
        </div>
      )}

      {!apiKey && (
        <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
          {t("chat.noKey")}
        </div>
      )}

      <div className="mt-1 flex gap-2 border-t border-border/60 dark:border-border-dark/60 pt-3 items-end bg-surface/90 dark:bg-surface-dark/90">
        <textarea
          className="flex-1 min-h-[44px] max-h-32 rounded-2xl border border-border/80 dark:border-border-dark/80 bg-white/90 dark:bg-surface-mutedDark/80 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/40 transition"
          rows={2}
          placeholder={t("chat.placeholder")}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
        />
        <Button
          variant="primary"
          onClick={handleSend}
          disabled={!apiKey || isSending || input.trim().length === 0}
        >
          {isSending ? `${t("chat.send")}...` : t("chat.send")}
        </Button>
      </div>
    </Card>
  );
};
