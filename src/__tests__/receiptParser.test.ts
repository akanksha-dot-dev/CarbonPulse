/**
 * Receipt Parser Tests
 *
 * Validates OCR text parsing, food item recognition, weight estimation,
 * and CO₂ emission calculation from receipt text.
 */

import { parseReceiptText } from '@/lib/receiptParser';

// ─── parseReceiptText Tests ───────────────────────────────────────────────────

describe('parseReceiptText', () => {
  it('parses simple receipt with recognizable food items', () => {
    const text = `
      WHOLE FOODS
      CHICKEN BREAST    $8.99
      ORGANIC MILK      $4.49
      BREAD             $3.29
    `;
    const result = parseReceiptText(text);
    expect(result.success).toBe(true);
    expect(result.lineItems.length).toBeGreaterThan(0);
    expect(result.totalEstimatedKgCO2e).toBeGreaterThan(0);
  });

  it('identifies beef items with high CO2e', () => {
    const text = 'GROUND BEEF 1LB $6.99';
    const result = parseReceiptText(text);
    const beefItem = result.lineItems.find((i) => i.matchedFoodItem?.includes('beef'));
    expect(beefItem).toBeTruthy();
    expect(beefItem!.category).toBe('meat_beef');
    expect(beefItem!.kgCO2ePer100g).toBeGreaterThan(1); // Beef is carbon-intensive
  });

  it('identifies dairy items', () => {
    const text = 'CHEESE CHEDDAR $5.49';
    const result = parseReceiptText(text);
    const dairyItem = result.lineItems.find((i) => i.category === 'dairy');
    expect(dairyItem).toBeTruthy();
  });

  it('identifies vegetables with low CO2e', () => {
    const text = 'BROCCOLI $2.99';
    const result = parseReceiptText(text);
    const vegItem = result.lineItems.find((i) => i.category === 'vegetables');
    expect(vegItem).toBeTruthy();
    expect(vegItem!.kgCO2ePer100g).toBeLessThan(0.5);
  });

  it('handles weight units (pounds)', () => {
    const text = 'CHICKEN 2.5 LBS $8.99';
    const result = parseReceiptText(text);
    const chickenItem = result.lineItems.find((i) => i.matchedFoodItem === 'chicken');
    expect(chickenItem).toBeTruthy();
    // 2.5 lbs ≈ 1134g
    expect(chickenItem!.estimatedGrams).toBeCloseTo(1134, 0);
  });

  it('handles weight units (kg)', () => {
    const text = 'RICE 1 KG $3.99';
    const result = parseReceiptText(text);
    const riceItem = result.lineItems.find((i) => i.matchedFoodItem === 'rice');
    expect(riceItem).toBeTruthy();
    expect(riceItem!.estimatedGrams).toBe(1000);
  });

  it('handles weight units (oz)', () => {
    const text = 'SALMON 16 OZ $12.99';
    const result = parseReceiptText(text);
    const salmonItem = result.lineItems.find((i) => i.matchedFoodItem === 'salmon');
    expect(salmonItem).toBeTruthy();
    // 16 oz ≈ 453.6g
    expect(salmonItem!.estimatedGrams).toBeCloseTo(453.6, 0);
  });

  it('assigns unknown category to unrecognized items', () => {
    const text = 'RANDOM WIDGET THING $9.99';
    const result = parseReceiptText(text);
    if (result.lineItems.length > 0) {
      const unknownItems = result.lineItems.filter((i) => i.category === 'unknown');
      expect(unknownItems.length).toBeGreaterThan(0);
    }
  });

  it('returns empty line items for empty text', () => {
    const result = parseReceiptText('');
    expect(result.success).toBe(true);
    expect(result.lineItems).toHaveLength(0);
    expect(result.totalEstimatedKgCO2e).toBe(0);
  });

  it('handles multi-line receipt with mixed items', () => {
    const text = `
      TRADER JOES
      SALMON FILLET    $12.99
      AVOCADO          $1.49
      PASTA            $2.49
      EGGS LARGE 12PK  $4.99
      COFFEE BEANS     $9.99
    `;
    const result = parseReceiptText(text);
    expect(result.success).toBe(true);
    expect(result.lineItems.length).toBeGreaterThanOrEqual(3);
    // Total should be a reasonable positive number
    expect(result.totalEstimatedKgCO2e).toBeGreaterThan(0);
    expect(result.totalEstimatedKgCO2e).toBeLessThan(100); // Sanity check
  });

  it('confidence is 100 for text-only parsing (no OCR)', () => {
    const result = parseReceiptText('CHICKEN $5.99');
    expect(result.confidence).toBe(100);
  });

  it('produces scanDate in ISO format', () => {
    const result = parseReceiptText('TEST');
    expect(result.scanDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('calculates CO2 proportionally to weight', () => {
    const lightResult = parseReceiptText('BEEF 100 G $5.99');
    const heavyResult = parseReceiptText('BEEF 500 G $24.99');
    const lightBeef = lightResult.lineItems.find((i) => i.matchedFoodItem?.includes('beef'));
    const heavyBeef = heavyResult.lineItems.find((i) => i.matchedFoodItem?.includes('beef'));
    if (lightBeef && heavyBeef) {
      expect(heavyBeef.estimatedKgCO2e).toBeGreaterThan(lightBeef.estimatedKgCO2e);
    }
  });
});
