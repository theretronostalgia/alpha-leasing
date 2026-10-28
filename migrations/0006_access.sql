create table if not exists profiles (
  user_id text primary key references "user" (id) on delete cascade,
  employee_number text not null unique,
  role text not null
);

create table if not exists roles (
  slug text primary key,
  label text not null
);

create table if not exists role_permissions (
  role text not null references roles (slug) on delete cascade,
  permission text not null,
  primary key (role, permission)
);

create table if not exists page_copy (
  page text not null,
  key text not null,
  value text not null,
  primary key (page, key)
);

insert into roles (slug, label) values
  ('admin', 'Admin'),
  ('staff', 'Staff'),
  ('driver', 'Driver')
on conflict (slug) do nothing;

insert into role_permissions (role, permission) values
  ('admin', 'users.manage'),
  ('admin', 'roles.manage'),
  ('admin', 'pages.edit'),
  ('admin', 'applications.view'),
  ('admin', 'quotes.view'),
  ('admin', 'orders.view'),
  ('admin', 'positions.manage'),
  ('staff', 'applications.view'),
  ('staff', 'quotes.view'),
  ('staff', 'orders.view'),
  ('staff', 'positions.manage')
on conflict do nothing;
