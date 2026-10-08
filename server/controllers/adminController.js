import { User } from '../models/User.js';
import { Movie } from '../models/Movie.js';
import { Theatre } from '../models/Theatre.js';
import { Show } from '../models/Show.js';
import { Booking } from '../models/Booking.js';
export async function dashboard(req, res) {
  const day = new Date(); day.setHours(0, 0, 0, 0);
  const [users, movies, theatres, shows, bookings, today, revenue, todayRevenue] = await Promise.all([
    User.countDocuments(), Movie.countDocuments(), Theatre.countDocuments(), Show.countDocuments(), Booking.countDocuments(), Booking.countDocuments({ createdAt: { $gte: day } }),
    Booking.aggregate([{ $match: { paymentStatus: 'PAID' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Booking.aggregate([{ $match: { paymentStatus: 'PAID', createdAt: { $gte: day } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
  ]);
  res.json({ users, movies, theatres, shows, bookings, todayBookings: today, revenue: revenue[0]?.total || 0, todayRevenue: todayRevenue[0]?.total || 0 });
}
export async function users(req, res) { res.json(await User.find().select('-password').sort({ createdAt: -1 }).lean()); }
export async function bookings(req, res) { const query = req.query.status ? { bookingStatus: req.query.status } : {}; res.json(await Booking.find(query).populate('user', 'name email').populate({ path: 'show', populate: ['movie', 'theatre'] }).sort({ createdAt: -1 })); }
