import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) throw new AppError('Sign in to continue.', 401);
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET); }
  catch { throw new AppError('Your session is invalid or expired. Sign in again.', 401); }
  const user = await User.findById(payload.sub).select('-password');
  if (!user || !user.active) throw new AppError('This account is unavailable.', 401);
  req.user = user;
  next();
});

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'ADMIN') return next(new AppError('Administrator access required.', 403));
  next();
}
