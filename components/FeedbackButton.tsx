'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const FEEDBACK_TYPES = ['数据错误', '功能建议', '页面问题', '其他'] as const;

export default function FeedbackButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>(FEEDBACK_TYPES[0]);
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  async function handleSubmit() {
    if (!description.trim()) {
      setToast({ message: '请填写问题描述', ok: false });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: pathname,
          type,
          description: description.trim(),
          contact: contact.trim(),
        }),
      });
      if (res.ok) {
        setToast({ message: '感谢反馈！我们已收到', ok: true });
        setOpen(false);
        setDescription('');
        setContact('');
        setType(FEEDBACK_TYPES[0]);
      } else {
        const data = await res.json().catch(() => ({ error: '提交失败' }));
        setToast({ message: data.error || '提交失败', ok: false });
      }
    } catch {
      setToast({ message: '网络错误，请稍后重试', ok: false });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* 浮动按钮 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="反馈/纠错"
        className="fixed bottom-20 right-4 z-40 flex h-12 items-center gap-2 rounded-full bg-[#0b7a3b] px-5 text-sm font-bold text-white shadow-lg shadow-[#0b7a3b]/20 transition-transform hover:scale-105 md:bottom-6"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        反馈
      </button>

      {/* 弹窗 */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" role="dialog" aria-modal="true">
          {/* 遮罩 */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !submitting && setOpen(false)}
          />

          {/* 表单卡片 */}
          <div className="relative w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl md:rounded-2xl">
            {/* 关闭按钮 */}
            <button
              type="button"
              onClick={() => !submitting && setOpen(false)}
              className="absolute right-4 top-4 text-2xl text-[#667085] hover:text-[#111827]"
              aria-label="关闭"
            >
              ×
            </button>

            <h2 className="text-xl font-black text-[#111827]">反馈 / 纠错</h2>
            <p className="mt-1 text-sm text-[#667085]">
              发现数据有误或页面有问题？告诉我们，我们会尽快修正。
            </p>

            {/* 当前页面 */}
            <div className="mt-4 rounded-lg bg-[#f7faf7] px-3 py-2 text-xs text-[#667085]">
              当前页面：<span className="font-mono font-bold text-[#0b7a3b]">{pathname}</span>
            </div>

            {/* 问题类型 */}
            <div className="mt-4">
              <label className="mb-2 block text-sm font-bold text-[#344054]">问题类型</label>
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`h-9 rounded-lg border px-4 text-sm font-bold transition-colors ${
                      type === t
                        ? 'border-[#0b7a3b] bg-[#0b7a3b] text-white'
                        : 'border-[#eadfce] bg-white text-[#344054] hover:border-[#0b7a3b]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* 问题描述 */}
            <div className="mt-4">
              <label htmlFor="fb-desc" className="mb-2 block text-sm font-bold text-[#344054]">
                问题描述 <span className="font-normal text-[#98a2b3]">（必填）</span>
              </label>
              <textarea
                id="fb-desc"
                rows={4}
                maxLength={2000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="请描述你发现的问题，例如：某条法规已过期、最低工资数据不对、页面显示异常等"
                className="w-full rounded-lg border border-[#d8dee8] px-4 py-3 text-sm text-[#111827] outline-none placeholder:text-[#98a2b3] focus:border-[#0b7a3b] focus:ring-2 focus:ring-[#dff4e8]"
              />
              <div className="mt-1 text-right text-xs text-[#98a2b3]">{description.length}/2000</div>
            </div>

            {/* 联系方式 */}
            <div className="mt-4">
              <label htmlFor="fb-contact" className="mb-2 block text-sm font-bold text-[#344054]">
                联系方式 <span className="font-normal text-[#98a2b3]">（选填，用于回复你）</span>
              </label>
              <input
                id="fb-contact"
                type="text"
                maxLength={200}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="手机号 / 微信号 / 邮箱"
                className="h-11 w-full rounded-lg border border-[#d8dee8] px-4 text-sm text-[#111827] outline-none placeholder:text-[#98a2b3] focus:border-[#0b7a3b] focus:ring-2 focus:ring-[#dff4e8]"
              />
            </div>

            {/* 提交 */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className={`mt-6 flex h-12 w-full items-center justify-center rounded-xl text-base font-bold text-white transition-colors ${
                submitting
                  ? 'cursor-not-allowed bg-[#0b7a3b]/60'
                  : 'bg-[#0b7a3b] hover:bg-[#096b33]'
              }`}
            >
              {submitting ? '提交中…' : '提交反馈'}
            </button>

            <p className="mt-3 text-center text-xs text-[#98a2b3]">
              你的反馈仅用于改进本站内容，不会用于其他用途。
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-28 left-1/2 z-[60] -translate-x-1/2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg md:bottom-8 ${
            toast.ok ? 'bg-[#0b7a3b] text-white' : 'bg-[#ef4444] text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </>
  );
}
