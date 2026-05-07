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

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Middleware to check if user has admin or operator role
export const requireAdminOrOperator = (req, res, next) => {
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
        
        if (role !== 'admin' && role !== 'operator') {
            return res.status(403).json({ message: 'Forbidden - Admin or Operator access required' });
        }

        req.user = { userId, role };
        next();
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};