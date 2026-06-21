/**
 * EcoTrack Carbon Calculation Engine
 *
 * Pure calculation functions with no side effects.
 * All inputs are validated before use.
 * All outputs are in kgCO2e.
 */

import type {
  TransportInput,
  EnergyInput,
  DietInput,
  ConsumptionInput,
  CategoryBreakdown,
  EmissionResult,
  ForecastPoint,
  WhatIfScenario,
  RecommendationItem,
} from '@/types/carbon';

import {
  TRANSPORT_FACTORS,
  AVG_SHORT_HAUL_KM,
  AVG_LONG_HAUL_KM,
  ENERGY_FACTORS,
  DIET_FACTORS,
  FOOD_WASTE_MULTIPLIERS,
  LOCAL_FOOD_MAX_DISCOUNT,
  COMPOSTING_ANNUAL_OFFSET_KG,
  CONSUMPTION_FACTORS,
  RECYCLING_MULTIPLIERS,
  SECOND_HAND_DISCOUNT,
  REPAIR_FIRST_DISCOUNT,
  US_NATIONAL_AVERAGE_KG,
  PARIS_2030_TARGET_KG,
  DAYS_PER_YEAR,
  WEEKS_PER_YEAR,
  MONTHS_PER_YEAR,
} from './emissionFactors';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Clamp a value between min and max */
const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/** Ensure a value is a finite, non-negative number */
const safePositive = (value: number): number =>
  isFinite(value) && value >= 0 ? value : 0;

// ─── Transport Emissions ──────────────────────────────────────────────────────

/**
 * Calculate annual transport emissions in kgCO2e/year.
 *
 * Formula:
 *   commute_annual = dailyDistanceKm * 2 * daysPerWeek * 52 weeks * factor
 *   flights = short × avgShortKm × factor_short + long × avgLongKm × factor_long
 */
export function calculateTransportEmissions(input: TransportInput): number {
  const dailyDist = safePositive(input.dailyDistanceKm);
  const days = clamp(safePositive(input.daysPerWeek), 0, 7);

  // Round-trip commute
  const annualCommuteKm = dailyDist * 2 * days * WEEKS_PER_YEAR;

  let commuteEmissions: number;

  if (input.mode === 'ev') {
    // EV: blend grid and green energy
    const greenRatio = clamp(input.evGreenEnergyRatio ?? 0, 0, 1);
    const evEfficiency = safePositive(input.evConsumptionKwh100km ?? 18) / 100;
    const blendedFactor =
      ENERGY_FACTORS.electricityGrid * (1 - greenRatio) +
      ENERGY_FACTORS.electricityGreen * greenRatio;
    commuteEmissions = annualCommuteKm * evEfficiency * blendedFactor;
  } else if (input.mode === 'ice') {
    // ICE: convert from L/100km
    const efficiency = safePositive(input.fuelEfficiencyL100km ?? 8) / 100;
    commuteEmissions = annualCommuteKm * efficiency * 2.31; // kgCO2e per litre
  } else if (input.mode === 'hybrid') {
    commuteEmissions = annualCommuteKm * TRANSPORT_FACTORS.hybrid;
  } else if (input.mode === 'bicycle') {
    commuteEmissions = 0;
  } else {
    // transit
    commuteEmissions = annualCommuteKm * TRANSPORT_FACTORS.transit;
  }

  // Aviation
  const shortHaulFlights = safePositive(input.shortHaulFlightsPerYear);
  const longHaulFlights = safePositive(input.longHaulFlightsPerYear);
  const aviationEmissions =
    shortHaulFlights * AVG_SHORT_HAUL_KM * TRANSPORT_FACTORS.aviation_short +
    longHaulFlights * AVG_LONG_HAUL_KM * TRANSPORT_FACTORS.aviation_long;

  return commuteEmissions + aviationEmissions;
}

// ─── Energy Emissions ─────────────────────────────────────────────────────────

/**
 * Calculate annual household energy emissions in kgCO2e/year.
 * Divides by household size for per-capita figure.
 */
