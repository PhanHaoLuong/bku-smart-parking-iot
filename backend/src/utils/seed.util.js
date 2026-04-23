import { seedDemoUsers } from './user.util.js';
import { seedDemoParkingHistories } from './parkinghistory.util.js';

export const seedDemoData = async () => {
  await seedDemoUsers();
  await seedDemoParkingHistories();
};