/**
 * EcoTrack Emission Factors
 * Sources: EPA Greenhouse Gas Equivalencies Calculator,
 *          GHG Protocol Corporate Standard,
 *          IPCC AR6 Working Group III
 *
 * All values in kgCO2e per unit unless noted
 */

// ─── Transport Factors ────────────────────────────────────────────────────────

export const TRANSPORT_FACTORS = {
  /** kg CO2e per km */
  ev: 0.053,            // US average grid (0.386 kgCO2e/kWh × ~0.14 kWh/km efficiency)
  ice: 0.192,           // Average petrol car, 8L/100km
  hybrid: 0.108,        // Average hybrid car
  transit: 0.089,       // Bus/metro average (EPA)
  bicycle: 0.0,         // Zero direct emissions
  aviation_short: 0.255, // Short-haul per km (< 1500km)
  aviation_long: 0.195,  // Long-haul per km (>= 1500km)
} as const;

/** Average short-haul flight distance in km */
export const AVG_SHORT_HAUL_KM = 800;
/** Average long-haul flight distance in km */
export const AVG_LONG_HAUL_KM = 6500;

/** kgCO2e per litre of petrol burned */
export const PETROL_KG_CO2E_PER_LITRE = 2.31;
/** kgCO2e per kWh (US average grid 2023) */
export const GRID_INTENSITY_KWH = 0.386;
/** kgCO2e per kWh (100% renewable) */
export const GREEN_GRID_INTENSITY_KWH = 0.02;

// ─── Energy Factors ───────────────────────────────────────────────────────────

export const ENERGY_FACTORS = {
  /** kg CO2e per kWh (US grid average) */
  electricityGrid: 0.386,
  /** kg CO2e per kWh (100% renewables) */
  electricityGreen: 0.02,
  /** kg CO2e per m³ of natural gas */
  naturalGasM3: 2.204,
  /** kg CO2e per litre of heating oil */
  heatingOilLitre: 2.68,
  /** kg CO2e per litre of propane */
  propaneLitre: 1.51,
} as const;

// ─── Diet Factors ─────────────────────────────────────────────────────────────

export const DIET_FACTORS = {
  /** kg CO2e per day per person */
  vegan: 1.5,
  vegetarian: 1.7,
  pescatarian: 2.0,
  omnivore: 2.5,
  high_meat: 3.3,
} as const;

/** Food waste multiplier by frequency */
export const FOOD_WASTE_MULTIPLIERS = {
  very_low: 0.92,  // 8% reduction
  low: 0.96,
  average: 1.0,
  high: 1.10,
  very_high: 1.20,
} as const;

/** Local food sourcing carbon discount (max 15% if 100% local) */
export const LOCAL_FOOD_MAX_DISCOUNT = 0.15;

/** Composting offset in kgCO2e/year */
export const COMPOSTING_ANNUAL_OFFSET_KG = 95;

// ─── Consumption Factors ──────────────────────────────────────────────────────

/**
 * kg CO2e per USD spent
 * Based on Carnegie Mellon's Economic Input-Output LCA model
 */
export const CONSUMPTION_FACTORS = {
  /** kg CO2e per USD on new clothing */
  clothing: 0.028,
  /** kg CO2e per USD on electronics */
  electronics: 0.035,
  /** kg CO2e per USD on general goods */
  otherGoods: 0.021,
} as const;

/** Recycling habit multipliers (emissions reduction %) */
export const RECYCLING_MULTIPLIERS = {
  none: 1.0,
  partial: 0.92,
  most: 0.83,
  all: 0.72,
} as const;

/** Second-hand purchasing discount on consumption emissions */
export const SECOND_HAND_DISCOUNT = 0.40; // 40% reduction

/** Repair-first discount on electronics/goods emissions */
export const REPAIR_FIRST_DISCOUNT = 0.20; // 20% reduction

// ─── Benchmark Targets ────────────────────────────────────────────────────────

/** US national average per capita kgCO2e/year (EPA 2023) */
export const US_NATIONAL_AVERAGE_KG = 14_000;

/** Global average per capita kgCO2e/year (IPCC 2023) */
export const GLOBAL_AVERAGE_KG = 7_000;

/** Paris Agreement 2°C compatible target by 2030 (kgCO2e/year per capita) */
export const PARIS_2030_TARGET_KG = 2_000;

/** Paris Agreement 1.5°C stretch target (kgCO2e/year per capita) */
export const PARIS_15_TARGET_KG = 1_000;

// ─── Days/Weeks/Year Constants ────────────────────────────────────────────────

export const DAYS_PER_YEAR = 365;
export const WEEKS_PER_YEAR = 52;
export const MONTHS_PER_YEAR = 12;
