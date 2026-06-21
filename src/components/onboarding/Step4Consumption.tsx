'use client';

/**
 * Step4Consumption — Wizard step for material goods & recycling emissions input.
 */

import { useCarbonStore } from '@/store/carbonStore';
import { DebounceSlider } from '@/components/shared/DebounceSlider';
import type { RecyclingHabit } from '@/types/carbon';

const RECYCLING_OPTIONS: { id: RecyclingHabit; label: string; emoji: string; description: string }[] = [
  { id: 'none', label: 'None', emoji: '❌', description: 'Nothing recycled' },
  { id: 'partial', label: 'Partial', emoji: '📦', description: 'Some items' },
  { id: 'most', label: 'Most', emoji: '♻️', description: 'Most materials' },
  { id: 'all', label: 'All', emoji: '🌿', description: 'Everything eligible' },
];

export function Step4Consumption() {
  const consumption = useCarbonStore((s) => s.consumption);
  const updateConsumption = useCarbonStore((s) => s.updateConsumption);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-1">🛍️ Consumption</h2>
        <p className="text-slate-400 text-sm">
          Material goods carry embedded carbon from manufacturing and shipping. Your spending habits matter.
        </p>
      </div>

      {/* Spending Sliders */}
      <div className="space-y-5">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
          Monthly Spending on New Goods (USD)
        </h3>
        <DebounceSlider
          id="clothing-spend"
          label="Clothing & fashion"
          min={0}
          max={1000}
          step={10}
          value={consumption.monthlyClothingSpend}
          onChange={(v) => updateConsumption({ monthlyClothingSpend: v })}
          formatValue={(v) => `$${Math.round(v)}`}
        />
        <DebounceSlider
          id="electronics-spend"
          label="Electronics & appliances"
          min={0}
          max={1000}
          step={10}
          value={consumption.monthlyElectronicsSpend}
          onChange={(v) => updateConsumption({ monthlyElectronicsSpend: v })}
          formatValue={(v) => `$${Math.round(v)}`}
        />
        <DebounceSlider
          id="other-spend"
          label="Other goods"
          min={0}
          max={2000}
          step={25}
          value={consumption.monthlyOtherGoodsSpend}
          onChange={(v) => updateConsumption({ monthlyOtherGoodsSpend: v })}
          formatValue={(v) => `$${Math.round(v)}`}
        />
      </div>

      {/* Recycling Habits */}
      <fieldset>
        <legend className="text-sm font-medium text-slate-300 mb-3">
          How much do you recycle?
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup">
          {RECYCLING_OPTIONS.map(({ id, label, emoji, description }) => {
            const isSelected = consumption.recyclingHabit === id;
            return (
              <button
                key={id}
                role="radio"
                aria-checked={isSelected}
                onClick={() => updateConsumption({ recyclingHabit: id })}
                className={`
                  flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center
                  ${isSelected
                    ? 'bg-teal-500/10 border-teal-500/40 text-teal-400'
                    : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:border-slate-600'
                  }
                `}
              >
                <span className="text-xl" aria-hidden="true">{emoji}</span>
                <span className="text-xs font-semibold">{label}</span>
                <span className="text-xs opacity-60">{description}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Habit Toggles */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
          Sustainable Habits
        </h3>
        {[
          {
            key: 'buySecondHand' as const,
            label: '👗 Buy second-hand clothing',
            description: 'Saves ~40% of clothing-related emissions',
          },
          {
            key: 'repairFirst' as const,
            label: '🔧 Repair before replacing',
            description: 'Saves ~20% of electronics emissions',
          },
        ].map(({ key, label, description }) => (
          <div
            key={key}
            className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/40"
          >
            <div>
              <p className="text-sm font-medium text-slate-300">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </div>
            <button
              role="switch"
              aria-checked={consumption[key]}
              onClick={() => updateConsumption({ [key]: !consumption[key] })}
              className={`
                relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 shrink-0
                ${consumption[key] ? 'bg-emerald-500' : 'bg-slate-700'}
              `}
              aria-label={label}
            >
              <span
                className={`
                  absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                  ${consumption[key] ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
