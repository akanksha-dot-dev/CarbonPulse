'use client';

/**
 * Dashboard page — Main analytics view with all charts and metrics.
 */

import { useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { useEmissionResult } from '@/store/carbonStore';
import { useUIStore } from '@/store/uiStore';
import { MetricsLedger } from '@/components/dashboard/MetricsLedger';
import { CategoryBreakdownChart } from '@/components/dashboard/CategoryBreakdownChart';
import { HistoricalLineChart } from '@/components/dashboard/HistoricalLineChart';
import { BenchmarkComparison } from '@/components/dashboard/BenchmarkComparison';
import { AchievementsGrid } from '@/components/gamification/AchievementBadge';
import { getQuickWins } from '@/lib/recommendations';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import Link from 'next/link';
import { ArrowRight, RefreshCcw } from 'lucide-react';

export default function DashboardPage() {
  const result = useEmissionResult();
  const checkAndUnlockAchievements = useUserStore((s) => s.checkAndUnlockAchievements);
  const incrementLoginStreak = useUserStore((s) => s.incrementLoginStreak);
  const toggleSandboxRec = useUIStore((s) => s.toggleSandboxRec);
  const activeSandboxRecIds = useUIStore((s) => s.activeSandboxRecIds);

  // Check achievements and streak on mount
  useEffect(() => {
    incrementLoginStreak();
    checkAndUnlockAchievements({
      totalAnnualKg: result.totalAnnual,
      activeRecCount: activeSandboxRecIds.length,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const quickWins = getQuickWins(result.breakdown, 3);

  return (
    <div className="min-h-screen mesh-bg px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Your Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Live carbon footprint overview
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/onboarding"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-700/50 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Update your inputs"
            >
              <RefreshCcw className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Update Inputs</span>
            </Link>
          </div>
        </div>

        {/* Metrics Ledger — Top KPIs */}
        <MetricsLedger />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CategoryBreakdownChart />
          <BenchmarkComparison />
        </div>

        {/* Historical Trend — Full Width */}
        <HistoricalLineChart />

        {/* Quick Wins */}
        <section aria-label="Quick win recommendations">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              ⚡ Top Quick Wins
            </h2>
            <Link
              href="/recommendations"
              className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
            >
              View all actions
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickWins.map((rec) => (
              <RecommendationCard
                key={rec.id}
                item={rec}
                isInSandbox={activeSandboxRecIds.includes(rec.id)}
                onSandboxToggle={toggleSandboxRec}
              />
            ))}
          </div>
        </section>

        {/* Achievements */}
        <AchievementsGrid />
      </div>
    </div>
  );
}
