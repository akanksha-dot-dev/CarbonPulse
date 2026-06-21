'use client';

/**
 * Step1Transport — Wizard step for transport emissions input.
 * Includes commute type selector, sliders, and optional Google Maps distance lookup.
 */

import { useCarbonStore } from '@/store/carbonStore';
import { DebounceSlider } from '@/components/shared/DebounceSlider';
import type { TransportMode } from '@/types/carbon';
import { Plane, Zap, Fuel, Bus, Bike, Car } from 'lucide-react';

const TRANSPORT_MODES: {
  id: TransportMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}[] = [
  { id: 'ev', label: 'Electric', icon: Zap, description: 'EV / e-car', color: 'emerald' },
  { id: 'ice', label: 'Petrol/Diesel', icon: Fuel, description: 'Combustion engine', color: 'orange' },
  { id: 'hybrid', label: 'Hybrid', icon: Car, description: 'Petrol + electric', color: 'yellow' },
  { id: 'transit', label: 'Transit', icon: Bus, description: 'Bus / metro / rail', color: 'blue' },
  { id: 'bicycle', label: 'Bicycle', icon: Bike, description: 'Cycle / walk', color: 'teal' },
];

const COLOR_MAP: Record<string, string> = {
  emerald: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400',
  orange: 'bg-orange-500/10 border-orange-500/40 text-orange-400',
  yellow: 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400',
  blue: 'bg-blue-500/10 border-blue-500/40 text-blue-400',
  teal: 'bg-teal-500/10 border-teal-500/40 text-teal-400',
};

export function Step1Transport() {
  const transport = useCarbonStore((s) => s.transport);
  const updateTransport = useCarbonStore((s) => s.updateTransport);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-1">🚗 Transport</h2>
        <p className="text-slate-400 text-sm">
          Transport is typically the largest source of personal emissions. Tell us about your commute.
        </p>
      </div>

      {/* Transport Mode Selector */}
      <fieldset>
        <legend className="text-sm font-medium text-slate-300 mb-3">
          Primary commute method
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup">
          {TRANSPORT_MODES.map(({ id, label, icon: Icon, description, color }) => {
            const isSelected = transport.mode === id;
            const colorClass = isSelected ? COLOR_MAP[color] : 'bg-slate-800/40 border-slate-700/50 text-slate-500';

            return (
              <button
                key={id}
                role="radio"
                aria-checked={isSelected}
                onClick={() => updateTransport({ mode: id })}
                className={`
                  flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer
                  transition-all duration-200 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500
                  ${colorClass}
                `}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold">{label}</p>
                  <p className="text-xs opacity-70">{description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Commute Distance */}
      {transport.mode !== 'bicycle' && (
        <DebounceSlider
          id="daily-distance"
          label="Daily commute distance (one way)"
          min={0}
          max={200}
          step={1}
          value={transport.dailyDistanceKm}
          onChange={(v) => updateTransport({ dailyDistanceKm: v })}
          unit=" km"
        />
      )}

      {/* Days Per Week */}
      <DebounceSlider
        id="commute-days"
        label="Commute days per week"
        min={0}
        max={7}
        step={1}
        value={transport.daysPerWeek}
        onChange={(v) => updateTransport({ daysPerWeek: v })}
        formatValue={(v) => `${v} day${v !== 1 ? 's' : ''}`}
      />

      {/* ICE Fuel Efficiency */}
      {(transport.mode === 'ice' || transport.mode === 'hybrid') && (
        <DebounceSlider
          id="fuel-efficiency"
          label="Vehicle fuel efficiency"
          min={3}
          max={30}
          step={0.5}
          value={transport.fuelEfficiencyL100km ?? 8}
          onChange={(v) => updateTransport({ fuelEfficiencyL100km: v })}
          formatValue={(v) => `${v.toFixed(1)} L/100km`}
        />
      )}

      {/* EV Settings */}
      {transport.mode === 'ev' && (
        <div className="space-y-4 p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/40">
          <DebounceSlider
            id="ev-consumption"
            label="EV energy consumption"
            min={10}
            max={40}
            step={0.5}
            value={transport.evConsumptionKwh100km ?? 18}
            onChange={(v) => updateTransport({ evConsumptionKwh100km: v })}
            formatValue={(v) => `${v.toFixed(1)} kWh/100km`}
          />
          <DebounceSlider
            id="ev-green"
            label="Charged with renewable energy"
            min={0}
            max={100}
            step={5}
            value={(transport.evGreenEnergyRatio ?? 0) * 100}
            onChange={(v) => updateTransport({ evGreenEnergyRatio: v / 100 })}
            formatValue={(v) => `${Math.round(v)}%`}
          />
        </div>
      )}

      {/* Flights */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Plane className="w-4 h-4 text-sky-400" aria-hidden="true" />
          Aviation (per year)
        </div>
        <DebounceSlider
          id="short-haul"
          label="Short-haul flights (< 1,500 km)"
          min={0}
          max={30}
          step={1}
          value={transport.shortHaulFlightsPerYear}
          onChange={(v) => updateTransport({ shortHaulFlightsPerYear: v })}
          formatValue={(v) => `${Math.round(v)} flight${v !== 1 ? 's' : ''}`}
        />
        <DebounceSlider
          id="long-haul"
          label="Long-haul flights (> 1,500 km)"
          min={0}
          max={20}
          step={1}
          value={transport.longHaulFlightsPerYear}
          onChange={(v) => updateTransport({ longHaulFlightsPerYear: v })}
          formatValue={(v) => `${Math.round(v)} flight${v !== 1 ? 's' : ''}`}
        />
      </div>
    </div>
  );
}
