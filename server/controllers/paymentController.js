import Razorpay from 'razorpay';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { Coupon } from '../models/Coupon.js';
import { Show } from '../models/Show.js';
import { AppError } from '../utils/AppError.js';
import { markPaid, verifySignature } from './bookingController.js';

function client() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw new AppError('Online payment is not configured. Add Razorpay test keys to the server environment.', 503);
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}
export async function createOrder(req, res) {
  const booking = await Booking.findOne({ _id: req.body.bookingId, user: req.user._id });
  if (!booking || booking.bookingStatus !== 'PENDING') throw new AppError('Pending booking not found.', 404);
  if (booking.lockExpiresAt <= new Date()) throw new AppError('Your booking session has expired. Select the seats again.', 409);
  const order = await client().orders.create({ amount: Math.round(booking.totalAmount * 100), currency: process.env.PAYMENT_CURRENCY || 'INR', receipt: booking.bookingId, notes: { bookingId: booking.bookingId } });
  const payment = await Payment.create({ booking: booking._id, user: req.user._id, providerOrderId: order.id, amount: booking.totalAmount, currency: order.currency });
  booking.payment = payment._id; await booking.save();
  res.status(201).json({ keyId: process.env.RAZORPAY_KEY_ID, orderId: order.id, amount: order.amount, currency: order.currency, bookingId: booking.bookingId });
}
export async function verifyPayment(req, res) {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;
  const payment = await Payment.findOne({ providerOrderId: orderId, user: req.user._id }).populate('booking');
  if (!payment) throw new AppError('Payment order not found.', 404);
  if (payment.status === 'PAID') return res.json({ success: true, booking: payment.booking });
  if (!verifySignature(orderId, paymentId, signature)) {
    payment.status = 'FAILED'; await payment.save();
    payment.booking.paymentStatus = 'FAILED'; payment.booking.bookingStatus = 'FAILED'; await payment.booking.save();
    await Show.updateOne({ _id: payment.booking.show }, { $pull: { locks: { seat: { $in: payment.booking.seats }, user: req.user._id } } });
    throw new AppError('Payment verification failed.', 400);
  }
  const result = await markPaid(payment.booking);
  if (payment.booking.couponCode) await Coupon.updateOne({ code: payment.booking.couponCode }, { $inc: { usedCount: 1 } });
  payment.status = 'PAID'; payment.providerPaymentId = paymentId; payment.signature = signature; await payment.save();
  res.json({ success: true, booking: result.booking, qrCode: result.qrCode });
}
export async function failPayment(req, res) {
  const payment = await Payment.findOne({ providerOrderId: req.body.orderId, user: req.user._id }).populate('booking');
  if (!payment) throw new AppError('Payment order not found.', 404);
  if (payment.status !== 'PAID') {
    payment.status = 'FAILED'; await payment.save();
    if (payment.booking.bookingStatus === 'PENDING') {
      payment.booking.paymentStatus = 'FAILED'; payment.booking.bookingStatus = 'FAILED'; await payment.booking.save();
      await Show.updateOne({ _id: payment.booking.show }, { $pull: { locks: { seat: { $in: payment.booking.seats }, user: req.user._id } } });
    }
  }
  res.json({ success: true, message: 'Payment attempt closed and seat holds released.' });
}
