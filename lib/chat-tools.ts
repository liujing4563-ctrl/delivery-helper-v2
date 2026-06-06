import { tool } from 'ai';
import { z } from 'zod/v4';
import { regulations } from '@/data/regulations';
import { minWageData } from '@/data/minWage';
import { legalAidCenters } from '@/data/legalAidCenters';

/**
 * AI 聊天工具集 — 让 DeepSeek 能检索项目数据后回答
 *
 * 工具设计原则：
 * 1. 只读操作，不修改任何数据
 * 2. 返回结构化文本，方便模型整合到回答中
 * 3. 数据来源全部来自项目内已有数据，零外部依赖
 */

/** 搜索法规条文 */
export const searchRegulations = tool({
  description:
    '搜索与外卖骑手劳动权益相关的法规和政策文件。当用户询问法律依据、政策规定、法规条文时使用。',
  inputSchema: z.object({
    keyword: z
      .string()
      .describe('搜索关键词，如"工伤"、"劳动合同"、"扣款"、"最低工资"'),
  }),
  execute: async (input) => {
    const keywordLower = input.keyword.toLowerCase();
    const results = regulations.filter(
      (reg) =>
        reg.title.toLowerCase().includes(keywordLower) ||
        reg.summary.toLowerCase().includes(keywordLower) ||
        reg.tags.some((tag) => tag.toLowerCase().includes(keywordLower)) ||
        reg.category.toLowerCase().includes(keywordLower)
    );

    if (results.length === 0) {
      return `未找到与"${input.keyword}"相关的法规。`;
    }

    return results
      .map(
        (reg) =>
          `《${reg.title}》（${reg.issuer}，${reg.publishDate}）\n` +
          `类别：${reg.category}\n` +
          `摘要：${reg.summary}\n` +
          (reg.officialUrl ? `官方链接：${reg.officialUrl}\n` : '')
      )
      .join('\n---\n');
  },
});

/** 查询最低工资标准 */
export const getMinimumWage = tool({
  description:
    '查询指定城市的最低工资标准（月标准和小时标准）。当用户询问某个城市的最低工资、工资是否合规时使用。',
  inputSchema: z.object({
    city: z.string().describe('城市名称，如"上海"、"北京"、"成都"'),
  }),
  execute: async (input) => {
    const data = minWageData.find(
      (w) => w.city === input.city || w.city.includes(input.city)
    );

    if (!data) {
      const availableCities = minWageData.map((w) => w.city).join('、');
      return `未找到"${input.city}"的最低工资数据。当前已收录城市：${availableCities}。建议拨打 12333 查询当地最新标准。`;
    }

    const verified = data.lastVerified !== '待核实' ? '已核验' : '待核实';
    return (
      `${data.city}最低工资标准（${verified}）：\n` +
      `月最低工资：${data.monthly ?? '未知'}元\n` +
      `小时最低工资：${data.hourly}元\n` +
      `生效日期：${data.effectiveDate}\n` +
      (data.scopeNote ? `说明：${data.scopeNote}\n` : '') +
      `数据来源：${data.sourceName}`
    );
  },
});

/** 查找法律援助中心 */
export const findLegalAid = tool({
  description:
    '查找指定城市的法律援助中心地址和电话。当用户询问法律援助、找律师、维权渠道时使用。',
  inputSchema: z.object({
    city: z.string().describe('城市名称，如"上海"、"北京"、"深圳"'),
  }),
  execute: async (input) => {
    const results = legalAidCenters.filter(
      (c) => c.city === input.city || c.city.includes(input.city)
    );

    if (results.length === 0) {
      const availableCities = [
        ...new Set(legalAidCenters.map((c) => c.city)),
      ].join('、');
      return (
        `未找到"${input.city}"的法律援助中心信息。\n` +
        `当前已收录城市：${availableCities}。\n` +
        `建议：拨打 12348（全国法律援助热线）或访问 https://www.12348.gov.cn/ 查询。`
      );
    }

    return results
      .map(
        (c) =>
          `${c.name}\n` +
          (c.address ? `地址：${c.address}\n` : '') +
          (c.phone ? `电话：${c.phone}\n` : '') +
          (c.hours ? `接待时间：${c.hours}\n` : '') +
          `核验状态：${c.lastVerified !== '待核实' ? '已核验' : '待核实'}`
      )
      .join('\n---\n');
  },
});

