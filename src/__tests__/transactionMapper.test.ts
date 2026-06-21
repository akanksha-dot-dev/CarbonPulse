/**
 * Transaction Mapper Tests
 *
 * Validates Plaid transaction → CO₂ emission mapping, aggregation,
 * category recognition, and edge case handling.
 */

import {
  mapTransaction,
  mapTransactionsToCO2,
  aggregateTransactionEmissions,
  getTopEmittingTransactions,
} from '@/lib/transactionMapper';
import type { PlaidTransaction, MappedTransaction } from '@/types/integrations';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createMockTransaction(
  overrides: Partial<PlaidTransaction> = {},
): PlaidTransaction {
  return {
    id: `tx_${Date.now()}`,
    accountId: 'acc_1',
    date: '2024-01-15',
    amount: 50,
    name: 'Test Transaction',
    category: ['Shopping'],
    ...overrides,
  };
}

// ─── mapTransaction Tests ─────────────────────────────────────────────────────

describe('mapTransaction', () => {
  it('maps gas station purchase to transport category', () => {
    const tx = createMockTransaction({ category: ['Gas Stations'], amount: 60 });
    const mapped = mapTransaction(tx);
    expect(mapped.ecoCategory).toBe('transport');
    expect(mapped.emissionFactor).toBe(0.41);
    expect(mapped.estimatedKgCO2e).toBeCloseTo(24.6, 1);
  });

  it('maps grocery purchase to diet category', () => {
    const tx = createMockTransaction({ category: ['Groceries'], amount: 100 });
    const mapped = mapTransaction(tx);
    expect(mapped.ecoCategory).toBe('diet');
    expect(mapped.emissionFactor).toBe(0.023);
  });

  it('maps utilities to energy category', () => {
    const tx = createMockTransaction({ category: ['Utilities'], amount: 150 });
    const mapped = mapTransaction(tx);
    expect(mapped.ecoCategory).toBe('energy');
  });

  it('maps clothing to consumption category', () => {
    const tx = createMockTransaction({ category: ['Clothing and Apparel'], amount: 200 });
    const mapped = mapTransaction(tx);
    expect(mapped.ecoCategory).toBe('consumption');
  });

  it('marks bank transfers as ignore', () => {
    const tx = createMockTransaction({ category: ['Transfer'], amount: 1000 });
    const mapped = mapTransaction(tx);
    expect(mapped.ecoCategory).toBe('ignore');
    expect(mapped.estimatedKgCO2e).toBe(0);
  });

  it('uses absolute amount for negative values', () => {
    const tx = createMockTransaction({ category: ['Gas Stations'], amount: -40 });
    const mapped = mapTransaction(tx);
    expect(mapped.estimatedKgCO2e).toBeGreaterThan(0);
  });

  it('applies default factor for unknown categories', () => {
    const tx = createMockTransaction({ category: ['Totally Unknown Category'], amount: 100 });
    const mapped = mapTransaction(tx);
    expect(mapped.ecoCategory).toBe('consumption');
    expect(mapped.emissionFactor).toBe(0.015);
  });

  it('prefers more specific category when multiple are provided', () => {
    const tx = createMockTransaction({
      category: ['Food and Drink', 'Restaurants'],
      amount: 50,
    });
    const mapped = mapTransaction(tx);
    expect(mapped.ecoCategory).toBe('diet');
    expect(mapped.label).toBe('Dining out');
  });
});

// ─── mapTransactionsToCO2 Tests ───────────────────────────────────────────────

describe('mapTransactionsToCO2', () => {
  it('filters out ignored transactions', () => {
    const transactions: PlaidTransaction[] = [
      createMockTransaction({ category: ['Gas Stations'], amount: 50 }),
      createMockTransaction({ category: ['Transfer'], amount: 1000 }),
      createMockTransaction({ category: ['Payment'], amount: 500 }),
    ];
    const mapped = mapTransactionsToCO2(transactions);
    expect(mapped).toHaveLength(1);
    expect(mapped[0].ecoCategory).toBe('transport');
  });

  it('returns empty array for empty input', () => {
    expect(mapTransactionsToCO2([])).toHaveLength(0);
  });

  it('processes all non-ignored transactions', () => {
    const transactions: PlaidTransaction[] = [
      createMockTransaction({ category: ['Gas Stations'], amount: 50 }),
      createMockTransaction({ category: ['Groceries'], amount: 100 }),
      createMockTransaction({ category: ['Utilities'], amount: 150 }),
    ];
    const mapped = mapTransactionsToCO2(transactions);
    expect(mapped).toHaveLength(3);
  });
});

