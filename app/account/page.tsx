'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AccountPage() {
  const [clearStatus, setClearStatus] = useState<'idle' | 'done' | 'failed'>(
    'idle'
  );

  const handleClearLocalData = () => {
    try {
      localStorage.removeItem('calculator-input');
      setClearStatus('done');
    } catch {
      setClearStatus('failed');
    }
  };

  return (
    <div className="px-4 pb-4 pt-6">
      <h1 className="text-xl font-bold text-gray-900">我的</h1>
      <p className="mt-1 text-sm text-gray-500">
        当前 MVP 阶段不启用真实账号系统
      </p>

      <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
        核心功能无需登录即可使用。为降低合规和隐私风险，本站当前不收集邮箱、手机号、密码或身份材料。
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-base font-semibold text-gray-900">本地数据</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          薪资计算器会把上次输入临时保存在当前浏览器，方便你下次继续填写。数据不会上传到服务器。
        </p>
        <button
          type="button"
          onClick={handleClearLocalData}
          className="mt-3 w-full rounded-lg bg-gray-800 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-900"
        >
          清除本地计算器输入
        </button>
        {clearStatus !== 'idle' && (
          <p
            className={`mt-2 text-sm ${
              clearStatus === 'done' ? 'text-green-600' : 'text-red-600'
            }`}
            role="status"
          >
            {clearStatus === 'done'
              ? '已清除当前浏览器保存的计算器输入。'
              : '清除失败，请检查浏览器本地存储权限。'}
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <Link
          href="/login"
          className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700"
        >
          账号功能说明
        </Link>
        <Link
          href="/privacy"
          className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700"
        >
          查看隐私说明
        </Link>
        <Link
          href="/disclaimer"
          className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700"
        >
          查看免责声明
        </Link>
      </div>
    </div>
  );
}
