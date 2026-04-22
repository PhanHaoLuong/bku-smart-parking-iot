// backend/src/data/user.data.js

// In-memory user storage
const users = new Map();

// Add initial users (optional)
users.set("1", { id: "1", username: "2452712", password: "123", role: "learner", cardActive: true });
users.set("2", { id: "2", username: "fstaff", password: "123", role: "staff" });

// Utility functions
export const addUser = (user) => {
  const id = String(users.size + 1); // Generate a new ID
  users.set(id, { id, ...user });
  return users.get(id);
};

export const findUserByUsername = (username) => {
  return [...users.values()].find((user) => user.username === username);
};

export const validateUser = (username, password) => {
  return [...users.values()].find((user) => user.username === username && user.password === password);
};

export const getAllUsers = () => [...users.values()];