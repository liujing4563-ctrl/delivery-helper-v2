import { describe, it, expect } from 'vitest';
import { calculateSalary } from './calculator';
import type { CalculatorInput, MinWage } from '@/data/types';

// 测试用最低工资数据
const mockMinWageData: MinWage[] = [
  {
    city: '测试城市A',
    monthly: 2500,
    hourly: 25,
    effectiveDate: '2025-01-01',
    sourceName: '测试来源',
    sourceUrl: 'https://example.com',
    lastVerified: '2026-01-01',
  },
  {
    city: '测试城市B',
    monthly: 0,
    hourly: 0,
    effectiveDate: '2025-01-01',
    sourceName: '测试来源',
    sourceUrl: 'https://example.com',
    lastVerified: '待核实',
  },
];

const defaultInput: CalculatorInput = {
  city: '测试城市A',
  period: 'day',
  totalEarnings: 210,
  subsidies: 0,
  rewards: 0,
  deductions: 0,
  costs: 0,
  onlineHours: 10,
};

describe('calculateSalary', () => {
  describe('基础计算', () => {
    it('应正确计算毛收入', () => {
      const result = calculateSalary(defaultInput, mockMinWageData);
      // 总收入 210 元
      expect(result.grossIncome).toBe(210);
    });

    it('应正确计算净收入（含扣款和成本）', () => {
      const input: CalculatorInput = {
        ...defaultInput,
        deductions: 20,
        costs: 30,
      };
      const result = calculateSalary(input, mockMinWageData);
      // 210 - 20 - 30 = 160 元
      expect(result.netIncome).toBe(160);
    });

    it('应正确计算时薪', () => {
      const result = calculateSalary(defaultInput, mockMinWageData);
      // 210 元 / 10 小时 = 21 元/小时
      expect(result.hourlyRate).toBe(21);
    });

    it('应正确处理零工时', () => {
      const input: CalculatorInput = { ...defaultInput, onlineHours: 0 };
      const result = calculateSalary(input, mockMinWageData);
      expect(result.hourlyRate).toBe(0);
    });
  });

  describe('周期折算', () => {
    it('应正确折算日收入到月收入', () => {
      const result = calculateSalary(
        { ...defaultInput, period: 'day' },
        mockMinWageData
      );
      // 210 元 × 26 天 = 5460 元
      expect(result.monthlyEquivalent).toBe(210 * 26);
    });

    it('应正确折算周收入到月收入', () => {
      const input: CalculatorInput = {
        ...defaultInput,
        period: 'week',
        totalEarnings: 210,
      };
      const result = calculateSalary(input, mockMinWageData);
      // 210 元 × 4.33 周 ≈ 909.3 元
      expect(result.monthlyEquivalent).toBeCloseTo(210 * 4.33, 1);
    });

    it('月收入应直接使用', () => {
      const input: CalculatorInput = {
        ...defaultInput,
        period: 'month',
        totalEarnings: 2100,
      };
      const result = calculateSalary(input, mockMinWageData);
      expect(result.monthlyEquivalent).toBe(2100);
    });
  });

  describe('风险等级判断', () => {
    it('时薪高于最低工资应为绿色', () => {
      // 21 元/小时 < 25 元/小时最低工资
      const result = calculateSalary(defaultInput, mockMinWageData);
      expect(result.riskLevel).toBe('yellow'); // 21 < 25
    });

    it('时薪等于最低工资应为绿色', () => {
      const input: CalculatorInput = {
        ...defaultInput,
        totalEarnings: 250, // 250 元 / 10 小时 = 25 元/小时
      };
      const result = calculateSalary(input, mockMinWageData);
      expect(result.riskLevel).toBe('green');
    });

    it('时薪明显高于最低工资应为绿色', () => {
      const input: CalculatorInput = {
        ...defaultInput,
        totalEarnings: 500, // 500 元 / 10 小时 = 50 元/小时
      };
      const result = calculateSalary(input, mockMinWageData);
      expect(result.riskLevel).toBe('green');
    });

    it('时薪略低于最低工资应为黄色', () => {
      // 21 元/小时 = 25 × 0.84，在 80%-100% 区间
      const result = calculateSalary(defaultInput, mockMinWageData);
      expect(result.riskLevel).toBe('yellow');
    });

    it('时薪明显低于最低工资应为红色', () => {
      const input: CalculatorInput = {
        ...defaultInput,
        totalEarnings: 50, // 50 元 / 10 小时 = 5 元/小时，远低于 25
      };
      const result = calculateSalary(input, mockMinWageData);
      expect(result.riskLevel).toBe('red');
    });

    it('未核验城市应为灰色', () => {
      const input: CalculatorInput = { ...defaultInput, city: '测试城市B' };
      const result = calculateSalary(input, mockMinWageData);
      expect(result.riskLevel).toBe('gray');
    });

    it('未知城市应为灰色', () => {
      const input: CalculatorInput = { ...defaultInput, city: '不存在的城市' };
      const result = calculateSalary(input, mockMinWageData);
      expect(result.riskLevel).toBe('gray');
    });
  });

  describe('补贴和奖励', () => {
    it('应正确计算补贴', () => {
      const input: CalculatorInput = { ...defaultInput, subsidies: 50 };
      const result = calculateSalary(input, mockMinWageData);
      // 210 + 50 = 260 元
      expect(result.grossIncome).toBe(260);
    });

    it('应正确计算奖励', () => {
      const input: CalculatorInput = { ...defaultInput, rewards: 30 };
      const result = calculateSalary(input, mockMinWageData);
      // 210 + 30 = 240 元
      expect(result.grossIncome).toBe(240);
    });

    it('应正确计算补贴和奖励的组合', () => {
      const input: CalculatorInput = {
        ...defaultInput,
        subsidies: 50,
        rewards: 30,
      };
      const result = calculateSalary(input, mockMinWageData);
      // 210 + 50 + 30 = 290 元
      expect(result.grossIncome).toBe(290);
    });
  });

  describe('边界情况', () => {
    it('应正确处理所有字段为零', () => {
      const input: CalculatorInput = {
        city: '测试城市A',
        period: 'day',
        totalEarnings: 0,
        subsidies: 0,
        rewards: 0,
        deductions: 0,
        costs: 0,
        onlineHours: 10,
      };
      const result = calculateSalary(input, mockMinWageData);
      expect(result.grossIncome).toBe(0);
      expect(result.netIncome).toBe(0);
      expect(result.hourlyRate).toBe(0);
      expect(result.riskLevel).toBe('red');
    });

    it('应正确处理负数输入（虽然 UI 已阻止）', () => {
      const input: CalculatorInput = {
        ...defaultInput,
        deductions: -100, // 负数扣款（逻辑上不应出现）
        costs: -50,
      };
      const result = calculateSalary(input, mockMinWageData);
      // Math.max(0, -100) = 0, Math.max(0, -50) = 0
      // 净收入 = 210 - 0 - 0 = 210（后端钳位负数到 0，防止异常输入）
      expect(result.netIncome).toBe(210);
    });

    it('大额扣款导致负净收入仍为红色', () => {
      const input: CalculatorInput = {
        ...defaultInput,
        deductions: 500,
      };
      const result = calculateSalary(input, mockMinWageData);
      // grossIncome = 210, netIncome = 210 - 500 = -290
      expect(result.netIncome).toBe(-290);
      expect(result.hourlyRate).toBe(-29);
      expect(result.riskLevel).toBe('red');
    });
  });
});
