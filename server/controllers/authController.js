import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

const tokenFor = (user) => jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role });

export async function register(req, res) {
  const { name, email, password, phone = '' } = req.body;
  if (!name || !email || !password || password.length < 8) throw new AppError('Name, email, and a password of at least 8 characters are required.');
  if (await User.exists({ email: email.toLowerCase() })) throw new AppError('An account with this email already exists.', 409);
  const user = await User.create({ name, email, phone, password });
  res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
}
export async function login(req, res) {
  const user = await User.findOne({ email: String(req.body.email || '').toLowerCase() }).select('+password');
  if (!user || !(await user.checkPassword(req.body.password || ''))) throw new AppError('Email or password is incorrect.', 401);
  res.json({ token: tokenFor(user), user: publicUser(user) });
}
export async function me(req, res) { res.json({ user: publicUser(req.user) }); }
