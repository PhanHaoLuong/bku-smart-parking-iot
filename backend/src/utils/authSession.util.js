import jwt from 'jsonwebtoken';

export const AUTH_COOKIE_NAME = 'token';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};

export const createAuthToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const normalizeSessionUser = (payload = {}) => {
  const userId = payload.userId || payload.id || payload.sub || null;
  const role = payload.role || null;

  if (!userId || !role) {
    return null;
  }

  return {
    id: userId,
    userId,
    role,
  };
};

export const getAuthTokenFromRequest = (req) => req.cookies?.[AUTH_COOKIE_NAME] || null;

export const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, cookieOptions);
};

export const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, cookieOptions);
};

export const verifyAuthToken = (token) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return normalizeSessionUser(payload);
  } catch {
    return null;
  }
};