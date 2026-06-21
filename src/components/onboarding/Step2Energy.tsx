'use client';

/**
 * Step2Energy — Wizard step for home energy emissions input.
 */

import { useCarbonStore } from '@/store/carbonStore';
import { DebounceSlider } from '@/components/shared/DebounceSlider';
import { Sun, Users } from 'lucide-react';

export function Step2Energy() {
  const energy = useCarbonStore((s) => s.energy);
  const updateEnergy = useCarbonStore((s) => s.updateEnergy);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-1">⚡ Home Energy</h2>
        <p className="text-slate-400 text-sm">
          Home energy use — heating, electricity, and hot water — accounts for about 25% of personal emissions.
        </p>
      </div>

      {/* Household Size */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
        <Users className="w-5 h-5 text-blue-400 shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <label htmlFor="household-size" className="text-sm font-medium text-slate-300 block mb-2">
            People in your household
          </label>
          <div className="flex gap-2" role="radiogroup" aria-label="Household size">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                role="radio"
                aria-checked={energy.householdSize === n}
                onClick={() => updateEnergy({ householdSize: n })}
                className={`
                  w-9 h-9 rounded-lg text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500
                  ${energy.householdSize === n
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-900/40'
                    : 'bg-slate-700/60 text-slate-400 hover:bg-slate-700'
                  }
                `}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Electricity */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Electricity</h3>
        <DebounceSlider
          id="electricity-kwh"
          label="Monthly electricity usage"
          min={0}
          max={2000}
          step={10}
          value={energy.monthlyElectricityKwh}
          onChange={(v) => updateEnergy({ monthlyElectricityKwh: v })}
          formatValue={(v) => `${Math.round(v)} kWh`}
        />
        <DebounceSlider
          id="green-energy"
          label="Renewable energy mix"
          min={0}
          max={100}
          step={5}
          value={energy.greenEnergyRatio * 100}
          onChange={(v) => updateEnergy({ greenEnergyRatio: v / 100 })}
          formatValue={(v) => `${Math.round(v)}% green`}
        />
      </div>

      {/* Solar */}
      <div className="p-4 rounded-xl bg-yellow-950/20 border border-yellow-900/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-yellow-400" aria-hidden="true" />
            <span className="text-sm font-medium text-slate-300">Solar panels installed?</span>
          </div>
          <button
            role="switch"
            aria-checked={energy.hasSolar}
            onClick={() => updateEnergy({ hasSolar: !energy.hasSolar })}
            className={`
              relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500
              ${energy.hasSolar ? 'bg-yellow-500' : 'bg-slate-700'}
            `}
            aria-label="Solar panels toggle"
          >
            <span
              className={`
                absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                ${energy.hasSolar ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>
        {energy.hasSolar && (
          <DebounceSlider
            id="solar-offset"
            label="Monthly solar generation"
            min={0}
            max={1000}
            step={10}
            value={energy.solarOffsetKwh}
            onChange={(v) => updateEnergy({ solarOffsetKwh: v })}
            formatValue={(v) => `${Math.round(v)} kWh/month`}
          />
        )}
      </div>

      {/* Heating */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Heating</h3>
        <DebounceSlider
          id="natural-gas"
          label="Monthly natural gas usage"
          min={0}
          max={300}
          step={5}
          value={energy.monthlyNaturalGasM3}
          onChange={(v) => updateEnergy({ monthlyNaturalGasM3: v })}
          formatValue={(v) => `${Math.round(v)} m³`}
        />
        <DebounceSlider
          id="heating-oil"
          label="Monthly heating oil"
          min={0}
          max={500}
          step={10}
          value={energy.monthlyHeatingOilL}
          onChange={(v) => updateEnergy({ monthlyHeatingOilL: v })}
          formatValue={(v) => `${Math.round(v)} litres`}
        />
      </div>
    </div>
  );
}
