/**
 * Token Engine Tests
 *
 * Validates token earning, spending, redemption validation,
 * daily limits, and level progression logic.
 */

import {
  TOKEN_EARN_RULES,
  TOKEN_REDEMPTION_RULES,
  createEarnTransaction,
  createSpendTransaction,
  validateRedemption,
  canEarnToday,
  getTokenLevel,
} from '@/lib/tokenEngine';
import type { TokenTransaction, TokenBalance } from '@/types/social';

// ─── Earn Transaction Tests ──────────────────────────────────────────────────

describe('createEarnTransaction', () => {
  it('creates a valid earn transaction with correct balance', () => {
    const tx = createEarnTransaction('first_calculation', 100);
    expect(tx.amount).toBe(100); // 100 tokens for first calculation
    expect(tx.balance).toBe(200); // 100 + 100
    expect(tx.type).toBe('first_calculation');
    expect(tx.id).toContain('first_calculation');
    expect(tx.timestamp).toBeTruthy();
  });

  it('uses rule-defined token amounts', () => {
    const tx = createEarnTransaction('daily_login', 0);
    expect(tx.amount).toBe(TOKEN_EARN_RULES.daily_login.tokens);
  });

  it('generates unique IDs for each transaction', () => {
    const tx1 = createEarnTransaction('daily_login', 0);
    const tx2 = createEarnTransaction('daily_login', 0);
    expect(tx1.id).not.toBe(tx2.id);
  });

  it('uses the correct label from rules', () => {
    const tx = createEarnTransaction('streak_7', 0);
    expect(tx.label).toBe(TOKEN_EARN_RULES.streak_7.label);
  });

  it('falls back to default amount for unknown types', () => {
    const tx = createEarnTransaction('unknown_type' as string, 100);
    expect(tx.amount).toBe(10); // default fallback
    expect(tx.balance).toBe(110);
  });

  it('includes metadata when provided', () => {
    const meta = { source: 'test' };
    const tx = createEarnTransaction('daily_login', 0, meta);
    expect(tx.metadata).toEqual(meta);
  });
});

// ─── Spend Transaction Tests ─────────────────────────────────────────────────

describe('createSpendTransaction', () => {
  it('creates a valid spend transaction with negative amount', () => {
    const tx = createSpendTransaction('redeem_offer', 50, 200, 'Test redeem');
    expect(tx).not.toBeNull();
    expect(tx!.amount).toBe(-50);
    expect(tx!.balance).toBe(150);
  });

  it('returns null when balance is insufficient', () => {
    const tx = createSpendTransaction('redeem_offer', 500, 100, 'Too expensive');
    expect(tx).toBeNull();
  });

  it('returns null when attempting to spend exactly the balance', () => {
    const tx = createSpendTransaction('redeem_offer', 100, 100, 'Exact balance');
    expect(tx).not.toBeNull();
    expect(tx!.balance).toBe(0);
  });

  it('generates spend transaction IDs with spend_ prefix', () => {
    const tx = createSpendTransaction('redeem_offer', 10, 100, 'Test');
    expect(tx!.id).toContain('spend_');
  });
});

// ─── Redemption Validation Tests ──────────────────────────────────────────────

