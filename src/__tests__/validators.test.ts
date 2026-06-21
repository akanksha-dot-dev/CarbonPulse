/**
 * Validator Tests
 *
 * Tests Zod schemas for all four input domains.
 * Validates XSS rejection, boundary values, and type coercion.
 */

import {
  transportSchema,
  energySchema,
  dietSchema,
  consumptionSchema,
  sanitizeString,
  sanitizeNumber,
  stripNonNumeric,
} from '@/lib/validators';

// ─── XSS Sanitization Tests ───────────────────────────────────────────────────

describe('sanitizeString', () => {
  it('escapes < and > characters', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toContain('&lt;');
    expect(sanitizeString('<script>alert("xss")</script>')).toContain('&gt;');
    expect(sanitizeString('<script>alert("xss")</script>')).not.toContain('<script>');
  });

  it('escapes ampersands', () => {
    expect(sanitizeString('AT&T')).toBe('AT&amp;T');
  });

  it('escapes double quotes', () => {
    expect(sanitizeString('"hello"')).toContain('&quot;');
  });

  it('escapes single quotes', () => {
    expect(sanitizeString("it's")).toContain('&#x27;');
  });

  it('passes through normal alphanumeric strings', () => {
    expect(sanitizeString('Hello World 123')).toBe('Hello World 123');
  });

  it('handles empty string', () => {
    expect(sanitizeString('')).toBe('');
  });

  it('rejects XSS event attribute injection', () => {
    const xss = 'onclick=alert(1)';
    const sanitized = sanitizeString(xss);
    expect(sanitized).not.toContain('onclick=alert');
    // Note: = is not in our entity map, but < > " ' / are
  });

  it('handles typical addresses safely', () => {
    const address = '123 Main St, New York, NY 10001';
    expect(sanitizeString(address)).toBe(address);
  });
});

describe('sanitizeNumber', () => {
  it('returns 0 for NaN', () => {
    expect(sanitizeNumber(NaN)).toBe(0);
  });

  it('returns 0 for undefined', () => {
    expect(sanitizeNumber(undefined)).toBe(0);
  });

  it('clamps to min when below', () => {
    expect(sanitizeNumber(-100, 0, 100)).toBe(0);
  });

  it('clamps to max when above', () => {
    expect(sanitizeNumber(999, 0, 100)).toBe(100);
  });

  it('returns the value unchanged when within range', () => {
    expect(sanitizeNumber(50, 0, 100)).toBe(50);
  });

  it('converts string numbers', () => {
    expect(sanitizeNumber('42')).toBe(42);
  });
});

describe('stripNonNumeric', () => {
  it('removes letters', () => {
    expect(stripNonNumeric('abc123def')).toBe('123');
  });

  it('allows decimal point', () => {
    expect(stripNonNumeric('3.14')).toBe('3.14');
  });

  it('allows minus sign', () => {
    expect(stripNonNumeric('-5')).toBe('-5');
  });
});

// ─── Transport Schema Tests ───────────────────────────────────────────────────

describe('transportSchema', () => {
  const validTransport = {
    mode: 'ice' as const,
    dailyDistanceKm: 20,
    daysPerWeek: 5,
    shortHaulFlightsPerYear: 2,
    longHaulFlightsPerYear: 1,
    fuelEfficiencyL100km: 8,
    evConsumptionKwh100km: 18,
    evGreenEnergyRatio: 0,
  };

  it('accepts valid transport input', () => {
    expect(transportSchema.safeParse(validTransport).success).toBe(true);
  });

  it('rejects invalid transport mode', () => {
    const invalid = { ...validTransport, mode: 'horse' };
    expect(transportSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects negative daily distance', () => {
    const invalid = { ...validTransport, dailyDistanceKm: -10 };
    expect(transportSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects days per week > 7', () => {
    const invalid = { ...validTransport, daysPerWeek: 8 };
    expect(transportSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects distance > 2000', () => {
    const invalid = { ...validTransport, dailyDistanceKm: 3000 };
    expect(transportSchema.safeParse(invalid).success).toBe(false);
  });

  it('accepts zero values', () => {
    const zero = { ...validTransport, dailyDistanceKm: 0, daysPerWeek: 0 };
    expect(transportSchema.safeParse(zero).success).toBe(true);
  });
});

// ─── Energy Schema Tests ──────────────────────────────────────────────────────

describe('energySchema', () => {
  const validEnergy = {
    monthlyElectricityKwh: 400,
    greenEnergyRatio: 0.3,
    monthlyNaturalGasM3: 30,
    monthlyHeatingOilL: 0,
    householdSize: 2,
    hasSolar: false,
    solarOffsetKwh: 0,
  };

  it('accepts valid energy input', () => {
    expect(energySchema.safeParse(validEnergy).success).toBe(true);
  });

  it('rejects greenEnergyRatio > 1', () => {
    const invalid = { ...validEnergy, greenEnergyRatio: 1.5 };
    expect(energySchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects greenEnergyRatio < 0', () => {
    const invalid = { ...validEnergy, greenEnergyRatio: -0.1 };
    expect(energySchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects householdSize < 1', () => {
    const invalid = { ...validEnergy, householdSize: 0 };
    expect(energySchema.safeParse(invalid).success).toBe(false);
  });
});

// ─── Diet Schema Tests ────────────────────────────────────────────────────────

describe('dietSchema', () => {
  const validDiet = {
    profile: 'omnivore' as const,
    wasteFrequency: 'average' as const,
    localFoodRatio: 0.3,
    composting: false,
  };

  it('accepts valid diet input', () => {
    expect(dietSchema.safeParse(validDiet).success).toBe(true);
  });

  it('rejects invalid diet profile', () => {
    const invalid = { ...validDiet, profile: 'carnivore' };
    expect(dietSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects localFoodRatio > 1', () => {
    const invalid = { ...validDiet, localFoodRatio: 1.5 };
    expect(dietSchema.safeParse(invalid).success).toBe(false);
  });

  it('accepts all valid diet profiles', () => {
    const profiles = ['vegan', 'vegetarian', 'pescatarian', 'omnivore', 'high_meat'] as const;
    profiles.forEach((profile) => {
      expect(dietSchema.safeParse({ ...validDiet, profile }).success).toBe(true);
    });
  });
});

// ─── Consumption Schema Tests ─────────────────────────────────────────────────

describe('consumptionSchema', () => {
  const validConsumption = {
    monthlyClothingSpend: 100,
    monthlyElectronicsSpend: 50,
    monthlyOtherGoodsSpend: 150,
    recyclingHabit: 'partial' as const,
    buySecondHand: false,
    repairFirst: false,
  };

  it('accepts valid consumption input', () => {
    expect(consumptionSchema.safeParse(validConsumption).success).toBe(true);
  });

  it('rejects negative spending', () => {
    const invalid = { ...validConsumption, monthlyClothingSpend: -10 };
    expect(consumptionSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects invalid recycling habit', () => {
    const invalid = { ...validConsumption, recyclingHabit: 'sometimes' };
    expect(consumptionSchema.safeParse(invalid).success).toBe(false);
  });

  it('accepts zero spending', () => {
    const zero = { ...validConsumption, monthlyClothingSpend: 0, monthlyElectronicsSpend: 0 };
    expect(consumptionSchema.safeParse(zero).success).toBe(true);
  });
});
