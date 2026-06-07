'use cache';

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  injuryInsurancePlatforms,
  batchLabels,
  batchGroups,
} from '@/data/injuryInsurance';

export const metadata: Metadata = {
  title: '职业伤害保障平台名单',
  description:
    '2026年7月1日起全国31省推行，覆盖外卖、出行、货运三大行业约8400万劳动者。无需个人缴费，平台按单缴纳。',
};

export default async function InjuryInsurancePage() {
  return (
    <div className="pb-4 md:pb-8">
      <section className="rounded-none bg-orange-600 px-4 pb-5 pt-6 text-white md:mt-6 md:rounded-2xl md:px-8 md:py-8">
        <p className="text-sm font-medium text-white/90">职业伤害保障</p>
        <h1 className="mt-2 text-2xl font-bold leading-8 md:text-3xl">
          你的平台在保障名单里吗？
        </h1>
        <p className="mt-3 text-sm leading-6 text-orange-50 md:text-base">
          2026年7月1日起全国31省推行，平台按单缴费，骑手无需自掏腰包。覆盖外卖、出行、货运三大行业约8400万劳动者。
        </p>
      </section>

      <section className="px-4 pt-5 md:px-0 md:pt-8">
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <p className="text-sm font-bold text-orange-900">制度要点</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-orange-800">
            <li>无需个人缴费，由平台企业按单计费、按月缴纳</li>
            <li>缴费标准：即时配送每单 0.07～0.25 元、出行每单 0.01 元、货运每单 0.18 元</li>
            <li>待遇涵盖：医疗费用、伤残补助、死亡抚恤、生活保障</li>
            <li>新职伤与商业意外险可双重理赔</li>
            <li>累计已覆盖约 2742 万人，预计覆盖约 8400 万劳动者</li>
          </ul>
        </div>
      </section>

      {batchGroups.map((batch) => {
        const platforms = injuryInsurancePlatforms.filter(
          (p) => p.batch === batch,
        );
        const industries = [
          ...new Set(platforms.map((p) => p.industry)),
        ];

        return (
          <section key={batch} className="px-4 pt-5 md:px-0 md:pt-8">
            <h2 className="text-lg font-bold text-gray-900">
              {batchLabels[batch]}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {platforms.length} 家平台 · {platforms[0].startDate} 起
            </p>
            {industries.map((industry) => (
              <div key={industry} className="mt-3">
                <p className="text-sm font-semibold text-gray-700">
                  {industry}
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {platforms
                    .filter((p) => p.industry === industry)
                    .map((p) => (
                      <span
                        key={p.name}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800"
                      >
                        {p.name}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </section>
        );
      })}

      <section className="px-4 pt-6 md:px-0 md:pt-8">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900">受伤了怎么申请理赔？</p>
          <div className="mt-2 space-y-3 text-sm text-blue-800">
            <div>
              <p className="font-semibold">第一步：一键报案</p>
              <p>在执行平台订单任务期间受伤后，立即通过平台 APP 的"一键报案"功能发送事故报案信息。同时保留好事故现场照片、医院病历和当时的订单截图。</p>
            </div>
            <div>
              <p className="font-semibold">第二步：平台申请待遇</p>
              <p>平台企业在收到报案后 30 日内向人社部门申请职业伤害待遇。如果平台未按时申请，你本人或近亲属可在事故发生之日起 90 日内直接向人社部门申请。</p>
            </div>
            <div>
              <p className="font-semibold">第三步：人社部门确认</p>
              <p>人社部门在 30 个工作日内完成职业伤害确认。如需劳动能力鉴定，由劳动能力鉴定委员会参照工伤标准进行。</p>
            </div>
            <div>
              <p className="font-semibold">第四步：待遇支付</p>
              <p>确认后直接核定待遇，赔偿金支付至你的社保卡金融账户。待遇涵盖医疗费用、伤残补助、死亡抚恤和生活保障。</p>
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">需要准备哪些材料？</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-700">
            <li>事故现场照片或视频</li>
            <li>医院诊断证明和费用票据</li>
            <li>当时执行订单的截图（含时间、地点）</li>
            <li>身份证复印件、社保卡信息</li>
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            如有疑问，拨打{' '}
            <a href="tel:12333" className="font-bold text-blue-600 underline" aria-label="拨打人社咨询热线 12333">
              12333
            </a>{' '}
            咨询当地人社部门。
          </p>
        </div>
        <div className="mt-4 flex justify-center">
          <Link
            href="/guide"
            className="text-sm text-blue-600 underline underline-offset-2"
          >
            查看完整维权路径指引
          </Link>
        </div>
      </section>

      <p className="mt-6 px-4 text-center text-xs text-gray-400">
        数据来源：人社部 2026年5月26日国新办政策吹风会 · 最后核实：2026-06-07
      </p>
    </div>
  );
}