export function calculateEnergyEmissions(input: EnergyInput): number {
  const householdSize = Math.max(1, Math.round(input.householdSize));
  const greenRatio = clamp(input.greenEnergyRatio, 0, 1);

  // Electricity: blend grid and green
  const electricityKwh = safePositive(input.monthlyElectricityKwh) * MONTHS_PER_YEAR;
  const solarOffset = safePositive(input.solarOffsetKwh) * (input.hasSolar ? MONTHS_PER_YEAR : 0);
  const netElectricityKwh = Math.max(0, electricityKwh - solarOffset);
  const blendedElectricityFactor =
    ENERGY_FACTORS.electricityGrid * (1 - greenRatio) +
    ENERGY_FACTORS.electricityGreen * greenRatio;
  const electricityEmissions = netElectricityKwh * blendedElectricityFactor;

  // Natural gas
  const gasM3 = safePositive(input.monthlyNaturalGasM3) * MONTHS_PER_YEAR;
  const gasEmissions = gasM3 * ENERGY_FACTORS.naturalGasM3;

  // Heating oil
  const oilL = safePositive(input.monthlyHeatingOilL) * MONTHS_PER_YEAR;
  const oilEmissions = oilL * ENERGY_FACTORS.heatingOilLitre;

  const total = electricityEmissions + gasEmissions + oilEmissions;
  return total / householdSize;
}

// ─── Diet Emissions ───────────────────────────────────────────────────────────

/**
 * Calculate annual diet & lifestyle emissions in kgCO2e/year.
 */
export function calculateDietEmissions(input: DietInput): number {
  const baseDailyKg = DIET_FACTORS[input.profile];
  const wasteMultiplier = FOOD_WASTE_MULTIPLIERS[input.wasteFrequency];
  const localDiscount = clamp(input.localFoodRatio, 0, 1) * LOCAL_FOOD_MAX_DISCOUNT;

  const adjustedDailyKg = baseDailyKg * wasteMultiplier * (1 - localDiscount);
  const annualEmissions = adjustedDailyKg * DAYS_PER_YEAR;
  const compostingOffset = input.composting ? COMPOSTING_ANNUAL_OFFSET_KG : 0;

  return Math.max(0, annualEmissions - compostingOffset);
}

// ─── Consumption Emissions ────────────────────────────────────────────────────

/**
 * Calculate annual consumption emissions in kgCO2e/year.
 */
export function calculateConsumptionEmissions(input: ConsumptionInput): number {
  const clothingAnnual = safePositive(input.monthlyClothingSpend) * MONTHS_PER_YEAR;
  const electronicsAnnual = safePositive(input.monthlyElectronicsSpend) * MONTHS_PER_YEAR;
  const otherAnnual = safePositive(input.monthlyOtherGoodsSpend) * MONTHS_PER_YEAR;

  let total =
    clothingAnnual * CONSUMPTION_FACTORS.clothing +
    electronicsAnnual * CONSUMPTION_FACTORS.electronics +
    otherAnnual * CONSUMPTION_FACTORS.otherGoods;

  // Apply recycling reduction
  total *= RECYCLING_MULTIPLIERS[input.recyclingHabit];

  // Apply second-hand discount on clothing portion
  if (input.buySecondHand) {
    total -= clothingAnnual * CONSUMPTION_FACTORS.clothing * SECOND_HAND_DISCOUNT;
  }

  // Apply repair-first discount on electronics
  if (input.repairFirst) {
    total -= electronicsAnnual * CONSUMPTION_FACTORS.electronics * REPAIR_FIRST_DISCOUNT;
  }

  return Math.max(0, total);
}

// ─── Combined Calculation ─────────────────────────────────────────────────────

/**
 * Calculate the full emission result from all four categories.
 */
export function calculateFullEmissions(
  transport: TransportInput,
  energy: EnergyInput,
  diet: DietInput,
  consumption: ConsumptionInput,
): EmissionResult {
  const transportKg = calculateTransportEmissions(transport);
  const energyKg = calculateEnergyEmissions(energy);
  const dietKg = calculateDietEmissions(diet);
  const consumptionKg = calculateConsumptionEmissions(consumption);

  const breakdown: CategoryBreakdown = {
    transport: transportKg,
    energy: energyKg,
    diet: dietKg,
    consumption: consumptionKg,
  };

  const totalAnnual = transportKg + energyKg + dietKg + consumptionKg;
  const totalMonthly = totalAnnual / MONTHS_PER_YEAR;

  // Net offset balance: difference from Paris 2°C target
  const netOffsetBalance = PARIS_2030_TARGET_KG - totalAnnual;

  // Ratio comparisons
  const parisAlignmentRatio = totalAnnual / PARIS_2030_TARGET_KG;
  const nationalAverageRatio = totalAnnual / US_NATIONAL_AVERAGE_KG;

  // Simple percentile estimate based on US distribution
  // Approximation: assume log-normal distribution of emissions
  const percentileRank = Math.min(
    99,
    Math.max(1, Math.round((totalAnnual / US_NATIONAL_AVERAGE_KG) * 50)),
  );

  return {
    breakdown,
    totalAnnual,
    totalMonthly,
    annualizedRunRate: totalAnnual,
    netOffsetBalance,
    parisAlignmentRatio,
    nationalAverageRatio,
    percentileRank,
  };
}

