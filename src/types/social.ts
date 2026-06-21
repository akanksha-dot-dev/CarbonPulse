/**
 * EcoTrack Social & Gamification Types
 * Covers leagues, challenges, leaderboards, Eco-Token economy.
 */

// ─── Leagues ──────────────────────────────────────────────────────────────────

export type LeagueType = 'friends' | 'neighborhood' | 'corporate' | 'public';
export type LeagueStatus = 'active' | 'completed' | 'upcoming';

export interface LeagueMember {
  uid: string;
  displayName: string;
  photoURL?: string;
  totalAnnualKg: number;
  /** kg reduced vs. their baseline */
  reductionKg: number;
  reductionPercent: number;
  tokensEarned: number;
  rank: number;
  joinedAt: string;
  isCurrentUser?: boolean;
}

export interface League {
  id: string;
  name: string;
  description: string;
  emoji: string;
  type: LeagueType;
  createdBy: string;
  createdAt: string;
  /** ISO date */
  challengeStartDate: string;
  challengeEndDate: string;
  status: LeagueStatus;
  members: LeagueMember[];
  memberCount: number;
  maxMembers: number;
  inviteCode: string;
  activeChallenge: Challenge | null;
  isPublic: boolean;
}

// ─── Challenges ───────────────────────────────────────────────────────────────

export type ChallengeCategory = 'transport' | 'diet' | 'energy' | 'consumption' | 'any';
export type ChallengeType = 'reduction_percent' | 'no_meat' | 'bike_days' | 'no_flights' | 'zero_waste' | 'custom';

export interface Challenge {
  id: string;
  leagueId: string | null; // null = global challenge
  title: string;
  description: string;
  emoji: string;
  type: ChallengeType;
  category: ChallengeCategory;
  /** Target: e.g. reduce by 20%, or 5 bike-days */
  target: number;
  targetUnit: string;
  startDate: string;
  endDate: string;
  tokenReward: number;
  participantCount: number;
  isJoined: boolean;
  progress: number; // 0-100%
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  uid: string;
  displayName: string;
  photoURL?: string;
  totalAnnualKg: number;
  reductionPercent: number;
  tokensEarned: number;
  badgeCount: number;
  isCurrentUser: boolean;
}

// ─── Eco-Token Economy ────────────────────────────────────────────────────────

export type TokenTransactionType =
  | 'streak_bonus'
  | 'milestone_reduction'
  | 'challenge_complete'
  | 'first_calculation'
  | 'offset_purchase'
  | 'league_win'
  | 'referral'
  | 'redeem_offer'
  | 'tree_donation'
  | 'manual_award';

export interface TokenTransaction {
  id: string;
  type: TokenTransactionType;
  amount: number; // positive = earn, negative = spend
  balance: number; // balance after this transaction
  label: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface TokenBalance {
  available: number;
  lifetime: number;
  pending: number; // optimistic additions not yet confirmed
}

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationCategory = 'challenge' | 'achievement' | 'league' | 'tip' | 'token' | 'offset';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  emoji: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}
