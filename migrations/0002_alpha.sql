-- Alpha Leasing office inbox: driver applications, rate quotes, company-store requests.
create table if not exists applications (
  id serial primary key,
  applicant_name text not null,
  email text not null,
  phone text not null,
  position text not null,
  payload text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists rate_quotes (
  id serial primary key,
  contact_name text not null,
  company text not null default '',
  email text not null,
  phone text not null,
  origin text not null,
  destination text not null,
  freight text not null,
  weight text not null,
  equipment text not null,
  pickup_date text not null,
  notes text not null default '',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists store_orders (
  id serial primary key,
  user_id text not null,
  email text not null,
  driver_name text not null,
  items text not null,
  note text not null default '',
  status text not null default 'requested',
  created_at timestamptz not null default now()
);

create index if not exists applications_created_idx on applications (created_at desc);
create index if not exists rate_quotes_created_idx on rate_quotes (created_at desc);
create index if not exists store_orders_user_idx on store_orders (user_id);
