# CodeAlpha E-commerce Store

A modern full-stack e-commerce store built for **CodeAlpha Full Stack Development – Task 1**.

## Features

- Product listing and search
- Category filtering
- Product details
- Shopping cart with quantity controls
- User registration and login
- Password hashing with bcrypt
- JWT authentication
- SQLite database
- Order processing and order history
- Responsive modern developer-style UI
- REST API with Express.js

## Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js + Express.js
- Database: SQLite
- Authentication: JWT + bcrypt

## Design

- Primary: `#6366F1`
- Secondary: `#0F172A`
- Accent: `#22D3EE`
- Background: `#020617`
- Card: `#111827`
- Text: `#F8FAFC`
- Secondary text: `#94A3B8`

## Run

Requirements:
- Node.js installed
- npm (comes with Node.js)

Open a terminal in this folder:

```bash
npm install
npm start
```

Then open:

`http://localhost:3000`

A SQLite database is created automatically in `data/store.db`.

## Demo account

You can register your own account from the Login button.

A demo user is also seeded:

- Email: `demo@codealpha.dev`
- Password: `Demo@123`

## API

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/orders`
- `GET /api/orders`

## CodeAlpha submission

Repository name format required by the task document:

`CodeAlpha_ProjectName`

Suggested repository name:

`CodeAlpha_EcommerceStore`

The CodeAlpha task asks interns to upload the complete source code to GitHub, explain the project in a LinkedIn video, and submit it through the provided submission form.
