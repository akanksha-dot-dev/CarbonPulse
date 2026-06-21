/**
 * EcoTrack UI State Store (Zustand)
 *
 * Manages wizard step, active tabs, modal visibility, and recommendation filters.
 */

import { create } from 'zustand';
import type { RecommendationFilters, EmissionCategory, CostLevel, TimeCommitment } from '@/types/carbon';
import { DEFAULT_FILTERS } from '@/lib/recommendations';

export type WizardStep = 1 | 2 | 3 | 4;
export type DashboardTab = 'overview' | 'breakdown' | 'history' | 'benchmarks';
export type TimeRange = 'week' | 'month' | '3months' | 'year' | 'all';

interface UIState {
  // Wizard
  wizardStep: WizardStep;
  wizardCompleted: boolean;
  setWizardStep: (step: WizardStep) => void;
  nextWizardStep: () => void;
  prevWizardStep: () => void;
  completeWizard: () => void;

  // Dashboard
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  selectedTimeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;

  // Modals
  isSettingsOpen: boolean;
  isShareOpen: boolean;
  isResetConfirmOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  openShare: () => void;
  closeShare: () => void;
  openResetConfirm: () => void;
  closeResetConfirm: () => void;

  // Recommendation Filters
  recFilters: RecommendationFilters;
  setRecFilter: <K extends keyof RecommendationFilters>(
    key: K,
    value: RecommendationFilters[K],
  ) => void;
  toggleRecCategory: (category: EmissionCategory) => void;
  toggleCostLevel: (level: CostLevel) => void;
  toggleTimeCommitment: (commitment: TimeCommitment) => void;
  resetFilters: () => void;

  // What-If Sandbox
  activeSandboxRecIds: string[];
  toggleSandboxRec: (id: string) => void;
  clearSandboxRecs: () => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>()((set, get) => ({
  // Wizard
  wizardStep: 1,
  wizardCompleted: false,
  setWizardStep: (step) => set({ wizardStep: step }),
  nextWizardStep: () =>
    set((s) => ({
      wizardStep: Math.min(4, s.wizardStep + 1) as WizardStep,
    })),
  prevWizardStep: () =>
    set((s) => ({
      wizardStep: Math.max(1, s.wizardStep - 1) as WizardStep,
    })),
  completeWizard: () => set({ wizardCompleted: true }),

  // Dashboard
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
  selectedTimeRange: 'month',
  setTimeRange: (range) => set({ selectedTimeRange: range }),

  // Modals
  isSettingsOpen: false,
  isShareOpen: false,
  isResetConfirmOpen: false,
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  openShare: () => set({ isShareOpen: true }),
  closeShare: () => set({ isShareOpen: false }),
  openResetConfirm: () => set({ isResetConfirmOpen: true }),
  closeResetConfirm: () => set({ isResetConfirmOpen: false }),

  // Recommendation Filters
  recFilters: DEFAULT_FILTERS,
  setRecFilter: (key, value) =>
    set((s) => ({ recFilters: { ...s.recFilters, [key]: value } })),
  toggleRecCategory: (category) =>
    set((s) => {
      const cats = s.recFilters.categories;
      return {
        recFilters: {
          ...s.recFilters,
          categories: cats.includes(category)
            ? cats.filter((c) => c !== category)
            : [...cats, category],
        },
      };
    }),
  toggleCostLevel: (level) =>
    set((s) => {
      const levels = s.recFilters.costLevels;
      return {
        recFilters: {
          ...s.recFilters,
          costLevels: levels.includes(level)
            ? levels.filter((l) => l !== level)
            : [...levels, level],
        },
      };
    }),
  toggleTimeCommitment: (commitment) =>
    set((s) => {
      const tc = s.recFilters.timeCommitments;
      return {
        recFilters: {
          ...s.recFilters,
          timeCommitments: tc.includes(commitment)
            ? tc.filter((t) => t !== commitment)
            : [...tc, commitment],
        },
      };
    }),
  resetFilters: () => set({ recFilters: DEFAULT_FILTERS }),

  // What-If Sandbox
  activeSandboxRecIds: [],
  toggleSandboxRec: (id) =>
    set((s) => ({
      activeSandboxRecIds: s.activeSandboxRecIds.includes(id)
        ? s.activeSandboxRecIds.filter((r) => r !== id)
        : [...s.activeSandboxRecIds, id],
    })),
  clearSandboxRecs: () => set({ activeSandboxRecIds: [] }),

  // Theme
  isDarkMode: true,
  toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
}));
