/**
 * EcoTrack Carbon Data Store (Zustand)
 *
 * Manages all carbon input data, derived calculations, and historical log.
 * Persists to localStorage for guest mode.
 * Debounces calculation triggers to 200ms.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  TransportInput,
  EnergyInput,
  DietInput,
  ConsumptionInput,
  EmissionResult,
  HistoricalDataPoint,
} from '@/types/carbon';
import { calculateFullEmissions } from '@/lib/carbonEngine';

// ─── Default Input Values ─────────────────────────────────────────────────────

export const DEFAULT_TRANSPORT: TransportInput = {
  mode: 'ice',
  dailyDistanceKm: 30,
  daysPerWeek: 5,
  shortHaulFlightsPerYear: 2,
  longHaulFlightsPerYear: 1,
  fuelEfficiencyL100km: 8,
  evConsumptionKwh100km: 18,
  evGreenEnergyRatio: 0,
};

export const DEFAULT_ENERGY: EnergyInput = {
  monthlyElectricityKwh: 400,
  greenEnergyRatio: 0,
  monthlyNaturalGasM3: 30,
  monthlyHeatingOilL: 0,
  householdSize: 2,
  hasSolar: false,
  solarOffsetKwh: 0,
};

export const DEFAULT_DIET: DietInput = {
  profile: 'omnivore',
  wasteFrequency: 'average',
  localFoodRatio: 0.2,
  composting: false,
};

export const DEFAULT_CONSUMPTION: ConsumptionInput = {
  monthlyClothingSpend: 100,
  monthlyElectronicsSpend: 50,
  monthlyOtherGoodsSpend: 150,
  recyclingHabit: 'partial',
  buySecondHand: false,
  repairFirst: false,
};

// ─── Store State & Actions ────────────────────────────────────────────────────

interface CarbonState {
  transport: TransportInput;
  energy: EnergyInput;
  diet: DietInput;
  consumption: ConsumptionInput;
  result: EmissionResult;
  historicalLog: HistoricalDataPoint[];
  lastCalculatedAt: string | null;

  // Actions
  updateTransport: (partial: Partial<TransportInput>) => void;
  updateEnergy: (partial: Partial<EnergyInput>) => void;
  updateDiet: (partial: Partial<DietInput>) => void;
  updateConsumption: (partial: Partial<ConsumptionInput>) => void;
  recalculate: () => void;
  logCurrentSnapshot: () => void;
  resetToDefaults: () => void;
}

// ─── Debounce Map ─────────────────────────────────────────────────────────────

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedRecalc(recalcFn: () => void, ms = 200) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(recalcFn, ms);
}

// ─── Initial Calculation ──────────────────────────────────────────────────────

const initialResult = calculateFullEmissions(
  DEFAULT_TRANSPORT,
  DEFAULT_ENERGY,
  DEFAULT_DIET,
  DEFAULT_CONSUMPTION,
);

// ─── Store Definition ─────────────────────────────────────────────────────────

export const useCarbonStore = create<CarbonState>()(
  persist(
    (set, get) => ({
      transport: DEFAULT_TRANSPORT,
      energy: DEFAULT_ENERGY,
      diet: DEFAULT_DIET,
      consumption: DEFAULT_CONSUMPTION,
      result: initialResult,
      historicalLog: [],
      lastCalculatedAt: null,

      updateTransport: (partial) => {
        set((state) => ({
          transport: { ...state.transport, ...partial },
        }));
        debouncedRecalc(get().recalculate);
      },

      updateEnergy: (partial) => {
        set((state) => ({
          energy: { ...state.energy, ...partial },
        }));
        debouncedRecalc(get().recalculate);
      },

      updateDiet: (partial) => {
        set((state) => ({
          diet: { ...state.diet, ...partial },
        }));
        debouncedRecalc(get().recalculate);
      },

      updateConsumption: (partial) => {
        set((state) => ({
          consumption: { ...state.consumption, ...partial },
        }));
        debouncedRecalc(get().recalculate);
      },

      recalculate: () => {
        const { transport, energy, diet, consumption } = get();
        const result = calculateFullEmissions(transport, energy, diet, consumption);
        set({ result, lastCalculatedAt: new Date().toISOString() });
      },

      logCurrentSnapshot: () => {
        const { result } = get();
        const entry: HistoricalDataPoint = {
          date: new Date().toISOString().split('T')[0],
          totalKgCO2e: result.totalAnnual,
          breakdown: result.breakdown,
        };
        set((state) => ({
          historicalLog: [
            ...state.historicalLog.filter((p) => p.date !== entry.date),
            entry,
          ].sort((a, b) => a.date.localeCompare(b.date)),
        }));
      },

      resetToDefaults: () => {
        set({
          transport: DEFAULT_TRANSPORT,
          energy: DEFAULT_ENERGY,
          diet: DEFAULT_DIET,
          consumption: DEFAULT_CONSUMPTION,
          result: initialResult,
        });
      },
    }),
    {
      name: 'ecotrack-carbon-data',
      storage: createJSONStorage(() => localStorage),
      // Only persist inputs and log, not derived result
      partialize: (state) => ({
        transport: state.transport,
        energy: state.energy,
        diet: state.diet,
        consumption: state.consumption,
        historicalLog: state.historicalLog,
      }),
    },
  ),
);

// ─── Convenience Selectors ────────────────────────────────────────────────────

export const useTotalEmissions = () => useCarbonStore((s) => s.result.totalAnnual);
export const useCategoryBreakdown = () => useCarbonStore((s) => s.result.breakdown);
export const useEmissionResult = () => useCarbonStore((s) => s.result);
export const useHistoricalLog = () => useCarbonStore((s) => s.historicalLog);
