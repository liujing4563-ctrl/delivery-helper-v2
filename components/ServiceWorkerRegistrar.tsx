'use client';

import { useEffect } from 'react';

/**
 * 注册 Service Worker 实现 PWA 离线支持
 * 仅在生产环境且浏览器支持时注册
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      void navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service Worker 是渐进增强；注册失败不影响核心功能。
      });
    }
  }, []);

  return null;
}
