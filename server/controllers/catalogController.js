import { Movie } from '../models/Movie.js';
import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';
import { Show } from '../models/Show.js';
import { AppError } from '../utils/AppError.js';
import crypto from 'node:crypto';

export async function listMovies(req, res) {
  const query = { status: { $ne: 'ARCHIVED' } };
  if (req.query.search) query.title = { $regex: String(req.query.search), $options: 'i' };
  if (req.query.genre) query.genre = { $in: [new RegExp(`^${String(req.query.genre)}$`, 'i')] };
  if (req.query.language) query.language = { $in: [new RegExp(`^${String(req.query.language)}$`, 'i')] };
  if (req.query.format) query.formats = { $in: [new RegExp(String(req.query.format), 'i')] };
  if (req.query.status) query.status = String(req.query.status).toUpperCase().replace(' ', '_');
  const movies = await Movie.find(query).sort({ releaseDate: -1 });
  res.json(movies.map(toMediaItem));
}
export async function getMovie(req, res) { const movie = await Movie.findOne({ $or: [{ _id: req.params.id.match(/^[0-9a-f]{24}$/i) ? req.params.id : null }, { slug: req.params.id }] }); if (!movie) throw new AppError('Movie not found.', 404); res.json(toMediaItem(movie)); }
export async function saveMovie(req, res) { const payload = normalizeMovie(req.body); const movie = req.params.id ? await Movie.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true }) : await Movie.create(payload); if (!movie) throw new AppError('Movie not found.', 404); res.status(req.params.id ? 200 : 201).json(toMediaItem(movie)); }
export async function deleteMovie(req, res) { const result = await Movie.findByIdAndDelete(req.params.id); if (!result) throw new AppError('Movie not found.', 404); res.status(204).end(); }
export async function listTheatres(req, res) { const q = req.query.city && req.query.city !== 'All Cities' ? { city: req.query.city, active: true } : { active: true }; res.json(await Theatre.find(q).lean()); }
export async function getTheatre(req, res) { const t = await Theatre.findById(req.params.id).lean(); if (!t) throw new AppError('Theatre not found.', 404); res.json(t); }
export async function saveTheatre(req, res) { const t = req.params.id ? await Theatre.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }) : await Theatre.create(req.body); if (!t) throw new AppError('Theatre not found.', 404); res.status(req.params.id ? 200 : 201).json(t); }
export async function deleteTheatre(req, res) { if (await Screen.exists({ theatre: req.params.id })) throw new AppError('Remove this theatre’s screens before deleting it.', 409); await Theatre.findByIdAndDelete(req.params.id); res.status(204).end(); }
export async function saveScreen(req, res) { const screen = req.params.id ? await Screen.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }) : await Screen.create(req.body); if (!screen) throw new AppError('Screen not found.', 404); res.status(req.params.id ? 200 : 201).json(screen); }
export async function listScreens(req, res) { const query = req.params.theatreId ? { theatre: req.params.theatreId } : {}; res.json(await Screen.find(query).populate('theatre').lean()); }
export async function deleteScreen(req, res) { if (await Show.exists({ screen: req.params.id, active: true })) throw new AppError('Remove or reschedule this screen’s shows before deleting it.', 409); const result = await Screen.findByIdAndDelete(req.params.id); if (!result) throw new AppError('Screen not found.', 404); res.status(204).end(); }
export async function listShows(req, res) {
  const q = { active: true, startsAt: { $gte: new Date() } };
  if (req.query.movie) { const movie = await Movie.findOne({ $or: [{ slug: req.query.movie }, ...(req.query.movie.match(/^[0-9a-f]{24}$/i) ? [{ _id: req.query.movie }] : [])] }); if (!movie) return res.json([]); q.movie = movie._id; }
  if (req.query.theatre) q.theatre = req.query.theatre;
  if (req.query.date) { const start = new Date(`${req.query.date}T00:00:00`); const end = new Date(start); end.setDate(end.getDate() + 1); q.startsAt = { $gte: start, $lt: end }; }
  res.json(await Show.find(q).populate('movie theatre screen').sort({ startsAt: 1 }));
}
export async function getShow(req, res) { const show = await Show.findById(req.params.id).populate('movie theatre screen'); if (!show) throw new AppError('Show not found.', 404); res.json(show); }
export async function saveShow(req, res) {
  const { screen, startsAt, endsAt } = req.body;
  if (new Date(endsAt) <= new Date(startsAt)) throw new AppError('Show end time must be after its start time.');
  const token = crypto.randomUUID();
  const now = new Date();
  const lockedScreen = await Screen.findOneAndUpdate({ _id: screen, $or: [{ scheduleLockUntil: null }, { scheduleLockUntil: { $lte: now } }] }, { scheduleLockUntil: new Date(now.getTime() + 15000), scheduleLockToken: token }, { new: true });
  if (!lockedScreen) throw new AppError('Screen not found or another show is being scheduled. Retry in a moment.', 409);
  try {
    const collision = await Show.exists({ screen, active: true, ...(req.params.id ? { _id: { $ne: req.params.id } } : {}), startsAt: { $lt: new Date(endsAt) }, endsAt: { $gt: new Date(startsAt) } });
    if (collision) throw new AppError('This screen already has a show during that time.', 409);
    const show = req.params.id ? await Show.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }) : await Show.create(req.body);
    if (!show) throw new AppError('Show not found.', 404);
    res.status(req.params.id ? 200 : 201).json(show);
  } finally { await Screen.updateOne({ _id: screen, scheduleLockToken: token }, { $unset: { scheduleLockUntil: 1, scheduleLockToken: 1 } }); }
}
export async function deleteShow(req, res) { const show = await Show.findByIdAndUpdate(req.params.id, { active: false }); if (!show) throw new AppError('Show not found.', 404); res.status(204).end(); }

function normalizeMovie(body) {
  const slug = body.slug || String(body.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return { ...body, slug, genre: list(body.genre), language: list(body.language), formats: list(body.formats), status: body.status || (body.statusCategory === 'upcoming' ? 'COMING_SOON' : 'NOW_SHOWING') };
}
function list(value) { return Array.isArray(value) ? value : String(value || '').split(',').map((x) => x.trim()).filter(Boolean); }
function toMediaItem(movie) {
  const m = movie.toObject ? movie.toObject() : movie;
  return { ...m, id: m.slug || m._id?.toString() || m.id, genre: (m.genre || []).join(', ').toLowerCase(), genreTags: m.genre || [], formats: m.formats || [], rating: m.rating || 0, statusCategory: m.status === 'COMING_SOON' ? 'upcoming' : 'now', duration: m.durationMinutes ? `${Math.floor(m.durationMinutes / 60)}h ${m.durationMinutes % 60}m` : '', primaryAction: { label: 'Choose Seats', icon: 'ticket', link: `/book/${m.slug}` }, secondaryAction: { label: 'More Info', link: `/movie/${m.slug}` } };
}
