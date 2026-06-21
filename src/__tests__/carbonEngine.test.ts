/**
 * Carbon Engine Unit Tests
 *
 * Tests all four emission calculators plus the combined calculation.
 * Validates edge cases: zero inputs, extreme values, and boundary conditions.
 */

import {
  calculateTransportEmissions,
  calculateEnergyEmissions,
  calculateDietEmissions,
  calculateConsumptionEmissions,
  calculateFullEmissions,
  generateWhatIfForecast,
  formatEmissions,
  getAlignmentLabel,
} from '@/lib/carbonEngine';

import {
  DEFAULT_TRANSPORT,
  DEFAULT_ENERGY,
  DEFAULT_DIET,
  DEFAULT_CONSUMPTION,
} from '@/store/carbonStore';

import type { TransportInput, EnergyInput, DietInput, ConsumptionInput } from '@/types/carbon';

// ─── Transport Calculator Tests ───────────────────────────────────────────────

describe('calculateTransportEmissions', () => {
  it('returns 0 for bicycle mode regardless of distance', () => {
    const input: TransportInput = { ...DEFAULT_TRANSPORT, mode: 'bicycle', dailyDistanceKm: 100 };
    expect(calculateTransportEmissions(input)).toBe(0);
  });

  it('returns 0 when daily distance is 0', () => {
    const input: TransportInput = { ...DEFAULT_TRANSPORT, dailyDistanceKm: 0, shortHaulFlightsPerYear: 0, longHaulFlightsPerYear: 0 };
    expect(calculateTransportEmissions(input)).toBe(0);
  });

  it('returns 0 when commute days is 0 and no flights', () => {
    const input: TransportInput = {
      ...DEFAULT_TRANSPORT,
      daysPerWeek: 0,
      shortHaulFlightsPerYear: 0,
      longHaulFlightsPerYear: 0,
    };
    expect(calculateTransportEmissions(input)).toBe(0);
  });

  it('calculates ICE commute emissions correctly', () => {
    const input: TransportInput = {
      mode: 'ice',
      dailyDistanceKm: 20,
      daysPerWeek: 5,
      shortHaulFlightsPerYear: 0,
      longHaulFlightsPerYear: 0,
      fuelEfficiencyL100km: 8,
      evConsumptionKwh100km: 18,
      evGreenEnergyRatio: 0,
    };
    // round-trip: 20×2=40km/day × 5days × 52weeks × (8/100)L/km × 2.31kgCO2/L
    const expected = 40 * 5 * 52 * (8 / 100) * 2.31;
    expect(calculateTransportEmissions(input)).toBeCloseTo(expected, 0);
  });

  it('EV emissions are lower than ICE for same distance', () => {
    const base = { dailyDistanceKm: 30, daysPerWeek: 5, shortHaulFlightsPerYear: 0, longHaulFlightsPerYear: 0 };
    const ev = calculateTransportEmissions({ ...base, mode: 'ev', evConsumptionKwh100km: 18, evGreenEnergyRatio: 0 });
    const ice = calculateTransportEmissions({ ...base, mode: 'ice', fuelEfficiencyL100km: 8 });
    expect(ev).toBeLessThan(ice);
  });

  it('EV with 100% green energy has near-zero commute emissions', () => {
    const input: TransportInput = {
      mode: 'ev',
      dailyDistanceKm: 50,
      daysPerWeek: 5,
      shortHaulFlightsPerYear: 0,
      longHaulFlightsPerYear: 0,
      evConsumptionKwh100km: 18,
      evGreenEnergyRatio: 1.0,
    };
    const result = calculateTransportEmissions(input);
    // Should be very low (not exactly zero due to green grid factor)
    expect(result).toBeLessThan(100);
  });

  it('includes aviation emissions correctly', () => {
    const noFlights: TransportInput = { ...DEFAULT_TRANSPORT, mode: 'bicycle', shortHaulFlightsPerYear: 0, longHaulFlightsPerYear: 0 };
    const withFlights: TransportInput = { ...DEFAULT_TRANSPORT, mode: 'bicycle', shortHaulFlightsPerYear: 2, longHaulFlightsPerYear: 1 };
    expect(calculateTransportEmissions(withFlights)).toBeGreaterThan(calculateTransportEmissions(noFlights));
  });

  it('handles negative distance gracefully (clamps to 0)', () => {
    const input: TransportInput = { ...DEFAULT_TRANSPORT, dailyDistanceKm: -50, shortHaulFlightsPerYear: 0, longHaulFlightsPerYear: 0 };
    expect(calculateTransportEmissions(input)).toBeGreaterThanOrEqual(0);
  });

  it('handles NaN/Infinity inputs gracefully', () => {
    const input: TransportInput = { ...DEFAULT_TRANSPORT, dailyDistanceKm: NaN, shortHaulFlightsPerYear: 0, longHaulFlightsPerYear: 0 };
    expect(() => calculateTransportEmissions(input)).not.toThrow();
    expect(calculateTransportEmissions(input)).toBeGreaterThanOrEqual(0);
  });
});

// ─── Energy Calculator Tests ──────────────────────────────────────────────────

