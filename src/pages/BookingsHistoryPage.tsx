import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, QrCode } from 'lucide-react';
import { bookingService, errorMessage } from '../services/api';

type BookingRow = { _id: string; bookingId: string; seats: string[]; totalAmount: number; bookingStatus: string; paymentStatus: string; show: { startsAt: string; movie: { title: string; posterImage: string }; theatre: { name: string }; screen: { name: string } } };
type Ticket = { bookingId: string; qrCode: string };

export const BookingsHistoryPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  useEffect(() => { bookingService.mine().then(setBookings).catch((e) => setError(errorMessage(e))); }, []);
  return <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-10 max-w-[1000px] mx-auto">
    <div className="mb-6 flex items-center justify-between"><Link to="/" className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white"><ArrowLeft className="w-4 h-4"/>Back to Home</Link><span className="text-xs text-[#f5a623] font-semibold">MY BOOKING HISTORY</span></div>
    <h1 className="text-2xl sm:text-3xl font-bold">My Tickets & Reservations</h1><p className="text-sm text-neutral-400 mt-1">Your paid tickets and booking status.</p>
    {error && <p role="alert" className="mt-5 text-sm text-red-300">{error}</p>}
    {!bookings.length && !error && <p className="mt-8 text-sm text-neutral-400">No bookings yet. Your purchases will appear here.</p>}
    <div className="space-y-4 mt-6">{bookings.map((b) => <article key={b._id} className="p-5 bg-[#11131c] border border-white/10 flex flex-col md:flex-row gap-5 md:items-center md:justify-between">
      <div className="flex gap-4"><img src={b.show.movie.posterImage} alt="" className="w-16 h-24 object-cover bg-neutral-800"/><div><div className="flex items-center gap-2"><span className="text-xs font-semibold">{b.bookingStatus}</span><span className="text-xs font-mono text-neutral-500">{b.bookingId}</span></div><h2 className="text-lg font-bold mt-1">{b.show.movie.title}</h2><p className="text-xs text-neutral-400 flex gap-1 mt-1"><MapPin size={14}/>{b.show.theatre.name}, {b.show.screen.name}</p><p className="text-xs text-neutral-400 flex gap-1 mt-1"><Calendar size={14}/>{new Date(b.show.startsAt).toLocaleString()}</p><p className="text-xs mt-2">Seats: <strong className="text-[#f5a623]">{b.seats.join(', ')}</strong> · ₹{b.totalAmount.toFixed(2)} · {b.paymentStatus}</p></div></div>
      {b.bookingStatus === 'CONFIRMED' && <button onClick={async () => { try { setTicket(await bookingService.ticket(b._id)); setError(''); } catch (e) { setError(errorMessage(e)); } }} className="px-4 py-2 bg-white/10 text-sm inline-flex items-center gap-2 self-start"><QrCode size={16} className="text-[#f5a623]"/>Show ticket QR</button>}
    </article>)}</div>
    {ticket && <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setTicket(null)}><div className="bg-[#11131c] border border-white/15 p-6 text-center" onClick={(e) => e.stopPropagation()}><h2 className="font-bold">{ticket.bookingId}</h2><img className="w-56 h-56 bg-white p-2 mt-4" src={ticket.qrCode} alt="Ticket QR code"/><button className="mt-4 text-sm text-[#f5a623]" onClick={() => setTicket(null)}>Close</button></div></div>}
  </div>;
};
