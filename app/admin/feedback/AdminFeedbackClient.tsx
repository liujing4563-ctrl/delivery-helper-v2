'use client';

import { useState, useCallback } from 'react';

type FeedbackStatus = 'pending' | 'done' | 'ignored';

interface FeedbackEntry {
  id: string;
  page: string;
  type: string;
  description: string;
  contact: string;
  status: FeedbackStatus;
  createdAt: string;
  userAgent: string;
}

interface FeedbackCounts {
  total: number;
  pending: number;
  done: number;
  ignored: number;
}

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  pending: '待处理',
  done: '已处理',
  ignored: '已忽略',
};

const STATUS_COLORS: Record<FeedbackStatus, string> = {
  pending: 'bg-orange-50 text-orange-700 border-orange-200',
  done: 'bg-green-50 text-green-700 border-green-200',
  ignored: 'bg-gray-50 text-gray-500 border-gray-200',
};

const TYPE_OPTIONS = ['all', '数据错误', '功能建议', '页面问题', '其他'] as const;

function readSavedToken(): string {
  if (typeof window === 'undefined') return '';
  try {
    return sessionStorage.getItem('admin-token') || '';
  } catch {
    return '';
  }
}

export default function AdminFeedbackPage() {
  const [token, setToken] = useState(readSavedToken);
  const [authed, setAuthed] = useState(false);
  const [items, setItems] = useState<FeedbackEntry[]>([]);
  const [counts, setCounts] = useState<FeedbackCounts>({ total: 0, pending: 0, done: 0, ignored: 0 });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchFeedback = useCallback(async (next?: { token?: string; status?: string; type?: string }) => {
    const requestToken = (next?.token ?? token).trim();
    const requestStatus = next?.status ?? statusFilter;
    const requestType = next?.type ?? typeFilter;
    if (!requestToken) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'list',
          token: requestToken,
          status: requestStatus,
          type: requestType,
          limit: '50',
        }),
      });
      if (res.status === 401) {
        setError('Token 无效，请重新输入');
        setAuthed(false);
        return;
      }
      const data = await res.json();
      setItems(data.items || []);
      setCounts(data.counts || { total: 0, pending: 0, done: 0, ignored: 0 });
      // 保存 token
      try { sessionStorage.setItem('admin-token', requestToken); } catch { /* ignore */ }
      setAuthed(true);
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, typeFilter]);

  async function updateStatus(id: string, status: FeedbackStatus) {
    try {
      const res = await fetch('/api/feedback', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-feedback-token': token,
        },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        await fetchFeedback();
      }
    } catch { /* ignore */ }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    void fetchFeedback({ token });
  }

  function handleLogout() {
    setToken('');
    setAuthed(false);
    setItems([]);
    try { sessionStorage.removeItem('admin-token'); } catch { /* ignore */ }
  }

  // ─── 未登录：显示登录表单 ───
  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 py-20">
        <h1 className="text-2xl font-black text-[#111827]">反馈管理</h1>
        <p className="mt-2 text-sm text-[#667085]">输入管理 Token 查看和处理用户反馈</p>
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="管理 Token"
            className="h-12 w-full rounded-xl border border-[#d8dee8] px-4 text-sm outline-none focus:border-[#0b7a3b] focus:ring-2 focus:ring-[#dff4e8]"
            autoFocus
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="h-12 w-full rounded-xl bg-[#0b7a3b] text-sm font-bold text-white"
          >
            登录
          </button>
        </form>
      </div>
    );
  }

  // ─── 已登录：显示管理界面 ───
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">反馈管理</h1>
          <p className="mt-1 text-sm text-[#667085]">
            共 {counts.total} 条反馈 · {counts.pending} 条待处理
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void fetchFeedback()}
            className="h-9 rounded-lg border border-[#eadfce] px-4 text-sm font-bold text-[#344054] hover:bg-gray-50"
          >
            ↻ 刷新
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="h-9 rounded-lg border border-[#eadfce] px-4 text-sm font-bold text-[#667085] hover:bg-gray-50"
          >
            退出
          </button>
        </div>
      </div>

      {/* 筛选 */}
      <div className="mt-5 flex flex-wrap gap-3">
        {/* 状态筛选 */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: '全部', count: counts.total },
            { key: 'pending', label: '待处理', count: counts.pending },
            { key: 'done', label: '已处理', count: counts.done },
            { key: 'ignored', label: '已忽略', count: counts.ignored },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setStatusFilter(tab.key);
                if (authed) void fetchFeedback({ status: tab.key });
              }}
              className={`h-9 rounded-lg border px-3 text-sm font-bold transition-colors ${
                statusFilter === tab.key
                  ? 'border-[#0b7a3b] bg-[#0b7a3b] text-white'
                  : 'border-[#eadfce] bg-white text-[#344054] hover:border-[#0b7a3b]'
              }`}
            >
              {tab.label}（{tab.count}）
            </button>
          ))}
        </div>

        {/* 类型筛选 */}
        <select
          value={typeFilter}
          onChange={(e) => {
            const nextType = e.target.value;
            setTypeFilter(nextType);
            if (authed) void fetchFeedback({ type: nextType });
          }}
          className="h-9 rounded-lg border border-[#eadfce] px-3 text-sm font-bold text-[#344054] outline-none focus:border-[#0b7a3b]"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t === 'all' ? '全部类型' : t}</option>
          ))}
        </select>
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="mt-10 text-center text-sm text-[#667085]">加载中…</div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[#eadfce] py-16 text-center text-sm text-[#667085]">
          {counts.total === 0 ? '暂无用户反馈' : '当前筛选条件下没有反馈'}
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[#eadfce] bg-white p-5"
            >
              {/* 头部：类型 + 状态 + 时间 */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-md bg-[#e8f6ee] px-2.5 py-1 text-xs font-bold text-[#0b7a3b]">
                  {item.type}
                </span>
                <span className={`rounded-md border px-2.5 py-1 text-xs font-bold ${STATUS_COLORS[item.status]}`}>
                  {STATUS_LABELS[item.status]}
                </span>
                <span className="text-xs text-[#667085]">
                  {new Date(item.createdAt).toLocaleString('zh-CN')}
                </span>
                <span className="ml-auto font-mono text-xs text-[#98a2b3]">
                  {item.page || '(未知页面)'}
                </span>
              </div>

              {/* 描述 */}
              <p className="mt-3 text-sm leading-6 text-[#111827]">
                {item.description}
              </p>

              {/* 联系方式 */}
              {item.contact && (
                <p className="mt-2 text-xs text-[#667085]">
                  联系方式：<span className="font-bold text-[#344054]">{item.contact}</span>
                </p>
              )}

              {/* 操作按钮 */}
              <div className="mt-4 flex gap-2 border-t border-[#eadfce] pt-3">
                {item.status !== 'done' && (
                  <button
                    type="button"
                    onClick={() => updateStatus(item.id, 'done')}
                    className="h-8 rounded-lg bg-[#0b7a3b] px-4 text-xs font-bold text-white"
                  >
                    ✓ 标记已处理
                  </button>
                )}
                {item.status !== 'ignored' && (
                  <button
                    type="button"
                    onClick={() => updateStatus(item.id, 'ignored')}
                    className="h-8 rounded-lg border border-[#eadfce] px-4 text-xs font-bold text-[#667085] hover:bg-gray-50"
                  >
                    忽略
                  </button>
                )}
                {item.status !== 'pending' && (
                  <button
                    type="button"
                    onClick={() => updateStatus(item.id, 'pending')}
                    className="h-8 rounded-lg border border-[#eadfce] px-4 text-xs font-bold text-[#344054] hover:bg-gray-50"
                  >
                    恢复待处理
                  </button>
                )}
                {item.page && (
                  <a
                    href={item.page}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto h-8 flex items-center rounded-lg border border-[#eadfce] px-4 text-xs font-bold text-[#344054] hover:bg-gray-50"
                  >
                    查看页面 ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
