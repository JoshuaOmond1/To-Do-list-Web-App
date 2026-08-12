# Daymark

Daymark is a private, account-based to-do web app built with Next.js and Supabase, ready for Vercel.

## Features

- Email/password sign-up, sign-in, sign-out, and password reset
- Private tasks enforced by PostgreSQL Row Level Security
- Add, edit, complete, filter, prioritize, schedule, and delete tasks
- Responsive mobile and desktop design

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Add the Supabase project URL and publishable key.
3. Install and run:

```bash
npm install
npm run dev
```

The database migration is in `supabase/migrations/`.

## Deploy to Vercel

Import this GitHub repository into Vercel and add these environment variables for Production, Preview, and Development:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

After deployment, add the Vercel URL to Supabase under **Authentication → URL Configuration → Redirect URLs** so confirmation and password-reset emails return to the app.
