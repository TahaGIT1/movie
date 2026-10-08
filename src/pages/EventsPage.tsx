import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { eventsData } from '../data/events';
import type { HeroConfig } from '../types';
import { Star, ExternalLink } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const heroConfig: HeroConfig = {
    pageType: 'events',
    verticalAccent: 'India • Upcoming',
    statusLabelLeft: 'India events',
    statusSubLeft: 'Belagavi and across India',
    genres: ['Music', 'Dance', 'Concerts'],
    statusToggle: {
      activeOption: 'Upcoming',
      secondaryOption: 'All Events',
    },
    items: eventsData,
  };

  return (
    <main className="w-full">
      <HeroSection config={heroConfig} />

      {/* 2. SCROLLABLE LIVE EVENTS DISCOVERY GRID */}
      <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/30 mb-2 inline-block">
              VERIFIED EVENT LISTINGS
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
              Events in Belagavi and India
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Event dates and official booking links last checked 8 October 2026. Confirm availability with the organizer.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {eventsData.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col rounded-2xl overflow-hidden bg-[#11131c] border border-white/10 hover:border-[#f5a623]/60 transition-all duration-300 hover:-translate-y-1 shadow-xl"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900">
                <img
                  src={item.posterImage}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-2.5 right-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/80 backdrop-blur-md border border-white/20 text-white">
                    {item.badgeTopRight || item.scheduleStatus}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[11px] text-neutral-400 truncate max-w-[130px]">
                      {item.genre}
                    </span>
                    <div className="flex items-center gap-1 text-[#f5a623] font-semibold text-xs">
                      <Star className="w-3 h-3 fill-[#f5a623]" />
                      <span>{item.rating}</span>
                    </div>
                  </div>

                  <h3 className="font-heading font-bold text-white text-base leading-snug group-hover:text-[#f5a623] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-neutral-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-neutral-500 block">
                      Passes From
                    </span>
                    <span className="text-sm font-heading font-bold text-white">
                      {item.priceINR ? `₹${item.priceINR.toLocaleString('en-IN')} onwards` : 'See ticket page'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#f5a623] hover:bg-[#e09612] text-black font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#f5a623]/20"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Official tickets</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
};
