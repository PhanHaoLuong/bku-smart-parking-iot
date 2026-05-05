import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const protectedRoute = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }   

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { userId, role } = decoded;
        req.user = { userId, role };
        next();
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};