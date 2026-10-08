import React from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const cinemas = [
  { name:'INOX: Camp Road', address:'Belgaum Camp, Belagavi', url:'https://in.bookmyshow.com/cinemas/belagavi-belgaum/inox-camp-road-belagavi' },
  { name:'Chitra Talkies', address:'Ravivar Peth, Belagavi', url:'https://in.bookmyshow.com/cinemas/belagavi-belgaum/chitra-talkies-belagavi' },
  { name:'Prakash Digital 4K Cinema', address:'Shahpur, Belagavi', url:'https://in.bookmyshow.com/cinemas/belagavi-belgaum/prakash-digital-4k-cinema-belagavi' },
];

export const TheatresSection: React.FC = () => <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><span className="text-xs font-bold uppercase tracking-wider text-[#f5a623]">Belagavi, Karnataka</span><h2 className="mt-1 text-2xl sm:text-3xl font-heading font-black text-white">Cinemas near you</h2><p className="mt-1 text-sm text-neutral-400">Check live operator listings for current showtimes.</p></div><Link to="/theatres" className="text-sm font-semibold text-[#f5a623]">All cinemas →</Link></div>
  <div className="grid gap-3 md:grid-cols-3">{cinemas.map((cinema) => <a key={cinema.name} href={cinema.url} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 bg-[#11131c] p-4 hover:border-[#f5a623]/50"><h3 className="font-bold text-white">{cinema.name}</h3><p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-400"><MapPin size={13}/>{cinema.address}</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#f5a623]">Live listings <ExternalLink size={12}/></span></a>)}</div>
  <p className="mt-3 text-[11px] text-neutral-500">This demo does not have live cinema seat inventory. Local seat selection is for payment flow testing only.</p>
</section>;
