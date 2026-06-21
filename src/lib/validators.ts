/**
 * EcoTrack Input Validators
 *
 * Zod schemas for all user inputs with XSS sanitization helpers.
 * Used by react-hook-form resolvers and manual validation.
 */

import { z } from 'zod';

// ─── XSS Sanitization ─────────────────────────────────────────────────────────

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escape HTML special characters to prevent XSS injection.
 */
export function sanitizeString(input: string): string {
  return String(input).replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] ?? char);
}

/**
 * Sanitize and clamp a numeric input.
 */
export function sanitizeNumber(value: unknown, min = 0, max = 1_000_000): number {
  const num = Number(value);
  if (!isFinite(num) || isNaN(num)) return 0;
  return Math.max(min, Math.min(max, num));
}

/**
 * Strip any non-numeric characters from a string (allows decimal point and minus).
 */
export function stripNonNumeric(value: string): string {
  return value.replace(/[^0-9.-]/g, '');
}

// ─── Shared Field Schemas ─────────────────────────────────────────────────────

const positiveNumber = (max: number, label: string) =>
  z
    .number({ invalid_type_error: `${label} must be a number` })
    .min(0, `${label} cannot be negative`)
    .max(max, `${label} exceeds maximum allowed value`);

const ratioField = (label: string) =>
  z
    .number({ invalid_type_error: `${label} must be a number` })
    .min(0, `${label} must be at least 0`)
    .max(1, `${label} must be at most 1 (100%)`);

// ─── Transport Schema ─────────────────────────────────────────────────────────

export const transportSchema = z.object({
  mode: z.enum(['ev', 'ice', 'hybrid', 'transit', 'bicycle', 'aviation'], {
    errorMap: () => ({ message: 'Please select a valid transport mode' }),
  }),
  dailyDistanceKm: positiveNumber(2000, 'Daily distance'),
  daysPerWeek: positiveNumber(7, 'Days per week').int('Must be a whole number'),
  shortHaulFlightsPerYear: positiveNumber(100, 'Short-haul flights'),
  longHaulFlightsPerYear: positiveNumber(50, 'Long-haul flights'),
  fuelEfficiencyL100km: positiveNumber(50, 'Fuel efficiency').optional(),
  evConsumptionKwh100km: positiveNumber(100, 'EV consumption').optional(),
  evGreenEnergyRatio: ratioField('Green energy ratio').optional(),
});

export type TransportFormData = z.infer<typeof transportSchema>;

// ─── Energy Schema ────────────────────────────────────────────────────────────

export const energySchema = z.object({
  monthlyElectricityKwh: positiveNumber(10_000, 'Monthly electricity'),
  greenEnergyRatio: ratioField('Green energy ratio'),
  monthlyNaturalGasM3: positiveNumber(1000, 'Natural gas'),
  monthlyHeatingOilL: positiveNumber(2000, 'Heating oil'),
  householdSize: positiveNumber(20, 'Household size')
    .int('Must be a whole number')
    .min(1, 'Household must have at least 1 person'),
  hasSolar: z.boolean(),
  solarOffsetKwh: positiveNumber(5000, 'Solar offset'),
});

export type EnergyFormData = z.infer<typeof energySchema>;

// ─── Diet Schema ──────────────────────────────────────────────────────────────

export const dietSchema = z.object({
  profile: z.enum(['vegan', 'vegetarian', 'pescatarian', 'omnivore', 'high_meat'], {
    errorMap: () => ({ message: 'Please select a valid diet profile' }),
  }),
  wasteFrequency: z.enum(['very_low', 'low', 'average', 'high', 'very_high'], {
    errorMap: () => ({ message: 'Please select a valid waste frequency' }),
  }),
  localFoodRatio: ratioField('Local food ratio'),
  composting: z.boolean(),
});

export type DietFormData = z.infer<typeof dietSchema>;

// ─── Consumption Schema ───────────────────────────────────────────────────────

export const consumptionSchema = z.object({
  monthlyClothingSpend: positiveNumber(50_000, 'Clothing spend'),
  monthlyElectronicsSpend: positiveNumber(50_000, 'Electronics spend'),
  monthlyOtherGoodsSpend: positiveNumber(50_000, 'Other goods spend'),
  recyclingHabit: z.enum(['none', 'partial', 'most', 'all'], {
    errorMap: () => ({ message: 'Please select a valid recycling habit' }),
  }),
  buySecondHand: z.boolean(),
  repairFirst: z.boolean(),
});

export type ConsumptionFormData = z.infer<typeof consumptionSchema>;

// ─── Combined Profile Schema ──────────────────────────────────────────────────

export const fullProfileSchema = z.object({
  transport: transportSchema,
  energy: energySchema,
  diet: dietSchema,
  consumption: consumptionSchema,
});

export type FullProfileFormData = z.infer<typeof fullProfileSchema>;

// ─── Address / Location Schema ────────────────────────────────────────────────

export const locationSchema = z.object({
  origin: z
    .string()
    .min(3, 'Origin address is too short')
    .max(200, 'Address is too long')
    .transform((val) => sanitizeString(val.trim())),
  destination: z
    .string()
    .min(3, 'Destination address is too short')
    .max(200, 'Address is too long')
    .transform((val) => sanitizeString(val.trim())),
});

export type LocationFormData = z.infer<typeof locationSchema>;

// ─── Runtime Validation Helpers ───────────────────────────────────────────────

/**
 * Validate transport input at runtime (for Zustand store updates).
 * Returns sanitized data or null if invalid.
 */
export function validateTransportInput(data: unknown): TransportFormData | null {
  const result = transportSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Validate energy input at runtime.
 */
export function validateEnergyInput(data: unknown): EnergyFormData | null {
  const result = energySchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Validate diet input at runtime.
 */
export function validateDietInput(data: unknown): DietFormData | null {
  const result = dietSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Validate consumption input at runtime.
 */
export function validateConsumptionInput(data: unknown): ConsumptionFormData | null {
  const result = consumptionSchema.safeParse(data);
  return result.success ? result.data : null;
}