describe('validateRedemption', () => {
  it('returns valid for sufficient balance', () => {
    const balance: TokenBalance = { available: 500, lifetime: 1000, pending: 0 };
    const result = validateRedemption(100, balance);
    expect(result.valid).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('rejects when below minimum balance', () => {
    const balance: TokenBalance = { available: 30, lifetime: 30, pending: 0 };
    const result = validateRedemption(10, balance);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain(String(TOKEN_REDEMPTION_RULES.minimumBalance));
  });

  it('rejects when insufficient tokens', () => {
    const balance: TokenBalance = { available: 100, lifetime: 100, pending: 0 };
    const result = validateRedemption(500, balance);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('500');
  });

  it('rejects when exceeding per-transaction limit', () => {
    const balance: TokenBalance = { available: 20000, lifetime: 20000, pending: 0 };
    const result = validateRedemption(15000, balance);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('exceeds');
  });
});

// ─── Daily Limit Tests ────────────────────────────────────────────────────────

describe('canEarnToday', () => {
  const today = new Date().toISOString().split('T')[0];

  it('allows earning when no transactions exist', () => {
    expect(canEarnToday('daily_login', [])).toBe(true);
  });

  it('blocks earning when daily limit reached', () => {
    const transactions: TokenTransaction[] = [
      {
        id: 'test_1',
        type: 'daily_login',
        amount: 10,
        balance: 10,
        label: 'test',
        timestamp: `${today}T12:00:00.000Z`,
      },
    ];
    expect(canEarnToday('daily_login', transactions)).toBe(false);
  });

  it('allows earning types without daily limits', () => {
    const transactions: TokenTransaction[] = [
      {
        id: 'test_1',
        type: 'first_calculation',
        amount: 100,
        balance: 100,
        label: 'test',
        timestamp: `${today}T12:00:00.000Z`,
      },
    ];
    expect(canEarnToday('first_calculation', transactions)).toBe(true);
  });

  it('allows receipt_scan up to maxPerDay (5)', () => {
    const transactions: TokenTransaction[] = Array.from({ length: 4 }, (_, i) => ({
      id: `test_${i}`,
      type: 'receipt_scan' as const,
      amount: 25,
      balance: 25 * (i + 1),
      label: 'test',
      timestamp: `${today}T${10 + i}:00:00.000Z`,
    }));
    expect(canEarnToday('receipt_scan', transactions)).toBe(true);
  });

  it('blocks receipt_scan after maxPerDay (5)', () => {
    const transactions: TokenTransaction[] = Array.from({ length: 5 }, (_, i) => ({
      id: `test_${i}`,
      type: 'receipt_scan' as const,
      amount: 25,
      balance: 25 * (i + 1),
      label: 'test',
      timestamp: `${today}T${10 + i}:00:00.000Z`,
    }));
    expect(canEarnToday('receipt_scan', transactions)).toBe(false);
  });

  it('does not count negative (spend) transactions toward daily limit', () => {
    const transactions: TokenTransaction[] = [
      {
        id: 'test_spend',
        type: 'daily_login',
        amount: -10,
        balance: 0,
        label: 'spend',
        timestamp: `${today}T12:00:00.000Z`,
      },
    ];
    expect(canEarnToday('daily_login', transactions)).toBe(true);
  });
});

// ─── Token Level Tests ────────────────────────────────────────────────────────

describe('getTokenLevel', () => {
  it('returns Seedling for 0 tokens', () => {
    const level = getTokenLevel(0);
    expect(level.title).toBe('Seedling');
    expect(level.level).toBe(1);
    expect(level.emoji).toBe('🌱');
  });

  it('returns Sprout for 250 tokens', () => {
    const level = getTokenLevel(250);
    expect(level.title).toBe('Sprout');
    expect(level.level).toBe(2);
  });

  it('returns Eco Ally for 750 tokens', () => {
    const level = getTokenLevel(750);
    expect(level.title).toBe('Eco Ally');
    expect(level.level).toBe(3);
  });

  it('returns Net Zero Legend for 25000+ tokens', () => {
    const level = getTokenLevel(30000);
    expect(level.title).toBe('Net Zero Legend');
    expect(level.level).toBe(8);
    expect(level.progressPercent).toBe(100);
  });

  it('calculates progress correctly between levels', () => {
    const level = getTokenLevel(500); // Between Sprout (250) and Eco Ally (750)
    expect(level.progressPercent).toBeGreaterThan(0);
    expect(level.progressPercent).toBeLessThan(100);
    // (500-250)/(750-250) = 250/500 = 50%
    expect(level.progressPercent).toBe(50);
  });

  it('returns progressPercent between 0 and 100', () => {
    for (const tokens of [0, 100, 500, 1000, 5000, 10000, 25000]) {
      const level = getTokenLevel(tokens);
      expect(level.progressPercent).toBeGreaterThanOrEqual(0);
      expect(level.progressPercent).toBeLessThanOrEqual(100);
    }
  });

  it('has a nextLevelAt value greater than current level minimum', () => {
    const level = getTokenLevel(100);
    expect(level.nextLevelAt).toBeGreaterThan(0);
  });
});
