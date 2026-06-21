'use client';

/**
 * CategoryBreakdownChart — Recharts RadialBarChart + legend for category breakdown.
 */

import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useCategoryBreakdown } from '@/store/carbonStore';

const CATEGORY_CONFIG = [
  { key: 'transport', label: 'Transport', color: '#3b82f6', emoji: '🚗' },
  { key: 'energy', label: 'Energy', color: '#f59e0b', emoji: '⚡' },
  { key: 'diet', label: 'Diet', color: '#22c55e', emoji: '🥗' },
  { key: 'consumption', label: 'Consumption', color: '#a855f7', emoji: '🛍️' },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; payload: { fill: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-300 font-medium">{item.name}</p>
      <p className="text-emerald-400 font-bold">{Math.round(item.value).toLocaleString()} kg CO₂e/yr</p>
    </div>
  );
}

export function CategoryBreakdownChart() {
  const breakdown = useCategoryBreakdown();
  const total = Object.values(breakdown).reduce((s, v) => s + v, 0);

  const data = CATEGORY_CONFIG.map(({ key, label, color, emoji }) => ({
    name: `${emoji} ${label}`,
    value: breakdown[key as keyof typeof breakdown],
    fill: color,
    percent: total > 0 ? ((breakdown[key as keyof typeof breakdown] / total) * 100).toFixed(1) : '0',
  }));

  return (
    <section
      className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 backdrop-blur-sm"
      aria-label="Carbon footprint breakdown by category"
    >
      <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">
        Emissions by Category
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="30%"
            outerRadius="90%"
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              dataKey="value"
              cornerRadius={4}
              background={{ fill: '#1e293b' }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with percentages */}
      <div className="mt-4 space-y-2">
        {data.map(({ name, value, fill, percent }) => (
          <div key={name} className="flex items-center gap-3">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: fill }}
              aria-hidden="true"
            />
            <span className="text-xs text-slate-400 flex-1">{name}</span>
            <span className="text-xs font-semibold tabular-nums" style={{ color: fill }}>
              {Math.round(value).toLocaleString()} kg
            </span>
            <span className="text-xs text-slate-600 w-10 text-right">{percent}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}
