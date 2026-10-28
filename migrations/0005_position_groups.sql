alter table positions add column if not exists category text not null default 'driver';

delete from positions where listing in ('AL-2601', 'AL-2602', 'AL-2603');
