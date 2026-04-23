export const protectedRoute = (req, res, next) => {
    localStorage.getItem('token') ? next() : res.status(401).json({ message: 'Unauthorized' });
};