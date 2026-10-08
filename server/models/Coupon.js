import mongoose from 'mongoose';
const couponSchema = new mongoose.Schema({ code: { type: String, required: true, unique: true, uppercase: true, trim: true }, discountType: { type: String, enum: ['PERCENT', 'FIXED'], required: true }, discountValue: { type: Number, min: 0, required: true }, maxDiscount: Number, minimumAmount: { type: Number, default: 0 }, expiresAt: Date, usageLimit: Number, usedCount: { type: Number, default: 0 }, active: { type: Boolean, default: true } }, { timestamps: true });
export const Coupon = mongoose.model('Coupon', couponSchema);
