'use client';

import { useState } from 'react';

export default function DeleteAccountButton() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [status, setStatus] = useState<'idle' | 'done'>('idle');

  const handleClearLocalData = () => {
    try {
      localStorage.removeItem('calculator-input');
      setStatus('done');
      setIsConfirming(false);
    } catch {
      setStatus('done');
      setIsConfirming(false);
    }
  };

  if (status === 'done') {
    return (
      <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
        已清除当前浏览器保存的本地数据。当前 MVP 阶段没有服务端账户记录。
      </p>
    );
  }

  if (!isConfirming) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          MVP 阶段不启用真实账号系统，此操作只会清除当前浏览器保存的本地数据。
        </p>
        <button
          type="button"
          onClick={() => setIsConfirming(true)}
          className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          清除本地数据
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-red-700">
        请确认：这会清除浏览器本地保存的计算器输入。
      </p>
      <p className="text-xs text-gray-500">
        当前没有服务端账户或业务数据库，因此无需删除服务端账户记录。
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleClearLocalData}
          className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          确认清除
        </button>
        <button
          type="button"
          onClick={() => setIsConfirming(false)}
          className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700"
        >
          取消
        </button>
      </div>
    </div>
  );
}
