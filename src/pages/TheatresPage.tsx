import React from 'react';
import { ExternalLink, MapPin } from 'lucide-react';

const cinemas = [
  { name:'INOX: Camp Road, Belagavi', address:'Near BSNL Office, Head Post Office Road, Belgaum Camp, Belagavi, Karnataka 590001', url:'https://in.bookmyshow.com/cinemas/belagavi-belgaum/inox-camp-road-belagavi' },
  { name:'Chitra Talkies: Belagavi', address:'1724/A Huns Talkies Road, Ravivar Peth, Belagavi, Karnataka 590001', url:'https://in.bookmyshow.com/cinemas/belagavi-belgaum/chitra-talkies-belagavi' },
  { name:'Prakash Digital 4K Cinema: Belagavi', address:'SPM Road, Shashtri Nagar, Shahpur, Belagavi', url:'https://in.bookmyshow.com/cinemas/belagavi-belgaum/prakash-digital-4k-cinema-belagavi' },
  { name:'Globe Cinemas: Camp Area', address:'Camp Area, Khanapur Road, Belagavi', url:'https://in.bookmyshow.com/cinemas/belagavi-belgaum/globe-cinemas-camp-area' },
  { name:'Kapeel Cinema Nucleus Mall', address:'Nucleus Mall, Ramling Khind Galli, Belagavi', url:'https://in.bookmyshow.com/cinemas/belagavi-belgaum/kapeel-cinema-nucleus-mall' },
];

export const TheatresPage: React.FC = () => <main className="w-full min-h-screen py-10 px-4 sm:px-6 lg:px-10 max-w-[1720px] mx-auto">
  <header className="mb-8"><span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/30 mb-2 inline-block">BELAGAVI, KARNATAKA</span><h1 className="text-3xl sm:text-4xl font-heading font-black text-white">Cinemas near you</h1><p className="text-sm text-neutral-400 mt-2">Open the theatre’s live listing to see current movies and showtimes. Local seat booking is demo inventory only.</p></header>
  <div className="grid gap-4 md:grid-cols-2">{cinemas.map((cinema) => <article key={cinema.name} className="rounded-2xl border border-white/10 bg-[#11131c] p-5"><h2 className="text-lg font-bold text-white">{cinema.name}</h2><p className="mt-2 flex gap-2 text-sm text-neutral-400"><MapPin size={16} className="shrink-0 text-[#f5a623]"/>{cinema.address}</p><a href={cinema.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#f5a623] px-4 py-2 text-sm font-semibold text-black">Live showtimes <ExternalLink size={15}/></a></article>)}</div>
</main>;
