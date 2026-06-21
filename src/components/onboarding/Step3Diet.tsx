'use client';

/**
 * Step3Diet — Wizard step for diet and lifestyle emissions input.
 */

import { useCarbonStore } from '@/store/carbonStore';
import { DebounceSlider } from '@/components/shared/DebounceSlider';
import type { DietProfile, WasteFrequency } from '@/types/carbon';
import { DIET_FACTORS } from '@/lib/emissionFactors';

const DIET_OPTIONS: { id: DietProfile; label: string; emoji: string; description: string; color: string }[] = [
  { id: 'vegan', label: 'Vegan', emoji: '🌱', description: `${DIET_FACTORS.vegan} kg CO₂/day`, color: 'green' },
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥕', description: `${DIET_FACTORS.vegetarian} kg CO₂/day`, color: 'lime' },
  { id: 'pescatarian', label: 'Pescatarian', emoji: '🐟', description: `${DIET_FACTORS.pescatarian} kg CO₂/day`, color: 'cyan' },
  { id: 'omnivore', label: 'Omnivore', emoji: '🍽️', description: `${DIET_FACTORS.omnivore} kg CO₂/day`, color: 'orange' },
  { id: 'high_meat', label: 'High Meat', emoji: '🥩', description: `${DIET_FACTORS.high_meat} kg CO₂/day`, color: 'red' },
];

const WASTE_OPTIONS: { id: WasteFrequency; label: string; emoji: string }[] = [
  { id: 'very_low', label: 'Minimal', emoji: '✨' },
  { id: 'low', label: 'Low', emoji: '👍' },
  { id: 'average', label: 'Average', emoji: '🤷' },
  { id: 'high', label: 'High', emoji: '⚠️' },
  { id: 'very_high', label: 'Very High', emoji: '🗑️' },
];

const DIET_COLOR: Record<string, string> = {
  green: 'bg-green-500/10 border-green-500/40 text-green-400',
  lime: 'bg-lime-500/10 border-lime-500/40 text-lime-400',
  cyan: 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400',
  orange: 'bg-orange-500/10 border-orange-500/40 text-orange-400',
  red: 'bg-red-500/10 border-red-500/40 text-red-400',
};

export function Step3Diet() {
  const diet = useCarbonStore((s) => s.diet);
  const updateDiet = useCarbonStore((s) => s.updateDiet);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-1">🥗 Diet & Lifestyle</h2>
        <p className="text-slate-400 text-sm">
          Food production accounts for ~26% of global emissions. Your diet choices matter enormously.
        </p>
      </div>

      {/* Diet Profile */}
      <fieldset>
        <legend className="text-sm font-medium text-slate-300 mb-3">Your diet profile</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup">
          {DIET_OPTIONS.map(({ id, label, emoji, description, color }) => {
            const isSelected = diet.profile === id;
            return (
              <button
                key={id}
                role="radio"
                aria-checked={isSelected}
                onClick={() => updateDiet({ profile: id })}
                className={`
                  flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center
                  ${isSelected ? DIET_COLOR[color] : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:border-slate-600'}
                `}
              >
                <span className="text-2xl" aria-hidden="true">{emoji}</span>
                <span className="text-xs font-semibold">{label}</span>
                <span className="text-xs opacity-60">{description}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Food Waste Frequency */}
      <fieldset>
        <legend className="text-sm font-medium text-slate-300 mb-3">
          How much food do you waste?
        </legend>
        <div className="flex gap-2 flex-wrap" role="radiogroup">
          {WASTE_OPTIONS.map(({ id, label, emoji }) => {
            const isSelected = diet.wasteFrequency === id;
            return (
              <button
                key={id}
                role="radio"
                aria-checked={isSelected}
                onClick={() => updateDiet({ wasteFrequency: id })}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                  focus:outline-none focus:ring-2 focus:ring-emerald-500
                  ${isSelected
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                    : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:border-slate-600'
                  }
                `}
              >
                <span aria-hidden="true">{emoji}</span>
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Local Food Ratio */}
      <DebounceSlider
        id="local-food"
        label="Locally sourced food"
        min={0}
        max={100}
        step={5}
        value={diet.localFoodRatio * 100}
        onChange={(v) => updateDiet({ localFoodRatio: v / 100 })}
        formatValue={(v) => `${Math.round(v)}% local`}
      />

      {/* Composting Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
        <div>
          <p className="text-sm font-medium text-slate-300">♻️ Composting food waste</p>
          <p className="text-xs text-slate-500 mt-0.5">Saves ~95 kg CO₂e per year</p>
        </div>
        <button
          role="switch"
          aria-checked={diet.composting}
          onClick={() => updateDiet({ composting: !diet.composting })}
          className={`
            relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500
            ${diet.composting ? 'bg-emerald-500' : 'bg-slate-700'}
          `}
          aria-label="Composting toggle"
        >
          <span
            className={`
              absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
              ${diet.composting ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>
    </div>
  );
}
