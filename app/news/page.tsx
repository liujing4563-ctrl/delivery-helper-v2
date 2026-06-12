import type { Metadata } from 'next';
import { Suspense } from 'react';
import { newsItems } from '@/data/news';
import type { NewsItem } from '@/data/types';

export const metadata: Metadata = {
  title: '新闻资讯',
  description: '关注外卖骑手权益相关的最新政策、行业动态与社会新闻，每条动态保留来源原文链接。',
};

const categories = ['全部', '政策法规', '行业动态', '权益保障', '社会关注', '典型案例'] as const;
type NewsCategory = (typeof categories)[number];
type SearchParams = Record<string, string | string[] | undefined>;
type SourceEntry = {
  label: string;
  type: '官方' | '媒体';
  href: string;
};

const PAGE_SIZE = 5;

const covers = [
  '/news/mhrss-building.svg',
  '/news/conference.svg',
  '/news/rider-street.svg',
  '/news/law-book-gavel.svg',
  '/news/shanghai-skyline.svg',
];

const sourceList: SourceEntry[] = [
  { label: '人力资源和社会保障部官网', type: '官方', href: 'https://www.mohrss.gov.cn/' },
  { label: '中国政府网', type: '官方', href: 'https://www.gov.cn/' },
  { label: '新华社', type: '媒体', href: 'https://www.news.cn/' },
  { label: '中国新闻网', type: '媒体', href: 'https://www.chinanews.com.cn/' },
  { label: '法治日报', type: '媒体', href: 'https://www.legaldaily.com.cn/' },
];

function categoryOf(item: NewsItem, index: number): Exclude<NewsCategory, '全部'> {
  if (item.tags.some((tag) => tag.includes('职业伤害') || tag.includes('维权'))) return '权益保障';
  if (item.tags.some((tag) => tag.includes('算法') || tag.includes('平台'))) return '行业动态';
  if (item.tags.some((tag) => tag.includes('社保') || tag.includes('公共服务'))) return '社会关注';
  if (index === 3) return '政策法规';
  return index === 4 ? '行业动态' : '政策法规';
}

