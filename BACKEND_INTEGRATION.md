# 🎬 CinePass — Backend Developer Integration Guide

Welcome! This frontend was engineered using **React 19 + TypeScript + Vite + Tailwind CSS v4**. It is **100% frontend only**, completely decoupled, and ready to plug into any backend stack (Node/Express, Python/FastAPI/Django, Go, NestJS, Java Spring, etc.).

---

## ⚡ Quick Start for Backend Developer

### 1. Environment Variable
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```
*(If `VITE_API_BASE_URL` is omitted, the frontend automatically falls back to the high-fidelity mock data).*

### 2. Frontend API Service Layer
All data fetching and mutations go through:
👉 [`src/services/api.ts`](file:///c:/Users/Lenovo/Desktop/movie/src/services/api.ts)

When your endpoints are ready, simply verify that your API matches the route signatures listed below.

---

## 📡 Required Endpoints & Schemas

### 1. Movies & Media Catalog
#### `GET /api/movies`
Returns a list of movies matching `MediaItem[]`.
```json
[
  {
    "id": "the-batman",
    "indexNumber": "01",
    "title": "The Batman",
    "tagline": "Session schedule",
    "scheduleStatus": "Tomorrow",
    "scheduleLabel": "Session schedule",
    "heroBadge": "BLOCKBUSTER",
    "rating": 4.5,
    "genre": "action, crime, mystery",
    "genreTags": ["Action", "Crime", "Mystery"],
    "formats": ["IMAX 2D", "PG-13"],
    "description": "When a sadistic serial killer begins murdering key political figures in Gotham...",
    "posterImage": "/images/movies/the-batman.jpg",
    "backdropImage": "/images/backgrounds/batman_hero.jpg",
    "duration": "2h 56m",
    "director": "Matt Reeves",
    "cast": ["Robert Pattinson", "Zoë Kravitz", "Paul Dano", "Colin Farrell"],
    "priceRM": 38.00,
    "statusCategory": "now",
    "primaryAction": { "label": "Book Now", "icon": "ticket", "link": "/book/the-batman" },
    "secondaryAction": { "label": "More Info", "link": "/movie/the-batman" }
  }
]
```

#### `GET /api/movies/:id`
Returns a single `MediaItem` object.

---

### 2. Live Shows, Plays, Sports & Activities
The frontend has unified pages for all live entertainment:
- `GET /api/events` — Festivals, Standup Comedy, Exhibitions
- `GET /api/streams` — 4K HDR Digital Premieres
- `GET /api/plays` — Broadway Musicals & Stage Theatre
- `GET /api/sports` — Stadium screenings (F1, EPL, Badminton)
- `GET /api/activities` — Free-roam VR, Karting, Escape Rooms

---

### 3. Theatres & Venues
#### `GET /api/theatres?city={city}`
Returns cinema halls with showtimes:
```json
[
  {
    "id": "dadi-pavilion",
    "name": "Dadi Cinema & IMAX Pavilion Elite",
    "location": "Level 7, Pavilion Kuala Lumpur, Bukit Bintang",
    "city": "Kuala Lumpur",
    "distance": "1.2 km away",
    "features": ["IMAX with Laser", "Star-Max Bed Lounge", "Dolby Atmos", "Gourmet Bar"],
    "showtimes": [
      {
        "format": "IMAX Laser 2D",
        "price": 38.00,
        "times": ["11:30 AM", "02:45 PM", "06:15 PM", "09:30 PM", "12:15 AM"]
      },
      {
        "format": "Dolby Atmos",
        "price": 26.00,
        "times": ["12:30 PM", "03:45 PM", "07:00 PM", "10:15 PM"]
      }
    ]
  }
]
```

---

### 4. Ticket Reservation & Booking
#### `POST /api/bookings`
**Request Payload (`BookingPayload`):**
```json
{
  "mediaId": "the-batman",
  "theatreName": "IMAX Pavilion Elite KL",
  "date": "Tomorrow, Oct 8",
  "time": "06:30 PM (IMAX)",
  "seats": ["E7", "E8"],
  "totalAmount": 76.00,
  "customerName": "Marcus Levin",
  "customerEmail": "marcus.levin@cinema.com"
}
```

**Expected Response (`BookingResponse`):**
```json
{
  "success": true,
  "orderId": "CINE-MY-9942",
  "booking": {
    "mediaId": "the-batman",
    "theatreName": "IMAX Pavilion Elite KL",
    "date": "Tomorrow, Oct 8",
    "time": "06:30 PM (IMAX)",
    "seats": ["E7", "E8"],
    "totalAmount": 76.00,
    "createdAt": "2026-10-08T00:30:00Z",
    "qrCodeData": "https://cinepass.my/verify/CINE-MY-9942",
    "status": "CONFIRMED"
  }
}
```

---

### 5. Seeding Initial Data
You can easily seed your database using the existing data files located in:
- `src/data/movies.ts`
- `src/data/events.ts`
- `src/data/streams.ts`
- `src/data/plays.ts`
- `src/data/sports.ts`
- `src/data/activities.ts`
- `src/data/theatres.ts`
- `src/data/offers.ts`

---

## 🛠️ Running the Dev Environment
```bash
# 1. Install dependencies
npm install

# 2. Run dev server (default port 5173 or 5174)
npm run dev

# 3. Build & Typecheck for production
npm run build
```