/** 计算时薪 */
export const calculateHourlyRate = tool({
  description:
    '计算外卖骑手的实际时薪并与当地最低工资对比。当用户询问收入是否合理、时薪多少、工资是否达标时使用。',
  inputSchema: z.object({
    city: z.string().describe('所在城市'),
    totalEarnings: z.number().describe('总收入（元，骑手 app 显示的到账金额）'),
    onlineHours: z.number().describe('在线接单小时数'),
    period: z.enum(['day', 'week', 'month']).describe('统计周期：day/week/month'),
    subsidies: z.number().optional().default(0).describe('补贴金额（元）'),
    rewards: z.number().optional().default(0).describe('奖励金额（元）'),
    deductions: z.number().optional().default(0).describe('扣款金额（元）'),
    costs: z.number().optional().default(0).describe('工作成本（元，如油费、维修费）'),
  }),
  execute: async (input) => {
    const subsidies = input.subsidies ?? 0;
    const rewards = input.rewards ?? 0;
    const deductions = input.deductions ?? 0;
    const costs = input.costs ?? 0;

    const grossIncome = input.totalEarnings + subsidies + rewards;
    const netIncome = grossIncome - deductions - costs;
    const hourlyRate = input.onlineHours > 0 ? netIncome / input.onlineHours : 0;

    const WORKING_DAYS_PER_MONTH = 26;
    const WEEKS_PER_MONTH = 4.33;
    let monthlyEquivalent = 0;
    switch (input.period) {
      case 'day':
        monthlyEquivalent = netIncome * WORKING_DAYS_PER_MONTH;
        break;
      case 'week':
        monthlyEquivalent = netIncome * WEEKS_PER_MONTH;
        break;
      case 'month':
        monthlyEquivalent = netIncome;
        break;
    }

    const cityMinWage = minWageData.find(
      (w) => w.city === input.city || w.city.includes(input.city)
    );
    const minWageHourly = cityMinWage?.hourly ?? 0;
    const isVerified = cityMinWage && cityMinWage.lastVerified !== '待核实';

    let riskLevel = 'gray';
    let riskMessage = '';
    if (!minWageHourly || !isVerified) {
      riskMessage = `${input.city}暂无已核验的最低工资数据，无法判断是否达标。`;
    } else if (hourlyRate >= minWageHourly) {
      riskLevel = 'green';
      riskMessage = `时薪 ${hourlyRate.toFixed(2)} 元 ≥ 最低工资 ${minWageHourly} 元/小时，收入达标。`;
    } else if (hourlyRate >= minWageHourly * 0.8) {
      riskLevel = 'yellow';
      riskMessage = `时薪 ${hourlyRate.toFixed(2)} 元，略低于最低工资 ${minWageHourly} 元/小时。`;
    } else {
      riskLevel = 'red';
      riskMessage = `时薪 ${hourlyRate.toFixed(2)} 元，明显低于最低工资 ${minWageHourly} 元/小时。`;
    }

    return (
      `计算结果：\n` +
      `毛收入：${grossIncome.toFixed(2)} 元\n` +
      `净收入：${netIncome.toFixed(2)} 元\n` +
      `时薪：${hourlyRate.toFixed(2)} 元/小时\n` +
      `折算月收入：${monthlyEquivalent.toFixed(2)} 元\n` +
      `风险等级：${riskLevel}\n` +
      `判断：${riskMessage}`
    );
  },
});
