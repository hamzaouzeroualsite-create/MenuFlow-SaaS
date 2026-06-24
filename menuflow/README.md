# MenuFlow

Premium SaaS platform for restaurant digital menus, real-time orders, and management — built for the Moroccan market.

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, Recharts
- **Backend:** Firebase (Auth, Firestore, Storage, Cloud Functions, FCM, Hosting)

## Quick Start (Demo Mode)

The app runs in **demo mode** without Firebase credentials. Demo data is pre-loaded.

```bash
cd menuflow
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@menuflow.ma | demo1234 |
| Restaurant Owner | owner@legourmet.ma | demo1234 |

### Demo URLs

- Landing: `/`
- Restaurant Dashboard: `/dashboard`
- Super Admin: `/admin`
- Customer Menu (mobile): `/r/le-gourmet`

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Enable Storage
5. Copy `.env.example` to `apps/web/.env.local` and fill in values
6. Deploy rules and functions:

```bash
firebase login
firebase deploy --only firestore:rules,storage
cd functions && npm install && npm run build
firebase deploy --only functions
```

7. Seed demo data (after configuring Firebase Admin):

```bash
npx ts-node scripts/seed.ts
```

## Project Structure

```
menuflow/
├── apps/web/          # Next.js 15 application
├── functions/           # Firebase Cloud Functions
├── firestore.rules    # Multi-tenant security rules
├── firestore.indexes.json
├── storage.rules
└── firebase.json
```

## Features

- **Super Admin Panel** — Create restaurants, manage users, subscriptions, monitoring
- **Restaurant Dashboard** — KPIs, charts, orders, menu management, QR codes
- **Customer Mobile Flow** — QR scan → menu → cart → order → tracking (FR/EN/AR)
- **Multi-tenant** — Isolated data per restaurant with `restaurantId`
- **Real-time** — Firestore listeners for orders and tracking
- **FCM** — Push notifications for new orders

## Business Model

Restaurants cannot self-register. Only the platform owner (Super Admin) creates restaurant accounts.
