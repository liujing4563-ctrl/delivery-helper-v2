import { NextRequest } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), '.data');
const FEEDBACK_FILE = join(DATA_DIR, 'feedback.json');

export type FeedbackStatus = 'pending' | 'done' | 'ignored';

export interface FeedbackEntry {
  id: string;
  page: string;
  type: string;
  description: string;
  contact: string;
  status: FeedbackStatus;
  createdAt: string;
  userAgent: string;
}

async function readFeedback(): Promise<FeedbackEntry[]> {
  try {
    const content = await readFile(FEEDBACK_FILE, 'utf-8');
    const entries = JSON.parse(content);
    // 兼容旧数据：没有 status 字段的补上
    return entries.map((e: FeedbackEntry) => ({
      ...e,
      status: e.status || 'pending',
    }));
  } catch {
    return [];
  }
}

async function saveFeedback(entries: FeedbackEntry[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(FEEDBACK_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

function getAdminToken(): string {
  const configured = process.env.FEEDBACK_ADMIN_TOKEN?.trim();
  if (configured) return configured;
  return process.env.NODE_ENV === 'production' ? '' : 'rider-admin-2026';
}

function isAdminAuthorized(token: string | null | undefined): boolean {
  const adminToken = getAdminToken();
  return Boolean(adminToken && token === adminToken);
}

async function listFeedback(params: {
  token?: string;
  status?: string;
  type?: string;
  page?: string | number;
  limit?: string | number;
}) {
  if (!isAdminAuthorized(params.token)) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  const entries = await readFeedback();

  const filtered = params.status && params.status !== 'all'
    ? entries.filter((e) => e.status === params.status)
    : entries;

  const result = params.type && params.type !== 'all'
    ? filtered.filter((e) => e.type === params.type)
    : filtered;

  const page = Number(params.page || '1');
  const limit = Number(params.limit || '50');
  const start = (page - 1) * limit;

  const counts = {
    total: entries.length,
    pending: entries.filter((e) => e.status === 'pending').length,
    done: entries.filter((e) => e.status === 'done').length,
    ignored: entries.filter((e) => e.status === 'ignored').length,
  };

  return Response.json({
    counts,
    page,
    limit,
    items: result.slice(start, start + limit),
  });
}

/** POST /api/feedback — 提交反馈 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      page?: string;
      type?: string;
      description?: string;
      contact?: string;
      action?: string;
      token?: string;
      status?: string;
      pageNum?: string | number;
      limit?: string | number;
    };

    if (body.action === 'list') {
      return listFeedback({
        token: body.token,
        status: body.status,
        type: body.type,
        page: body.pageNum,
        limit: body.limit,
      });
    }

    const page = (body.page || '').trim().slice(0, 500);
    const type = (body.type || '').trim().slice(0, 50);
    const description = (body.description || '').trim().slice(0, 2000);
    const contact = (body.contact || '').trim().slice(0, 200);

    if (!type || !description) {
      return Response.json(
        { error: '请填写问题类型和描述' },
        { status: 400 }
      );
    }

    const validTypes = ['数据错误', '功能建议', '页面问题', '其他'];
    if (!validTypes.includes(type)) {
      return Response.json(
        { error: '无效的问题类型' },
        { status: 400 }
      );
    }

    const entry: FeedbackEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      page,
      type,
      description,
      contact,
      status: 'pending',
      createdAt: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || '',
    };

    const entries = await readFeedback();
    entries.unshift(entry);

    // 最多保留 500 条
    if (entries.length > 500) {
      entries.length = 500;
    }

    await saveFeedback(entries);

    return Response.json({ success: true, id: entry.id });
  } catch {
    return Response.json(
      { error: '提交失败，请稍后重试' },
      { status: 500 }
    );
  }
}

/** PATCH /api/feedback — 更新反馈状态（token 保护） */
export async function PATCH(request: NextRequest) {
  const url = new URL(request.url);
  const token = request.headers.get('x-feedback-token') || url.searchParams.get('token');

  if (!isAdminAuthorized(token)) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      id?: string;
      status?: FeedbackStatus;
    };

    if (!body.id || !body.status) {
      return Response.json({ error: '缺少 id 或 status' }, { status: 400 });
    }

    const validStatuses: FeedbackStatus[] = ['pending', 'done', 'ignored'];
    if (!validStatuses.includes(body.status)) {
      return Response.json({ error: '无效的状态值' }, { status: 400 });
    }

    const entries = await readFeedback();
    const target = entries.find((e) => e.id === body.id);
    if (!target) {
      return Response.json({ error: '反馈不存在' }, { status: 404 });
    }

    target.status = body.status;
    await saveFeedback(entries);

    return Response.json({ success: true, id: target.id, status: target.status });
  } catch {
    return Response.json({ error: '更新失败' }, { status: 500 });
  }
}
