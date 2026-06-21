/**
 * Recommendations Engine Tests
 *
 * Validates filtering logic, sorting by category priority, and empty state handling.
 */

import { getRecommendations, getQuickWins, DEFAULT_FILTERS, RECOMMENDATIONS } from '@/lib/recommendations';
import type { CategoryBreakdown, RecommendationFilters } from '@/types/carbon';

const HIGH_TRANSPORT_BREAKDOWN: CategoryBreakdown = {
  transport: 8000,
  energy: 2000,
  diet: 1500,
  consumption: 500,
};

const HIGH_DIET_BREAKDOWN: CategoryBreakdown = {
  transport: 500,
  energy: 1000,
  diet: 9000,
  consumption: 500,
};

const ZERO_BREAKDOWN: CategoryBreakdown = {
  transport: 0,
  energy: 0,
  diet: 0,
  consumption: 0,
};

describe('getRecommendations', () => {
  it('returns recommendations for all categories by default', () => {
    const recs = getRecommendations(HIGH_TRANSPORT_BREAKDOWN);
    const categories = new Set(recs.map((r) => r.category));
    expect(categories.size).toBeGreaterThan(1);
  });

  it('prioritizes transport recs when transport is highest', () => {
    const recs = getRecommendations(HIGH_TRANSPORT_BREAKDOWN);
    expect(recs[0].category).toBe('transport');
  });

  it('prioritizes diet recs when diet is highest', () => {
    const recs = getRecommendations(HIGH_DIET_BREAKDOWN);
    expect(recs[0].category).toBe('diet');
  });

  it('filters by category correctly', () => {
    const filters: RecommendationFilters = { ...DEFAULT_FILTERS, categories: ['energy'] };
    const recs = getRecommendations(HIGH_TRANSPORT_BREAKDOWN, filters);
    expect(recs.every((r) => r.category === 'energy')).toBe(true);
  });

  it('filters by cost level correctly', () => {
    const filters: RecommendationFilters = { ...DEFAULT_FILTERS, costLevels: ['free'] };
    const recs = getRecommendations(HIGH_TRANSPORT_BREAKDOWN, filters);
    expect(recs.every((r) => r.costLevel === 'free')).toBe(true);
  });

  it('filters by time commitment correctly', () => {
    const filters: RecommendationFilters = { ...DEFAULT_FILTERS, timeCommitments: ['immediate'] };
    const recs = getRecommendations(HIGH_TRANSPORT_BREAKDOWN, filters);
    expect(recs.every((r) => r.timeCommitment === 'immediate')).toBe(true);
  });

  it('filters by minimum weekly impact', () => {
    const filters: RecommendationFilters = { ...DEFAULT_FILTERS, minWeeklyImpactKg: 20 };
    const recs = getRecommendations(HIGH_TRANSPORT_BREAKDOWN, filters);
    expect(recs.every((r) => r.weeklyImpactKg >= 20)).toBe(true);
  });

  it('returns empty array when no recommendations match filters', () => {
    const filters: RecommendationFilters = { ...DEFAULT_FILTERS, minWeeklyImpactKg: 10000 };
    const recs = getRecommendations(HIGH_TRANSPORT_BREAKDOWN, filters);
    expect(recs).toHaveLength(0);
  });

  it('returns empty array when no categories selected', () => {
    const filters: RecommendationFilters = { ...DEFAULT_FILTERS, categories: [] };
    const recs = getRecommendations(HIGH_TRANSPORT_BREAKDOWN, filters);
    expect(recs).toHaveLength(0);
  });

  it('works correctly with zero breakdown', () => {
    expect(() => getRecommendations(ZERO_BREAKDOWN)).not.toThrow();
    const recs = getRecommendations(ZERO_BREAKDOWN);
    expect(Array.isArray(recs)).toBe(true);
  });

  it('all recommendations have required fields', () => {
    const recs = getRecommendations(HIGH_TRANSPORT_BREAKDOWN);
    recs.forEach((rec) => {
      expect(rec.id).toBeTruthy();
      expect(rec.title).toBeTruthy();
      expect(rec.weeklyImpactKg).toBeGreaterThanOrEqual(0);
      expect(rec.annualImpactKg).toBeGreaterThanOrEqual(0);
      expect(['free', 'low', 'medium', 'high']).toContain(rec.costLevel);
      expect(['immediate', 'habitual', 'long_term']).toContain(rec.timeCommitment);
    });
  });
});

describe('getQuickWins', () => {
  it('returns at most maxCount results', () => {
    const wins = getQuickWins(HIGH_TRANSPORT_BREAKDOWN, 3);
    expect(wins.length).toBeLessThanOrEqual(3);
  });

  it('only returns free or low cost recommendations', () => {
    const wins = getQuickWins(HIGH_TRANSPORT_BREAKDOWN, 10);
    wins.forEach((rec) => {
      expect(['free', 'low']).toContain(rec.costLevel);
    });
  });

  it('only returns immediate or habitual recommendations', () => {
    const wins = getQuickWins(HIGH_TRANSPORT_BREAKDOWN, 10);
    wins.forEach((rec) => {
      expect(['immediate', 'habitual']).toContain(rec.timeCommitment);
    });
  });
});

describe('RECOMMENDATIONS static data', () => {
  it('all recommendation IDs are unique', () => {
    const ids = RECOMMENDATIONS.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('annual impact is approximately 52× weekly impact for all recs', () => {
    RECOMMENDATIONS.forEach((rec) => {
      // Allow ±5% tolerance for rounding
      const expected = rec.weeklyImpactKg * 52;
      expect(rec.annualImpactKg).toBeGreaterThan(expected * 0.95);
      expect(rec.annualImpactKg).toBeLessThan(expected * 1.05);
    });
  });
});
