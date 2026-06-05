'use client';

import { type ReactNode } from 'react';

/**
 * 全局 Provider 包裹层。
 * 当前 MVP 不启用真实账号系统，暂不挂载认证 Provider。
 */
export default function Providers({ children }: { children: ReactNode }) {
  return children;
}
