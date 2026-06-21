'use client';

/**
 * RecommendationCard — Single action card with impact badges and completion toggle.
 */

import type { RecommendationItem, CostLevel, TimeCommitment } from '@/types/carbon';
import { Check } from 'lucide-react';

const COST_BADGE: Record<CostLevel, { label: string; color: string }> = {
  free: { label: 'Free', color: 'bg-green-500/15 text-green-400 border-green-500/30' },
  low: { label: 'Low cost', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  medium: { label: 'Medium', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  high: { label: 'High invest', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
};

const TIME_BADGE: Record<TimeCommitment, { label: string; color: string }> = {
  immediate: { label: 'Do now', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  habitual: { label: 'Habit', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  long_term: { label: 'Long-term', color: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
};

const CATEGORY_COLOR: Record<string, string> = {
  transport: 'border-l-blue-500',
  energy: 'border-l-yellow-500',
  diet: 'border-l-green-500',
  consumption: 'border-l-purple-500',
};

interface RecommendationCardProps {
  item: RecommendationItem;
  isInSandbox?: boolean;
  onSandboxToggle?: (id: string) => void;
}

export function RecommendationCard({ item, isInSandbox, onSandboxToggle }: RecommendationCardProps) {
  const cost = COST_BADGE[item.costLevel];
  const time = TIME_BADGE[item.timeCommitment];

  return (
    <article
      className={`
        bg-slate-900/60 border border-slate-800/50 border-l-4 ${CATEGORY_COLOR[item.category]}
        rounded-xl p-4 space-y-3 hover:bg-slate-900/80 transition-all duration-200
        ${isInSandbox ? 'ring-1 ring-emerald-500/40' : ''}
      `}
      aria-label={`${item.title}: saves ${item.weeklyImpactKg} kg CO₂ per week`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">{item.emoji}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-200 leading-tight">{item.title}</h4>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
        </div>
      </div>

      {/* Impact */}
      <div className="flex items-center justify-between">
        <div className="text-center">
          <p className="text-lg font-bold text-emerald-400 tabular-nums">
            {item.weeklyImpactKg.toFixed(1)}
          </p>
          <p className="text-xs text-slate-500">kg/week</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-emerald-300 tabular-nums">
            {Math.round(item.annualImpactKg).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">kg/year</p>
        </div>
        <div className="flex flex-col gap-1">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${cost.color}`}>
            {cost.label}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${time.color}`}>
            {time.label}
          </span>
        </div>
      </div>

      {/* Action */}
      <div className="flex gap-2">
        <a
          href="#"
          className="flex-1 text-center text-xs font-medium py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
          onClick={(e) => e.preventDefault()}
        >
          {item.actionLabel}
        </a>
        {onSandboxToggle && (
          <button
            onClick={() => onSandboxToggle(item.id)}
            aria-pressed={isInSandbox}
            aria-label={isInSandbox ? `Remove "${item.title}" from What-If sandbox` : `Add "${item.title}" to What-If sandbox`}
            className={`
              w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-all
              focus:outline-none focus:ring-2 focus:ring-emerald-500
              ${isInSandbox
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'bg-transparent border-slate-700 text-slate-600 hover:border-emerald-500/50'
              }
            `}
          >
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  );
}
