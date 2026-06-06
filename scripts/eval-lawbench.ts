/**
 * LawBench 劳动法评测脚本
 *
 * 从 data/lawbench-labor.json 加载 88 道劳动法相关题目，
 * 调用 AI 聊天 API 逐题评测，输出准确率报告。
 *
 * 用法：
 *   npx tsx scripts/eval-lawbench.ts --api-url http://localhost:3000/api/chat
 *   npx tsx scripts/eval-lawbench.ts --api-url https://delivery-helper.vercel.app/api/chat
 *
 * 环境变量：
 *   EVAL_CONCURRENCY=3  （并发数，默认 3）
 *   EVAL_LIMIT=10       （限制评测题目数，用于快速测试）
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

interface LawBenchItem {
  task: string;
  task_id: string;
  question: string;
  answer: string;
}

interface EvalResult {
  index: number;
  question: string;
  expected: string;
  actual: string;
  success: boolean;
  error?: string;
}

const API_URL = process.argv
  .find((_, i, arr) => arr[i - 1] === '--api-url') || 'http://localhost:3000/api/chat';

const CONCURRENCY = parseInt(process.env.EVAL_CONCURRENCY || '3', 10);
const LIMIT = process.env.EVAL_LIMIT ? parseInt(process.env.EVAL_LIMIT, 10) : Infinity;

const DATA_PATH = resolve(__dirname, '..', 'data', 'lawbench-labor.json');

async function callChat(question: string): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: question }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`API error ${response.status}: ${(err as { error?: string }).error || 'Unknown'}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let text = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
  }
  return text;
}

/** 简单判断：回答是否包含期望答案中的关键信息 */
function evaluateAnswer(expected: string, actual: string): boolean {
  // 提取期望答案中的关键短语（去掉"答案:"前缀，取核心内容）
  const cleanExpected = expected.replace(/^答案[:：]\s*/, '').trim();

  // 取前 50 个字符作为关键片段
  const keyPhrases = cleanExpected.slice(0, 80);

  // 检查回答是否包含关键片段中的核心词汇
  const words = keyPhrases.split(/[，。、；：]/).filter((w) => w.length >= 4);
  if (words.length === 0) return actual.includes(cleanExpected.slice(0, 20));

  const matchCount = words.filter((w) => actual.includes(w)).length;
  return matchCount / words.length >= 0.5;
}

async function runEval() {
  console.log(`\n📋 LawBench 劳动法评测`);
  console.log(`API: ${API_URL}`);
  console.log(`数据: ${DATA_PATH}\n`);

  const data: LawBenchItem[] = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
  const items = data.slice(0, LIMIT);
  console.log(`共 ${data.length} 题，本次评测 ${items.length} 题\n`);

  const results: EvalResult[] = [];
  let completed = 0;

  // 按任务类型分组统计
  const taskStats = new Map<string, { total: number; passed: number }>();

  async function processItem(item: LawBenchItem, index: number): Promise<EvalResult> {
    try {
      const actual = await callChat(item.question);
      const success = evaluateAnswer(item.answer, actual);
      completed++;
      process.stdout.write(success ? '✓' : '✗');
      if (completed % 10 === 0) process.stdout.write(` ${completed}/${items.length}\n`);

      return { index, question: item.question, expected: item.answer, actual, success };
    } catch (err) {
      completed++;
      process.stdout.write('E');
      return {
        index,
        question: item.question,
        expected: item.answer,
        actual: '',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  // 并发控制
  const chunks: LawBenchItem[][] = [];
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    chunks.push(items.slice(i, i + CONCURRENCY));
  }

  for (const chunk of chunks) {
    const promises = chunk.map((item, i) => {
      const globalIndex = chunks.indexOf(chunk) * CONCURRENCY + i;
      return processItem(item, globalIndex);
    });
    const chunkResults = await Promise.all(promises);
    results.push(...chunkResults);
  }

  if (completed % 10 !== 0) process.stdout.write(` ${completed}/${items.length}\n`);

  // 统计
  for (const result of results) {
    const item = items[result.index];
    const taskKey = `${item.task_id} ${item.task}`;
    if (!taskStats.has(taskKey)) taskStats.set(taskKey, { total: 0, passed: 0 });
    const stat = taskStats.get(taskKey)!;
    stat.total++;
    if (result.success) stat.passed++;
  }

  // 输出报告
  const totalPassed = results.filter((r) => r.success).length;
  const totalErrors = results.filter((r) => r.error).length;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`评测报告`);
  console.log(`${'='.repeat(60)}`);
  console.log(`总题数: ${results.length}`);
  console.log(`通过: ${totalPassed} (${((totalPassed / results.length) * 100).toFixed(1)}%)`);
  console.log(`失败: ${results.length - totalPassed - totalErrors}`);
  console.log(`错误: ${totalErrors}`);

  console.log(`\n按任务类型:`);
  for (const [task, stat] of taskStats) {
    const pct = ((stat.passed / stat.total) * 100).toFixed(1);
    console.log(`  ${task}: ${stat.passed}/${stat.total} (${pct}%)`);
  }

  // 输出失败样例
  const failures = results.filter((r) => !r.success && !r.error);
  if (failures.length > 0) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`失败样例 (前 5 个):`);
    for (const f of failures.slice(0, 5)) {
      console.log(`\n  Q: ${f.question.slice(0, 80)}...`);
      console.log(`  期望: ${f.expected.slice(0, 80)}...`);
      console.log(`  实际: ${f.actual.slice(0, 120)}...`);
    }
  }

  console.log(`\n${'='.repeat(60)}\n`);
}

runEval().catch((err) => {
  console.error('评测脚本执行失败:', err);
  process.exit(1);
});