describe('calculateEnergyEmissions', () => {
  it('returns 0 for all-zero inputs', () => {
    const input: EnergyInput = {
      monthlyElectricityKwh: 0,
      greenEnergyRatio: 0,
      monthlyNaturalGasM3: 0,
      monthlyHeatingOilL: 0,
      householdSize: 1,
      hasSolar: false,
      solarOffsetKwh: 0,
    };
    expect(calculateEnergyEmissions(input)).toBe(0);
  });

  it('100% green energy significantly reduces electricity emissions', () => {
    const baseInput: EnergyInput = { ...DEFAULT_ENERGY, greenEnergyRatio: 0 };
    const greenInput: EnergyInput = { ...DEFAULT_ENERGY, greenEnergyRatio: 1.0 };
    expect(calculateEnergyEmissions(greenInput)).toBeLessThan(calculateEnergyEmissions(baseInput));
  });

  it('divides emissions by household size', () => {
    const single: EnergyInput = { ...DEFAULT_ENERGY, householdSize: 1 };
    const couple: EnergyInput = { ...DEFAULT_ENERGY, householdSize: 2 };
    expect(calculateEnergyEmissions(single)).toBeCloseTo(calculateEnergyEmissions(couple) * 2, 0);
  });

  it('solar offset reduces electricity emissions', () => {
    const noSolar: EnergyInput = { ...DEFAULT_ENERGY, hasSolar: false };
    const withSolar: EnergyInput = { ...DEFAULT_ENERGY, hasSolar: true, solarOffsetKwh: 200 };
    expect(calculateEnergyEmissions(withSolar)).toBeLessThan(calculateEnergyEmissions(noSolar));
  });

  it('does not go negative when solar exceeds consumption', () => {
    const input: EnergyInput = { ...DEFAULT_ENERGY, hasSolar: true, solarOffsetKwh: 10000, monthlyElectricityKwh: 100 };
    expect(calculateEnergyEmissions(input)).toBeGreaterThanOrEqual(0);
  });

  it('household size of 0 is treated as 1 (safe clamp)', () => {
    const input: EnergyInput = { ...DEFAULT_ENERGY, householdSize: 0 };
    const singleHousehold = calculateEnergyEmissions({ ...DEFAULT_ENERGY, householdSize: 1 });
    expect(calculateEnergyEmissions(input)).toBeCloseTo(singleHousehold, 0);
  });
});

// ─── Diet Calculator Tests ────────────────────────────────────────────────────

describe('calculateDietEmissions', () => {
  it('vegan diet has lower emissions than high_meat', () => {
    const vegan: DietInput = { ...DEFAULT_DIET, profile: 'vegan' };
    const highMeat: DietInput = { ...DEFAULT_DIET, profile: 'high_meat' };
    expect(calculateDietEmissions(vegan)).toBeLessThan(calculateDietEmissions(highMeat));
  });

  it('composting reduces emissions', () => {
    const noCompost: DietInput = { ...DEFAULT_DIET, composting: false };
    const withCompost: DietInput = { ...DEFAULT_DIET, composting: true };
    expect(calculateDietEmissions(withCompost)).toBeLessThan(calculateDietEmissions(noCompost));
  });

  it('local food ratio reduces emissions', () => {
    const noLocal: DietInput = { ...DEFAULT_DIET, localFoodRatio: 0 };
    const allLocal: DietInput = { ...DEFAULT_DIET, localFoodRatio: 1.0 };
    expect(calculateDietEmissions(allLocal)).toBeLessThan(calculateDietEmissions(noLocal));
  });

  it('very high waste increases emissions vs average', () => {
    const average: DietInput = { ...DEFAULT_DIET, wasteFrequency: 'average' };
    const highWaste: DietInput = { ...DEFAULT_DIET, wasteFrequency: 'very_high' };
    expect(calculateDietEmissions(highWaste)).toBeGreaterThan(calculateDietEmissions(average));
  });

  it('returns positive value for vegan with composting (no negative)', () => {
    const input: DietInput = { profile: 'vegan', wasteFrequency: 'very_low', localFoodRatio: 1.0, composting: true };
    expect(calculateDietEmissions(input)).toBeGreaterThanOrEqual(0);
  });
});

// ─── Consumption Calculator Tests ─────────────────────────────────────────────

