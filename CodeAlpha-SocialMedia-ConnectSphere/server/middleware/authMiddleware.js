import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware that protects private routes by verifying a JWT Bearer token.
 *
 * On success: attaches the authenticated user document (password excluded) to req.user.
 * On failure: passes a 401 AppError to the next error handler.
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Not authorized — no token provided');
    err.statusCode = 401;
    return next(err);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // password has select:false in schema — excluded automatically
    const user = await User.findById(decoded.id);

    if (!user) {
      const err = new Error('Not authorized — user no longer exists');
      err.statusCode = 401;
      return next(err);
    }

    req.user = user;
    next();
  } catch {
    const err = new Error('Not authorized — invalid or expired token');
    err.statusCode = 401;
    next(err);
  }
};

export default protect;
