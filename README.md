# BookMyMovie

BookMyMovie is a movie discovery and ticket booking application built on the existing React/Vite experience, with an Express, MongoDB and Mongoose API. The original movie artwork and discovery components are retained. The movie booking path now uses API shows, server-side seat holds and prices, Razorpay order/signature verification, and QR tickets.

## Requirements

- Node.js 20 or newer
- MongoDB (local or hosted)
- Razorpay test keys for checkout

## Local setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and set `MONGODB_URI`, `JWT_SECRET`, and Razorpay test keys.
3. Seed demo records: `npm run seed`
4. Start client and API: `npm run dev`
5. Open the Vite URL (normally `http://localhost:5173`).

The API listens on port 5000 by default. You can run only the frontend with `npm run dev:client` and only the API with `npm run dev:server`. The health endpoint is `GET /api/health`.

## Demo records

The seed script creates ten movies, three theatres, six screens, upcoming shows, and the `WELCOME10` coupon. Local admin credentials are `admin@bookmymovie.local` / `Admin12345!`. Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` before running the seed command to use different local credentials. Change the demo password before using a shared environment.

Seat prices and amounts in seeded records are in INR. Booking fees are calculated by the API as 5% of ticket subtotal. The frontend does not send trusted prices or totals. Show locks last ten minutes.

## Razorpay test checkout

Create test API keys in the Razorpay dashboard and set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in the server environment. The key ID is returned to the checkout client; the secret remains on the server. `PAYMENT_CURRENCY` defaults to `INR`. Checkout cannot complete without valid provider credentials and a reachable MongoDB database.

## Environment

See [.env.example](.env.example). `VITE_API_BASE_URL` is the client API base. `CLIENT_ORIGIN` accepts a comma-separated origin list. Keep `.env` out of source control.

## API summary

- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Movies: `GET /api/movies`, `GET /api/movies/:id`, admin `POST/PUT/DELETE /api/movies`
- Theatres: `GET /api/theatres`, `GET /api/theatres/:id`, admin theatre CRUD
- Screens: admin `POST /api/screens`, `PUT /api/screens/:id`
- Shows: `GET /api/shows`, `GET /api/shows/:id`, admin show CRUD
- Seats and bookings: `GET /api/shows/:id/seats`, `POST /api/bookings/lock`, `POST /api/bookings`, `GET /api/bookings/my`, `GET /api/bookings/:id`, `GET /api/bookings/:id/ticket`, `POST /api/bookings/:id/cancel`
- Payments: `POST /api/payment/create-order`, `POST /api/payment/verify`, `POST /api/payment/failure`
- Coupons: `POST /api/coupons/validate`, admin coupon CRUD
- Admin: `GET /api/admin/dashboard`, `GET /api/admin/users`, `GET /api/admin/bookings`, `POST /api/admin/verify-ticket`

Protected endpoints use `Authorization: Bearer <JWT>`. Admin endpoints additionally require role `ADMIN`. The API validates show overlap before creating or updating a show and rejects seat locks that conflict with bookings or other unexpired locks.

## Build

- Client production build: `npm run build`
- API production start: `npm run server`

The client and server are separate deployment units. Configure the frontend API URL, MongoDB URI, CORS origins, JWT secret, and Razorpay credentials in the deployment environment.

## Current implementation scope

Movie browsing, authentication, movie/theatre/show APIs, seat locking, bookings, Razorpay signature verification, ticket QR generation, coupons, cancellation, and admin summary/ticket verification are implemented. Broader admin CRUD APIs are available to admin clients; this repository does not yet include management screens for every CRUD area. Non-movie discovery categories and promotional sections retain their original local demo data. Refund processing and Google sign-in are not configured; confirmed eligible cancellations release seats but do not claim a refund.