function secondTag(index: number) {
  return ['平台上线', '政策解读', '政策发布', '新规施行', ''][index] || '';
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function CardShell({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return <section id={id} className={`rounded-2xl border border-[#eadfce] bg-white ${className}`}>{children}</section>;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function parseCategory(value: string): NewsCategory {
  return categories.includes(value as NewsCategory) ? value as NewsCategory : '全部';
}

function clampPage(value: string, totalPages: number) {
  const page = Number.parseInt(value, 10);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(page, totalPages);
}

function newsMatchesKeyword(item: NewsItem, keyword: string) {
  if (!keyword) return true;
  const normalized = keyword.toLowerCase();
  return (
    item.title.toLowerCase().includes(normalized) ||
    item.summary.toLowerCase().includes(normalized) ||
    item.source.toLowerCase().includes(normalized) ||
    item.tags.some((tag) => tag.toLowerCase().includes(normalized))
  );
}

function getPaginationItems(currentPage: number, totalPages: number): Array<number | '…'> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sortedPages = [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  return sortedPages.flatMap((page, index) => {
    const previous = sortedPages[index - 1];
    return previous && page - previous > 1 ? ['…', page] : [page];
  });
}

function sourceTypeOf(source: string): SourceEntry['type'] {
  return /政府|人力资源|人社|法院|工会|部|局/.test(source) ? '官方' : '媒体';
}

function getAllSources(): SourceEntry[] {
  const byHref = new Map<string, SourceEntry>();

  for (const source of sourceList) {
    byHref.set(source.href, source);
  }

  for (const item of newsItems) {
    byHref.set(item.sourceUrl, {
      label: item.source,
      type: sourceTypeOf(item.source),
      href: item.sourceUrl,
    });
  }

  return [...byHref.values()];
}

function buildNewsHref({
  category,
  q,
  page,
  sources,
  hash,
}: {
  category: NewsCategory;
  q: string;
  page: number;
  sources?: 'all';
  hash?: string;
}) {
  const params = new URLSearchParams();
  const keyword = q.trim();

  if (category !== '全部') params.set('category', category);
  if (keyword) params.set('q', keyword);
  if (page > 1) params.set('page', String(page));
  if (sources === 'all') params.set('sources', 'all');

  const query = params.toString();
  return `/news${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`;
}

function externalLinkProps(href: string) {
  return {
    href,
    target: '_blank',
    rel: 'noopener noreferrer',
  };
}

async function NewsPageContent({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const selectedCategory = parseCategory(firstParam(params.category));
  const keyword = firstParam(params.q).trim();
  const showAllSources = firstParam(params.sources) === 'all';

  const preparedNews = newsItems.map((item, index) => ({
    item,
    category: categoryOf(item, index),
    originalIndex: index,
  }));
  const filteredNews = preparedNews.filter(({ item, category }) => (
    (selectedCategory === '全部' || category === selectedCategory) &&
    newsMatchesKeyword(item, keyword)
  ));
  const totalPages = Math.max(1, Math.ceil(filteredNews.length / PAGE_SIZE));
  const currentPage = clampPage(firstParam(params.page), totalPages);
  const visibleNews = filteredNews.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const hotNews = preparedNews.slice(0, 5);
  const visibleSources = showAllSources ? getAllSources() : sourceList;
  const hrefFor = (overrides: Partial<{
    category: NewsCategory;
    q: string;
    page: number;
    sources?: 'all';
    hash: string;
  }> = {}) => buildNewsHref({
    category: overrides.category ?? selectedCategory,
    q: overrides.q ?? keyword,
    page: overrides.page ?? currentPage,
    sources: Object.prototype.hasOwnProperty.call(overrides, 'sources')
      ? overrides.sources
      : showAllSources ? 'all' : undefined,
    hash: overrides.hash,
  });

  const newsArticleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: visibleNews.map(({ item }, index) => ({
      '@type': 'ListItem',
      position: (currentPage - 1) * PAGE_SIZE + index + 1,
      item: {
        '@type': 'NewsArticle',
        headline: item.title,
        datePublished: item.date,
        description: item.summary.slice(0, 100),
        publisher: { '@type': 'Organization', name: item.source },
      },
    })),
  };

  return (
    <div className="py-6 md:py-7">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }}
      />

      <div className="mx-auto max-w-[1280px]">
        <div className="mb-5 text-sm text-[#667085]">首页  ›  新闻资讯</div>
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
          <main>
            <div className="flex items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black tracking-normal text-[#111827]">新闻资讯</h1>
                <p className="mt-3 text-base text-[#475467]">
                  关注外卖骑手权益相关的最新政策、行业动态与社会新闻，每条动态保留来源原文链接。
                </p>
              </div>
              <form action="/news" className="hidden h-12 w-64 items-center gap-3 rounded-xl border border-[#d8dee8] bg-white px-4 md:flex">
                {selectedCategory !== '全部' && <input type="hidden" name="category" value={selectedCategory} />}
                {showAllSources && <input type="hidden" name="sources" value="all" />}
                <button type="submit" aria-label="搜索新闻" className="text-[#344054]">
                  <SearchIcon />
                </button>
                <input
                  name="q"
                  type="search"
                  defaultValue={keyword}
                  placeholder="搜索新闻标题、关键词"
                  className="min-w-0 flex-1 text-sm outline-none placeholder:text-[#98a2b3]"
                />
              </form>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {categories.map((category) => (
                <a
                  key={category}
                  href={hrefFor({ category, page: 1 })}
                  aria-current={selectedCategory === category ? 'page' : undefined}
                  className={`h-9 rounded-xl px-5 text-sm font-bold ${
                    selectedCategory === category
                      ? 'bg-[#0b7a3b] text-white shadow-sm'
                      : 'border border-[#eadfce] bg-white text-[#111827]'
                  }`}
                >
                  {category}
                </a>
              ))}
            </div>

            <CardShell id="news-list" className="mt-5 overflow-hidden">
              {visibleNews.length === 0 && (
                <div className="px-5 py-12 text-center text-sm text-[#667085]">
                  没有找到匹配的新闻资讯。
                </div>
              )}

              {visibleNews.map(({ item, category, originalIndex }) => {
                const extraTag = secondTag(originalIndex);
                return (
                  <article
                    key={item.id}
                    className="grid grid-cols-[220px_minmax(0,1fr)_96px] gap-6 border-b border-[#eadfce] px-5 py-5 last:border-b-0"
                  >
                    <img
                      src={covers[originalIndex % covers.length]}
                      alt=""
                      className="h-[120px] w-[220px] rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-md bg-[#dff4e8] px-2.5 py-1 text-xs font-bold text-[#0b7a3b]">
                          {category}
                        </span>
                        {extraTag && (
                          <span className="rounded-md bg-[#fff1dd] px-2.5 py-1 text-xs font-bold text-[#c2410c]">
                            {extraTag}
                          </span>
                        )}
                      </div>
                      <a {...externalLinkProps(item.sourceUrl)} className="mt-3 block hover:text-[#0b7a3b]">
                        <h2 className="line-clamp-2 text-xl font-black leading-snug text-[#111827]">
                        {item.title}
                        </h2>
                      </a>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#667085]">{item.summary}</p>
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <span className="font-bold text-[#111827]">{item.source}</span>
                        <a
                          {...externalLinkProps(item.sourceUrl)}
                          className="font-bold text-[#0b7a3b]"
                        >
                          查看来源
                        </a>
                        {item.backupUrl && (
                          <a
                            {...externalLinkProps(item.backupUrl)}
                            className="font-bold text-[#667085]"
                          >
                            备用来源
                          </a>
                        )}
                      </div>
                    </div>
                    <time className="pt-4 text-right text-sm text-[#667085]">{item.date}</time>
                  </article>
                );
              })}

              <div className="flex items-center justify-center gap-3 px-5 py-5 text-sm">
                {currentPage > 1 ? (
                  <a href={hrefFor({ page: currentPage - 1, hash: 'news-list' })} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#eadfce]">‹</a>
                ) : (
                  <span aria-disabled="true" className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#eadfce] text-[#98a2b3]">‹</span>
                )}
                {getPaginationItems(currentPage, totalPages).map((page, index) => (
                  page === '…' ? (
                    <span key={`ellipsis-${index}`} className="px-1 text-[#667085]">…</span>
                  ) : page === currentPage ? (
                    <span key={page} aria-current="page" className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b7a3b] font-bold text-white">{page}</span>
                  ) : (
                    <a key={page} href={hrefFor({ page, hash: 'news-list' })} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#eadfce]">{page}</a>
                  )
                ))}
                {currentPage < totalPages ? (
                  <a href={hrefFor({ page: currentPage + 1, hash: 'news-list' })} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#eadfce]">›</a>
                ) : (
                  <span aria-disabled="true" className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#eadfce] text-[#98a2b3]">›</span>
                )}
                <span className="ml-3 text-[#667085]">共 {filteredNews.length} 条</span>
              </div>
            </CardShell>
          </main>

          <aside className="space-y-4">
            <form action="/news" className="flex h-11 items-center gap-3 rounded-full border border-[#eadfce] bg-white px-4">
              {selectedCategory !== '全部' && <input type="hidden" name="category" value={selectedCategory} />}
              {showAllSources && <input type="hidden" name="sources" value="all" />}
              <button type="submit" aria-label="搜索新闻" className="text-[#344054]">
                <SearchIcon />
              </button>
              <input
                name="q"
                type="search"
                defaultValue={keyword}
                placeholder="搜索新闻标题、关键词"
                className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#98a2b3]"
              />
            </form>

            <CardShell className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-[#111827]">热门资讯</h2>
                <a href={hrefFor({ category: '全部', q: '', page: 1, hash: 'news-list' })} className="text-sm text-[#667085]">更多 ›</a>
              </div>
              <div className="mt-4 space-y-4 rounded-xl bg-white">
                {hotNews.map(({ item }, index) => (
                  <div key={item.id} className="grid grid-cols-[24px_1fr] gap-3 border-b border-[#eadfce] pb-3 last:border-b-0 last:pb-0">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-black ${
                        index < 3 ? 'bg-[#fff1dd] text-[#f97316]' : 'bg-[#eef2f6] text-[#475467]'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <a {...externalLinkProps(item.sourceUrl)}>
                      <p className="line-clamp-2 text-sm font-bold leading-5 text-[#111827] hover:text-[#0b7a3b]">
                        {item.title}
                        {index === 0 && <span className="ml-2 text-[#f97316]">●</span>}
                      </p>
                      <time className="mt-1 block text-xs text-[#667085]">{item.date}</time>
                    </a>
                  </div>
                ))}
              </div>
            </CardShell>

            <CardShell className="p-5">
              <h2 className="text-lg font-black text-[#111827]">订阅更新</h2>
              <p className="mt-2 text-sm leading-6 text-[#667085]">订阅后，最新政策法规和权益资讯将通过邮件通知您。</p>
              <div className="mt-4 flex gap-3">
                <input
                  type="email"
                  placeholder="请输入您的邮箱地址"
                  className="min-w-0 flex-1 rounded-lg border border-[#d8dee8] px-3 text-sm outline-none focus:border-[#0b7a3b]"
                />
                <button className="h-10 rounded-lg bg-[#0b7a3b] px-4 text-sm font-bold text-white">订阅资讯</button>
              </div>
              <p className="mt-3 text-xs text-[#667085]">演示版本暂未开通邮件订阅，我们不会保存您的邮箱。</p>
            </CardShell>

            <CardShell id="source-list" className="p-5">
              <h2 className="text-lg font-black text-[#111827]">资讯来源</h2>
              <div className="mt-4 space-y-3">
                {visibleSources.map((source) => (
                  <a key={source.href} {...externalLinkProps(source.href)} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2 text-[#344054]">
                      <span className="h-5 w-5 rounded-full bg-[#0b7a3b]" />
                      <span className="truncate hover:text-[#0b7a3b]">{source.label}</span>
                    </span>
                    <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${source.type === '官方' ? 'bg-[#dff4e8] text-[#0b7a3b]' : 'bg-[#efe7ff] text-[#6941c6]'}`}>
                      {source.type}
                    </span>
                  </a>
                ))}
              </div>
              <a
                href={hrefFor({ sources: showAllSources ? undefined : 'all', hash: 'source-list' })}
                className="mt-5 flex h-10 w-full items-center justify-center rounded-lg border border-[#eadfce] text-sm font-bold text-[#0b7a3b]"
              >
                {showAllSources ? '收起来源' : '查看全部来源'}  ›
              </a>
            </CardShell>

            <section className="rounded-2xl border border-[#fed7aa] bg-[#fff7ed] p-5">
              <h2 className="text-lg font-black text-[#9a3412]">重要提示</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#c2410c]">
                新闻仅供背景阅读，不作为法律依据。具体维权请以官方法规、12348 或专业律师意见为准。
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function NewsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-[#667085]">加载新闻资讯...</div>}>
      <NewsPageContent searchParams={searchParams} />
    </Suspense>
  );
}
