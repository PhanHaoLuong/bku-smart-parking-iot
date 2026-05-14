import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PricingPolicy from '../src/models/pricingpolicy.model.js';
import User from '../src/models/user.model.js';

dotenv.config();

const defaultPolicies = [
  { userType: 'learner', vehicleType: 'motorcycle', pricingMode: 'per-session', daytimeRate: 10000, eveningRate: 15000 },
  { userType: 'learner', vehicleType: 'bicycle', pricingMode: 'per-session', daytimeRate: 5000, eveningRate: 7000 },
  { userType: 'learner', vehicleType: 'car', pricingMode: 'per-hour', firstHourRate: 20000, subsequentHourlyRate: 10000 },
  { userType: 'faculty', vehicleType: 'motorcycle', pricingMode: 'per-session', daytimeRate: 15000, eveningRate: 20000 },
  { userType: 'faculty', vehicleType: 'bicycle', pricingMode: 'per-session', daytimeRate: 5000, eveningRate: 7000 },
  { userType: 'faculty', vehicleType: 'car', pricingMode: 'per-hour', firstHourRate: 30000, subsequentHourlyRate: 15000 },
  { userType: 'staff', vehicleType: 'motorcycle', pricingMode: 'per-session', daytimeRate: 15000, eveningRate: 20000 },
  { userType: 'staff', vehicleType: 'bicycle', pricingMode: 'per-session', daytimeRate: 5000, eveningRate: 7000 },
  { userType: 'staff', vehicleType: 'car', pricingMode: 'per-hour', firstHourRate: 30000, subsequentHourlyRate: 15000 },
  { userType: 'visitor', vehicleType: 'car', pricingMode: 'per-hour', firstHourRate: 10000, subsequentHourlyRate: 5000 },
  { userType: 'default', vehicleType: 'any', pricingMode: 'per-session', daytimeRate: 4999, eveningRate: 4999 },
];

async function fixPolicies() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const operator = await User.findOne({ role: 'operator' }).lean();
    const operatorId = operator?._id?.toString() || 'system';

    for (const policy of defaultPolicies) {
      console.log(`Updating policy for ${policy.userType}/${policy.vehicleType}...`);
      await PricingPolicy.findOneAndUpdate(
        { userType: policy.userType, vehicleType: policy.vehicleType, isActive: true },
        { $set: { ...policy, isActive: true, updatedBy: operatorId } },
        { upsert: true }
      );
    }

    console.log('All policies updated successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing policies:', error);
    process.exit(1);
  }
}

fixPolicies();
