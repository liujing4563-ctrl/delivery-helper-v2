'use client';

import { useState, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const EXAMPLES = [
  { icon: '💰', text: '平台扣了我超时罚款，我应该先保留哪些材料？' },
  { icon: '🩹', text: '我送餐受伤了，想知道可以先咨询哪些渠道。' },
  { icon: '📄', text: '我没有签劳动合同，怎么梳理劳动关系线索？' },
];

const TOPIC_QUESTIONS: Record<string, string> = {
  deduction: '平台扣了我超时罚款，我应该先保留哪些材料？',
  injury: '我送餐受伤了，想知道可以先咨询哪些渠道。',
  blocked: '我的账号被封了，想知道怎么申诉。',
  contract: '我没有签劳动合同，怎么梳理劳动关系线索？',
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ChatClient() {
  return (
    <Suspense
      fallback={
        <div className="px-4 pb-4 pt-6">
          <h1 className="text-xl font-bold text-[#1A1A1A]">权益问答</h1>
          <p className="mt-2 text-sm text-[#6B6560]">加载中…</p>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: unknown };
    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error;
    }
  } catch {
    // 使用兜底文案
  }
  return '请求失败，请稍后重试。';
}

function ChatContent() {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic') || '';
  const initialInput = TOPIC_QUESTIONS[topic] || '';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialInput);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    cancelRequest();

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    let assistantId = '';

    try {
      // Capacitor APK WebView 需要完整 URL，网页版使用相对路径
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('text/plain') || contentType.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        assistantId = generateId();

        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: 'assistant', content: '' },
        ]);

        let pendingContent = '';
        let rafId = 0;

        const flushToState = () => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: pendingContent } : m
            )
          );
        };

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          pendingContent += chunk;

          if (!rafId) {
            rafId = requestAnimationFrame(() => {
              flushToState();
              rafId = 0;
            });
          }
        }

        if (rafId > 0) cancelAnimationFrame(rafId);
        flushToState();
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setMessages((prev) =>
          prev.filter((m) => m.id === assistantId || m.content.length > 0)
        );
        return;
      }
      setError(err instanceof Error ? err.message : '请求失败，请重试');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleRetry = () => {
    if (messages.length > 0) {
      const lastUserIndex = messages.map((m) => m.role).lastIndexOf('user');
      if (lastUserIndex >= 0) {
        setInput(messages[lastUserIndex].content);
        setMessages((prev) => prev.slice(0, lastUserIndex));
      }
    }
  };

  const handleStop = () => {
    cancelRequest();
    setIsLoading(false);
  };

  return (
    <div className="px-4 pb-4 pt-6">
      <h1 className="text-xl font-bold text-[#1A1A1A]">权益问答</h1>
      <p className="mt-1 text-sm text-[#6B6560]">
        提供劳动权益信息和路径引导，不替代律师。
      </p>

      <div className="mt-3 rounded-lg border border-[#F5E6C8] bg-[#FEF9EE] p-3 text-xs leading-5 text-[#92650A]">
        只提供劳动权益信息参考，不替代律师意见。请勿输入身份证、银行卡等个人敏感信息。
      </div>

      <div className="mt-4 space-y-3" role="list" aria-label="对话消息">
        {messages.length === 0 ? (
          <div className="rounded-xl border border-[#EDE9E3] bg-white p-4">
            <p className="text-sm font-semibold text-[#1A1A1A]">可以这样问</p>
            <p className="mt-1 text-xs text-[#6B6560]">点击下方问题快速开始</p>
            <div className="mt-3 space-y-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example.text}
                  type="button"
                  onClick={() => setInput(example.text)}
                  className="flex w-full items-center gap-3 rounded-lg border border-[#EDE9E3] bg-[#F5F3F0] px-3 py-3 text-left text-sm text-[#374151] hover:bg-[#EDE9E3]"
                >
                  <span className="text-base">{example.icon}</span>
                  <span className="flex-1">{example.text}</span>
                  <svg className="h-4 w-4 text-[#D1CDC7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-xl border p-4 text-sm leading-6 ${
                message.role === 'user'
                  ? 'border-[#E5E1DB] bg-[#F5F3F0] text-[#1A1A1A]'
                  : 'border-[#EDE9E3] bg-white text-[#374151]'
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-xs ${
                  message.role === 'user' ? 'bg-[#E0F2FE] text-[#0284C7]' : 'bg-[#F5F3F0] text-[#6B6560]'
                }`}>
                  {message.role === 'user' ? '👤' : '💬'}
                </span>
                <p className="text-xs font-medium text-[#6B6560]">
                  {message.role === 'user' ? '我的问题' : '回答'}
                </p>
              </div>
              <p className="whitespace-pre-line">{message.content}</p>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center gap-2 rounded-xl border border-[#EDE9E3] bg-white p-4 text-sm text-[#6B6560]" role="status">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#D97706]" />
            正在整理信息…
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-[#FECACA] bg-[#FEE2E2] p-4 text-sm text-[#B91C1C]" role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-2 text-sm font-medium text-[#DC2626] underline"
            >
              重试
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 rounded-xl border border-[#EDE9E3] bg-white p-4">
        <label className="block text-sm font-medium text-[#374151]" htmlFor="chat-input">
          描述你遇到的问题
        </label>
        <textarea
          id="chat-input"
          value={input}
          maxLength={1000}
          rows={4}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例如：平台扣款、工资太低、送餐受伤、没签合同、被封号…"
          className="mt-2 w-full resize-none rounded-lg border border-[#EDE9E3] bg-[#F5F3F0] px-3 py-2 text-sm leading-6 text-[#1A1A1A] placeholder-[#B0AAA3] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs text-[#B0AAA3]">{input.length}/1000</span>
          <div className="flex gap-2">
            {isLoading && (
              <button
                type="button"
                onClick={handleStop}
                className="rounded-lg border border-[#EDE9E3] px-3 py-2 text-sm font-medium text-[#6B6560] hover:bg-[#F5F3F0]"
              >
                停止
              </button>
            )}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#D1CDC7]"
            >
              {isLoading ? '发送中' : '发送'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}