/**
 * EcoTrack Carbon Footprint Platform — Core Domain Types
 * Based on EPA & GHG Protocol emissions accounting standards
 */

// ─── Transport ────────────────────────────────────────────────────────────────

export type TransportMode = 'ev' | 'ice' | 'hybrid' | 'transit' | 'bicycle' | 'aviation';

export interface TransportInput {
  mode: TransportMode;
  /** Daily commute distance in kilometers */
  dailyDistanceKm: number;
  /** Number of commute days per week */
  daysPerWeek: number;
  /** Short-haul flights per year */
  shortHaulFlightsPerYear: number;
  /** Long-haul flights per year */
  longHaulFlightsPerYear: number;
  /** Vehicle fuel efficiency in L/100km (for ICE/Hybrid) */
  fuelEfficiencyL100km?: number;
  /** EV electricity consumption kWh/100km */
  evConsumptionKwh100km?: number;
  /** Green energy percentage for EV charging (0-1) */
  evGreenEnergyRatio?: number;
}

// ─── Energy ───────────────────────────────────────────────────────────────────

export type HeatingFuel = 'electricity' | 'natural_gas' | 'heating_oil' | 'propane' | 'none';

export interface EnergyInput {
  /** Monthly electricity consumption in kWh */
  monthlyElectricityKwh: number;
  /** Green/renewable energy mix ratio (0-1) */
  greenEnergyRatio: number;
  /** Monthly natural gas consumption in m³ */
  monthlyNaturalGasM3: number;
  /** Monthly heating oil in liters */
  monthlyHeatingOilL: number;
  /** Number of people in household */
  householdSize: number;
  /** Solar panels installed? */
  hasSolar: boolean;
  /** Monthly solar generation offset in kWh */
  solarOffsetKwh: number;
}

// ─── Diet & Lifestyle ─────────────────────────────────────────────────────────

export type DietProfile = 'vegan' | 'vegetarian' | 'pescatarian' | 'omnivore' | 'high_meat';

export type WasteFrequency = 'very_low' | 'low' | 'average' | 'high' | 'very_high';

export interface DietInput {
  profile: DietProfile;
  /** Food waste frequency */
  wasteFrequency: WasteFrequency;
  /** Percentage of locally-sourced food (0-1) */
  localFoodRatio: number;
  /** Composting? */
  composting: boolean;
}

// ─── Consumption ──────────────────────────────────────────────────────────────

export type RecyclingHabit = 'none' | 'partial' | 'most' | 'all';

export interface ConsumptionInput {
  /** Monthly spending on new clothing in USD */
  monthlyClothingSpend: number;
  /** Monthly spending on electronics/appliances in USD */
  monthlyElectronicsSpend: number;
  /** Monthly spending on other goods in USD */
  monthlyOtherGoodsSpend: number;
  recyclingHabit: RecyclingHabit;
  /** Buys second-hand items */
  buySecondHand: boolean;
  /** Repair instead of replace */
  repairFirst: boolean;
}

// ─── Calculation Results ──────────────────────────────────────────────────────

export interface CategoryBreakdown {
  transport: number;   // kgCO2e/year
  energy: number;      // kgCO2e/year
  diet: number;        // kgCO2e/year
  consumption: number; // kgCO2e/year
}

export interface EmissionResult {
  breakdown: CategoryBreakdown;
  totalAnnual: number;       // kgCO2e/year
  totalMonthly: number;      // kgCO2e/month
  annualizedRunRate: number; // kgCO2e/year (same as totalAnnual)
  netOffsetBalance: number;  // kgCO2e/year (positive = savings)
  parisAlignmentRatio: number; // ratio to 2-tonne Paris target (2000 kgCO2e)
  nationalAverageRatio: number; // ratio to US national average (14,000 kgCO2e)
  percentileRank: number;    // 0-100, lower is better
}

// ─── Historical Tracking ──────────────────────────────────────────────────────

export type TimeRange = 'week' | 'month' | '3months' | 'year' | 'all';

export interface HistoricalDataPoint {
  date: string; // ISO date string
  totalKgCO2e: number;
  breakdown: CategoryBreakdown;
}

// ─── Recommendations ─────────────────────────────────────────────────────────

export type CostLevel = 'free' | 'low' | 'medium' | 'high';
export type TimeCommitment = 'immediate' | 'habitual' | 'long_term';
export type EmissionCategory = 'transport' | 'energy' | 'diet' | 'consumption';

export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  category: EmissionCategory;
  /** Weekly CO2 avoided in kgCO2e */
  weeklyImpactKg: number;
  annualImpactKg: number;
  costLevel: CostLevel;
  timeCommitment: TimeCommitment;
  emoji: string;
  actionLabel: string;
  isCompleted?: boolean;
  isActive?: boolean;
}

export interface RecommendationFilters {
  categories: EmissionCategory[];
  costLevels: CostLevel[];
  timeCommitments: TimeCommitment[];
  minWeeklyImpactKg: number;
}

// ─── What-If Forecasting ──────────────────────────────────────────────────────

export interface ForecastPoint {
  week: number;       // weeks from now (0-52)
  date: string;       // ISO date
  baselineKgCO2e: number;
  optimizedKgCO2e: number;
  savedKgCO2e: number;
  cumulativeSavedKgCO2e: number;
}

export interface WhatIfScenario {
  activeRecommendationIds: string[];
  forecastPoints: ForecastPoint[];
  totalAnnualSavingsKg: number;
  percentageReduction: number;
  projectedAnnual: number;
}

// ─── Gamification ─────────────────────────────────────────────────────────────

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  tier: AchievementTier;
  unlockedAt?: string; // ISO date
  isUnlocked: boolean;
  progressPercent: number; // 0-100
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  country: string;
  createdAt: string;
  lastUpdated: string;
  /** Linked Google account */
  isGoogleAuth: boolean;
  /** Guest mode (no Firebase) */
  isGuest: boolean;
}

// ─── Full App State Snapshot ──────────────────────────────────────────────────

export interface CarbonSnapshot {
  userId: string;
  timestamp: string;
  transport: TransportInput;
  energy: EnergyInput;
  diet: DietInput;
  consumption: ConsumptionInput;
  result: EmissionResult;
}
