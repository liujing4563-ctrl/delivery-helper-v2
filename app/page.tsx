'use cache';
import Link from 'next/link';
import DisclaimerBox from '@/components/DisclaimerBox';
import ProblemCard from '@/components/ProblemCard';
import type { ProblemEntry } from '@/data/types';
import { newsItems } from '@/data/news';

const entries: ProblemEntry[] = [
  {
    id: 'guide',
    title: '不知道怎么办',
    description: '五步维权路径指引，从证据收集到仲裁',
    icon: '路',
    href: '/guide',
  },
  {
    id: 'evidence',
    title: '准备证据',
    description: '按问题类型整理证据清单，一键复制导出',
    icon: '证',
    href: '/evidence',
  },
  {
    id: 'deduction',
    title: '被扣钱了',
    description: '超时罚款、差评扣款、违规处罚',
    icon: '扣',
    href: '/chat?topic=deduction',
    colorKey: 'deduction',
  },
  {
    id: 'low-pay',
    title: '工资太低',
    description: '想知道时薪是否低于最低工资',
    icon: '薪',
    href: '/calculator',
    colorKey: 'pay',
  },
  {
    id: 'injury',
    title: '送餐受伤',
    description: '交通事故、职业伤害保障',
    icon: '伤',
    href: '/chat?topic=injury',
    colorKey: 'injury',
  },
  {
    id: 'blocked',
    title: '被封号了',
    description: '账号停用、申诉流程',
    icon: '号',
    href: '/chat?topic=blocked',
    colorKey: 'blocked',
  },
  {
    id: 'contract',
    title: '没签合同',
    description: '劳动关系线索、权益保障',
    icon: '约',
    href: '/chat?topic=contract',
    colorKey: 'contract',
  },
  {
    id: 'injury-insurance',
    title: '职业伤害保障',
    description: '查看你的平台是否在保障名单中',
    icon: '保',
    href: '/injury-insurance',
  },
  {
    id: 'social-insurance',
    title: '想缴社保',
    description: '骑手养老/医疗保险参保指南，平台补贴方案',
    icon: '社',
    href: '/social-insurance',
  },
  {
    id: 'legal-aid',
    title: '申请法援',
    description: '法律援助中心、咨询渠道',
    icon: '援',
    href: '/legal-aid',
    colorKey: 'aid',
  },
];

export default async function Home() {
  return (
    <div className="pb-4 md:pb-8">
      {/* 顶部品牌区 — 温暖橙色，不是蓝色 */}
      <section className="px-4 pb-5 pt-6 md:px-8 md:py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FEEBC8]">
            <span className="text-xl">🛵</span>
          </div>
          <div>
            <p className="text-sm font-medium text-[#6B6560]">公益项目 · 免费使用</p>
            <h1 className="text-xl font-bold text-[#1A1A1A]">骑手权益助手</h1>
          </div>
        </div>

        {/* 免责提示 — 米色温和提示 */}
        <div className="mt-4 rounded-lg border border-[#F5E6C8] bg-[#FEF9EE] p-3">
          <p className="text-sm text-[#92650A]">
            提供法律信息和一般性指引，不构成律师法律意见。具体维权请咨询 12348 或当地法律援助中心。
          </p>
        </div>

        {/* 快捷入口 */}
        <div className="mt-5 grid grid-cols-2 gap-3 md:max-w-sm">
          <Link
            href="/calculator"
            className="rounded-xl border border-[#EDE9E3] bg-white px-4 py-3 text-center text-sm font-semibold text-[#1A1A1A] hover:bg-[#F5F3F0]"
          >
            先算时薪
          </Link>
          <Link
            href="/legal-aid"
            className="rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3 text-center text-sm font-semibold text-[#059669]"
          >
            找法援入口
          </Link>
        </div>
      </section>

      {/* 问题入口 */}
      <section className="px-4 pt-5 md:px-0 md:pt-8">
        <h2 className="text-lg font-bold text-[#1A1A1A]">遇到什么问题？</h2>
        <p className="mt-1 text-sm text-[#6B6560]">选择你的情况，我们帮你找解决路径</p>
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry) => (
            <ProblemCard key={entry.id} problem={entry} />
          ))}
        </div>
      </section>

      {/* 最新动态 */}
      <section className="px-4 pt-5 md:px-0 md:pt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">最新动态</h2>
          <Link
            href="/news"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            查看全部 →
          </Link>
        </div>
        <div className="mt-3 space-y-2">
          {newsItems.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
            >
              <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                {item.title}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {item.source} · {item.date}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 紧急联系 */}
      <section className="px-4 pt-6 md:px-0 md:pt-8">
        <h2 className="text-lg font-bold text-[#1A1A1A]">紧急联系</h2>
        <div className="mt-3 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D1FAE5]">
              <span className="text-lg">📞</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-[#059669]">12348 法律援助热线</p>
              <p className="text-sm text-[#6B6560]">全国统一法律援助咨询热线，免费拨打</p>
            </div>
            <a
              href="tel:12348"
              className="ml-auto rounded-lg bg-[#059669] px-4 py-2 text-sm font-semibold text-white"
            >
              拨打
            </a>
          </div>
        </div>
      </section>

      {/* 底部 */}
      <section className="px-4 pt-6 md:px-0 md:pt-8">
        <DisclaimerBox />
        <div className="mt-3 flex justify-center gap-4 text-xs text-[#6B6560]">
          <Link href="/privacy" className="underline underline-offset-2">
            隐私说明
          </Link>
          <Link href="/disclaimer" className="underline underline-offset-2">
            免责声明
          </Link>
        </div>
      </section>
    </div>
  );
}
