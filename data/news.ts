import type { NewsItem } from './types';

// 只保留已核验的官方政策动态；不展示未经核验的新闻条目。
export const newsItems: NewsItem[] = [
  {
    id: 'news-001',
    title: '人社部办公厅印发新就业形态劳动者权益保障三项指引',
    source: '中国政府网',
    sourceUrl: 'https://www.gov.cn/zhengce/zhengceku/202402/content_6933822.htm',
    date: '2023-11-08',
    summary: '文件包括休息和劳动报酬权益保障指引、劳动规则公示指引、权益维护服务指南，要求指导平台依法规范用工、劳动者依法维权。',
    tags: ['新就业形态', '劳动报酬', '平台规则'],
    lastVerified: '2026-06-05',
  },
  {
    id: 'news-002',
    title: '九部门扩大新就业形态人员职业伤害保障试点',
    source: '中国政府网国务院公报',
    sourceUrl: 'https://www.gov.cn/gongbao/2025/issue_12186/202507/content_7034087.html',
    date: '2025-04-22',
    summary: '文件明确用三年时间分步骤推进职业伤害保障试点扩围，2025年7月1日起新增试点省份和平台企业，后续推动覆盖更多地区和行业。',
    tags: ['职业伤害保障', '试点扩围', '平台企业'],
    lastVerified: '2026-06-05',
  },
  {
    id: 'news-003',
    title: '上海扩大新就业形态人员职业伤害保障试点',
    source: '上海市人力资源和社会保障局',
    sourceUrl: 'https://rsj.sh.gov.cn/tjypx_17728/20250819/t0035_1434960.html',
    date: '2025-07-29',
    summary: '上海文件明确自2025年7月1日起扩大职业伤害保障试点范围，并制定《上海市新就业形态人员职业伤害保障实施办法》。',
    tags: ['上海', '职业伤害保障', '即时配送'],
    lastVerified: '2026-06-05',
  },
];
