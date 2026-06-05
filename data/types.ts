// ===== 核心数据类型 =====

export interface Regulation {
  id: string;
  title: string;
  issuer: string;
  publishDate: string;
  category: '劳动报酬' | '劳动关系' | '社会保险' | '工伤职业伤害' | '法律援助' | '平台规则';
  summary: string;
  officialUrl: string;
  tags: string[];
  lastVerified: string;
}

export interface MinWage {
  city: string;
  monthly: number | null;
  hourly: number;
  effectiveDate: string;
  scopeNote?: string;
  sourceName: string;
  sourceUrl: string;
  lastVerified: string;
}

export interface LegalAidCenter {
  id: string;
  name: string;
  type: '法律援助中心' | '公共法律服务中心' | '正规律所查询入口';
  city: string;
  district?: string;
  address?: string;
  phone?: string;
  hours?: string;
  mapUrl?: string;
  qrImageUrl?: string;
  sourceName: string;
  sourceUrl: string;
  lastVerified: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  date: string;
  summary: string;
  tags: string[];
  lastVerified: string;
}

export interface CalculatorInput {
  city: string;
  period: 'day' | 'week' | 'month';
  orders: number;
  avgIncomePerOrder: number;
  subsidies: number;
  rewards: number;
  deductions: number;
  costs: number;
  onlineHours: number;
}

export interface CalculatorResult {
  grossIncome: number;
  netIncome: number;
  hourlyRate: number;
  monthlyEquivalent: number;
  minWageReference: number;
  riskLevel: 'green' | 'yellow' | 'red' | 'gray';
  riskMessage: string;
}

// 首页问题入口
export interface ProblemEntry {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
}

// 功能入口
export interface FeatureEntry {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
}

// 底部导航项
export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