// ─── aggregateTransactionEmissions Tests ──────────────────────────────────────

describe('aggregateTransactionEmissions', () => {
  const sampleMapped: MappedTransaction[] = [
    {
      ...createMockTransaction({ category: ['Gas Stations'], amount: 100 }),
      emissionFactor: 0.41,
      estimatedKgCO2e: 41,
      ecoCategory: 'transport',
      label: 'Fuel',
    },
    {
      ...createMockTransaction({ category: ['Groceries'], amount: 200 }),
      emissionFactor: 0.023,
      estimatedKgCO2e: 4.6,
      ecoCategory: 'diet',
      label: 'Groceries',
    },
  ];

  it('extrapolates 30-day data to annual values', () => {
    const result = aggregateTransactionEmissions(sampleMapped, 30);
    expect(result.totalAnnual).toBeGreaterThan(result.totalMonthly);
    // 365/30 ≈ 12.17x
    expect(result.totalAnnual).toBeCloseTo((41 + 4.6) * (365 / 30), 0);
  });

  it('aggregates by category correctly', () => {
    const result = aggregateTransactionEmissions(sampleMapped, 30);
    expect(result.transport).toBeGreaterThan(0);
    expect(result.diet).toBeGreaterThan(0);
    expect(result.energy).toBe(0);
    expect(result.consumption).toBe(0);
  });

  it('handles empty array', () => {
    const result = aggregateTransactionEmissions([], 30);
    expect(result.totalAnnual).toBe(0);
    expect(result.totalMonthly).toBe(0);
  });

  it('handles custom period days', () => {
    const result7 = aggregateTransactionEmissions(sampleMapped, 7);
    const result30 = aggregateTransactionEmissions(sampleMapped, 30);
    // Shorter period → higher annual extrapolation
    expect(result7.totalAnnual).toBeGreaterThan(result30.totalAnnual);
  });
});

// ─── getTopEmittingTransactions Tests ──────────────────────────────────────────

describe('getTopEmittingTransactions', () => {
  const mockMapped: MappedTransaction[] = [
    { ...createMockTransaction(), emissionFactor: 0.01, estimatedKgCO2e: 1, ecoCategory: 'diet', label: 'Low' },
    { ...createMockTransaction(), emissionFactor: 0.41, estimatedKgCO2e: 50, ecoCategory: 'transport', label: 'High' },
    { ...createMockTransaction(), emissionFactor: 0.1, estimatedKgCO2e: 10, ecoCategory: 'energy', label: 'Med' },
  ];

  it('returns transactions sorted by kgCO2e descending', () => {
    const top = getTopEmittingTransactions(mockMapped, 3);
    expect(top[0].estimatedKgCO2e).toBe(50);
    expect(top[1].estimatedKgCO2e).toBe(10);
    expect(top[2].estimatedKgCO2e).toBe(1);
  });

  it('limits results to specified count', () => {
    const top = getTopEmittingTransactions(mockMapped, 2);
    expect(top).toHaveLength(2);
  });

  it('defaults to 5 results', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      ...createMockTransaction(),
      emissionFactor: 0.01,
      estimatedKgCO2e: i,
      ecoCategory: 'diet' as const,
      label: `tx_${i}`,
    }));
    const top = getTopEmittingTransactions(many);
    expect(top).toHaveLength(5);
  });

  it('does not mutate the original array', () => {
    const original = [...mockMapped];
    getTopEmittingTransactions(mockMapped, 3);
    expect(mockMapped[0].estimatedKgCO2e).toBe(original[0].estimatedKgCO2e);
  });
});
