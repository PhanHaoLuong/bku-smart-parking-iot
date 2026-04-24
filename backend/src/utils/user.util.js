import User from '../models/user.model.js';

const demoUsers = [
  { username: '2452712', password: '123', role: 'learner', cardActive: true, fullName: 'Phan Van A', email: 'A.phanvan@hcmut.edu.vn' },
  { username: 'fstaff', password: '123', role: 'staff', cardActive: true, fullName: 'Staff Member', email: 'staff@hcmut.edu.vn' },
  { username: 'admin', password: '123', role: 'admin', cardActive: true, fullName: 'Admin User', email: 'admin@hcmut.edu.vn' },
  { username: 'parkingop', password: '123', role: 'learner', cardActive: true, fullName: 'Parking Operator', email: 'parking@hcmut.edu.vn' },
];

export const seedDemoUsers = async () => {
  await User.bulkWrite(
    demoUsers.map((user) => ({
      updateOne: {
        filter: { username: user.username },
        update: { $setOnInsert: user },
        upsert: true,
      },
    }))
  );

  return User.find(
    { username: { $in: demoUsers.map((user) => user.username) } },
    { _id: 1, username: 1 }
  ).lean();
};

export const addUser = async (user) => User.create(user);

export const findUserByUsername = async (username) => User.findOne({ username }).lean();

export const findUserById = async (id) => User.findById(id).lean();

export const validateUser = async (username, password) =>
  User.findOne({ username, password }).lean();

export const getAllUsers = async () => User.find().lean();