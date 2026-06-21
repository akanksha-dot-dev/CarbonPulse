/**
 * EcoTrack User Profile Store (Zustand)
 *
 * Manages user profile, achievements, and sync state.
 * Persists to localStorage for guest mode.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserProfile, Achievement } from '@/types/carbon';

// ─── Achievement Definitions ──────────────────────────────────────────────────

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-calculation',
    title: 'First Steps',
    description: 'Complete your first carbon footprint calculation.',
    emoji: '🌱',
    tier: 'bronze',
    isUnlocked: false,
    progressPercent: 0,
  },
  {
    id: 'below-national',
    title: 'Below Average',
    description: 'Achieve a footprint below the national average.',
    emoji: '📉',
    tier: 'silver',
    isUnlocked: false,
    progressPercent: 0,
  },
  {
    id: 'paris-aligned',
    title: 'Paris Aligned',
    description: 'Reach the Paris Agreement 2-tonne target.',
    emoji: '🌍',
    tier: 'gold',
    isUnlocked: false,
    progressPercent: 0,
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Log your emissions every day for 7 days.',
    emoji: '🔥',
    tier: 'bronze',
    isUnlocked: false,
    progressPercent: 0,
  },
  {
    id: 'streak-30',
    title: 'Month Champion',
    description: 'Log your emissions every day for 30 days.',
    emoji: '🏆',
    tier: 'gold',
    isUnlocked: false,
    progressPercent: 0,
  },
  {
    id: 'five-actions',
    title: 'Action Hero',
    description: 'Activate 5 or more recommendations simultaneously.',
    emoji: '⚡',
    tier: 'silver',
    isUnlocked: false,
    progressPercent: 0,
  },
  {
    id: 'transport-zero',
    title: 'Green Commuter',
    description: 'Log a week with zero car transport emissions.',
    emoji: '🚲',
    tier: 'silver',
    isUnlocked: false,
    progressPercent: 0,
  },
  {
    id: 'net-zero',
    title: 'Net Zero Pioneer',
    description: 'Reach a net offset balance of zero or better.',
    emoji: '🌟',
    tier: 'platinum',
    isUnlocked: false,
    progressPercent: 0,
  },
];

// ─── Store State ──────────────────────────────────────────────────────────────

interface UserState {
  profile: UserProfile | null;
  achievements: Achievement[];
  loginStreak: number;
  lastLoginDate: string | null;
  isSyncing: boolean;
  syncError: string | null;

  // Actions
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
  unlockAchievement: (id: string) => void;
  updateAchievementProgress: (id: string, percent: number) => void;
  checkAndUnlockAchievements: (params: {
    totalAnnualKg: number;
    activeRecCount: number;
  }) => void;
  incrementLoginStreak: () => void;
  setSyncing: (syncing: boolean) => void;
  setSyncError: (error: string | null) => void;
}

// ─── Guest Profile Factory ────────────────────────────────────────────────────

export function createGuestProfile(): UserProfile {
  return {
    uid: `guest_${Date.now()}`,
    displayName: 'Guest User',
    email: '',
    country: 'US',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    isGoogleAuth: false,
    isGuest: true,
  };
}

// ─── Store Definition ─────────────────────────────────────────────────────────

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      achievements: ALL_ACHIEVEMENTS,
      loginStreak: 0,
      lastLoginDate: null,
      isSyncing: false,
      syncError: null,

      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),

      unlockAchievement: (id) =>
        set((s) => ({
          achievements: s.achievements.map((a) =>
            a.id === id
              ? { ...a, isUnlocked: true, progressPercent: 100, unlockedAt: new Date().toISOString() }
              : a,
          ),
        })),

      updateAchievementProgress: (id, percent) =>
        set((s) => ({
          achievements: s.achievements.map((a) =>
            a.id === id && !a.isUnlocked
              ? { ...a, progressPercent: Math.min(100, Math.max(0, percent)) }
              : a,
          ),
        })),

      checkAndUnlockAchievements: ({ totalAnnualKg, activeRecCount }) => {
        const { achievements, unlockAchievement, updateAchievementProgress } = get();

        // First calculation
        if (!achievements.find((a) => a.id === 'first-calculation')?.isUnlocked) {
          unlockAchievement('first-calculation');
        }

        // Below national average (14,000 kg)
        if (totalAnnualKg < 14_000) {
          unlockAchievement('below-national');
        } else {
          updateAchievementProgress('below-national', (1 - totalAnnualKg / 14_000) * 100 + 100);
        }

        // Paris aligned (2,000 kg)
        const parisProgress = Math.max(0, (1 - totalAnnualKg / 14_000) * 100);
        updateAchievementProgress('paris-aligned', parisProgress);
        if (totalAnnualKg <= 2_000) {
          unlockAchievement('paris-aligned');
        }

        // Net zero
        if (totalAnnualKg <= 0) {
          unlockAchievement('net-zero');
        }

        // 5 active actions
        if (activeRecCount >= 5) {
          unlockAchievement('five-actions');
        } else {
          updateAchievementProgress('five-actions', (activeRecCount / 5) * 100);
        }
      },

      incrementLoginStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const { lastLoginDate, loginStreak } = get();
        if (lastLoginDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const newStreak = lastLoginDate === yesterdayStr ? loginStreak + 1 : 1;
        set({ loginStreak: newStreak, lastLoginDate: today });

        if (newStreak >= 7) get().unlockAchievement('streak-7');
        if (newStreak >= 30) get().unlockAchievement('streak-30');
      },

      setSyncing: (syncing) => set({ isSyncing: syncing }),
      setSyncError: (error) => set({ syncError: error }),
    }),
    {
      name: 'ecotrack-user-data',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
