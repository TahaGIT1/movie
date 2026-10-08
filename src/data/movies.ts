import type { MediaItem } from '../types';

const films = [
  ['premada-oorali','Premada Oorali','Drama, romance','Kannada','', ''],
  ['verity','Verity','Mystery, thriller','English','https://www.youtube-nocookie.com/embed/xdPMKhjMSFs?rel=0',''],
  ['drishyam-the-conclusion','Drishyam The Conclusion','Drama, thriller','Hindi','https://www.youtube-nocookie.com/embed/fneuVQ7uO_w?rel=0',''],
  ['prem-keetanu','Prem Keetanu','Drama, romance','Hindi','https://www.youtube-nocookie.com/embed/rbQEoVzHNSE?rel=0','Official Teaser'],
  ['bail','Bail','Drama','Kannada','https://www.youtube-nocookie.com/embed/Fe3KiAZNkto?rel=0','Official Teaser'],
  ['citylights-2026','Citylights','Drama','Kannada','',''],
  ['hulibeera','Hulibeera','Drama','Kannada','',''],
  ['hanuman-ansh','Hanuman Ansh','Drama, family','Hindi','https://www.youtube-nocookie.com/embed/NEHJrJYh-h0?rel=0',''],
] as const;
const posters = films.map(() => '/images/movies/india-now-showing.svg');

export const moviesData: MediaItem[] = films.map(([id,title,genre,language,trailerUrl,trailerLabel], index) => ({
  id, indexNumber:String(index + 1).padStart(2,'0'), title, scheduleStatus:'Now Showing', scheduleLabel:'Belagavi listing', heroBadge:'NOW SHOWING', badgeTopRight:'Belagavi', rating:0,
  genre:genre.toLowerCase(), genreTags:genre.split(', '), formats:[language,'2D'], description:`${genre} currently listed in Belagavi cinemas. Check the live theatre listing for today's availability.`,
  posterImage:posters[index], backdropImage:posters[index], primaryAction:{label:'Choose Seats',icon:'ticket',link:`/book/${id}`}, secondaryAction:{label:'More Info',link:`/movie/${id}`}, statusCategory:'now', trailerUrl:trailerUrl || undefined, trailerLabel:trailerLabel || undefined, liveUrl:'https://in.bookmyshow.com/explore/movies-belagavi-belgaum?cat=MT', category:'movie',
}));
