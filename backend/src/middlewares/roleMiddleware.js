import { tokens } from '../utils/tokenstore.js';

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized — no token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token || !tokens.has(token)) {
      return res.status(401).json({ message: 'Unauthorized — invalid token' });
    }

    const [userId, role] = token.split('-');

    if (role === 'admin') {
      req.user = { id: userId, role };
      return next();
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Forbidden — insufficient permissions' });
    }

    req.user = { id: userId, role };
    next();
  };
};
