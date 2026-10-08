import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Ticket } from 'lucide-react';
import { moviesData } from '../data/movies';
import { bookingService, errorMessage, paymentService, theatreService } from '../services/api';
import type { MediaItem } from '../types';

type Show = { _id: string; startsAt: string; prices: { category: string; amount: number }[]; movie: { title: string; posterImage: string }; theatre: { name: string; city: string }; screen: { name: string } };
type Seat = { id: string; category: string; status: 'AVAILABLE' | 'LOCKED' | 'BOOKED' };
declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on?: (event: string, handler: () => void) => void } } }

export const BookingPage: React.FC = () => {
  const { movieId = '' } = useParams();
  const navigate = useNavigate();
  const fallback = moviesData.find((movie) => movie.id === movieId) || moviesData[0];
  const [shows, setShows] = useState<Show[]>([]);
  const [showId, setShowId] = useState('');
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [coupon, setCoupon] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState<{ bookingId: string; qrCode?: string } | null>(null);
  const show = shows.find((entry) => entry._id === showId);
  const rows = useMemo(() => [...new Set(seats.map((seat) => seat.id.match(/^[A-Z]+/)?.[0] || ''))], [seats]);

  useEffect(() => {
    theatreService.listShows({ movie: movieId }).then((data: Show[]) => { setShows(data); if (data[0]) setShowId(data[0]._id); }).catch((e) => setMessage(errorMessage(e)));
  }, [movieId]);
  useEffect(() => {
    if (!showId) { setSeats([]); setSelected([]); return; }
    bookingService.seats(showId).then((data: { seats: Seat[] }) => { setSeats(data.seats); setSelected([]); }).catch((e) => setMessage(errorMessage(e)));
  }, [showId]);

  const toggle = async (seat: Seat) => {
    if (seat.status === 'BOOKED' || seat.status === 'LOCKED' || busy) return;
    const next = selected.includes(seat.id) ? selected.filter((id) => id !== seat.id) : [...selected, seat.id];
    if (!localStorage.getItem('bmm_token')) { navigate('/login'); return; }
    try {
      await bookingService.lock(showId, next);
      setSelected(next);
      const map = await bookingService.seats(showId);
      setSeats(map.seats);
      setMessage('');
    } catch (error) { setMessage(errorMessage(error)); }
  };

  const checkout = async () => {
    if (!show || !selected.length) return;
    if (!localStorage.getItem('bmm_token')) { navigate('/login'); return; }
    setBusy(true); setMessage('');
    try {
      const data = await bookingService.create(showId, selected, coupon.trim() || undefined);
      const order = await paymentService.createOrder(data.booking._id);
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.onload = () => resolve(); script.onerror = () => reject(new Error('Could not load Razorpay Checkout.')); document.body.appendChild(script);
        });
      }
      if (!window.Razorpay) throw new Error('Razorpay Checkout is unavailable.');
      const checkout = new window.Razorpay({ key: order.keyId, amount: order.amount, currency: order.currency, name: 'BookMyMovie', description: show.movie.title, order_id: order.orderId,
        handler: async (response: Record<string, string>) => {
          try { const result = await paymentService.verify(response); setConfirmed({ bookingId: result.booking.bookingId, qrCode: result.qrCode }); }
          catch (error) { setMessage(errorMessage(error)); }
          finally { setBusy(false); }
        }, modal: { ondismiss: () => { void paymentService.fail(order.orderId).catch(() => undefined); setBusy(false); } } });
      checkout.on?.('payment.failed', () => { void paymentService.fail(order.orderId).catch(() => undefined); setMessage('Payment failed. Your seat hold has been released.'); setBusy(false); });
      checkout.open();
    } catch (error) { setBusy(false); setMessage(errorMessage(error)); }
  };

  const item: MediaItem = fallback;
  if (confirmed) return <main className="max-w-xl mx-auto py-16 px-4 text-center"><h1 className="text-3xl font-bold">Booking confirmed</h1><p className="mt-3 text-neutral-300">Booking ID <strong className="text-[#f5a623]">{confirmed.bookingId}</strong></p>{confirmed.qrCode && <img className="w-48 h-48 bg-white p-2 mx-auto my-6" src={confirmed.qrCode} alt="Ticket QR code" />}<Link className="text-[#f5a623] underline" to="/bookings">View my bookings</Link></main>;

  return <main className="max-w-5xl mx-auto px-4 py-8 w-full">
    <Link to={`/movie/${movieId}`} className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white"><ArrowLeft size={16}/> Back to movie</Link>
    <header className="flex gap-4 items-center border-b border-white/10 py-6"><img src={item.posterImage} alt="" className="w-16 h-24 object-cover rounded"/><div><p className="text-xs uppercase tracking-wide text-[#f5a623]">Choose a show and seats</p><h1 className="text-2xl font-bold">{item.title}</h1></div></header>
    <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">Demo booking inventory for local testing. This checkout does not issue a cinema admission ticket; confirm live availability with the theatre.</p>
    {message && <p role="alert" className="my-4 text-sm text-red-300">{message}</p>}
    <section className="py-6"><label className="block text-sm text-neutral-300 mb-2">Theatre, screen and showtime</label><select className="w-full sm:max-w-xl bg-[#151821] border border-white/20 rounded px-3 py-3" value={showId} onChange={(e) => setShowId(e.target.value)}><option value="">Select a show</option>{shows.map((entry) => <option key={entry._id} value={entry._id}>{entry.theatre.name}, {entry.screen.name} · {new Date(entry.startsAt).toLocaleString()}</option>)}</select>{!shows.length && <p className="mt-3 text-sm text-neutral-400">No upcoming shows are available for this movie.</p>}{show && <p className="mt-2 text-xs text-neutral-400 flex gap-3"><span className="inline-flex gap-1"><MapPin size={14}/>{show.theatre.city}</span><span className="inline-flex gap-1"><Calendar size={14}/>{new Date(show.startsAt).toLocaleDateString()}</span><span className="inline-flex gap-1"><Clock size={14}/>{new Date(show.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></p>}</section>
    {show && <><section className="border-y border-white/10 py-7"><div className="text-center mb-6"><div className="h-1 w-2/3 max-w-lg mx-auto bg-[#d3d6dd] rounded"/><p className="text-[10px] text-neutral-500 tracking-[.25em] mt-2">SCREEN</p></div><div className="space-y-2 overflow-x-auto">{rows.map((row) => <div key={row} className="flex justify-center gap-2 min-w-[380px]">{seats.filter((s) => s.id.startsWith(row)).map((seat) => <button key={seat.id} title={`${seat.id} · ${seat.category}`} aria-pressed={selected.includes(seat.id)} disabled={seat.status !== 'AVAILABLE' && !selected.includes(seat.id)} onClick={() => void toggle(seat)} className={`w-8 h-8 text-[10px] border rounded-t-md ${seat.status === 'BOOKED' ? 'bg-neutral-700 text-neutral-500' : seat.status === 'LOCKED' && !selected.includes(seat.id) ? 'bg-red-950 text-red-300' : selected.includes(seat.id) ? 'bg-[#f5a623] text-black border-[#f5a623]' : 'bg-white/5 border-white/20 text-neutral-300 hover:border-[#f5a623]'}`}>{seat.id}</button>)}</div>)}</div><div className="flex flex-wrap justify-center gap-5 text-xs text-neutral-400 mt-6">{show.prices.map((price) => <span key={price.category}>{price.category}: ₹{price.amount}</span>)}<span>Selected: {selected.join(', ') || 'none'}</span></div></section>
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 py-6"><label className="text-sm text-neutral-300">Coupon code<input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Optional" className="block mt-2 bg-white/5 border border-white/20 rounded px-3 py-2 text-white"/></label><div className="text-right"><p className="text-sm text-neutral-400">Backend calculates ticket price, fees and discount at checkout.</p><button onClick={() => void checkout()} disabled={!selected.length || busy} className="mt-3 inline-flex items-center gap-2 bg-[#f5a623] text-black font-semibold px-5 py-3 rounded disabled:opacity-50"><Ticket size={16}/>{busy ? 'Opening secure checkout…' : 'Continue to payment'}</button></div></section>
    </>}
  </main>;
};
