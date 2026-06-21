'use client';

/**
 * WhatIfSandbox — Simulated forecasting with live Recharts area chart.
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useUIStore } from '@/store/uiStore';
import { useTotalEmissions } from '@/store/carbonStore';
import { RECOMMENDATIONS } from '@/lib/recommendations';
import { generateWhatIfForecast } from '@/lib/carbonEngine';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { Sparkles, X } from 'lucide-react';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">Week {label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.dataKey === 'baselineKgCO2e' ? 'Baseline' : 'Optimized'}:{' '}
          {Math.round(p.value)} kg/wk
        </p>
      ))}
    </div>
  );
}

export function WhatIfSandbox() {
  const totalAnnual = useTotalEmissions();
  const activeSandboxRecIds = useUIStore((s) => s.activeSandboxRecIds);
  const toggleSandboxRec = useUIStore((s) => s.toggleSandboxRec);
  const clearSandboxRecs = useUIStore((s) => s.clearSandboxRecs);

  const activeRecs = RECOMMENDATIONS.filter((r) => activeSandboxRecIds.includes(r.id));
  const scenario = generateWhatIfForecast(totalAnnual, activeRecs);

  // Sample every 4th week for chart performance
  const chartData = scenario.forecastPoints.filter((_, i) => i % 4 === 0);

  return (
    <section
      className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 backdrop-blur-sm space-y-5"
      aria-label="What-If forecasting sandbox"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            What-If Sandbox
          </h3>
        </div>
        {activeSandboxRecIds.length > 0 && (
          <button
            onClick={clearSandboxRecs}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
            aria-label="Clear all sandbox selections"
          >
            <X className="w-3 h-3" aria-hidden="true" />
            Clear all
          </button>
        )}
      </div>

      {/* Impact Summary */}
      {activeSandboxRecIds.length > 0 && (
        <div
          className="grid grid-cols-3 gap-3"
          aria-live="polite"
          aria-label="Projected savings summary"
        >
          <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <AnimatedCounter
              value={scenario.totalAnnualSavingsKg}
              suffix=" kg"
              decimals={0}
              className="text-xl font-bold text-emerald-400 tabular-nums"
              aria-label="Annual savings"
            />
            <p className="text-xs text-slate-500 mt-0.5">Saved/year</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <AnimatedCounter
              value={scenario.percentageReduction}
              suffix="%"
              decimals={1}
              className="text-xl font-bold text-blue-400 tabular-nums"
              aria-label="Percentage reduction"
            />
            <p className="text-xs text-slate-500 mt-0.5">Reduction</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <AnimatedCounter
              value={scenario.projectedAnnual}
              suffix=" kg"
              decimals={0}
              className="text-xl font-bold text-purple-400 tabular-nums"
              aria-label="Projected annual emissions"
            />
            <p className="text-xs text-slate-500 mt-0.5">Projected/yr</p>
          </div>
        </div>
      )}

      {/* Forecast Chart */}
      {activeSandboxRecIds.length > 0 ? (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `W${v}`} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="baselineKgCO2e" stroke="#ef4444" fill="url(#baseGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="optimizedKgCO2e" stroke="#34d399" fill="url(#optGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-36 flex flex-col items-center justify-center text-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
          <Sparkles className="w-6 h-6 mb-2 text-slate-700" aria-hidden="true" />
          <p className="text-sm">Select recommendations above</p>
          <p className="text-xs mt-1">to simulate your future emissions</p>
        </div>
      )}

      {/* Active Recommendation Chips */}
      {activeSandboxRecIds.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2">Active in simulation:</p>
          <div className="flex flex-wrap gap-1.5">
            {activeRecs.map((rec) => (
              <button
                key={rec.id}
                onClick={() => toggleSandboxRec(rec.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-400 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label={`Remove ${rec.title} from simulation`}
              >
                {rec.emoji} {rec.title}
                <X className="w-3 h-3 ml-1" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
