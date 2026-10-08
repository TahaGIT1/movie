import 'dotenv/config';
import { connectDatabase } from './config/db.js';
import { User } from './models/User.js';
import { Movie } from './models/Movie.js';
import { Theatre } from './models/Theatre.js';
import { Screen } from './models/Screen.js';
import { Show } from './models/Show.js';
import { Coupon } from './models/Coupon.js';

await connectDatabase();

// Belagavi cinema listings checked on 8 October 2026. This is a local demo
// catalogue; it is not connected to cinema operator inventory or ticketing.
const catalog = [
  { slug:'premada-oorali', title:'Premada Oorali', genre:['Drama','Romance'], language:['Kannada'], durationMinutes:155, cast:[], trailerUrl:'', posterImage:'/images/movies/india-now-showing.svg', description:'A Kannada romantic drama currently listed in Belagavi cinemas.', liveUrl:'https://in.bookmyshow.com/explore/movies-belagavi-belgaum?cat=MT' },
  { slug:'verity', title:'Verity', genre:['Mystery','Thriller'], language:['English'], durationMinutes:130, cast:[], trailerUrl:'https://www.youtube.com/embed/xdPMKhjMSFs', posterImage:'/images/movies/india-now-showing.svg', description:'An English-language mystery thriller currently listed in Belagavi cinemas.', liveUrl:'https://in.bookmyshow.com/explore/movies-belagavi-belgaum?cat=MT' },
  { slug:'drishyam-the-conclusion', title:'Drishyam The Conclusion', genre:['Drama','Thriller'], language:['Hindi'], durationMinutes:150, cast:[], trailerUrl:'https://www.youtube.com/embed/fneuVQ7uO_w', posterImage:'/images/movies/india-now-showing.svg', description:'A Hindi thriller currently listed in Belagavi cinemas.', liveUrl:'https://in.bookmyshow.com/explore/movies-belagavi-belgaum?cat=MT' },
  { slug:'prem-keetanu', title:'Prem Keetanu', genre:['Drama','Romance'], language:['Hindi'], durationMinutes:135, cast:[], trailerUrl:'https://www.youtube.com/embed/rbQEoVzHNSE', trailerLabel:'Official Teaser', posterImage:'/images/movies/india-now-showing.svg', description:'A Hindi romantic drama currently listed in Belagavi cinemas.', liveUrl:'https://in.bookmyshow.com/explore/movies-belagavi-belgaum?cat=MT' },
  { slug:'bail', title:'Bail', genre:['Drama'], language:['Kannada'], durationMinutes:140, cast:[], trailerUrl:'https://www.youtube.com/embed/Fe3KiAZNkto', trailerLabel:'Official Teaser', posterImage:'/images/movies/india-now-showing.svg', description:'A Kannada film currently listed in Belagavi cinemas. Teaser available.', liveUrl:'https://in.bookmyshow.com/explore/movies-belagavi-belgaum?cat=MT' },
  { slug:'citylights-2026', title:'Citylights', genre:['Drama'], language:['Kannada'], durationMinutes:140, cast:['Vinay Rajkumar','Monisha Vijaykumar'], trailerUrl:'', posterImage:'/images/movies/india-now-showing.svg', description:'A Kannada drama currently listed in Belagavi cinemas.', liveUrl:'https://in.bookmyshow.com/explore/movies-belagavi-belgaum?cat=MT' },
  { slug:'hulibeera', title:'Hulibeera', genre:['Drama'], language:['Kannada'], durationMinutes:135, cast:[], trailerUrl:'', posterImage:'/images/movies/india-now-showing.svg', description:'A Kannada feature currently listed in Belagavi cinemas.', liveUrl:'https://in.bookmyshow.com/explore/movies-belagavi-belgaum?cat=MT' },
  { slug:'hanuman-ansh', title:'Hanuman Ansh', genre:['Drama','Family'], language:['Hindi'], durationMinutes:140, cast:['Shobhinaw Satyaa','Vihaan Shedge'], trailerUrl:'https://www.youtube.com/embed/NEHJrJYh-h0', posterImage:'/images/movies/india-now-showing.svg', description:'A Hindi film currently listed in Belagavi cinemas.', liveUrl:'https://in.bookmyshow.com/explore/movies-belagavi-belgaum?cat=MT' },
];
const movies = await Promise.all(catalog.map((movie) => Movie.findOneAndUpdate({ slug: movie.slug }, {
  ...movie, backdropImage: movie.posterImage, formats:['2D'], rating:0, status:'NOW_SHOWING', releaseDate:new Date('2026-09-25T00:00:00+05:30'),
}, { upsert:true, new:true, setDefaultsOnInsert:true })));

