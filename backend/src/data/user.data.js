// backend/src/data/user.data.js

import { use } from "react";

// In-memory user storage
const users = new Map();

// Add initial users (optional)
users.set("1", { id : "1", username: "2451111", password: "123", role: "learner", cardActive: false, IDstatus: true });
users.set("2", { id : "2", username: "2452222", password: "123", role: "staff", cardActive: false, IDstatus: true });
users.set("3", { id : "3", username: "2453333", password: "123", role: "guest", cardActive: false});
users.set("4", { id : "4", username: "2454444", password: "123", role: "parkingOperator", cardActive: false});
users.set("5", { id : "5", username: "2455555", password: "123", role: "systemAdministrators", cardActive: false});
users.set("6", { id : "6", username: "2456666", password: "123", role: "BKPayIntegration", cardActive: false});

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