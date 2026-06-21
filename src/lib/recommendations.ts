/**
 * EcoTrack Recommendation Matrix
 *
 * 30+ contextual actions organized by category with impact, cost, and time metadata.
 * Used by the recommendation engine and What-If sandbox.
 */

import type {
  RecommendationItem,
  RecommendationFilters,
  CategoryBreakdown,
  EmissionCategory,
} from '@/types/carbon';

// ─── Static Recommendation Database ──────────────────────────────────────────

export const RECOMMENDATIONS: RecommendationItem[] = [
  // ── Transport ──────────────────────────────────────────────────────────────
  {
    id: 'transport-carpool',
    title: 'Carpool 2 Days/Week',
    description: 'Share your daily commute with a colleague or neighbor 2 days per week.',
    category: 'transport',
    weeklyImpactKg: 12.4,
    annualImpactKg: 644,
    costLevel: 'free',
    timeCommitment: 'habitual',
    emoji: '🚗',
    actionLabel: 'Find Carpool Partners',
  },
  {
    id: 'transport-public',
    title: 'Switch to Public Transit',
    description: 'Replace your car commute with bus or metro for your daily route.',
    category: 'transport',
    weeklyImpactKg: 35.2,
    annualImpactKg: 1830,
    costLevel: 'low',
    timeCommitment: 'habitual',
    emoji: '🚇',
    actionLabel: 'Plan Your Route',
  },
  {
    id: 'transport-bike',
    title: 'Cycle to Work',
    description: 'Cycle or e-bike to work at least 3 days per week for sub-5km commutes.',
    category: 'transport',
    weeklyImpactKg: 8.6,
    annualImpactKg: 447,
    costLevel: 'medium',
    timeCommitment: 'habitual',
    emoji: '🚲',
    actionLabel: 'Start Commuting',
  },
  {
    id: 'transport-ev',
    title: 'Switch to an Electric Vehicle',
    description: 'Replace your ICE vehicle with an EV charged on a green tariff.',
    category: 'transport',
    weeklyImpactKg: 55.0,
    annualImpactKg: 2860,
    costLevel: 'high',
    timeCommitment: 'long_term',
    emoji: '⚡',
    actionLabel: 'Compare EVs',
  },
  {
    id: 'transport-work-from-home',
    title: 'Work From Home 2 Days',
    description: 'Eliminate commute emissions 2 days per week with remote work.',
    category: 'transport',
    weeklyImpactKg: 9.8,
    annualImpactKg: 510,
    costLevel: 'free',
    timeCommitment: 'habitual',
    emoji: '🏠',
    actionLabel: 'Request WFH Policy',
  },
  {
    id: 'transport-no-flights',
    title: 'Replace One Flight with Train',
    description: 'Swap one short-haul flight per year for a high-speed train journey.',
    category: 'transport',
    weeklyImpactKg: 4.0,
    annualImpactKg: 210,
    costLevel: 'free',
    timeCommitment: 'immediate',
    emoji: '🚆',
    actionLabel: 'Search Train Routes',
  },
  {
    id: 'transport-virtual-meetings',
    title: 'Replace Business Flights with Video Calls',
    description: 'Use video conferencing instead of flying for meetings up to 4 hours away.',
    category: 'transport',
    weeklyImpactKg: 25.0,
    annualImpactKg: 1300,
    costLevel: 'free',
    timeCommitment: 'immediate',
    emoji: '💻',
    actionLabel: 'Set Up Video Platform',
  },
  {
    id: 'transport-tire-pressure',
    title: 'Maintain Optimal Tire Pressure',
    description: 'Properly inflated tires improve fuel efficiency by up to 3%.',
    category: 'transport',
    weeklyImpactKg: 0.9,
    annualImpactKg: 47,
    costLevel: 'free',
    timeCommitment: 'immediate',
    emoji: '🔧',
    actionLabel: 'Check Tire Pressure',
  },

  // ── Energy ─────────────────────────────────────────────────────────────────
  {
    id: 'energy-green-tariff',
    title: 'Switch to a Green Energy Tariff',
    description: 'Move to a 100% renewable electricity provider or add RECs.',
    category: 'energy',
    weeklyImpactKg: 28.6,
    annualImpactKg: 1487,
    costLevel: 'low',
    timeCommitment: 'immediate',
    emoji: '🌿',
    actionLabel: 'Compare Green Tariffs',
  },
  {
    id: 'energy-solar',
    title: 'Install Rooftop Solar Panels',
    description: '4kW system can offset 3,000+ kWh annually, cutting electricity bills too.',
    category: 'energy',
    weeklyImpactKg: 22.4,
    annualImpactKg: 1165,
    costLevel: 'high',
    timeCommitment: 'long_term',
    emoji: '☀️',
    actionLabel: 'Get Solar Quote',
  },
  {
    id: 'energy-thermostat',
    title: 'Smart Thermostat Optimization',
    description: 'Install a smart thermostat and set 2°C lower in winter, 2°C higher in summer.',
    category: 'energy',
    weeklyImpactKg: 5.2,
    annualImpactKg: 270,
    costLevel: 'medium',
    timeCommitment: 'immediate',
    emoji: '🌡️',
    actionLabel: 'Shop Smart Thermostats',
  },
  {
    id: 'energy-leds',
    title: 'Replace All Bulbs with LEDs',
    description: 'LEDs use 75% less energy than incandescent bulbs and last 25x longer.',
    category: 'energy',
    weeklyImpactKg: 1.3,
    annualImpactKg: 68,
    costLevel: 'low',
    timeCommitment: 'immediate',
    emoji: '💡',
    actionLabel: 'Shop LED Bulbs',
  },
  {
    id: 'energy-standby',
    title: 'Eliminate Standby Power',
    description: 'Use smart power strips to cut phantom load — saves ~10% of electricity.',
    category: 'energy',
    weeklyImpactKg: 2.8,
    annualImpactKg: 146,
    costLevel: 'low',
    timeCommitment: 'immediate',
    emoji: '🔌',
    actionLabel: 'Get Smart Strip',
  },
  {
    id: 'energy-heat-pump',
    title: 'Install a Heat Pump',
    description: 'Replace gas boiler with an air-source heat pump (3× more efficient).',
    category: 'energy',
    weeklyImpactKg: 40.0,
    annualImpactKg: 2080,
    costLevel: 'high',
    timeCommitment: 'long_term',
    emoji: '🏡',
    actionLabel: 'Get Heat Pump Quote',
  },
  {
    id: 'energy-washing',
    title: 'Wash Clothes at 30°C',
    description: 'Lowering wash temperature from 60°C to 30°C cuts laundry energy by 40%.',
    category: 'energy',
    weeklyImpactKg: 0.8,
    annualImpactKg: 42,
    costLevel: 'free',
    timeCommitment: 'habitual',
    emoji: '🧺',
    actionLabel: 'Set Your Washer',
  },
  {
    id: 'energy-insulation',
    title: 'Improve Home Insulation',
    description: 'Loft and cavity wall insulation can reduce heating energy by 20-30%.',
    category: 'energy',
    weeklyImpactKg: 15.0,
    annualImpactKg: 780,
    costLevel: 'high',
    timeCommitment: 'long_term',
    emoji: '🏗️',
    actionLabel: 'Get Insulation Quote',
  },

  // ── Diet ───────────────────────────────────────────────────────────────────
  {
    id: 'diet-meat-free-monday',
    title: 'Meat-Free Monday',
    description: 'Go plant-based one day per week — the single easiest dietary change.',
    category: 'diet',
    weeklyImpactKg: 3.8,
    annualImpactKg: 198,
    costLevel: 'free',
    timeCommitment: 'habitual',
    emoji: '🥦',
    actionLabel: 'Get Plant-Based Recipes',
  },
  {
    id: 'diet-reduce-red-meat',
    title: 'Replace Red Meat with Poultry/Fish',
    description: 'Beef emits 7× more CO2 than chicken. Swap 3 meals/week.',
    category: 'diet',
    weeklyImpactKg: 8.5,
    annualImpactKg: 442,
    costLevel: 'free',
    timeCommitment: 'habitual',
    emoji: '🐟',
    actionLabel: 'Explore Recipes',
  },
  {
    id: 'diet-local-seasonal',
    title: 'Buy Local & Seasonal Produce',
    description: 'Local seasonal food cuts transport and storage emissions by up to 15%.',
    category: 'diet',
    weeklyImpactKg: 2.1,
    annualImpactKg: 109,
    costLevel: 'free',
    timeCommitment: 'habitual',
    emoji: '🌽',
    actionLabel: 'Find Local Markets',
  },
  {
    id: 'diet-composting',
    title: 'Start Composting Food Waste',
    description: 'Composting diverts organic waste from landfill, reducing methane emissions.',
    category: 'diet',
    weeklyImpactKg: 1.8,
    annualImpactKg: 95,
    costLevel: 'low',
    timeCommitment: 'habitual',
    emoji: '♻️',
    actionLabel: 'Get a Compost Bin',
  },
  {
    id: 'diet-meal-planning',
    title: 'Meal Plan to Reduce Food Waste',
    description: 'Plan weekly meals to cut food waste by 30% — the average household wastes $1,500/yr.',
    category: 'diet',
    weeklyImpactKg: 3.2,
    annualImpactKg: 166,
    costLevel: 'free',
    timeCommitment: 'habitual',
    emoji: '📋',
    actionLabel: 'Start Meal Planning',
  },
  {
    id: 'diet-vegan-month',
    title: 'Try a Vegan Month',
    description: 'Going fully plant-based for one month saves ~100 kg CO2e.',
    category: 'diet',
    weeklyImpactKg: 14.4,
    annualImpactKg: 748,
    costLevel: 'free',
    timeCommitment: 'immediate',
    emoji: '🌿',
    actionLabel: 'Start Vegan Challenge',
  },

  // ── Consumption ────────────────────────────────────────────────────────────
  {
    id: 'consumption-second-hand',
    title: 'Buy Second-Hand Clothing',
    description: 'Thrifting and resale platforms cut clothing emissions by up to 82%.',
    category: 'consumption',
    weeklyImpactKg: 3.4,
    annualImpactKg: 177,
    costLevel: 'free',
    timeCommitment: 'habitual',
    emoji: '👗',
    actionLabel: 'Browse Thrift Stores',
  },
  {
    id: 'consumption-repair',
    title: 'Repair Before You Replace',
    description: 'Fixing electronics and appliances instead of buying new cuts embodied carbon.',
    category: 'consumption',
    weeklyImpactKg: 2.8,
    annualImpactKg: 146,
    costLevel: 'low',
    timeCommitment: 'habitual',
    emoji: '🔧',
    actionLabel: 'Find Repair Shops',
  },
  {
    id: 'consumption-fast-fashion',
    title: 'Buy 30% Fewer New Clothes',
    description: 'The fashion industry emits more CO2 than aviation. Buy less, choose well.',
    category: 'consumption',
    weeklyImpactKg: 1.6,
    annualImpactKg: 83,
    costLevel: 'free',
    timeCommitment: 'habitual',
    emoji: '👔',
    actionLabel: 'Review Your Wardrobe',
  },
  {
    id: 'consumption-recycling',
    title: 'Recycle All Eligible Materials',
    description: 'Proper recycling of paper, glass, metal, and plastics reduces waste emissions.',
    category: 'consumption',
    weeklyImpactKg: 2.2,
    annualImpactKg: 114,
    costLevel: 'free',
    timeCommitment: 'habitual',
    emoji: '♻️',
    actionLabel: 'Check Local Recycling Rules',
  },
  {
    id: 'consumption-electronics',
    title: 'Extend Electronics Lifespan',
    description: 'Keep smartphones 3+ years instead of upgrading annually.',
    category: 'consumption',
    weeklyImpactKg: 4.2,
    annualImpactKg: 218,
    costLevel: 'free',
    timeCommitment: 'long_term',
    emoji: '📱',
    actionLabel: 'Phone Health Check',
  },
  {
    id: 'consumption-sharing',
    title: 'Join a Tool or Equipment Library',
    description: 'Borrow rarely-used items instead of buying — reduces manufacturing demand.',
    category: 'consumption',
    weeklyImpactKg: 1.1,
    annualImpactKg: 57,
    costLevel: 'free',
    timeCommitment: 'habitual',
    emoji: '🔨',
    actionLabel: 'Find a Tool Library',
  },
];

