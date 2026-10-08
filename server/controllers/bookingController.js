import crypto from 'node:crypto';
import QRCode from 'qrcode';
import { Show } from '../models/Show.js';
import { Booking } from '../models/Booking.js';
import { Coupon } from '../models/Coupon.js';
import { AppError } from '../utils/AppError.js';

const LOCK_MS = 10 * 60 * 1000;
const populateBooking = (query) => query.populate({ path: 'show', populate: ['movie', 'theatre', 'screen'] });

export async function getSeatMap(req, res) {
  const show = await Show.findById(req.params.id).populate('screen');
  if (!show || !show.active) throw new AppError('Show not found.', 404);
  const now = new Date();
  const locks = show.locks.filter((lock) => lock.expiresAt > now);
  res.json({ showId: show.id, expiresInSeconds: locks.length ? Math.max(0, Math.ceil((Math.min(...locks.map((x) => x.expiresAt.getTime())) - now.getTime()) / 1000)) : LOCK_MS / 1000, seats: show.screen.seats.map((seat) => { const id = `${seat.row}${seat.number}`; const locked = locks.find((l) => l.seat === id); return { id, category: seat.category, status: show.bookedSeats.includes(id) ? 'BOOKED' : locked ? 'LOCKED' : 'AVAILABLE' }; }) });
}

export async function lockSeats(req, res) {
  const { showId, seats } = req.body;
  if (!showId || !Array.isArray(seats) || seats.length > 10 || new Set(seats).size !== seats.length) throw new AppError('Choose up to 10 unique seats.');
  if (seats.length === 0) {
    await Show.updateOne({ _id: showId }, { $pull: { locks: { user: req.user._id } } });
    return res.json({ showId, seats: [], released: true });
  }
  const show = await Show.findById(showId).populate('screen');
  if (!show || !show.active || show.startsAt <= new Date()) throw new AppError('This show is no longer available.', 409);
  const known = new Set(show.screen.seats.map((s) => `${s.row}${s.number}`));
  if (seats.some((seat) => !known.has(seat))) throw new AppError('One or more seats do not belong to this screen.');
  await Show.updateOne({ _id: showId }, { $pull: { locks: { expiresAt: { $lte: new Date() } } } });
  const filter = { _id: showId, active: true, bookedSeats: { $nin: seats }, locks: { $not: { $elemMatch: { seat: { $in: seats }, user: { $ne: req.user.id }, expiresAt: { $gt: new Date() } } } } };
  const until = new Date(Date.now() + LOCK_MS);
  const updated = await Show.findOneAndUpdate(filter, { $pull: { locks: { user: req.user._id } }, $push: { locks: { $each: seats.map((seat) => ({ seat, user: req.user._id, expiresAt: until })) } }, $set: { updatedAt: new Date() } }, { new: true });
  if (!updated) throw new AppError('One or more seats are booked or temporarily held by another customer. Refresh the seat map.', 409);
  res.json({ showId, seats, expiresAt: until.toISOString(), expiresInSeconds: LOCK_MS / 1000 });
}

export async function createBooking(req, res) {
  const { showId, seats, couponCode } = req.body;
  if (!Array.isArray(seats) || !seats.length || new Set(seats).size !== seats.length) throw new AppError('Select at least one unique seat.');
  const show = await Show.findById(showId).populate('screen');
  if (!show || !show.active || show.startsAt <= new Date()) throw new AppError('This show is no longer available.', 409);
  const active = new Map(show.locks.filter((l) => l.user.equals(req.user._id) && l.expiresAt > new Date()).map((l) => [l.seat, l]));
  if (seats.some((seat) => !active.has(seat))) throw new AppError('Your seat hold has expired. Select the seats again.', 409);
  const categories = new Map(show.screen.seats.map((s) => [`${s.row}${s.number}`, s.category]));
  const prices = new Map(show.prices.map((p) => [p.category, p.amount]));
  const ticketAmount = seats.reduce((sum, seat) => { const price = prices.get(categories.get(seat)); if (!price) throw new AppError(`Pricing is not configured for seat ${seat}.`); return sum + price; }, 0);
  const convenienceFee = Math.round(ticketAmount * 0.05 * 100) / 100;
  let discount = 0;
  let normalizedCoupon = '';
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase(), active: true });
    if (!coupon || (coupon.expiresAt && coupon.expiresAt <= new Date()) || (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)) throw new AppError('Invalid or expired coupon.');
    if (ticketAmount < coupon.minimumAmount) throw new AppError(`This coupon requires a minimum ticket subtotal of ${coupon.minimumAmount}.`);
    discount = coupon.discountType === 'PERCENT' ? ticketAmount * coupon.discountValue / 100 : coupon.discountValue;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    discount = Math.round(Math.min(discount, ticketAmount) * 100) / 100;
    normalizedCoupon = coupon.code;
  }
  const now = new Date();
  const booking = await Booking.create({ bookingId: `BMM-${crypto.randomBytes(5).toString('hex').toUpperCase()}`, user: req.user._id, show: show._id, seats, ticketAmount, convenienceFee, discount, totalAmount: Math.max(0, ticketAmount + convenienceFee - discount), couponCode: normalizedCoupon, lockExpiresAt: new Date(Math.min(...seats.map((s) => active.get(s).expiresAt.getTime()))) });
  res.status(201).json({ booking, pricing: { ticketAmount, convenienceFee, discount, totalAmount: booking.totalAmount }, currency: process.env.PAYMENT_CURRENCY || 'INR' });
}

