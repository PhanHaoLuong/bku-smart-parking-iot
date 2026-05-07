import { tokens } from '../utils/tokenstore.js';

export const protectedRoute = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized — no token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token || !tokens.has(token)) {
    return res.status(401).json({ message: 'Unauthorized — invalid token' });
  }

  const [userId, role] = token.split('-');
  req.user = { id: userId, role };
  next();
};