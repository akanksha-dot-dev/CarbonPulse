'use client';

/**
 * AchievementBadge — Unlockable achievement display with tier glow and animation.
 */

import { ProgressRing } from '@/components/shared/ProgressRing';
import type { Achievement, AchievementTier } from '@/types/carbon';

const TIER_CONFIG: Record<AchievementTier, { color: string; glow: string; label: string }> = {
  bronze: { color: '#cd7f32', glow: 'shadow-[0_0_16px_#cd7f3240]', label: 'Bronze' },
  silver: { color: '#c0c0c0', glow: 'shadow-[0_0_16px_#c0c0c040]', label: 'Silver' },
  gold: { color: '#ffd700', glow: 'shadow-[0_0_16px_#ffd70050]', label: 'Gold' },
  platinum: { color: '#e5e4e2', glow: 'shadow-[0_0_20px_#e5e4e260]', label: 'Platinum' },
};

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementBadge({ achievement, size = 'md' }: AchievementBadgeProps) {
  const tier = TIER_CONFIG[achievement.tier];
  const ringSize = size === 'sm' ? 48 : size === 'md' ? 64 : 80;
  const emojiSize = size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl';

  return (
    <div
      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-300 ${
        achievement.isUnlocked
          ? `border-opacity-40 bg-opacity-10 ${tier.glow}`
          : 'border-slate-800 bg-slate-900/40 opacity-50 grayscale'
      }`}
      style={achievement.isUnlocked ? {
        borderColor: `${tier.color}40`,
        backgroundColor: `${tier.color}08`,
      } : {}}
      aria-label={`${achievement.title} — ${achievement.tier} — ${achievement.isUnlocked ? 'Unlocked' : `${achievement.progressPercent}% progress`}`}
    >
      <ProgressRing
        percent={achievement.progressPercent}
        size={ringSize}
        strokeWidth={3}
        color={achievement.isUnlocked ? tier.color : '#334155'}
        trackColor="#1e293b"
        animated={achievement.isUnlocked}
      >
        <span className={emojiSize} aria-hidden="true">
          {achievement.emoji}
        </span>
      </ProgressRing>

      <div className="text-center">
        <p
          className="text-xs font-semibold leading-tight"
          style={{ color: achievement.isUnlocked ? tier.color : '#64748b' }}
        >
          {achievement.title}
        </p>
        <p className="text-xs text-slate-600 mt-0.5 max-w-[80px] leading-tight">
          {achievement.description.substring(0, 40)}
          {achievement.description.length > 40 ? '…' : ''}
        </p>
        {achievement.isUnlocked && achievement.unlockedAt && (
          <p className="text-xs text-slate-700 mt-1">
            {new Date(achievement.unlockedAt).toLocaleDateString()}
          </p>
        )}
        {!achievement.isUnlocked && (
          <p className="text-xs mt-1" style={{ color: tier.color }}>
            {achievement.progressPercent.toFixed(0)}%
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * AchievementsGrid — Full grid of all achievements.
 */

import { useUserStore } from '@/store/userStore';
import { Trophy } from 'lucide-react';

export function AchievementsGrid() {
  const achievements = useUserStore((s) => s.achievements);
  const unlocked = achievements.filter((a) => a.isUnlocked).length;

  return (
    <section
      className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 backdrop-blur-sm"
      aria-label="Achievements"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Achievements
          </h3>
        </div>
        <span
          className="text-xs text-slate-500"
          aria-live="polite"
          aria-atomic="true"
        >
          {unlocked}/{achievements.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="list" aria-label="Achievement badges">
        {achievements.map((achievement) => (
          <div key={achievement.id} role="listitem">
            <AchievementBadge achievement={achievement} size="sm" />
          </div>
        ))}
      </div>
    </section>
  );
}
