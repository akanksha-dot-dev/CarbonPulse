'use client';

/**
 * FilterPanel — Recommendation filter controls for category, cost, time, and impact.
 */

import { useUIStore } from '@/store/uiStore';
import type { EmissionCategory, CostLevel, TimeCommitment } from '@/types/carbon';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

const CATEGORY_OPTS: { id: EmissionCategory; label: string; emoji: string }[] = [
  { id: 'transport', label: 'Transport', emoji: '🚗' },
  { id: 'energy', label: 'Energy', emoji: '⚡' },
  { id: 'diet', label: 'Diet', emoji: '🥗' },
  { id: 'consumption', label: 'Consumption', emoji: '🛍️' },
];

const COST_OPTS: { id: CostLevel; label: string }[] = [
  { id: 'free', label: 'Free' },
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
];

const TIME_OPTS: { id: TimeCommitment; label: string }[] = [
  { id: 'immediate', label: 'Now' },
  { id: 'habitual', label: 'Habit' },
  { id: 'long_term', label: 'Long-term' },
];

function FilterChip({
  label,
  selected,
  onClick,
  emoji,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  emoji?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
        focus:outline-none focus:ring-2 focus:ring-emerald-500
        ${selected
          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
          : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300 hover:border-slate-600'
        }
      `}
    >
      {emoji && <span aria-hidden="true">{emoji}</span>}
      {label}
    </button>
  );
}

export function FilterPanel() {
  const recFilters = useUIStore((s) => s.recFilters);
  const toggleRecCategory = useUIStore((s) => s.toggleRecCategory);
  const toggleCostLevel = useUIStore((s) => s.toggleCostLevel);
  const toggleTimeCommitment = useUIStore((s) => s.toggleTimeCommitment);
  const setRecFilter = useUIStore((s) => s.setRecFilter);
  const resetFilters = useUIStore((s) => s.resetFilters);

  return (
    <aside
      className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 backdrop-blur-sm space-y-4"
      aria-label="Recommendation filters"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <SlidersHorizontal className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          Filters
        </div>
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
          aria-label="Reset all filters"
        >
          <RotateCcw className="w-3 h-3" aria-hidden="true" />
          Reset
        </button>
      </div>

      {/* Category */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Category</p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Category filters">
          {CATEGORY_OPTS.map(({ id, label, emoji }) => (
            <FilterChip
              key={id}
              label={label}
              emoji={emoji}
              selected={recFilters.categories.includes(id)}
              onClick={() => toggleRecCategory(id)}
            />
          ))}
        </div>
      </div>

      {/* Cost */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Cost</p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Cost level filters">
          {COST_OPTS.map(({ id, label }) => (
            <FilterChip
              key={id}
              label={label}
              selected={recFilters.costLevels.includes(id)}
              onClick={() => toggleCostLevel(id)}
            />
          ))}
        </div>
      </div>

      {/* Time Commitment */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Time</p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Time commitment filters">
          {TIME_OPTS.map(({ id, label }) => (
            <FilterChip
              key={id}
              label={label}
              selected={recFilters.timeCommitments.includes(id)}
              onClick={() => toggleTimeCommitment(id)}
            />
          ))}
        </div>
      </div>

      {/* Min Impact Slider */}
      <div>
        <label htmlFor="min-impact" className="text-xs text-slate-500 uppercase tracking-wide block mb-2">
          Min. Weekly Impact: {recFilters.minWeeklyImpactKg.toFixed(0)} kg/wk
        </label>
        <input
          id="min-impact"
          type="range"
          min={0}
          max={50}
          step={1}
          value={recFilters.minWeeklyImpactKg}
          onChange={(e) => setRecFilter('minWeeklyImpactKg', parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none bg-slate-700 accent-emerald-500 cursor-pointer"
          aria-label={`Minimum weekly impact: ${recFilters.minWeeklyImpactKg} kg per week`}
        />
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>0 kg</span>
          <span>50 kg</span>
        </div>
      </div>
    </aside>
  );
}