// ─── What-If Forecasting ──────────────────────────────────────────────────────

/**
 * Generate a 52-week forecast comparing baseline vs. optimized scenarios.
 *
 * @param baselineAnnualKg - Current annual emissions
 * @param activeRecommendations - Recommendations the user has selected
 */
export function generateWhatIfForecast(
  baselineAnnualKg: number,
  activeRecommendations: RecommendationItem[],
): WhatIfScenario {
  const totalWeeklySavingsKg = activeRecommendations.reduce(
    (sum, rec) => sum + rec.weeklyImpactKg,
    0,
  );

  const baselineWeeklyKg = baselineAnnualKg / WEEKS_PER_YEAR;
  const optimizedWeeklyKg = Math.max(0, baselineWeeklyKg - totalWeeklySavingsKg);
  const totalAnnualSavingsKg = totalWeeklySavingsKg * WEEKS_PER_YEAR;
  const projectedAnnual = Math.max(0, baselineAnnualKg - totalAnnualSavingsKg);
  const percentageReduction = baselineAnnualKg > 0
    ? (totalAnnualSavingsKg / baselineAnnualKg) * 100
    : 0;

  const today = new Date();
  const forecastPoints: ForecastPoint[] = [];

  for (let week = 0; week <= 52; week++) {
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + week * 7);

    // Gradual adoption curve — savings ramp up over 4 weeks
    const adoptionFactor = Math.min(1, week / 4);
    const weeklyOptimized = baselineWeeklyKg - totalWeeklySavingsKg * adoptionFactor;
    const weeklySaved = baselineWeeklyKg - Math.max(0, weeklyOptimized);

    forecastPoints.push({
      week,
      date: futureDate.toISOString().split('T')[0],
      baselineKgCO2e: parseFloat(baselineWeeklyKg.toFixed(2)),
      optimizedKgCO2e: parseFloat(Math.max(0, weeklyOptimized).toFixed(2)),
      savedKgCO2e: parseFloat(weeklySaved.toFixed(2)),
      cumulativeSavedKgCO2e: parseFloat((weeklySaved * week).toFixed(2)),
    });
  }

  return {
    activeRecommendationIds: activeRecommendations.map((r) => r.id),
    forecastPoints,
    totalAnnualSavingsKg: parseFloat(totalAnnualSavingsKg.toFixed(2)),
    percentageReduction: parseFloat(percentageReduction.toFixed(1)),
    projectedAnnual: parseFloat(projectedAnnual.toFixed(2)),
  };
}

// ─── Utility: Format emissions ────────────────────────────────────────────────

/**
 * Format a kgCO2e value for display.
 * @returns e.g. "2,340 kg" or "2.3 tonnes"
 */
export function formatEmissions(kgCO2e: number, unit: 'kg' | 'tonnes' = 'kg'): string {
  if (unit === 'tonnes') {
    return `${(kgCO2e / 1000).toFixed(1)} t`;
  }
  return `${Math.round(kgCO2e).toLocaleString()} kg`;
}

/**
 * Get a human-readable label for the Paris alignment ratio.
 */
export function getAlignmentLabel(ratio: number): {
  label: string;
  color: string;
  emoji: string;
} {
  if (ratio <= 0.5) return { label: 'Excellent', color: '#22c55e', emoji: '🌱' };
  if (ratio <= 1.0) return { label: 'Good', color: '#84cc16', emoji: '✅' };
  if (ratio <= 2.0) return { label: 'Average', color: '#f59e0b', emoji: '⚠️' };
  if (ratio <= 3.5) return { label: 'High', color: '#f97316', emoji: '🔥' };
  return { label: 'Critical', color: '#ef4444', emoji: '🚨' };
}
