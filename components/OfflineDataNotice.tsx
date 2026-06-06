'use client';

import { useEffect, useState } from 'react';

/**
 * 统一的离线状态检测组件。
 * 浏览器环境使用 navigator.onLine + online/offline 事件；
 * Capacitor 环境使用 Network 插件获得更准确的网络状态。
 */
export default function OfflineDataNotice() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // 浏览器原生离线检测
    const updateOnlineState = () => setIsOffline(!navigator.onLine);
    updateOnlineState();
    window.addEventListener('online', updateOnlineState);
    window.addEventListener('offline', updateOnlineState);

    // Capacitor Network 插件（仅在 APK 环境生效）
    let networkCleanup: (() => void) | undefined;
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).Capacitor) {
      import('@capacitor/network').then(({ Network }) => {
        Network.getStatus().then((status) => setIsOffline(!status.connected));
        Network.addListener('networkStatusChange', (s) => {
          setIsOffline(!s.connected);
        }).then((handler) => {
          networkCleanup = () => handler.remove();
        });
      }).catch(() => { /* 非 Capacitor 环境，回退到浏览器检测 */ });
    }

    return () => {
      window.removeEventListener('online', updateOnlineState);
      window.removeEventListener('offline', updateOnlineState);
      networkCleanup?.();
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-medium leading-5 text-amber-900"
    >
      当前处于离线状态，AI 聊天不可用；页面内容可能来自缓存，法规、最低工资和法援信息可能已过期；联网后请以页面来源链接为准。
    </div>
  );
}
