'use cache';
import type { Metadata } from 'next';
import { newsItems } from '@/data/news';
import DisclaimerBox from '@/components/DisclaimerBox';

export const metadata: Metadata = {
  title: '权益动态',
  description: '外卖骑手劳动权益相关的最新政策动态和新闻，包括职业伤害保障、社保参保、算法整改、最低工资等。',
};

const newsArticleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: newsItems.slice(0, 5).map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'NewsArticle',
      headline: item.title,
      datePublished: item.date,
      description: item.summary.slice(0, 100),
      publisher: { '@type': 'Organization', name: item.source },
    },
  })),
};

export default async function NewsPage() {
  return (
    <div className="px-4 pt-6 pb-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }}
      />
      <h1 className="text-xl font-bold text-gray-900">权益动态</h1>
      <p className="mt-1 text-sm text-gray-500">
        与外卖骑手劳动权益相关的新闻和政策动态
      </p>

      <div className="mt-3">
        <DisclaimerBox />
      </div>

      <div className="mt-4 space-y-3">
        {newsItems.map((item) => {
          const isVerified = item.lastVerified !== '待核实';

          return (
            <div
              key={item.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <h2 className="text-base font-semibold text-[#1A1A1A]">
                {item.title}
              </h2>
              <p className="mt-1 text-sm text-gray-600">{item.summary}</p>
              {item.tags.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <span>{item.source}</span>
                <span>·</span>
                <span>{item.date}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
                  >
                    查看原文
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                  {item.backupUrl && (
                    <>
                      <span className="text-gray-300">|</span>
                      <a
                        href={item.backupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-500 hover:text-blue-600 hover:underline"
                      >
                        备用链接
                      </a>
                    </>
                  )}
                </div>
                <span className={`text-xs ${isVerified ? 'text-green-600' : 'text-amber-600'}`}>
                  {isVerified ? `✓ ${item.lastVerified}` : '⚠️ 待核实'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-gray-500 text-center">
        新闻摘要由本站整理，仅供背景阅读。具体内容请点击"查看原文"阅读官方来源。
      </p>
    </div>
  );
}
