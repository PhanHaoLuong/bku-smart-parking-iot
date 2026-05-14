import test from 'node:test';
import assert from 'node:assert';
import { getApplicablePolicy } from '../../src/utils/billing.util.js';
import PricingPolicy from '../../src/models/pricingpolicy.model.js';

// Mocking the Mongoose PricingPolicy model
const mockPolicies = [
  { _id: '1', userType: 'learner', vehicleType: 'motorcycle', daytimeRate: 10000, isActive: true },
  { _id: '2', userType: 'default', vehicleType: 'any', daytimeRate: 4999, isActive: true },
];

test('Policy Selection Logic', async (t) => {
  // Stub findOne
  const originalFindOne = PricingPolicy.findOne;
  
  await t.test('should return specific policy when it exists', async () => {
    PricingPolicy.findOne = (query) => ({
      lean: async () => {
        if (query.userType === 'learner' && query.vehicleType === 'motorcycle') {
          return mockPolicies[0];
        }
        return null;
      }
    });

    const policy = await getApplicablePolicy('learner', 'motorcycle');
    assert.strictEqual(policy.daytimeRate, 10000);
    assert.strictEqual(policy.userType, 'learner');
  });

  await t.test('should fallback to Global Default when specific policy is missing', async () => {
    PricingPolicy.findOne = (query) => ({
      lean: async () => {
        // First call for 'faculty/car' returns null
        if (query.userType === 'faculty') return null;
        // Second call for 'default' returns the fallback
        if (query.userType === 'default') return mockPolicies[1];
        return null;
      }
    });

    const policy = await getApplicablePolicy('faculty', 'car');
    assert.strictEqual(policy.daytimeRate, 4999);
    assert.strictEqual(policy.userType, 'default');
  });

  // Restore original function
   PricingPolicy.findOne = originalFindOne;
});
