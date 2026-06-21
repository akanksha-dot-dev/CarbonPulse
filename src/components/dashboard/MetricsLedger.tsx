'use client';

/**
 * MetricsLedger — Animated real-time KPI cards for the dashboard header.
 */

import { useEmissionResult } from '@/store/carbonStore';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { getAlignmentLabel } from '@/lib/carbonEngine';
import { US_NATIONAL_AVERAGE_KG, PARIS_2030_TARGET_KG } from '@/lib/emissionFactors';
import { TrendingDown, TrendingUp, Target, Activity } from 'lucide-react';

export function MetricsLedger() {
  const result = useEmissionResult();
  const alignment = getAlignmentLabel(result.parisAlignmentRatio);

  const metrics = [
    {
      id: 'annual-total',
      label: 'Annual Footprint',
      value: result.totalAnnual,
      suffix: ' kg',
      decimals: 0,
      icon: Activity,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      description: 'CO₂e per year',
      badge: null,
    },
    {
      id: 'monthly-rate',
      label: 'Monthly Average',
      value: result.totalMonthly,
      suffix: ' kg',
      decimals: 0,
      icon: TrendingUp,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      description: 'CO₂e this month',
      badge: null,
    },
    {
      id: 'paris-gap',
      label: 'Paris Gap',
      value: Math.abs(result.netOffsetBalance),
      suffix: ' kg',
      decimals: 0,
      icon: Target,
      iconColor: result.netOffsetBalance >= 0 ? 'text-green-400' : 'text-orange-400',
      bgColor: result.netOffsetBalance >= 0 ? 'bg-green-500/10' : 'bg-orange-500/10',
      borderColor: result.netOffsetBalance >= 0 ? 'border-green-500/20' : 'border-orange-500/20',
      description: result.netOffsetBalance >= 0 ? 'below 2t target ✅' : 'above 2t target',
      badge: null,
    },
    {
      id: 'vs-national',
      label: 'vs. US Average',
      value: Math.abs((result.nationalAverageRatio - 1) * 100),
      suffix: '%',
      decimals: 0,
      icon: TrendingDown,
      iconColor: result.totalAnnual <= US_NATIONAL_AVERAGE_KG ? 'text-teal-400' : 'text-red-400',
      bgColor: result.totalAnnual <= US_NATIONAL_AVERAGE_KG ? 'bg-teal-500/10' : 'bg-red-500/10',
      borderColor: result.totalAnnual <= US_NATIONAL_AVERAGE_KG ? 'border-teal-500/20' : 'border-red-500/20',
      description: result.totalAnnual <= US_NATIONAL_AVERAGE_KG ? 'below national avg' : 'above national avg',
      badge: null,
    },
  ];

  return (
    <section aria-label="Emissions metrics summary">
      {/* Alignment Banner */}
      <div
        className="mb-6 flex items-center gap-3 px-5 py-3 rounded-xl border"
        style={{
          backgroundColor: `${alignment.color}15`,
          borderColor: `${alignment.color}30`,
        }}
      >
        <span className="text-2xl" aria-hidden="true">{alignment.emoji}</span>
        <div>
          <p className="text-sm font-semibold text-slate-200">
            Climate Status:{' '}
            <span style={{ color: alignment.color }}>{alignment.label}</span>
          </p>
          <p className="text-xs text-slate-400">
            Your footprint is{' '}
            <strong style={{ color: alignment.color }}>
              {result.parisAlignmentRatio.toFixed(1)}×
            </strong>{' '}
            the Paris Agreement 2-tonne target
          </p>
        </div>
        <div className="ml-auto text-right hidden sm:block">
          <p className="text-xs text-slate-500">Target</p>
          <p className="text-sm font-bold text-slate-300">
            {(PARIS_2030_TARGET_KG / 1000).toFixed(0)} t/yr
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map(({ id, label, value, suffix, decimals, icon: Icon, iconColor, bgColor, borderColor, description }) => (
          <div
            key={id}
            className={`${bgColor} ${borderColor} border rounded-xl p-4 space-y-2`}
            role="status"
            aria-label={`${label}: ${Math.round(value)}${suffix} — ${description}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">{label}</span>
              <div className={`${bgColor} rounded-lg p-1.5`}>
                <Icon className={`w-3.5 h-3.5 ${iconColor}`} aria-hidden="true" />
              </div>
            </div>
            <div>
              <AnimatedCounter
                value={value}
                suffix={suffix}
                decimals={decimals}
                className={`text-2xl font-bold tabular-nums ${iconColor}`}
                aria-label={`${label} value`}
              />
            </div>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
