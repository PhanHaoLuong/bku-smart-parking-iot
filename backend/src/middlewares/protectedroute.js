import { getAuthTokenFromRequest, verifyAuthToken } from '../utils/authSession.util.js';

export const protectedRoute = (req, res, next) => {
    try {
        const token = getAuthTokenFromRequest(req);
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });

        }

        const sessionUser = verifyAuthToken(token);
        if (!sessionUser) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = sessionUser;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};