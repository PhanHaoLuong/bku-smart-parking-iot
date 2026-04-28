import User from '../models/user.model.js';

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