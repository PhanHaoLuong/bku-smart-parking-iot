import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Invoice from '../src/models/invoice.model.js';
import ParkingSession from '../src/models/parkingsession.model.js';
import PricingPolicy from '../src/models/pricingpolicy.model.js';
import User from '../src/models/user.model.js';
import { calculateSessionFee } from '../src/utils/billing.util.js';

dotenv.config();

async function fixInvoiceAmounts() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Load all active policies into a map
  const policies = await PricingPolicy.find({ isActive: true }).lean();
  const policyMap = {};
  for (const p of policies) {
    policyMap[`${p.userType}-${p.vehicleType}`] = p;
  }
  const defaultPolicy = policyMap['default-any'];

  // Load all users for their userType
  const users = await User.find({}).lean();
  const userTypeMap = {};
  for (const u of users) userTypeMap[u._id.toString()] = u.userType;

  const invoices = await Invoice.find({}).lean();
  let fixedCount = 0;
  let itemsFixed = 0;

  for (const invoice of invoices) {
    if (!invoice.items || invoice.items.length === 0) continue;

    const userType = userTypeMap[invoice.userId] || 'learner';
    let needsUpdate = false;
    let newTotal = 0;

    const fixedItems = await Promise.all(invoice.items.map(async (item) => {
      // Skip items that already have a valid amount
      if (item.amount && item.amount > 0) {
        newTotal += item.amount;
        return item;
      }

      // Fetch session for vehicle type
      const session = item.sessionId
        ? await ParkingSession.findById(item.sessionId).lean()
        : null;

      const vehicleType = session?.vehicleType || 'motorcycle';
      const policyKey = `${userType}-${vehicleType}`;
      const policy = policyMap[policyKey] || policyMap[`${userType}-motorcycle`] || defaultPolicy;

      const sessionForCalc = session || {
        entryTime: item.entryTime,
        exitTime: item.exitTime,
      };

      const amount = calculateSessionFee(sessionForCalc, policy);
      needsUpdate = true;
      itemsFixed++;
      newTotal += amount;

      return { ...item, amount, rate: amount };
    }));

    if (needsUpdate) {
      await Invoice.findByIdAndUpdate(invoice._id, {
        $set: {
          items: fixedItems,
          totalAmount: newTotal,
        },
      });
      fixedCount++;
      console.log(`Fixed invoice ${invoice._id.toString().slice(-6)}: total is now ${newTotal.toLocaleString()} VND (${itemsFixed} items recalculated)`);
    }
  }

  console.log(`\nDone. Fixed ${fixedCount} invoices, ${itemsFixed} line items recalculated.`);
  process.exit(0);
}

fixInvoiceAmounts().catch((err) => {
  console.error(err);
  process.exit(1);
});
