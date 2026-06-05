import Link from 'next/link';
import type { ProblemEntry } from '@/data/types';

export default function ProblemCard({ problem }: { problem: ProblemEntry }) {
  return (
    <Link
      href={problem.href}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-base font-bold text-amber-700">
          {problem.icon}
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-gray-900">
            {problem.title}
          </h3>
          <p className="mt-0.5 text-sm leading-5 text-gray-500">
            {problem.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
