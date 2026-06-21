'use client';

/**
 * Recommendations page — Full recommendation grid with filters and What-If sandbox.
 */

import { useMemo } from 'react';
import { useCategoryBreakdown } from '@/store/carbonStore';
import { useUIStore } from '@/store/uiStore';
import { getRecommendations } from '@/lib/recommendations';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { FilterPanel } from '@/components/recommendations/FilterPanel';
import { WhatIfSandbox } from '@/components/recommendations/WhatIfSandbox';
import { Lightbulb } from 'lucide-react';

export default function RecommendationsPage() {
  const breakdown = useCategoryBreakdown();
  const recFilters = useUIStore((s) => s.recFilters);
  const activeSandboxRecIds = useUIStore((s) => s.activeSandboxRecIds);
  const toggleSandboxRec = useUIStore((s) => s.toggleSandboxRec);

  const recommendations = useMemo(
    () => getRecommendations(breakdown, recFilters),
    [breakdown, recFilters],
  );

  return (
    <div className="min-h-screen mesh-bg px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="w-5 h-5 text-yellow-400" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-slate-100">Actions & Recommendations</h1>
          </div>
          <p className="text-slate-500 text-sm">
            Personalized to your highest emission categories. Toggle actions into the What-If sandbox to simulate your future.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Left Column: Filters + What-If */}
          <div className="space-y-4">
            <FilterPanel />
            <WhatIfSandbox />
          </div>

          {/* Right Column: Recommendation Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-slate-500" aria-live="polite" aria-atomic="true">
                {recommendations.length} action{recommendations.length !== 1 ? 's' : ''} found
              </p>
              <p className="text-xs text-slate-600">
                ✅ Selected in sandbox: {activeSandboxRecIds.length}
              </p>
            </div>

            {recommendations.length > 0 ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
                role="list"
                aria-label="Recommendations"
              >
                {recommendations.map((rec) => (
                  <div key={rec.id} role="listitem">
                    <RecommendationCard
                      item={rec}
                      isInSandbox={activeSandboxRecIds.includes(rec.id)}
                      onSandboxToggle={toggleSandboxRec}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl">
                <Lightbulb className="w-8 h-8 mb-3 text-slate-700" aria-hidden="true" />
                <p className="text-sm font-medium">No actions match your filters</p>
                <p className="text-xs mt-1">Try relaxing the cost or time filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
