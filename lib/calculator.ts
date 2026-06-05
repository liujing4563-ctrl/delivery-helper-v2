import type { CalculatorInput, CalculatorResult, MinWage } from '@/data/types';

/**
 * 薪资计算器核心逻辑。仅做参考测算，不输出法律结论。
 */
export function calculateSalary(
  input: CalculatorInput,
  minWageData: MinWage[]
): CalculatorResult {
  // 1. 毛收入 = 订单数 × 平均每单收入 + 补贴 + 奖励
  const grossIncome =
    input.orders * input.avgIncomePerOrder + input.subsidies + input.rewards;

  // 2. 净收入 = 毛收入 − 扣款 − 成本
  const netIncome = grossIncome - input.deductions - input.costs;

  // 3. 时薪 = 净收入 / 在线小时数
  const hourlyRate = input.onlineHours > 0 ? netIncome / input.onlineHours : 0;

  // 4. 折算月收入（粗略估算，仅供参考）
  let monthlyEquivalent = 0;
  switch (input.period) {
    case 'day':
      monthlyEquivalent = netIncome * 26;
      break;
    case 'week':
      monthlyEquivalent = netIncome * 4.33;
      break;
    case 'month':
      monthlyEquivalent = netIncome;
      break;
  }

  // 5. 获取当地小时最低工资
  const cityMinWage = minWageData.find((w) => w.city === input.city);
  const isVerifiedMinWage = Boolean(
    cityMinWage && cityMinWage.lastVerified !== '待核实'
  );
  const minWageReference = isVerifiedMinWage ? cityMinWage?.hourly ?? 0 : 0;

  // 6. 风险等级判断
  let riskLevel: CalculatorResult['riskLevel'] = 'gray';
  let riskMessage = '';

  if (minWageReference === 0) {
    riskLevel = 'gray';
    riskMessage =
      '未找到该城市已核验的小时最低工资参考数据，暂不做风险判断。建议先以当地人社部门最新公布信息为准。';
  } else if (hourlyRate >= minWageReference) {
    riskLevel = 'green';
    riskMessage = `你的测算时薪 ${hourlyRate.toFixed(2)} 元/小时，不低于当前城市小时最低工资参考线 ${minWageReference} 元/小时。`;
  } else if (hourlyRate >= minWageReference * 0.8) {
    riskLevel = 'yellow';
    riskMessage = `你的测算时薪 ${hourlyRate.toFixed(2)} 元/小时，略低于当前城市小时最低工资参考线 ${minWageReference} 元/小时。`;
  } else {
    riskLevel = 'red';
    riskMessage = `你的测算时薪 ${hourlyRate.toFixed(2)} 元/小时，明显低于当前城市小时最低工资参考线 ${minWageReference} 元/小时。`;
  }

  // 7. 法律边界提示（红线措辞）
  if (riskLevel === 'red' || riskLevel === 'yellow') {
    riskMessage +=
      '\n\n注意：外卖骑手是否适用最低工资，仍取决于劳动关系或新就业形态用工关系的具体认定。';
    riskMessage +=
      '\n\n建议你保存订单记录、收入流水、扣款通知、平台协议和沟通记录，并咨询 12348 或当地法律援助中心。';
  }

  return {
    grossIncome,
    netIncome,
    hourlyRate,
    monthlyEquivalent,
    minWageReference,
    riskLevel,
    riskMessage,
  };
}