// ─── Recommendation Engine ────────────────────────────────────────────────────

/**
 * Default filters state
 */
export const DEFAULT_FILTERS: RecommendationFilters = {
  categories: ['transport', 'energy', 'diet', 'consumption'],
  costLevels: ['free', 'low', 'medium', 'high'],
  timeCommitments: ['immediate', 'habitual', 'long_term'],
  minWeeklyImpactKg: 0,
};

/**
 * Return prioritized, filtered recommendations based on the user's
 * emission breakdown and filter constraints.
 *
 * Sorting: highest-impact categories first, then by weeklyImpactKg descending.
 */
export function getRecommendations(
  breakdown: CategoryBreakdown,
  filters: RecommendationFilters = DEFAULT_FILTERS,
): RecommendationItem[] {
  // Rank categories by emission level
  const ranked = Object.entries(breakdown)
    .sort(([, a], [, b]) => b - a)
    .map(([cat]) => cat as EmissionCategory);

  return RECOMMENDATIONS
    .filter((rec) => {
      return (
        filters.categories.includes(rec.category) &&
        filters.costLevels.includes(rec.costLevel) &&
        filters.timeCommitments.includes(rec.timeCommitment) &&
        rec.weeklyImpactKg >= filters.minWeeklyImpactKg
      );
    })
    .sort((a, b) => {
      // Primary: category priority rank
      const aRank = ranked.indexOf(a.category);
      const bRank = ranked.indexOf(b.category);
      if (aRank !== bRank) return aRank - bRank;
      // Secondary: impact descending
      return b.weeklyImpactKg - a.weeklyImpactKg;
    });
}

/**
 * Get top N recommendations for the quick-wins section of the dashboard.
 */
export function getQuickWins(
  breakdown: CategoryBreakdown,
  maxCount = 3,
): RecommendationItem[] {
  return getRecommendations(breakdown, {
    ...DEFAULT_FILTERS,
    costLevels: ['free', 'low'],
    timeCommitments: ['immediate', 'habitual'],
  }).slice(0, maxCount);
}