export async function myBookings(req, res) { res.json(await populateBooking(Booking.find({ user: req.user._id }).sort({ createdAt: -1 }))); }
export async function getBooking(req, res) { const booking = await populateBooking(Booking.findById(req.params.id)); if (!booking) throw new AppError('Booking not found.', 404); if (!booking.user._id.equals(req.user._id) && req.user.role !== 'ADMIN') throw new AppError('Booking not found.', 404); res.json(booking); }
export async function cancelBooking(req, res) {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id }).populate('show');
  if (!booking) throw new AppError('Booking not found.', 404);
  if (booking.bookingStatus === 'CONFIRMED' && booking.show.startsAt <= new Date(Date.now() + 2 * 60 * 60 * 1000)) throw new AppError('Bookings can be cancelled up to two hours before showtime.', 409);
  if (!['PENDING', 'CONFIRMED'].includes(booking.bookingStatus)) throw new AppError('This booking can no longer be cancelled.', 409);
  booking.bookingStatus = 'CANCELLED'; await booking.save();
  await Show.updateOne({ _id: booking.show._id }, { $pull: { locks: { seat: { $in: booking.seats }, user: req.user._id }, bookedSeats: { $in: booking.seats } } });
  res.json({ booking });
}
export async function verifyTicket(req, res) {
  let bookingId = req.body.bookingId;
  if (!bookingId && typeof req.body.qrPayload === 'string') {
    try { bookingId = JSON.parse(req.body.qrPayload).bookingId; } catch { bookingId = ''; }
  }
  const booking = await Booking.findOne({ bookingId }).populate({ path: 'show', populate: ['movie', 'theatre'] });
  if (!booking || booking.bookingStatus !== 'CONFIRMED' || booking.paymentStatus !== 'PAID') return res.json({ valid: false, status: 'INVALID' });
  res.json({ valid: true, status: 'VALID', bookingId: booking.bookingId, movie: booking.show.movie.title, theatre: booking.show.theatre.name, show: booking.show.startsAt, seats: booking.seats, bookingStatus: booking.bookingStatus });
}
export async function getTicket(req, res) {
  const booking = await Booking.findById(req.params.id);
  if (!booking || (!booking.user.equals(req.user._id) && req.user.role !== 'ADMIN')) throw new AppError('Booking not found.', 404);
  if (booking.bookingStatus !== 'CONFIRMED' || booking.paymentStatus !== 'PAID') throw new AppError('A confirmed, paid booking is required to view this ticket.', 409);
  res.json({ bookingId: booking.bookingId, qrCode: await ticketQr(booking) });
}

export async function ticketQr(booking) { return QRCode.toDataURL(JSON.stringify({ bookingId: booking.bookingId })); }
export async function markPaid(booking) {
  const show = await Show.findOneAndUpdate({ _id: booking.show, bookedSeats: { $nin: booking.seats }, locks: { $all: booking.seats.map((seat) => ({ $elemMatch: { seat, user: booking.user, expiresAt: { $gt: new Date() } } })) } }, { $addToSet: { bookedSeats: { $each: booking.seats } }, $pull: { locks: { seat: { $in: booking.seats } } } }, { new: true });
  if (!show) throw new AppError('Your seat hold has expired. The payment could not be attached to these seats; contact support.', 409);
  booking.paymentStatus = 'PAID'; booking.bookingStatus = 'CONFIRMED'; await booking.save();
  return { booking, qrCode: await ticketQr(booking) };
}
export function verifySignature(orderId, paymentId, signature) { return crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex') === signature; }
