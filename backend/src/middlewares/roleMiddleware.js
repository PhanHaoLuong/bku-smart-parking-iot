import jwt from 'jsonwebtoken';

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const token = req.cookies && req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized — no token provided' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Unauthorized — invalid or expired token' });
    }

    const userId = payload.userId || payload.id || payload.sub;
    const role = payload.role;

    if (!userId || !role) {
      return res.status(401).json({ message: 'Unauthorized — malformed token payload' });
    }

    if (role === 'admin') {
      req.user = { userId, role };
      return next();
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Forbidden — insufficient permissions' });
    }

    req.user = { userId, role };
    next();
  };
};
