import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Mail, Ticket, User } from 'lucide-react';
import { authService, errorMessage, type User as UserProfile } from '../services/api';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(() => { try { return JSON.parse(localStorage.getItem('bmm_user') || 'null') as UserProfile | null; } catch { return null; } });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => { if (!localStorage.getItem('bmm_token')) { navigate('/login'); return; } authService.me().then((user) => { setProfile(user); localStorage.setItem('bmm_user', JSON.stringify(user)); }).catch((e) => setError(errorMessage(e))); }, [navigate]);
  const logout = () => { authService.logout(); setProfile(null); navigate('/login'); };
  return <main className="max-w-3xl mx-auto w-full px-4 py-12"><h1 className="text-3xl font-bold">Your profile</h1>{error && <p role="alert" className="mt-4 text-red-300">{error}</p>}<section className="mt-6 p-6 bg-[#11131c] border border-white/10"><div className="flex items-center gap-4"><span className="w-12 h-12 flex items-center justify-center bg-white/5"><User/></span><div><h2 className="text-xl font-semibold">{profile?.name || 'Loading profile…'}</h2><p className="text-xs text-neutral-400">{profile?.role || ''}</p></div></div><p className="mt-5 text-sm flex items-center gap-2 text-neutral-300"><Mail size={16}/>{profile?.email || '—'}</p>{profile?.phone && <p className="mt-2 text-sm text-neutral-300">Phone: {profile.phone}</p>}</section><div className="mt-5 flex gap-3"><Link to="/bookings" className="px-4 py-3 bg-white/5 border border-white/10 flex gap-2 items-center"><Ticket size={16}/>Booking history</Link><button onClick={logout} className="px-4 py-3 bg-red-500/10 text-red-300 flex gap-2 items-center"><LogOut size={16}/>Sign out</button></div></main>;
};
