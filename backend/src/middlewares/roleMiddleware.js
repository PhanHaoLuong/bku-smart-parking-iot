import { getAuthTokenFromRequest, verifyAuthToken } from '../utils/authSession.util.js';

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const token = getAuthTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized — no token provided' });
    }

    const sessionUser = verifyAuthToken(token);
    if (!sessionUser) {
      return res.status(401).json({ message: 'Unauthorized — malformed token payload' });
    }

    if (!allowedRoles.includes(sessionUser.role)) {
      return res.status(403).json({ message: 'Forbidden — insufficient permissions' });
    }

    req.user = sessionUser;
    next();
  };
};
