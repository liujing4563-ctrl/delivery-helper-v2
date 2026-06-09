import Link from 'next/link';
import type { ProblemEntry } from '@/data/types';

// 每个问题对应的颜色
const problemColors: Record<string, { bg: string; fg: string }> = {
  deduction: { bg: 'bg-[#FEE2E2]', fg: 'text-[#DC2626]' },
  pay: { bg: 'bg-[#FEEBC8]', fg: 'text-[#D97706]' },
  injury: { bg: 'bg-[#F3E8FF]', fg: 'text-[#9333EA]' },
  blocked: { bg: 'bg-[#E0F2FE]', fg: 'text-[#0284C7]' },
  contract: { bg: 'bg-[#D1FAE5]', fg: 'text-[#059669]' },
  aid: { bg: 'bg-[#FCE7F3]', fg: 'text-[#DB2777]' },
  reg: { bg: 'bg-[#E0E7FF]', fg: 'text-[#4338CA]' },
};

export default function ProblemCard({ problem }: { problem: ProblemEntry }) {
  const colorKey = problem.colorKey || 'pay';
  const colors = problemColors[colorKey];

  return (
    <Link
      href={problem.href}
      className="block rounded-xl border border-[#EDE9E3] bg-white p-4 transition-all hover:border-[#D1CDC7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2563EB] active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base font-bold ${colors.bg} ${colors.fg}`}
        >
          {problem.icon}
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-[#1A1A1A]">
            {problem.title}
          </h3>
          <p className="mt-0.5 text-sm leading-5 text-[#6B6560]">
            {problem.description}
          </p>
        </div>
        <svg
          className="ml-auto h-4 w-4 shrink-0 text-[#D1CDC7]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}