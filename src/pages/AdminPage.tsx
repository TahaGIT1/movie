import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { adminService, errorMessage } from '../services/api';

type Metrics = { users: number; movies: number; theatres: number; shows: number; bookings: number; revenue: number; todayBookings: number; todayRevenue: number };
export const AdminPage: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [verification, setVerification] = useState('');
  let role = '';
  try { role = (JSON.parse(localStorage.getItem('bmm_user') || 'null') as { role?: string } | null)?.role || ''; } catch { role = ''; }
  useEffect(() => { if (role === 'ADMIN') adminService.dashboard().then(setMetrics).catch((e) => setError(errorMessage(e))); }, [role]);
  if (role !== 'ADMIN') return <Navigate to="/login" replace/>;
  const cards = metrics ? [['Users', metrics.users], ['Movies', metrics.movies], ['Theatres', metrics.theatres], ['Shows', metrics.shows], ['Bookings', metrics.bookings], ["Today's bookings", metrics.todayBookings], ['Revenue', `₹${metrics.revenue.toFixed(2)}`], ["Today's revenue", `₹${metrics.todayRevenue.toFixed(2)}`]] : [];
  return <main className="max-w-6xl mx-auto w-full px-4 py-10"><div className="flex justify-between items-center"><div><p className="text-xs uppercase text-[#f5a623] tracking-widest">BookMyMovie</p><h1 className="text-3xl font-bold mt-1">Admin dashboard</h1></div><Link to="/" className="text-sm text-neutral-400 hover:text-white">Back to site</Link></div>
    {error && <p role="alert" className="mt-5 text-red-300">{error}</p>}
    <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-7">{cards.map(([label, value]) => <div key={String(label)} className="border border-white/10 bg-[#11131c] p-4"><p className="text-xs text-neutral-400">{label}</p><p className="text-xl font-semibold mt-2">{value}</p></div>)}</section>
    <section className="mt-10 border-t border-white/10 pt-6"><h2 className="text-xl font-semibold">Ticket verification</h2><p className="text-sm text-neutral-400 mt-1">Enter the booking ID from a customer’s ticket.</p><form className="flex gap-2 mt-4" onSubmit={async (event) => { event.preventDefault(); setVerification(''); try { const result = await adminService.verifyTicket(bookingId); setVerification(result.valid ? `VALID · ${result.movie} · ${result.theatre} · seats ${result.seats.join(', ')}` : 'INVALID ticket'); } catch (e) { setVerification(errorMessage(e)); } }}><input value={bookingId} onChange={(e) => setBookingId(e.target.value)} placeholder="BMM-…" className="bg-white/5 border border-white/20 px-3 py-2" required/><button className="bg-[#f5a623] text-black font-medium px-4 py-2">Verify</button></form>{verification && <p className="mt-3 text-sm">{verification}</p>}</section>
    <p className="mt-8 text-xs text-neutral-500">Catalog, theatre, screen, show, booking and coupon CRUD endpoints are protected by the API’s ADMIN role.</p>
  </main>;
};
