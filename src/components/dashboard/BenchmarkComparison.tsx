'use client';

/**
 * BenchmarkComparison — Bar chart comparing user footprint against global benchmarks.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTotalEmissions } from '@/store/carbonStore';
import {
  US_NATIONAL_AVERAGE_KG,
  GLOBAL_AVERAGE_KG,
  PARIS_2030_TARGET_KG,
  PARIS_15_TARGET_KG,
} from '@/lib/emissionFactors';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; payload: { color: string; label: string } }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const { value, payload: { label, color } } = payload[0];
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-0.5">{label}</p>
      <p className="font-bold" style={{ color }}>
        {(value / 1000).toFixed(1)} tonnes CO₂e/yr
      </p>
    </div>
  );
}

export function BenchmarkComparison() {
  const userAnnual = useTotalEmissions();

  const data = [
    { label: 'You', value: userAnnual, color: '#34d399' },
    { label: 'US Average', value: US_NATIONAL_AVERAGE_KG, color: '#f97316' },
    { label: 'Global Average', value: GLOBAL_AVERAGE_KG, color: '#a78bfa' },
    { label: 'Paris 2°C', value: PARIS_2030_TARGET_KG, color: '#22c55e' },
    { label: 'Paris 1.5°C', value: PARIS_15_TARGET_KG, color: '#10b981' },
  ];

  return (
    <section
      className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 backdrop-blur-sm"
      aria-label="Benchmark comparison chart"
    >
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
        How You Compare
      </h3>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${Math.round(v / 1000)}t`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50}>
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stat Summary */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="text-center p-2 rounded-lg bg-slate-800/40">
          <p className="text-xs text-slate-500">vs. US Average</p>
          <p className={`text-sm font-bold ${userAnnual <= US_NATIONAL_AVERAGE_KG ? 'text-green-400' : 'text-red-400'}`}>
            {userAnnual <= US_NATIONAL_AVERAGE_KG ? '−' : '+'}
            {Math.abs(((userAnnual - US_NATIONAL_AVERAGE_KG) / US_NATIONAL_AVERAGE_KG) * 100).toFixed(0)}%
          </p>
        </div>
        <div className="text-center p-2 rounded-lg bg-slate-800/40">
          <p className="text-xs text-slate-500">vs. Paris 2°C</p>
          <p className={`text-sm font-bold ${userAnnual <= PARIS_2030_TARGET_KG ? 'text-green-400' : 'text-orange-400'}`}>
            {userAnnual <= PARIS_2030_TARGET_KG ? '−' : '+'}
            {Math.abs(((userAnnual - PARIS_2030_TARGET_KG) / PARIS_2030_TARGET_KG) * 100).toFixed(0)}%
          </p>
        </div>
      </div>
    </section>
  );
}
