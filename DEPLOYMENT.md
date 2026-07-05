# Deployment

This repo contains a React frontend and an Express/Supabase backend.

## Backend

Deploy the `BACKEND` folder as the backend service.

Required environment variables:

- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key. Keep this server-side only.
- `SUPABASE_CARS_TABLE`: Optional. Defaults to `cars`.
- `ADMIN_PASSWORD`: Password for the admin panel.
- `ADMIN_TOKEN_SECRET`: Long random string used to sign admin sessions.
- `ADMIN_USERNAME`: Optional. Defaults to `admin`.
- `CORS_ORIGIN`: Frontend URL. Use a comma-separated list for multiple origins.

Create this table in Supabase before starting the backend:

```sql
create table if not exists public.cars (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  brand text not null,
  model text not null,
  year integer not null,
  price numeric not null,
  mileage integer not null,
  fuel_type text not null check (fuel_type in ('Petrol', 'Diesel', 'Electric', 'Hybrid')),
  transmission text not null check (transmission in ('Manual', 'Automatic')),
  color text not null,
  images jsonb not null default '[]'::jsonb,
  condition text not null check (condition in ('New', 'Used')),
  contact_number text not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists cars_set_updated_at on public.cars;
create trigger cars_set_updated_at
before update on public.cars
for each row execute function public.set_updated_at();
```

Recommended Vercel settings:

- Root Directory: `BACKEND`
- Install Command: `npm install`
- Build Command: `npm run build`

For Render or another Node server host, use:

- Build Command: `npm install`
- Start Command: `npm start`

## Frontend

Deploy the `FRONTEND` folder as the frontend app. The existing `netlify.toml` is already configured for this.

Required environment variable:

- `REACT_APP_API_URL`: The deployed backend URL, for example `https://your-backend.vercel.app`.

If this variable is missing, the frontend falls back to `http://localhost:3000` for local development.
Always set `REACT_APP_API_URL` in production so the deployed frontend talks to the deployed backend.

Recommended Netlify settings:

- Base directory: `FRONTEND`
- Build command: `npm run build`
- Publish directory: `FRONTEND/build`

## Local Development

Backend:

```bash
cd BACKEND
npm install
npm run dev
```

Frontend:

```bash
cd FRONTEND
npm install
npm start
```

Use `.env.example` files as templates. Do not commit real `.env` files.
