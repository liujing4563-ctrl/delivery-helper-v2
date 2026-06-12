'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const suggestedQuestions = [
  '平台扣了我这周时薪，我该怎么办？',
  '送餐受伤后如何保留证据？',
  '没有劳动合同，如何维权？',
  '被封号了，可以申请解封吗？',
  '工资太低，平台说明不清，怎么办？',
  '申诉被驳回了，下一步可以做什么？',
  '我要怎么申请法律援助？',
];

const questionTones = [
  'bg-emerald-50 text-emerald-700',
  'bg-orange-50 text-orange-600',
  'bg-[#EAF7EF] text-[#047A43]',
  'bg-red-50 text-red-600',
  'bg-purple-50 text-purple-600',
  'bg-violet-50 text-violet-600',
  'bg-sky-50 text-sky-600',
] as const;

const topicQuestions: Record<string, string> = {
  deduction: '平台扣了我这周时薪，我该怎么办？',
  injury: '送餐受伤后如何保留证据？',
  blocked: '被封号了，可以申请解封吗？',
  contract: '没有劳动合同，如何维权？',
};

type ToastType = 'info' | 'success';
type ChatStatus = 'idle' | 'loading' | 'success' | 'error';

type ChatAnswerState = {
  status: ChatStatus;
  question: string;
  answer: string;
  error: string;
};

type ChatRecord = {
  id: string;
  question: string;
  createdAt: string;
};

const CHAT_RECORDS_STORAGE_KEY = 'delivery-helper-chat-records';
const MAX_CHAT_RECORDS = 50;

function formatRecordDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseStoredRecords(value: string | null): ChatRecord[] {
  if (!value) return [];

  try {
    const records = JSON.parse(value);
    if (!Array.isArray(records)) return [];

    return records
      .filter((record): record is ChatRecord => (
        typeof record?.id === 'string' &&
        typeof record.question === 'string' &&
        typeof record.createdAt === 'string'
      ))
      .slice(0, MAX_CHAT_RECORDS);
  } catch {
    return [];
  }
}

function readErrorMessage(contentType: string, body: string): string {
  if (contentType.includes('application/json')) {
    try {
      const parsed = JSON.parse(body) as { error?: string };
      if (parsed.error) return parsed.error;
    } catch {
      return 'AI 服务暂时不可用，请稍后再试。';
    }
  }

  return body.trim() || 'AI 服务暂时不可用，请稍后再试。';
}

function ShieldIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 3 5 6v5c0 4.6 2.9 8.6 7 10 4.1-1.4 7-5.4 7-10V6z" strokeLinejoin="round" />
      <path d="m8.5 12 2.2 2.2 4.8-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCircle({
  children,
  tone = 'green',
}: {
  children: React.ReactNode;
  tone?: 'green' | 'blue' | 'purple' | 'orange' | 'gray';
}) {
  const tones = {
    green: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-[#EAF7EF] text-[#047A43]',
    purple: 'bg-violet-50 text-violet-600',
    orange: 'bg-orange-50 text-orange-600',
    gray: 'bg-slate-100 text-slate-500',
  };

  return <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tones[tone]}`}>{children}</span>;
}

function MessageIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" strokeLinejoin="round" />
      <path d="M8 9h8M8 13h5" strokeLinecap="round" />
    </svg>
  );
}

function DocIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M7 3h7l4 4v14H7z" strokeLinejoin="round" />
      <path d="M14 3v5h5M10 12h5M10 16h5" strokeLinecap="round" />
    </svg>
  );
}

function PhoneIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9z" />
    </svg>
  );
}

function SendIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="m22 2-7 20-4-9-9-4z" strokeLinejoin="round" />
      <path d="M22 2 11 13" strokeLinecap="round" />
    </svg>
  );
}

function RefreshIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChatLeftSidebar({
  records,
  onClearRecords,
  onOpenRecords,
  onSelectQuestion,
  onToast,
}: {
  records: ChatRecord[];
  onClearRecords: () => void;
  onOpenRecords: () => void;
  onSelectQuestion: (question: string) => void;
  onToast: (message: string, type?: ToastType) => void;
}) {
  const recentRecords = records.slice(0, 5);

  return (
    <aside className="flex flex-col gap-5 lg:h-full">
      <section className="rounded-[22px] border border-[#eadfce] bg-white p-5 shadow-[0_12px_30px_rgba(15,60,35,0.05)]">
        <h2 className="text-xl font-bold text-slate-950">猜你想问</h2>
        <div className="mt-4 space-y-2">
          {suggestedQuestions.map((question, index) => (
            <button
              key={question}
              type="button"
              onClick={() => onSelectQuestion(question)}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm leading-5 transition ${
                index === 0 ? 'bg-emerald-50 font-medium text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${questionTones[index % questionTones.length]}`}>
                <MessageIcon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">{question}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onToast('暂无更多常见问题')}
          className="mt-4 flex w-full items-center justify-between rounded-xl border border-[#eadfce] px-4 py-3 text-sm font-medium text-slate-700"
        >
          查看全部问题
          <span aria-hidden="true">›</span>
        </button>
      </section>

      <section className="rounded-[22px] border border-[#eadfce] bg-white p-5 shadow-[0_12px_30px_rgba(15,60,35,0.05)]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-950">最近咨询</h2>
          <button
            type="button"
            onClick={onClearRecords}
            className="text-sm font-semibold text-emerald-700"
          >
            清空
          </button>
        </div>
        {recentRecords.length > 0 ? (
          <div className="mt-4 divide-y divide-[#f0ebe2]">
            {recentRecords.map((record) => (
              <button
                key={record.id}
                type="button"
                onClick={() => onSelectQuestion(record.question)}
                className="grid min-h-9 w-full grid-cols-[1fr_auto] items-center gap-3 rounded-lg py-2 text-left text-sm hover:bg-slate-50"
              >
                <span className="min-w-0 truncate text-slate-600">{record.question}</span>
                <span className="text-slate-400">{formatRecordDate(record.createdAt)}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-[#faf8f3] px-4 py-4 text-sm leading-6 text-slate-500">
            发送问题后，会自动保存最近咨询在本机。
          </div>
        )}
        <button
          type="button"
          onClick={onOpenRecords}
          className="mt-4 text-sm font-bold text-emerald-700"
        >
          查看全部记录 →
        </button>
      </section>
    </aside>
  );
}

function ChatRecordsDialog({
  records,
  onClearRecords,
  onClose,
  onSelectQuestion,
}: {
  records: ChatRecord[];
  onClearRecords: () => void;
  onClose: () => void;
  onSelectQuestion: (question: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 py-6">
      <div role="dialog" aria-modal="true" aria-labelledby="chat-records-title" className="w-full max-w-[560px] overflow-hidden rounded-[24px] border border-[#eadfce] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between border-b border-[#eadfce] px-6 py-5">
          <div>
            <h2 id="chat-records-title" className="text-xl font-bold text-slate-950">全部咨询记录</h2>
            <p className="mt-1 text-sm text-slate-500">记录只保存在当前浏览器本机。</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-[#eadfce] px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            关闭
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {records.length > 0 ? (
            <div className="divide-y divide-[#f0ebe2]">
              {records.map((record) => (
                <button
                  key={record.id}
                  type="button"
                  onClick={() => {
                    onSelectQuestion(record.question);
                    onClose();
                  }}
                  className="grid w-full grid-cols-[1fr_auto] gap-4 rounded-xl px-2 py-3 text-left text-sm hover:bg-slate-50"
                >
                  <span className="min-w-0 text-slate-700">{record.question}</span>
                  <span className="shrink-0 text-slate-400">{formatRecordDate(record.createdAt)}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-[#faf8f3] px-5 py-8 text-center text-sm leading-6 text-slate-500">
              暂无咨询记录。发送问题后，这里会显示本机保存的历史记录。
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#eadfce] px-6 py-4">
          <button type="button" onClick={onClearRecords} className="text-sm font-semibold text-red-600">
            清空记录
          </button>
          <button type="button" onClick={onClose} className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
            完成
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatHero() {
  return (
    <div className="flex min-h-[188px] items-center justify-between gap-8 px-9 py-6">
      <div className="max-w-[540px]">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white">
            <ShieldIcon className="h-8 w-8" />
          </div>
          <h1 className="text-[32px] font-bold leading-tight text-slate-950">你好，我是权益助手</h1>
        </div>
        <p className="text-[15px] leading-7 text-slate-600">我可以帮助你了解劳动权益相关的规则与维权路径，提供信息参考与方向指引。</p>
        <p className="mt-1 text-[15px] leading-7 text-slate-600">本工具不替代律师，不提供法律意见或代理服务。</p>
      </div>

      <Image
        src="/chat/hero-rider-clean.png"
        alt="外卖骑手"
        width={190}
        height={178}
        priority
        className="hidden h-[170px] w-[180px] shrink-0 object-contain md:block"
      />
    </div>
  );
}

function ChatExampleQuestion() {
  return (
    <div className="border-t border-[#eadfce] bg-[#faf8f3] px-9 py-4">
      <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 text-[15px] font-semibold text-slate-700">
        <IconCircle tone="gray">
          <MessageIcon className="h-5 w-5" />
        </IconCircle>
        <span>示例问题：平台扣了我这周时薪，我该怎么办？</span>
      </div>
    </div>
  );
}

function AnswerCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#eadfce] bg-white px-5 py-4">
      <div className="mb-2 flex items-center gap-3">
        <span className="text-emerald-700">{icon}</span>
        <h3 className="text-[15px] font-semibold text-slate-950">{title}</h3>
      </div>
      <div className="text-sm leading-6 text-slate-700">{children}</div>
    </div>
  );
}

function ChatAnswerBlocks() {
  return (
    <div className="grid grid-cols-[44px_minmax(0,1fr)] gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-700 text-white">
        <ShieldIcon className="h-8 w-8" />
      </div>
      <div>
        <p className="mb-4 text-sm leading-6 text-slate-700">
          根据你提供的信息，以下是一般性的参考建议，供你了解可能的维权方向和需要留意的要点：
        </p>
        <div className="space-y-3">
          <AnswerCard title="问题类型" icon={<ShieldIcon />}>
            <span className="inline-flex rounded-full border border-[#d6d1c8] px-5 py-2 text-sm text-slate-700">
              薪资争议 / 扣款争议
            </span>
          </AnswerCard>

          <AnswerCard title="建议保留的证据" icon={<DocIcon />}>
            <ul className="list-disc space-y-1 pl-5">
              <li>接单记录、订单详情、跑单时长截图</li>
              <li>收入结算明细、平台扣款通知或说明（截图）</li>
              <li>与平台客服沟通记录（聊天记录、工单截图）</li>
              <li>平台相关规则页面或说明（如计价规则、奖惩规则）</li>
            </ul>
          </AnswerCard>

          <AnswerCard title="可能相关的规则" icon={<ShieldIcon />}>
            <ul className="list-disc space-y-1 pl-5">
              <li>《中华人民共和国劳动法》相关规定</li>
              <li>《中华人民共和国劳动合同法》关于劳动报酬的规定</li>
              <li>《关于保障新就业形态劳动者劳动保障权益的指导意见》</li>
              <li>平台公示的计价规则与奖惩规则（如有）</li>
            </ul>
            <Link href="/regulations" className="mt-3 inline-flex text-sm font-semibold text-emerald-700 hover:underline">
              查看法规依据 →
            </Link>
          </AnswerCard>

          <AnswerCard title="下一步建议" icon={<DocIcon />}>
            <ol className="list-decimal space-y-1 pl-5">
              <li>先与平台进行沟通申诉，要求说明扣款原因并核对明细；</li>
              <li>若沟通无果，可通过平台申诉渠道提交证据；</li>
              <li>仍未解决，可拨打 12348 法律援助热线或向当地劳动保障部门咨询；</li>
              <li>符合法律援助条件的，可申请法律援助，或寻求工会、社会组织帮助。</li>
            </ol>
          </AnswerCard>
        </div>
      </div>
    </div>
  );
}

function ChatLiveAnswer({ state }: { state: ChatAnswerState }) {
  return (
    <div className="grid grid-cols-[44px_minmax(0,1fr)] gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-700 text-white">
        <ShieldIcon className="h-8 w-8" />
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#eadfce] bg-[#faf8f3] px-5 py-4">
          <p className="text-xs font-semibold text-slate-500">你的问题</p>
          <p className="mt-2 text-sm leading-6 text-slate-800">{state.question}</p>
        </div>

        {state.status === 'loading' && (
          <div className="rounded-2xl border border-[#eadfce] bg-white px-5 py-4 text-sm leading-6 text-slate-600">
            正在生成回答，请稍候...
          </div>
        )}

        {state.status === 'error' && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700">
            {state.error}
          </div>
        )}

        {state.status === 'success' && (
          <div className="rounded-2xl border border-[#eadfce] bg-white px-5 py-4">
            <div className="mb-2 flex items-center gap-3">
              <span className="text-emerald-700"><DocIcon /></span>
              <h3 className="text-[15px] font-semibold text-slate-950">AI 回答</h3>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{state.answer}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FeedbackBar({
  isLoading,
  onRegenerate,
  onToast,
}: {
  isLoading: boolean;
  onRegenerate: () => void;
  onToast: (message: string, type?: ToastType) => void;
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
      <span>内容是否对你有帮助？</span>
      <button
        type="button"
        onClick={() => onToast('感谢反馈', 'success')}
        className="rounded-full border border-[#eadfce] bg-white px-4 py-2 text-slate-700"
      >
        有帮助
      </button>
      <button
        type="button"
        onClick={() => onToast('已记录反馈，后续会继续优化', 'success')}
        className="rounded-full border border-[#eadfce] bg-white px-4 py-2 text-slate-700"
      >
        没帮助
      </button>
      <button
        type="button"
        disabled={isLoading}
        onClick={onRegenerate}
        className="inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-white px-4 py-2 font-semibold text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshIcon />
        {isLoading ? '生成中' : '重新回答'}
      </button>
    </div>
  );
}

function ChatComposer({
  input,
  onInputChange,
  onSelectQuestion,
  onSubmitQuestion,
  onToast,
  isLoading,
  textareaRef,
}: {
  input: string;
  onInputChange: (value: string) => void;
  onSelectQuestion: (question: string) => void;
  onSubmitQuestion: (question: string) => void;
  onToast: (message: string, type?: ToastType) => void;
  isLoading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input.trim();
    if (!question) {
      onToast('请先输入你的问题');
      return;
    }
    onSubmitQuestion(question);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-[20px] border border-emerald-600 bg-white p-4 sm:flex-row sm:items-end sm:gap-4">
        <textarea
          ref={textareaRef}
          value={input}
          maxLength={1000}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="请输入你的问题，尽量描述清楚你的情况..."
          className="min-h-[58px] flex-1 resize-none border-0 bg-transparent text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400"
        />
        <span className="self-end text-xs text-slate-400 sm:pb-3">{input.length}/1000</span>
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-7 text-base font-semibold text-white transition sm:w-auto ${
            input.trim() && !isLoading ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-slate-300'
          }`}
        >
          <SendIcon className="h-4 w-4" />
          {isLoading ? '发送中' : '发送'}
        </button>
      </form>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {suggestedQuestions.slice(0, 3).map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => onSelectQuestion(question)}
            className="rounded-full border border-[#eadfce] bg-white px-4 py-2 text-sm text-slate-700 hover:border-emerald-600 hover:text-emerald-700"
          >
            {question}
          </button>
        ))}
        <button type="button" className="ml-auto inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <RefreshIcon />
          换一换
        </button>
      </div>
    </div>
  );
}

function ChatMainPanel({
  input,
  onInputChange,
  onSelectQuestion,
  onSubmitQuestion,
  onRegenerate,
  onToast,
  answerState,
  messageScrollRef,
  textareaRef,
}: {
  input: string;
  onInputChange: (value: string) => void;
  onSelectQuestion: (question: string) => void;
  onSubmitQuestion: (question: string) => void;
  onRegenerate: () => void;
  onToast: (message: string, type?: ToastType) => void;
  answerState: ChatAnswerState;
  messageScrollRef: React.RefObject<HTMLDivElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const isLoading = answerState.status === 'loading';

  return (
    <section className="flex min-h-[calc(100vh-110px)] max-h-[calc(100vh-90px)] flex-col overflow-hidden rounded-[24px] border border-[#eadfce] bg-white shadow-[0_14px_36px_rgba(15,60,35,0.06)] lg:h-full lg:min-h-0 lg:max-h-none">
      <div className="shrink-0">
        <ChatHero />
        <ChatExampleQuestion />
      </div>
      <div ref={messageScrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 pr-3 sm:px-6 sm:pr-5 lg:px-9 lg:pr-7">
        {answerState.status === 'idle' ? <ChatAnswerBlocks /> : <ChatLiveAnswer state={answerState} />}
        <FeedbackBar isLoading={isLoading} onRegenerate={onRegenerate} onToast={onToast} />
      </div>
      <div className="shrink-0 border-t border-[#eadfce] bg-white px-4 py-4 shadow-[0_-8px_20px_rgba(15,60,35,0.04)] sm:px-6 lg:px-9 lg:py-5">
        <ChatComposer
          input={input}
          isLoading={isLoading}
          onInputChange={onInputChange}
          onSelectQuestion={onSelectQuestion}
          onSubmitQuestion={onSubmitQuestion}
          onToast={onToast}
          textareaRef={textareaRef}
        />
      </div>
    </section>
  );
}

function ChatRightSidebar() {
  const instructions = [
    ['提供信息与路径指引', '基于现行法律法规和公开信息，提供参考建议，帮助你了解权益与维权方向。', 'blue'],
    ['答案不替代律师', '本工具不提供法律意见、诉讼代理或任何形式的法律服务，具体问题请咨询专业律师。', 'green'],
    ['建议联系 12348', '遇到复杂或紧急的权益问题，可拨打全国法律援助热线 12348，获取专业帮助。', 'purple'],
    ['保护个人敏感信息', '请勿输入身份证号、银行卡号、手机号等个人敏感信息，避免个人隐私泄露。', 'orange'],
  ] as const;

  return (
    <aside className="flex flex-col gap-5 lg:h-full">
      <section className="rounded-[22px] border border-[#eadfce] bg-white p-5 shadow-[0_12px_30px_rgba(15,60,35,0.05)] lg:p-6">
        <h2 className="text-xl font-bold text-slate-950">使用说明</h2>
        <div className="mt-6 space-y-6">
          {instructions.map(([title, description, tone]) => (
            <div key={title} className="flex gap-4">
              <IconCircle tone={tone}>
                {title === '建议联系 12348' ? <PhoneIcon /> : title.includes('个人敏感信息') ? <ShieldIcon /> : <DocIcon />}
              </IconCircle>
              <div>
                <h3 className="text-base font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col rounded-[22px] border border-[#eadfce] bg-white p-5 shadow-[0_12px_30px_rgba(15,60,35,0.05)] lg:flex-1 lg:p-6">
        <h2 className="text-xl font-bold text-slate-950">回答结构</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">我们尽力按照以下结构为你提供解答：</p>
        <div className="mt-5 space-y-4">
          {[
            ['问题类型', '明确你的问题所属类别'],
            ['建议证据', '说明需要收集和保存的证据'],
            ['相关规则', '列出可能适用的法律 / 规则'],
            ['下一步建议', '分步骤指引你可采取的行动'],
          ].map(([title, description]) => (
            <div key={title} className="flex items-start gap-2 text-sm leading-6">
              <ShieldIcon className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />
              <span className="w-[76px] shrink-0 font-bold text-slate-950">
                {title}
              </span>
              <span className="min-w-0 text-[13px] text-slate-600 lg:whitespace-nowrap">{description}</span>
            </div>
          ))}
        </div>
        <p className="mt-6 border-t border-[#eadfce] pt-5 text-sm leading-7 text-slate-600 lg:mt-auto">
          以上内容仅供参考，具体以实际情况和相关部门认定为准。
        </p>
      </section>
    </aside>
  );
}

export default function ChatClient() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-slate-500">加载中...</div>}>
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
  const searchParams = useSearchParams();
  const initialInput = topicQuestions[searchParams.get('topic') || ''] || '';
  const [input, setInput] = useState(initialInput);
  const [answerState, setAnswerState] = useState<ChatAnswerState>({
    status: 'idle',
    question: '',
    answer: '',
    error: '',
  });
  const [chatRecords, setChatRecords] = useState<ChatRecord[]>([]);
  const [recordsOpen, setRecordsOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const messageScrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function showToast(message: string, type: ToastType = 'info') {
    setToast({ message, type });
  }

  function rememberQuestion(question: string) {
    const text = question.trim();
    if (!text) return;

    setChatRecords((currentRecords) => {
      const record: ChatRecord = {
        id: `${Date.now()}`,
        question: text,
        createdAt: new Date().toISOString(),
      };
      const nextRecords = [
        record,
        ...currentRecords.filter((item) => item.question !== text),
      ].slice(0, MAX_CHAT_RECORDS);

      try {
        window.localStorage.setItem(CHAT_RECORDS_STORAGE_KEY, JSON.stringify(nextRecords));
      } catch {
        // If browser storage is unavailable, keep the in-memory record for this session.
      }

      return nextRecords;
    });
  }

  function clearChatRecords() {
    if (chatRecords.length === 0) {
      showToast('暂无可清空的咨询记录');
      return;
    }

    setChatRecords([]);
    try {
      window.localStorage.setItem(CHAT_RECORDS_STORAGE_KEY, '[]');
    } catch {
      // Ignore storage write failures; UI state has already been cleared.
    }
    showToast('已清空本机咨询记录', 'success');
  }

  function fillComposer(question: string) {
    setInput(question);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setChatRecords(parseStoredRecords(window.localStorage.getItem(CHAT_RECORDS_STORAGE_KEY)));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const scrollContainer = messageScrollRef.current;
    if (!scrollContainer) return;
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }, [answerState.status, answerState.question, answerState.answer, answerState.error]);

  async function submitQuestion(question: string) {
    setAnswerState({ status: 'loading', question, answer: '', error: '' });
    rememberQuestion(question);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: question }] }),
      });

      const contentType = response.headers.get('content-type') || '';
      const body = await response.text();

      if (!response.ok) {
        setAnswerState({ status: 'error', question, answer: '', error: readErrorMessage(contentType, body) });
        return;
      }

      setAnswerState({
        status: 'success',
        question,
        answer: body.trim() || 'AI 暂未返回内容，请稍后重试。',
        error: '',
      });
    } catch {
      setAnswerState({
        status: 'error',
        question,
        answer: '',
        error: '网络连接失败，请检查网络后重试。',
      });
    }
  }

  function regenerateAnswer() {
    const question = answerState.question || input.trim();
    if (!question) {
      showToast('请先输入你的问题');
      return;
    }
    void submitQuestion(question);
  }

  return (
    <div className="relative left-1/2 w-[min(1440px,calc(100vw-48px))] -translate-x-1/2 bg-[#fbfaf6] py-8">
      <div className="grid grid-cols-1 gap-6 lg:min-h-[calc(100vh-140px)] lg:grid-cols-[280px_minmax(0,1fr)_360px] lg:items-stretch">
        <div className="order-2 min-w-0 lg:order-1 lg:h-full">
          <ChatLeftSidebar
            records={chatRecords}
            onClearRecords={clearChatRecords}
            onOpenRecords={() => setRecordsOpen(true)}
            onSelectQuestion={fillComposer}
            onToast={showToast}
          />
        </div>
        <div className="order-1 min-w-0 lg:order-2 lg:h-full">
          <ChatMainPanel
            answerState={answerState}
            input={input}
            messageScrollRef={messageScrollRef}
            onInputChange={setInput}
            onRegenerate={regenerateAnswer}
            onSelectQuestion={fillComposer}
            onSubmitQuestion={submitQuestion}
            onToast={showToast}
            textareaRef={textareaRef}
          />
        </div>
        <div className="order-3 min-w-0 lg:h-full">
          <ChatRightSidebar />
        </div>
      </div>

      {recordsOpen && (
        <ChatRecordsDialog
          records={chatRecords}
          onClearRecords={clearChatRecords}
          onClose={() => setRecordsOpen(false)}
          onSelectQuestion={fillComposer}
        />
      )}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg ${
            toast.type === 'success' ? 'bg-emerald-700 text-white' : 'bg-slate-900 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
