import User from '../models/user.model.js';

const demoUsers = [
  { username: '2452712', password: '123', role: 'learner', cardActive: true },
  { username: 'fstaff', password: '123', role: 'staff', cardActive: true },
];

export const seedDemoUsers = async () => {
  const userCount = await User.countDocuments();

  if (userCount === 0) {
    await User.insertMany(demoUsers);
  }
};

export const addUser = async (user) => User.create(user);

export const findUserByUsername = async (username) => User.findOne({ username }).lean();

export const validateUser = async (username, password) =>
  User.findOne({ username, password }).lean();

export const getAllUsers = async () => User.find().lean();