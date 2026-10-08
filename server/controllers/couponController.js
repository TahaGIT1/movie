import { Coupon } from '../models/Coupon.js';
import { AppError } from '../utils/AppError.js';
export async function validateCoupon(req, res) {
  const code = String(req.body.code || '').toUpperCase();
  const coupon = await Coupon.findOne({ code, active: true });
  const amount = Number(req.body.amount);
  if (!coupon || (coupon.expiresAt && coupon.expiresAt <= new Date()) || (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)) throw new AppError('Invalid or expired coupon.');
  if (!Number.isFinite(amount) || amount < coupon.minimumAmount) throw new AppError(`Minimum booking amount is ${coupon.minimumAmount}.`);
  let discount = coupon.discountType === 'PERCENT' ? amount * coupon.discountValue / 100 : coupon.discountValue;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  res.json({ code, discount: Math.round(Math.min(discount, amount) * 100) / 100 });
}
export async function saveCoupon(req, res) { const code = String(req.body.code || '').toUpperCase(); const coupon = req.params.id ? await Coupon.findByIdAndUpdate(req.params.id, { ...req.body, code }, { new: true, runValidators: true }) : await Coupon.create({ ...req.body, code }); if (!coupon) throw new AppError('Coupon not found.', 404); res.status(req.params.id ? 200 : 201).json(coupon); }
export async function deleteCoupon(req, res) { const coupon = await Coupon.findByIdAndDelete(req.params.id); if (!coupon) throw new AppError('Coupon not found.', 404); res.status(204).end(); }
