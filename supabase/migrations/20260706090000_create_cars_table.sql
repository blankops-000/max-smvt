create table if not exists public.cars (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  brand text not null,
  model text not null,
  year integer not null check (year >= 1886),
  price numeric not null check (price >= 0),
  mileage integer not null check (mileage >= 0),
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

alter table public.cars enable row level security;

create index if not exists cars_created_at_idx on public.cars (created_at desc);
create index if not exists cars_is_available_idx on public.cars (is_available);
create index if not exists cars_brand_model_idx on public.cars (brand, model);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cars_set_updated_at on public.cars;

create trigger cars_set_updated_at
before update on public.cars
for each row execute function public.set_updated_at();

grant usage on schema public to service_role;
grant select, insert, update, delete on table public.cars to service_role;
