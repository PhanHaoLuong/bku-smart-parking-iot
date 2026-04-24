import { get } from 'mongoose';
import { addUser, findUserById, findUserByUsername, validateUser } from '../utils/user.util.js';

// Mock token storage
const tokens = new Set();

// Signup controller
export const signup = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const userExists = await findUserByUsername(username);
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  await addUser({ username, password });
  res.status(201).json({ message: 'User signed up successfully' });
};

// Login controller
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const user = await validateUser(username, password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = `${user._id}-${user.role}-token`;
  tokens.add(token);
  res.status(200).json({ message: 'Login successful', token });
};

// Logout controller
export const logout = (req, res) => {
  const { token } = req.body;

  if (!token || !tokens.has(token)) {
    return res.status(400).json({ message: 'Invalid token' });
  }

  tokens.delete(token);
  res.status(200).json({ message: 'Logout successful' });
};

export const getUserInfo = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token || !tokens.has(token)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const [userId, role] = token.split('-');
  const user = await findUserById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json(user);
}