describe('calculateConsumptionEmissions', () => {
  it('returns 0 for zero spending', () => {
    const input: ConsumptionInput = {
      monthlyClothingSpend: 0,
      monthlyElectronicsSpend: 0,
      monthlyOtherGoodsSpend: 0,
      recyclingHabit: 'all',
      buySecondHand: true,
      repairFirst: true,
    };
    expect(calculateConsumptionEmissions(input)).toBe(0);
  });

  it('second-hand buying reduces clothing emissions', () => {
    const newClothes: ConsumptionInput = { ...DEFAULT_CONSUMPTION, buySecondHand: false };
    const secondHand: ConsumptionInput = { ...DEFAULT_CONSUMPTION, buySecondHand: true };
    expect(calculateConsumptionEmissions(secondHand)).toBeLessThan(calculateConsumptionEmissions(newClothes));
  });

  it('repair-first reduces electronics emissions', () => {
    const noRepair: ConsumptionInput = { ...DEFAULT_CONSUMPTION, repairFirst: false };
    const repair: ConsumptionInput = { ...DEFAULT_CONSUMPTION, repairFirst: true };
    expect(calculateConsumptionEmissions(repair)).toBeLessThan(calculateConsumptionEmissions(noRepair));
  });

  it('recycling all reduces emissions vs none', () => {
    const noRecycling: ConsumptionInput = { ...DEFAULT_CONSUMPTION, recyclingHabit: 'none' };
    const allRecycling: ConsumptionInput = { ...DEFAULT_CONSUMPTION, recyclingHabit: 'all' };
    expect(calculateConsumptionEmissions(allRecycling)).toBeLessThan(calculateConsumptionEmissions(noRecycling));
  });

  it('does not return negative values', () => {
    const input: ConsumptionInput = {
      monthlyClothingSpend: 1,
      monthlyElectronicsSpend: 1,
      monthlyOtherGoodsSpend: 1,
      recyclingHabit: 'all',
      buySecondHand: true,
      repairFirst: true,
    };
    expect(calculateConsumptionEmissions(input)).toBeGreaterThanOrEqual(0);
  });
});

// ─── Combined Calculation Tests ───────────────────────────────────────────────

describe('calculateFullEmissions', () => {
  it('total equals sum of all categories', () => {
    const result = calculateFullEmissions(DEFAULT_TRANSPORT, DEFAULT_ENERGY, DEFAULT_DIET, DEFAULT_CONSUMPTION);
    const sum = result.breakdown.transport + result.breakdown.energy + result.breakdown.diet + result.breakdown.consumption;
    expect(result.totalAnnual).toBeCloseTo(sum, 1);
  });

  it('monthly is annual divided by 12', () => {
    const result = calculateFullEmissions(DEFAULT_TRANSPORT, DEFAULT_ENERGY, DEFAULT_DIET, DEFAULT_CONSUMPTION);
    expect(result.totalMonthly).toBeCloseTo(result.totalAnnual / 12, 1);
  });

  it('parisAlignmentRatio is correct', () => {
    const result = calculateFullEmissions(DEFAULT_TRANSPORT, DEFAULT_ENERGY, DEFAULT_DIET, DEFAULT_CONSUMPTION);
    expect(result.parisAlignmentRatio).toBeCloseTo(result.totalAnnual / 2000, 2);
  });

  it('returns a positive total for default inputs', () => {
    const result = calculateFullEmissions(DEFAULT_TRANSPORT, DEFAULT_ENERGY, DEFAULT_DIET, DEFAULT_CONSUMPTION);
    expect(result.totalAnnual).toBeGreaterThan(0);
  });
});

// ─── What-If Forecast Tests ───────────────────────────────────────────────────

describe('generateWhatIfForecast', () => {
  const mockRec = {
    id: 'test-rec',
    title: 'Test Action',
    description: 'Test',
    category: 'transport' as const,
    weeklyImpactKg: 10,
    annualImpactKg: 520,
    costLevel: 'free' as const,
    timeCommitment: 'immediate' as const,
    emoji: '🚲',
    actionLabel: 'Do it',
  };

  it('generates 53 forecast points (week 0 to 52)', () => {
    const scenario = generateWhatIfForecast(10000, [mockRec]);
    expect(scenario.forecastPoints).toHaveLength(53);
  });

  it('optimized is always <= baseline', () => {
    const scenario = generateWhatIfForecast(10000, [mockRec]);
    scenario.forecastPoints.forEach((point) => {
      expect(point.optimizedKgCO2e).toBeLessThanOrEqual(point.baselineKgCO2e);
    });
  });

  it('no active recommendations means no savings', () => {
    const scenario = generateWhatIfForecast(10000, []);
    expect(scenario.totalAnnualSavingsKg).toBe(0);
    expect(scenario.percentageReduction).toBe(0);
  });

  it('returns correct annual savings', () => {
    const scenario = generateWhatIfForecast(10000, [mockRec]);
    expect(scenario.totalAnnualSavingsKg).toBeCloseTo(10 * 52, 0);
  });
});

// ─── Format Utilities Tests ───────────────────────────────────────────────────

describe('formatEmissions', () => {
  it('formats kg correctly', () => {
    expect(formatEmissions(2340, 'kg')).toBe('2,340 kg');
  });

  it('formats tonnes correctly', () => {
    expect(formatEmissions(2340, 'tonnes')).toBe('2.3 t');
  });
});

describe('getAlignmentLabel', () => {
  it('returns Excellent for < 0.5 ratio', () => {
    expect(getAlignmentLabel(0.4).label).toBe('Excellent');
  });
  it('returns Good for 0.5–1.0 ratio', () => {
    expect(getAlignmentLabel(0.8).label).toBe('Good');
  });
  it('returns Critical for very high ratio', () => {
    expect(getAlignmentLabel(5.0).label).toBe('Critical');
  });
});
