import mongoose from 'mongoose';

const pricingPolicySchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      required: true,
      enum: ['learner', 'faculty', 'staff', 'visitor', 'default'],
    },
    vehicleType: {
      type: String,
      required: true,
      enum: ['motorcycle', 'bicycle', 'car', 'any'],
      default: 'motorcycle',
    },
    pricingMode: {
      type: String,
      required: true,
      enum: ['per-session', 'per-hour'],
      default: 'per-session',
    },
    daytimeRate: {
      type: Number,
      default: 4999,
    },
    eveningRate: {
      type: Number,
      default: 4999,
    },
    firstHourRate: {
      type: Number,
      default: 5000,
    },
    subsequentHourlyRate: {
      type: Number,
      default: 2000,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'semester', null],
      default: 'monthly',
    },
    billingCycleDay: {
      type: Number,
      min: 1,
      max: 28,
      default: 1,
    },
    effectiveFrom: {
      type: Date,
      default: Date.now,
    },
    effectiveTo: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
    },
    updatedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

pricingPolicySchema.index(
  { userType: 1, vehicleType: 1 },
  { partialFilterExpression: { isActive: true } }
);

pricingPolicySchema.set('toJSON', {
  transform: (_, record) => {
    delete record.__v;
    return record;
  },
});

const PricingPolicy =
  mongoose.models.PricingPolicy ||
  mongoose.model('PricingPolicy', pricingPolicySchema);

export default PricingPolicy;
