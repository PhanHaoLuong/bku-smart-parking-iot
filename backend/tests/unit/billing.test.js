import test from 'node:test';
import assert from 'node:assert';
import { calculateSessionFee, calculateVisitorFee } from '../../src/utils/billing.util.js';

test('Billing Logic - Per-Turn (per-session)', async (t) => {
  await t.test('should calculate fee based on daytime rate', () => {
    const session = {
      entryTime: new Date(2026, 4, 13, 10, 0, 0), // 10 AM (Daytime)
    };
    const policy = {
      pricingMode: 'per-session',
      daytimeRate: 10000,
      eveningRate: 15000,
    };
    
    const fee = calculateSessionFee(session, policy);
    assert.strictEqual(fee, 10000);
  });

  await t.test('should calculate fee based on evening rate', () => {
    const session = {
      entryTime: new Date(2026, 4, 13, 20, 0, 0), // 8 PM (Evening)
    };
    const policy = {
      pricingMode: 'per-session',
      daytimeRate: 10000,
      eveningRate: 15000,
    };
    
    const fee = calculateSessionFee(session, policy);
    assert.strictEqual(fee, 15000);
  });

  await t.test('should apply discount', () => {
    const session = {
      entryTime: new Date(2026, 4, 13, 10, 0, 0),
    };
    const policy = {
      pricingMode: 'per-session',
      daytimeRate: 10000,
      discountPercent: 20,
    };
    
    // 10000 * 0.8 = 8000
    const fee = calculateSessionFee(session, policy);
    assert.strictEqual(fee, 8000);
  });
});

test('Billing Logic - Hourly (per-hour)', async (t) => {
  await t.test('should calculate hourly fee for Learner/Staff via calculateSessionFee', () => {
    const session = {
      entryTime: new Date(2026, 4, 13, 10, 0, 0),
      exitTime: new Date(2026, 4, 13, 13, 0, 0), // 3 hours
    };
    const policy = {
      pricingMode: 'per-hour',
      firstHourRate: 20000,
      subsequentHourlyRate: 10000,
    };
    
    // 20000 + (2 * 10000) = 40000
    const fee = calculateSessionFee(session, policy);
    assert.strictEqual(fee, 40000);
  });

  await t.test('should calculate visitor fee correctly', () => {
    const entryTime = new Date(2026, 4, 13, 10, 0, 0);
    const exitTime = new Date(2026, 4, 13, 11, 30, 0); // 1.5 hours -> rounded to 2 hours
    const policy = {
      firstHourRate: 10000,
      subsequentHourlyRate: 5000,
    };
    
    // 10000 (1st) + 5000 (2nd) = 15000
    const fee = calculateVisitorFee(entryTime, exitTime, policy);
    assert.strictEqual(fee, 15000);
  });

  await t.test('should handle very short sessions (less than 1 hour)', () => {
    const entryTime = new Date(2026, 4, 13, 10, 0, 0);
    const exitTime = new Date(2026, 4, 13, 10, 15, 0); // 15 mins
    const policy = {
      firstHourRate: 10000,
      subsequentHourlyRate: 5000,
    };
    
    const fee = calculateVisitorFee(entryTime, exitTime, policy);
    assert.strictEqual(fee, 10000);
  });
});

test('Billing Logic - Edge Cases', async (t) => {
  await t.test('should return 0 if policy is free', () => {
    const session = { entryTime: new Date() };
    const policy = { isFree: true };
    assert.strictEqual(calculateSessionFee(session, policy), 0);
  });

  await t.test('should return 0 if no exit time provided for hourly billing', () => {
    const entryTime = new Date();
    const policy = { firstHourRate: 10000 };
    assert.strictEqual(calculateVisitorFee(entryTime, null, policy), 0);
  });

  await t.test('should fallback to 4,999 VND if policy is missing rate fields', () => {
    const session = { entryTime: new Date(2026, 4, 13, 10, 0, 0) };
    const emptyPolicy = { pricingMode: 'per-session' }; // Missing daytimeRate
    
    const fee = calculateSessionFee(session, emptyPolicy);
    assert.strictEqual(fee, 4999);
  });
});