// Retire only the old demo movie slugs created by this project's original seed.
await Movie.updateMany({ slug:{ $in:['the-batman','dune-part-two','oppenheimer','interstellar','inception','avatar-way-of-water','gladiator-ii','deadpool-wolverine','the-wild-robot','inside-out-2'] } }, { $set:{ status:'ARCHIVED' } });

const venue = await Theatre.findOneAndUpdate({ name:'INOX: Camp Road, Belagavi' }, {
  name:'INOX: Camp Road, Belagavi', location:'Near BSNL Office, Head Post Office Road, Belgaum Camp, Karnataka 590001', city:'Belagavi', features:['2D','Food & Beverage','Wheelchair Facility'], active:true,
}, { upsert:true, new:true });
const seats=[];
for (const row of ['A','B','C','D','E','F']) for (let number=1; number<=10; number++) seats.push({row,number,category:['A','B'].includes(row)?'Regular':['E','F'].includes(row)?'Recliner':'Premium'});
const screen=await Screen.findOneAndUpdate({theatre:venue._id,name:'Screen 1'}, {theatre:venue._id,name:'Screen 1',seats}, {upsert:true,new:true});

// Times copied from the published 8 Oct listing; rolling dates are clearly
// marked demo inventory so local seat/payment testing stays possible.
const slots=[['premada-oorali',[9,55]],['premada-oorali',[11,45]],['premada-oorali',[15,5]],['premada-oorali',[18,25]],['premada-oorali',[21,45]],['verity',[10,0]],['verity',[16,10]],['drishyam-the-conclusion',[12,45]],['drishyam-the-conclusion',[16,0]],['drishyam-the-conclusion',[19,15]],['drishyam-the-conclusion',[22,30]],['prem-keetanu',[13,10]],['bail',[18,50]],['hulibeera',[20,0]],['hanuman-ansh',[22,15]],['citylights-2026',[14,30]]];
const now=new Date();
for (const movie of movies) for (let day=0;day<7;day++) for (const [,time] of slots.filter(([slug])=>slug===movie.slug)) {
  const startsAt=new Date(); startsAt.setDate(startsAt.getDate()+day); startsAt.setHours(time[0],time[1],0,0); if (startsAt<=now) continue;
  const endsAt=new Date(startsAt.getTime()+(movie.durationMinutes||140)*60000);
  await Show.findOneAndUpdate({movie:movie._id,screen:screen._id,startsAt},{movie:movie._id,theatre:venue._id,screen:screen._id,startsAt,endsAt,prices:[{category:'Regular',amount:180},{category:'Premium',amount:240},{category:'Recliner',amount:320}],active:true},{upsert:true,new:true});
}
await Coupon.findOneAndUpdate({code:'WELCOME10'},{code:'WELCOME10',discountType:'PERCENT',discountValue:10,maxDiscount:150,minimumAmount:300,expiresAt:new Date(Date.now()+180*86400000),usageLimit:1000,active:true},{upsert:true});
const adminEmail=process.env.SEED_ADMIN_EMAIL||'admin@bookmymovie.local';
let adminUser=await User.findOne({email:adminEmail}).select('+password');
if(!adminUser) adminUser=new User({name:'BookMyMovie Admin',email:adminEmail,password:process.env.SEED_ADMIN_PASSWORD||'Admin12345!',role:'ADMIN',active:true});
else {adminUser.role='ADMIN';adminUser.name='BookMyMovie Admin';adminUser.password=process.env.SEED_ADMIN_PASSWORD||'Admin12345!';}
await adminUser.save();
console.log(`Seeded ${movies.length} Belagavi movies, 1 demo theatre, 1 screen and upcoming demo shows. Local admin: ${adminEmail}`);
process.exit(0);
