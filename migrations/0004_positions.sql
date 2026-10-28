create table if not exists positions (
  id serial primary key,
  listing text not null unique,
  title text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);

insert into positions (listing, title, detail)
select 'AL-2601', 'Company Driver', 'Run local and regional freight for Alpha Leasing out of Fort Wayne. You need a valid CDL. Routes and home time are set with you, not handed down as a number.'
where not exists (select 1 from positions where listing = 'AL-2601');

insert into positions (listing, title, detail)
select 'AL-2602', 'Staff Positions', 'Office roles at the Fort Wayne shop, including dispatch, safety, and front-office work. Weekdays, 8 to 5. Tell us which seat you want on the application.'
where not exists (select 1 from positions where listing = 'AL-2602');

insert into positions (listing, title, detail)
select 'AL-2603', 'Truck and Trailer Technician', 'Diagnose and repair trucks and trailers for our fleet and for outside customers. The shop is in Fort Wayne, Monday through Friday.'
where not exists (select 1 from positions where listing = 'AL-2603');
