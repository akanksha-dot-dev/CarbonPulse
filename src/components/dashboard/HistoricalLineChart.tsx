'use client';

/**
 * HistoricalLineChart — Recharts LineChart tracking emissions over time.
 * Generates synthetic history from current data if no real log exists.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useHistoricalLog, useTotalEmissions } from '@/store/carbonStore';
import { useUIStore } from '@/store/uiStore';
import { PARIS_2030_TARGET_KG, US_NATIONAL_AVERAGE_KG } from '@/lib/emissionFactors';
import { format, subDays, parseISO } from 'date-fns';

type TimeRange = 'week' | 'month' | '3months' | 'year' | 'all';

const TIME_OPTIONS: { id: TimeRange; label: string }[] = [
  { id: 'week', label: '7D' },
  { id: 'month', label: '30D' },
  { id: '3months', label: '90D' },
  { id: 'year', label: '1Y' },
];

function generateSyntheticHistory(baseAnnual: number, days: number) {
  const points = [];
  const today = new Date();
  for (let i = days; i >= 0; i--) {
    const date = subDays(today, i);
    const noise = (Math.random() - 0.5) * 0.08 * baseAnnual;
    points.push({
      date: date.toISOString().split('T')[0],
      totalKgCO2e: Math.max(0, baseAnnual + noise),
    });
  }
  return points;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-emerald-400 font-bold">
        {Math.round(payload[0].value).toLocaleString()} kg CO₂e/yr
      </p>
    </div>
  );
}

export function HistoricalLineChart() {
  const historicalLog = useHistoricalLog();
  const totalAnnual = useTotalEmissions();
  const selectedTimeRange = useUIStore((s) => s.selectedTimeRange);
  const setTimeRange = useUIStore((s) => s.setTimeRange);

  const daysMap: Record<TimeRange, number> = {
    week: 7,
    month: 30,
    '3months': 90,
    year: 365,
    all: 730,
  };

  const days = daysMap[selectedTimeRange];

  // Use real log or synthetic data
  const cutoff = subDays(new Date(), days).toISOString().split('T')[0];
  const realData = historicalLog.filter((p) => p.date >= cutoff);
  const chartData = realData.length > 2
    ? realData.map((p) => ({ date: format(parseISO(p.date), 'MMM d'), totalKgCO2e: p.totalKgCO2e }))
    : generateSyntheticHistory(totalAnnual, Math.min(days, 30)).map((p) => ({
        date: format(parseISO(p.date), 'MMM d'),
        totalKgCO2e: p.totalKgCO2e,
      }));

  const parisDaily = PARIS_2030_TARGET_KG;
  const nationalDaily = US_NATIONAL_AVERAGE_KG;

  return (
    <section
      className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 backdrop-blur-sm"
      aria-label="Historical emissions trend chart"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
          Emission Trend
        </h3>
        <div className="flex gap-1" role="group" aria-label="Time range selector">
          {TIME_OPTIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTimeRange(id)}
              aria-pressed={selectedTimeRange === id}
              className={`
                px-2.5 py-1 rounded-md text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500
                ${selectedTimeRange === id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-500 hover:text-slate-300'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="date"
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
            <ReferenceLine
              y={parisDaily}
              stroke="#22c55e"
              strokeDasharray="4 4"
              label={{ value: 'Paris 2t', position: 'insideTopRight', fill: '#22c55e', fontSize: 9 }}
            />
            <ReferenceLine
              y={nationalDaily}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{ value: 'US Avg', position: 'insideTopRight', fill: '#ef4444', fontSize: 9 }}
            />
            <Line
              type="monotone"
              dataKey="totalKgCO2e"
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#34d399' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-4 mt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-green-500 rounded inline-block" aria-hidden="true" />
          Paris 2°C target
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-red-500 rounded inline-block" aria-hidden="true" />
          US average
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-emerald-400 rounded inline-block" aria-hidden="true" />
          Your trend
        </span>
      </div>
    </section>
  );
}
