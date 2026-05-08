import { createAuthToken, setAuthCookie } from './authSession.util.js';

export const generateToken = (res, userId, role) => {
    const token = createAuthToken(userId, role);
    setAuthCookie(res, token);
};