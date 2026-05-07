import bcrypt from 'bcrypt';

import { addUser, findUserById, findUserByUsername, validateUser } from '../utils/user.util.js';
import { generateToken } from '../utils/auth.util.js';

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

  const hashedPassword = await bcrypt.hash(password, 10);
  await addUser({ username, password: hashedPassword });
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

  generateToken(res, user._id, user.role);
  res.status(200).json({
    message: 'Login successful',
    user: { username: user.username, id: user._id, role: user.role },
  });
};

// Logout controller
export const logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
};

export const getUserInfo = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await findUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      id: req.user.userId,
      role: req.user.role,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
    });
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};