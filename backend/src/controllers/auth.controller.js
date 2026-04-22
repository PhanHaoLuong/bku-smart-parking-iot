// backend/src/controllers/auth.controller.js

// Hardcoded user data
const users = [
    { username: "admin", password: "admin123" },
    { username: "user", password: "user123" },
];

// Mock token storage
const tokens = new Set();

// Signup controller
export const signup = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.find((user) => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ username, password });
  res.status(201).json({ message: "User signed up successfully" });
};

// Login controller
export const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const user = users.find((user) => user.username === username && user.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = `${username}-token`; // Mock token generation
  tokens.add(token);
  res.status(200).json({ message: "Login successful", token });
};

// Logout controller
export const logout = (req, res) => {
  const { token } = req.body;

  if (!token || !tokens.has(token)) {
    return res.status(400).json({ message: "Invalid token" });
  }

  tokens.delete(token);
  res.status(200).json({ message: "Logout successful" });
};