# Gym Project

This repository contains a simple gym management application with a Node.js/Express backend (API) and a React frontend.

## Stack

- Backend: Node.js + Express
- Database: MySQL (used via Knex.js and XAMPP)
- ORM / Query builder: Knex
- Authentication: JWT (backend services)
- Frontend: React 

## Project Structure 
```
.
├── api/                   # Backend (Node.js + Express)
│   ├── app.js
│   ├── index.js
│   ├── knexfile.js
│   ├── .env              
│   ├── config/             
│   │   ├── config.js
│   │   ├── database.js
│   │   └── knex.js
│   ├── controllers/        # HTTP controllers/handlers
│   │   ├── auth.js
│   │   ├── member.js
│   │   ├── member-profile.controller.js
│   │   ├── member-package.controller.js
│   │   ├── order.controller.js
│   │   ├── package.controller.js
│   │   ├── schedule.controller.js
│   │   ├── schedule.js
│   │   ├── trainer.js
│   │   └── user.js
│   ├── routes/             # route definitions
│   │   ├── index.js
│   │   ├── auth.js
│   │   ├── member.js
│   │   ├── member-profile.js
│   │   ├── member-package.js
│   │   ├── order.js
│   │   ├── package.js
│   │   ├── schedule.js
│   │   ├── trainer.js
│   │   ├── uploads.js
│   │   └── user.js
│   ├── services/           # business logic / service layer
│   │   ├── member.js
│   │   ├── user.js
│   │   ├── trainer.js
│   │   ├── member-profile.service.js
│   │   ├── member-package.service.js
│   │   ├── order.service.js
│   │   ├── package.service.js
│   │   └── schedule.service.js
│   ├── repositories/       # DB access layer
│   ├── middleware/         # auth, validation, roles
│   ├── validations/        # joi or custom validators
│   ├── migrations/         # Knex migrations
│   ├── seeds/              # seed files (seed_admin.js, seed_packages.js, ...)
│   ├── uploads/            # uploaded assets (avatars)
│   ├── utils/              # helper utilities (jwt, response helpers)
│   └── package.json
|
├── frontend/              # React frontend
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── index.js
│       ├── main.jsx
│       ├── index.css
│       ├── pages/         # pages 
│       ├── services/      # client-side API wrappers
│       ├── context/       # React context (AuthContext)
│       ├── components/    # UI components
│       ├── hooks/         # custom hooks
│       └── utils/         # frontend utilities

Detailed `frontend/src/` files:

frontend/src/
├── App.jsx
├── index.js
├── main.jsx
├── index.css
├── assets/            
├── components/
│   ├── auth/
│   ├── common/
│   ├── layout/
│   ├── ui/
│   ├── NotificationPopup.jsx
│   └── NotificationPopup.css
├── components2/
│   └── common/
├── context/
│   ├── AuthContext.jsx
│   ├── CartContext.jsx
│   └── ShopContext.jsx
├── data/
│   ├── categories.js
│   ├── gymProducts.js
│   ├── mockData.js
│   └── products.js
├── hooks/
│   ├── useAuth.js
│   ├── useCart.js
│   ├── useLocalStorage.js
│   ├── useOrders.js
│   └── useProducts.js
├── pages/
│   ├── admin/
│   ├── auth/
│   ├── member/
│   │   └── Profile.jsx  
│   ├── public/
│   └── shop/
├── services/
│   ├── api.js
│   ├── authService.js
│   ├── memberProfileService.js
│   ├── orderService.js
│   ├── packageService.js
│   └── trainerService.js
├── styles/
│   ├── AdminOrders.css
│   ├── CheckoutPage.css
│   ├── globals.css
│   ├── member.css
│   ├── MyOrders.css
│   ├── shop.css
│   └── ShopPage.css
└── utils/
	├── cartHelpers.js
	├── constants.js
	├── formatPrice.js
	└── productHelpers.js

```
## Prerequisites

- Node.js (>=14) and npm installed
- PostgreSQL server (or a compatible Postgres service)
- Optional: npx (npm 5.2+ includes it)

## Environment variables

Create a `.env` file in the `api/` like .env.example


## Install

1. Install backend dependencies

```powershell
cd api
npm install
```

2. Install frontend dependencies

```powershell
cd ../frontend
npm install
```

## Database setup (migrations & seeds)

1. Ensure your Postgres server is running and `.env` in `api/` has correct DB credentials.
2. Run migrations

```powershell
cd api
npx knex migrate:latest --knexfile knexfile.js
```

3. Run seeds (all seeds)

```powershell
npx knex seed:run --knexfile knexfile.js
```

To run a specific seed file (for example to create the admin user):

```powershell
npx knex seed:run --specific=seed_admin.js --knexfile knexfile.js
```

Notes:
- The project already includes seeds such as `seed_admin.js`, `seed_packages.js`, and `seed_trainers.cjs` in `api/seeds/`.
- Seeds will create an admin user with email `admin@gym.com` and password `admin123` (see `api/seeds/seed_admin.js`).

## Run in development

Backend (development):

```powershell
cd api
# Start the dev server (check package.json for scripts such as `start` or `dev`)
npm run dev
```

If there is no `dev` script, run directly:

```powershell
node index.js
```

Frontend (development):

```powershell
cd frontend
npm start
```

By default, the frontend will proxy API requests to `http://localhost:4000/api/v1` .

## Build for production

Backend:

```powershell
cd api
npm install --production
node index.js
```

Frontend:

```powershell
cd frontend
npm run build
```

Serve the `frontend/build` folder with any static server or configure the backend to serve static assets.


